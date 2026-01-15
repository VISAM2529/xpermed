
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { DistributorOrder } from '@/models/DistributorOrder';
import { DistributorLink } from '@/models/DistributorLink';
import { Product, Batch } from '@/models/Inventory';

import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: Request) {
    try {
        await dbConnect();

        // One-time Auth (Similar to Orders API)
        const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        let tenantId = request.headers.get('x-tenant-id');

        if (!tenantId && token) {
            const decoded = verifyToken(token);
            if (decoded) {
                tenantId = decoded.tenantId;
            }
        }

        if (!tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Pending Orders
        const pendingOrders = await DistributorOrder.countDocuments({
            distributorId: tenantId,
            status: 'PENDING'
        });

        // 2. Today's Revenue
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const revenueAgg = await DistributorOrder.aggregate([
            {
                $match: {
                    distributorId: { $eq: tenantId as any }, // Cast if needed for TS
                    status: { $in: ['ACCEPTED', 'SHIPPED', 'DELIVERED'] }, // Revenue usually counts accepted orders
                    createdAt: { $gte: startOfDay }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' }
                }
            }
        ]);
        const todayRevenue = revenueAgg[0]?.total || 0;

        // 3. Connected Pharmacies
        const connectedPharmacies = await DistributorLink.countDocuments({
            distributorId: tenantId,
            status: 'APPROVED'
        });

        // 4. Low Stock Items
        // Find all products for this tenant
        // Aggregate batches to sum quantity
        // Compare with minStockLevel
        // This is complex in Mongo without lookups.

        // Simpler approach: Fetch all products and their batches (might be heavy for large inventory)
        // Better: Aggregate on Batches first.

        const lowStockAgg = await Batch.aggregate([
            { $match: { tenantId: { $eq: tenantId as any } } },
            {
                $group: {
                    _id: '$productId',
                    totalQuantity: { $sum: '$quantity' }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $match: {
                    $expr: { $lt: ['$totalQuantity', '$product.minStockLevel'] }
                }
            },
            { $count: 'lowStockCount' }
        ]);

        const lowStock = lowStockAgg[0]?.lowStockCount || 0;

        return NextResponse.json({
            stats: {
                pendingOrders,
                todayRevenue,
                connectedPharmacies,
                lowStock
            }
        });

    } catch (error: any) {
        console.error('Stats API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
