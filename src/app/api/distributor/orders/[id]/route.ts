
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { DistributorOrder } from '@/models/DistributorOrder';
import { Notification } from '@/models/Notification';
import { verifyToken } from '@/lib/auth/jwt';
import { Tenant } from '@/models/TenantUser';
import mongoose from 'mongoose';
import { Product, Batch } from '@/models/Inventory';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const order = await DistributorOrder.findById(id)
            .populate('pharmacyId', 'name city address phone contactEmail')
            .populate('assignedTo', 'name email')
            .lean();

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ order });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const { status, remarks, otp, assignedTo } = body;

        // OTP Verification for Delivery
        if (status === 'DELIVERED') {
            const existingOrder = await DistributorOrder.findById(id).lean();
            if (!existingOrder) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

            console.log('Verifying OTP. DB:', existingOrder.deliveryOtp, 'Input:', otp);

            const dbOtp = String(existingOrder.deliveryOtp || '').trim();
            const inputOtp = String(otp || '').trim();

            if (dbOtp !== inputOtp) {
                return NextResponse.json({
                    error: `Invalid Delivery OTP. Input: ${inputOtp}`
                }, { status: 400 });
            }

            // --- STOCK UPDATES ---
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                // 1. Deduct Stock from Distributor (FIFO)
                // 2. Add Stock to Pharmacy (Fuzzy Match Product -> Add Batch)

                for (const item of existingOrder.items) {
                    // A. DISTRIBUTOR DEDUCTION
                    let remainingToDeduct = item.quantity;
                    const distBatches = await Batch.find({
                        tenantId: existingOrder.distributorId,
                        productId: item.productId,
                        quantity: { $gt: 0 }
                    }).sort({ expiryDate: 1 }).session(session);

                    for (const batch of distBatches) {
                        if (remainingToDeduct <= 0) break;
                        const deduct = Math.min(batch.quantity, remainingToDeduct);
                        batch.quantity -= deduct;
                        await batch.save({ session });
                        remainingToDeduct -= deduct;
                    }

                    // B. PHARMACY ADDITION
                    // Fuzzy Match Name: Remove spaces, case insensitive
                    // e.g. "Dolo 650" -> regex /D\s*o\s*l\s*o\s*6\s*5\s*0/i
                    const fuzzyName = item.name.split('').map((c: string) => c.match(/\s/) ? '' : c.trim()).filter(Boolean).join('\\s*');
                    const nameRegex = new RegExp(`^${fuzzyName}$`, 'i');

                    let pharmacyProduct = await Product.findOne({
                        tenantId: existingOrder.pharmacyId,
                        name: { $regex: nameRegex }
                    }).session(session);

                    if (!pharmacyProduct) {
                        // Create New Product for Pharmacy
                        // We need details from Distributor's product. 
                        // Since we don't have full details in OrderItem, we fetch the Source Product
                        const sourceProduct = await Product.findById(item.productId).session(session);

                        pharmacyProduct = await Product.create([{
                            tenantId: existingOrder.pharmacyId,
                            name: item.name, // Use name from order (or source)
                            description: sourceProduct?.description,
                            category: sourceProduct?.category,
                            manufacturer: sourceProduct?.manufacturer,
                            unit: sourceProduct?.unit || 'strip',
                            gstRate: sourceProduct?.gstRate || 0,
                            minStockLevel: 10
                        }], { session }).then(res => res[0]);
                    }

                    // Create Batch for Pharmacy
                    await Batch.create([{
                        tenantId: existingOrder.pharmacyId,
                        productId: pharmacyProduct._id,
                        batchNumber: `PO-${existingOrder.orderNumber}-${Math.floor(Math.random() * 1000)}`, // Auto-generate if not tracked
                        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)), // Default 2 years expiry
                        quantity: item.quantity,
                        mrp: item.unitPrice * 1.5, // Dummy MRP logic (should be real)
                        purchaseRate: item.unitPrice,
                        supplierId: existingOrder.distributorId // Link back to distributor
                    }], { session });
                }

                await session.commitTransaction();
            } catch (err: any) {
                await session.abortTransaction();
                console.error("Stock Update Failed:", err);
                return NextResponse.json({ error: 'Stock update failed: ' + err.message }, { status: 500 });
            } finally {
                session.endSession();
            }
        }

        // Prepare Update Data
        const updateData: any = {
            $set: {},
            $push: {}
        };

        if (status) {
            updateData.$set.status = status;
            updateData.$push.timeline = {
                status,
                remark: remarks || `Order ${status.toLowerCase()} by distributor.`,
                timestamp: new Date()
            };
        }

        // Generate OTP when Accepted
        if (status === 'ACCEPTED') {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            updateData.$set.deliveryOtp = otp;
            console.log('Generating OTP for Order:', id, otp);
        }

        // Assign or Unassign Salesman
        if (assignedTo !== undefined) {
            console.log('Assignment Update:', assignedTo);

            if (assignedTo === null || assignedTo === '') {
                // Unassign
                updateData.$unset = { assignedTo: 1 };
                updateData.$push.timeline = {
                    status: 'UNASSIGNED',
                    remark: `Order unassigned from salesman.`,
                    timestamp: new Date()
                };
            } else if (mongoose.Types.ObjectId.isValid(assignedTo)) {
                // Assign
                updateData.$set.assignedTo = new mongoose.Types.ObjectId(assignedTo);

                if (!updateData.$push.timeline) {
                    updateData.$push.timeline = {
                        status: 'ASSIGNED',
                        remark: `Order assigned to salesman.`,
                        timestamp: new Date()
                    };
                }
            } else {
                return NextResponse.json({ error: 'Invalid Salesman ID format' }, { status: 400 });
            }
        }

        console.log('Update Data:', JSON.stringify(updateData, null, 2));

        const order = await DistributorOrder.findByIdAndUpdate(
            id,
            updateData,
            { new: true, strict: false }
        )
            .populate('pharmacyId', 'name city address phone contactEmail')
            .populate('assignedTo', 'name email');

        console.log('Updated Order Result:', order);

        if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

        // Notify Pharmacy
        await Notification.create({
            recipientId: order.pharmacyId,
            type: 'ORDER_UPDATE',
            title: `Order ${status}`,
            message: `Your order ${order.orderNumber} has been ${status}. ${remarks ? `Remark: ${remarks}` : ''}`,
            referenceId: order._id,
            referenceLink: `/dashboard/procurement/orders/${order._id}`
        });

        return NextResponse.json({ order });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
