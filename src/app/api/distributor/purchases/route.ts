
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { DistributorPurchase } from '@/models/Purchase';
import { Batch } from '@/models/Inventory';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(request: Request) {
    try {
        await dbConnect();

        // One-time Auth (Standardized)
        const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        let tenantId = request.headers.get('x-tenant-id');
        let userId = request.headers.get('x-user-id'); // Ideally middleware sets this

        if (!tenantId && token) {
            const decoded = verifyToken(token);
            if (decoded) {
                tenantId = decoded.tenantId;
                userId = decoded.userId;
            }
        }
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { supplierId, billNumber, billDate, items, totalAmount, discountAmount, taxAmount } = body;

        // Transaction would be ideal here
        // 1. Create Purchase Record
        const purchase = await DistributorPurchase.create({
            tenantId,
            supplierId,
            billNumber,
            billDate: new Date(billDate),
            items,
            totalAmount,
            discountAmount,
            taxAmount,
            createdBy: userId
        });

        // 2. Create/Update Inventory Batches
        const batchPromises = items.map(async (item: any) => {
            // Check if batch exists (unlikely if we want unique batches per purchase, but maybe same batch number delivered split?)
            // We usually act like it's a new entry
            await Batch.create({
                tenantId,
                productId: item.productId,
                batchNumber: item.batchNumber,
                expiryDate: new Date(item.expiryDate),
                quantity: item.quantity,
                mrp: item.mrp,
                purchaseRate: item.purchaseRate,
                supplierId: supplierId
            });
        });

        await Promise.all(batchPromises);

        return NextResponse.json({ purchase }, { status: 201 });

    } catch (error: any) {
        console.error("Purchase Creation Error:", error);
        // If dup key error (duplicate bill)
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Duplicate Bill Number for this Supplier' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message || "Purchase Creation Failed" }, { status: 500 });
    }
}
