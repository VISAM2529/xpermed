
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { DistributorOrder } from '@/models/DistributorOrder';
import { Batch } from '@/models/Inventory';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(request: Request) {
    try {
        await dbConnect();

        // One-time Auth
        const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        let tenantId = request.headers.get('x-tenant-id');
        let userId = request.headers.get('x-user-id');

        if (!tenantId && token) {
            const decoded = verifyToken(token);
            if (decoded) {
                tenantId = decoded.tenantId;
                userId = decoded.userId;
            }
        }
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { pharmacyId, items, discountAmount, taxAmount } = body;
        // items: [{ batchId, quantity, rate }]

        // 1. Validate Stock & Calculate Total
        let calculatedTotal = 0;
        const validItems = [];

        for (const item of items) {
            const batch = await Batch.findById(item.batchId);
            if (!batch) throw new Error(`Batch not found for item`);
            if (batch.quantity < item.quantity) throw new Error(`Insufficient stock for batch ${batch.batchNumber}`);

            calculatedTotal += (item.quantity * item.rate);
            validItems.push({
                productId: batch.productId,
                batchId: batch._id,
                quantity: item.quantity,
                rate: item.rate,
                total: item.quantity * item.rate
            });
        }

        const finalTotal = calculatedTotal + (taxAmount || 0) - (discountAmount || 0);

        // 2. Create Order (Status: DELIVERED as it counts as a completed sale entry)
        const order = await DistributorOrder.create({
            distributorId: tenantId,
            pharmacyId: pharmacyId, // Can be null for "Walk-in"? Schema might require it. Assuming existing connection.
            items: validItems.map(i => ({
                productId: i.productId,
                quantity: i.quantity,
                price: i.rate
            })),
            totalAmount: finalTotal,
            status: 'DELIVERED', // Completed Sale
            orderDate: new Date(),
            createdAt: new Date()
        });

        // 3. Deduct Stock
        const updatePromises = items.map((item: any) =>
            Batch.findByIdAndUpdate(item.batchId, { $inc: { quantity: -item.quantity } })
        );
        await Promise.all(updatePromises);

        return NextResponse.json({ order }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
