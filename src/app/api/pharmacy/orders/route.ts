
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Product, Batch } from '@/models/Inventory';
import { DistributorLink } from '@/models/DistributorLink';
import { DistributorOrder } from '@/models/DistributorOrder';
import { Notification } from '@/models/Notification';
import { verifyToken } from '@/lib/auth/jwt';

// GET: Fetch Distributor Catalog (Products + Stock)
export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const distributorId = searchParams.get('distributorId');

        if (!distributorId) {
            return NextResponse.json({ error: 'Distributor ID is required' }, { status: 400 });
        }

        // Verify Auth (Optional: Check if linked)
        // ...

        // Fetch Products for this Distributor
        const products = await Product.find({ tenantId: distributorId }).lean();

        // Enhance with Stock info
        const catalog = await Promise.all(products.map(async (p: any) => {
            const batches = await Batch.find({ productId: p._id });
            const stock = batches.reduce((acc, b) => acc + b.quantity, 0);
            // Get max MRP for display
            const maxMrp = batches.reduce((max, b) => b.mrp > max ? b.mrp : max, 0);

            return {
                _id: p._id,
                name: p.name,
                sku: p.sku,
                category: p.category,
                manufacturer: p.manufacturer,
                stock, // Available stock
                mrp: maxMrp
            };
        }));

        return NextResponse.json({ catalog });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Place New Order
export async function POST(request: Request) {
    try {
        await dbConnect();

        // Auth
        const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        let tenantId = request.headers.get('x-tenant-id');
        let userName = "Pharmacy Owner";

        if (!tenantId && token) {
            const decoded = verifyToken(token);
            if (decoded) {
                tenantId = decoded.tenantId;
                userName = decoded.email;
            }
        }
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { distributorId, items, totalAmount } = body;

        // 1. Verify Connection
        const link = await DistributorLink.findOne({
            pharmacyId: tenantId,
            distributorId,
            status: 'APPROVED'
        });

        if (!link) {
            return NextResponse.json({ error: 'You are not connected to this distributor.' }, { status: 403 });
        }

        // 2. Create Order
        const orderNumber = `PO-${Date.now().toString().slice(-6)}`;

        const order = await DistributorOrder.create({
            distributorId,
            pharmacyId: tenantId,
            orderNumber, // Required
            items: items.map((i: any) => ({
                productId: i.productId,
                name: i.productName, // Mapped from productName
                quantity: i.quantity,
                unitPrice: i.unitPrice || 0,
                totalPrice: (i.unitPrice || 0) * i.quantity // Required
            })),
            status: 'PENDING',
            totalAmount: totalAmount || 0,
            timeline: [{
                status: 'PENDING',
                remark: 'Order placed by pharmacy.',
                timestamp: new Date()
            }]
        });

        // 3. Create Notification for Distributor
        const notification = await Notification.create({
            recipientId: distributorId,
            type: 'ORDER_REQ',
            title: `New B2B Order: ${orderNumber}`,
            message: `New order request ${orderNumber} received.`,
            referenceId: order._id,
            referenceLink: `/distributor/orders/${order._id}`
        });

        return NextResponse.json({ order, notification }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
