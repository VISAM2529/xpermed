import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Order, Payment } from '@/models/Commerce';
import { Batch } from '@/models/Inventory';
import { Tenant } from '@/models/TenantUser';

// POST: Create New Sales Order (POS Bill)
export async function POST(req: NextRequest) {
    await dbConnect();

    try {
        const body = await req.json(); // { items, customer, payment }
        const { items, customerName, doctorName, paymentMethod, subTotal, taxTotal, grandTotal } = body;

        const tenantIdHeader = req.headers.get('x-tenant-id');
        const tenant = await Tenant.findOne({ subdomain: tenantIdHeader });
        if (!tenant) return NextResponse.json({ error: 'Tenant context missing' }, { status: 400 });

        // 1. Validate Stock & Deduct
        for (const item of items) {
            const batch = await Batch.findOne({
                _id: item.batchId,
                tenantId: tenant._id
            });

            if (!batch || batch.quantity < item.quantity) {
                throw new Error(`Insufficient stock for batch ${batch?.batchNumber || item.batchId}`);
            }

            // Deduct Stock
            batch.quantity -= item.quantity;
            await batch.save();
        }

        // 2. Create Order
        // Generate Invoice Number (Mock)
        const orderNumber = `INV-${Date.now().toString().slice(-6)}`;

        const order = await Order.create({
            tenantId: tenant._id,
            orderNumber,
            customerName,
            doctorName,
            items: items.map((i: any) => ({
                productId: i.productId,
                batchId: i.batchId,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                totalPrice: i.total, // Map 'total' from frontend to 'totalPrice' in Schema
                taxAmount: 0 // Simplified
            })),
            subTotal,
            taxTotal,
            grandTotal,
            paymentStatus: 'paid', // Assuming POS is instant pay
            paymentMethods: [{
                method: paymentMethod || 'cash',
                amount: grandTotal
            }]
        });

        // 3. Record Payment (Ledger)
        await Payment.create({
            tenantId: tenant._id,
            orderId: order._id,
            amount: grandTotal,
            method: paymentMethod || 'cash',
            type: 'credit', // Income
            recordedBy: tenant._id // Should be User ID
        });

        return NextResponse.json({ success: true, order });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || 'Billing failed' }, { status: 500 });
    }
}
