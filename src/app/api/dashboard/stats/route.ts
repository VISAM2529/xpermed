import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Order } from '@/models/Commerce';
import { Product, Batch } from '@/models/Inventory';
import { Tenant } from '@/models/TenantUser';

export async function GET(req: NextRequest) {
    await dbConnect();
    const tenantIdHeader = req.headers.get('x-tenant-id');
    const tenant = await Tenant.findOne({ subdomain: tenantIdHeader });
    if (!tenant) return NextResponse.json({ error: 'Tenant missing' }, { status: 400 });

    try {
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfYear = new Date(today.getFullYear(), 0, 1);

        // 1. Sales & Orders Today
        const salesTodayPromise = Order.aggregate([
            {
                $match: {
                    tenantId: tenant._id,
                    createdAt: { $gte: startOfDay }
                }
            },
            { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } }
        ]);

        // 2. Sales This Month
        const salesMonthPromise = Order.aggregate([
            {
                $match: {
                    tenantId: tenant._id,
                    createdAt: { $gte: startOfMonth }
                }
            },
            { $group: { _id: null, total: { $sum: '$grandTotal' } } }
        ]);

        // 3. Pending Orders (Assumption: status is tracked, or paymentStatus is pending)
        // Adjust 'paymentStatus' or 'status' based on your verified Schema. 
        // Using 'paymentStatus' as proxy for 'Pending' logic if 'status' field isn't explicit in OrderSchema View.
        const pendingOrdersPromise = Order.countDocuments({
            tenantId: tenant._id,
            $or: [{ paymentStatus: 'Pending' }, { status: 'Pending' }]
        });

        // 4. Yearly Sales Breakdown (For Main Chart)
        const salesYearlyPromise = Order.aggregate([
            {
                $match: {
                    tenantId: tenant._id,
                    createdAt: { $gte: startOfYear }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    total: { $sum: "$grandTotal" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 5. Expiry & Low Stock
        const nearExpiryPromise = Batch.countDocuments({
            tenantId: tenant._id,
            expiryDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
        });

        const recentOrdersPromise = Order.find({ tenantId: tenant._id })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(); // Use lean for faster access

        const [salesToday, salesMonth, pendingOrders, salesYearly, nearExpiry, recentOrders] = await Promise.all([
            salesTodayPromise,
            salesMonthPromise,
            pendingOrdersPromise,
            salesYearlyPromise,
            nearExpiryPromise,
            recentOrdersPromise
        ]);

        // Fill missing months for chart
        const monthlyData = Array.from({ length: 12 }, (_, i) => {
            const monthData = salesYearly.find(m => m._id === i + 1);
            return {
                month: i + 1,
                sales: monthData?.total || 0,
                orders: monthData?.count || 0
            };
        });

        return NextResponse.json({
            stats: {
                salesToday: salesToday[0]?.total || 0,
                ordersToday: salesToday[0]?.count || 0,
                salesMonth: salesMonth[0]?.total || 0,
                totalRevenue: salesMonth[0]?.total || 0, // Simplified: distinct from 'From Orders' usually
                pendingOrders,
                nearExpiry,
                monthlyData // [ { month: 1, sales: 5000 }, ... ]
            },
            recentOrders
        });

    } catch (error) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json({ error: 'Stats failed' }, { status: 500 });
    }
}
