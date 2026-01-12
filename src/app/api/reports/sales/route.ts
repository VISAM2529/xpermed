import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Order } from '@/models/Commerce';
import { Tenant } from '@/models/TenantUser';

export async function GET(req: NextRequest) {
    await dbConnect();
    const tenantIdHeader = req.headers.get('x-tenant-id');
    const tenant = await Tenant.findOne({ subdomain: tenantIdHeader });
    if (!tenant) return NextResponse.json({ error: 'Tenant context missing' }, { status: 400 });

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Sales & Orders Today
        const salesToday = await Order.aggregate([
            {
                $match: {
                    tenantId: tenant._id,
                    createdAt: { $gte: today }
                }
            },
            { $group: { _id: null, totalSales: { $sum: '$grandTotal' }, totalOrders: { $sum: 1 } } }
        ]);

        // 2. Gross Profit (Simplified: Assuming flat 20% margin if cost not tracked, or 0 if strictly revenue)
        // Note: Real profit requires tracking Cost Price per item in Order. 
        // For MVP, we'll return 0 or a placeholder estimate.
        const estimatedProfit = (salesToday[0]?.totalSales || 0) * 0.2;

        // 3. Sales Trend (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const salesTrend = await Order.aggregate([
            {
                $match: {
                    tenantId: tenant._id,
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sales: { $sum: '$grandTotal' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return NextResponse.json({
            summary: {
                salesToday: salesToday[0]?.totalSales || 0,
                ordersToday: salesToday[0]?.totalOrders || 0,
                grossProfit: estimatedProfit
            },
            trend: salesTrend.map(t => ({ date: t._id, sales: t.sales }))
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Report fetch failed' }, { status: 500 });
    }
}
