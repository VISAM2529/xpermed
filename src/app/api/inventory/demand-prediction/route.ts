import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Product, Batch } from '@/models/Inventory';
import { Order } from '@/models/Commerce';
import { Trend } from '@/models/Trend';
import { Tenant } from '@/models/TenantUser';

export async function GET(req: NextRequest) {
    await dbConnect();
    const tenantIdHeader = req.headers.get('x-tenant-id');
    const tenant = await Tenant.findOne({ subdomain: tenantIdHeader });

    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    try {
        // 1. Fetch Context Data
        const trends = await Trend.find({ tenantId: tenant._id, isActive: true });
        const products = await Product.find({ tenantId: tenant._id });

        const today = new Date();
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(today.getDate() - 90);

        const orders = await Order.find({
            tenantId: tenant._id,
            createdAt: { $gte: ninetyDaysAgo }
        }).select('items createdAt');

        // 2. Aggregate Sales per Product
        const productSales: Record<string, number> = {};
        orders.forEach(order => {
            order.items.forEach((item: any) => {
                const pid = item.productId.toString();
                productSales[pid] = (productSales[pid] || 0) + item.quantity;
            });
        });

        // 3. Current Stock Levels (Sum of Batches)
        // Optimization: Aggregate Batch Quantities
        const batches = await Batch.aggregate([
            { $match: { tenantId: tenant._id, quantity: { $gt: 0 } } },
            { $group: { _id: '$productId', totalQuantity: { $sum: '$quantity' } } }
        ]);
        const stockMap: Record<string, number> = {};
        batches.forEach(b => stockMap[b._id.toString()] = b.totalQuantity);

        // 4. Determine Current Season
        const month = today.getMonth(); // 0-11
        let currentSeason = 'All Year';
        if (month >= 2 && month <= 5) currentSeason = 'Summer'; // Mar-Jun
        else if (month >= 6 && month <= 9) currentSeason = 'Monsoon'; // Jul-Oct
        else currentSeason = 'Winter'; // Nov-Feb

        // 5. Calculate Demand & Reorder
        const predictions = products.map(product => {
            const sold90Days = productSales[product._id.toString()] || 0;
            const avgDailySales = sold90Days / 90;

            let boostFactor = 1.0;
            const boostReasons: string[] = [];

            // A. Seasonality Boost (e.g., 20% boost if matches)
            if (product.seasonality === currentSeason) {
                boostFactor += 0.2;
                boostReasons.push(`Season: ${currentSeason}`);
            }

            // B. Trend Boost
            trends.forEach(trend => {
                if (trend.affectedCategories.includes(product.category || '')) {
                    boostFactor += (trend.boostFactor - 1); // Add the extra factor (e.g. 1.5 - 1 = +0.5)
                    boostReasons.push(`Trend: ${trend.name}`);
                }
            });

            // Predicted Demand (Next 30 Days)
            const baseDemand = avgDailySales * 30;
            const predictedDemand = Math.ceil(baseDemand * boostFactor);
            const currentStock = stockMap[product._id.toString()] || 0;

            const reorderNeeded = currentStock < predictedDemand;
            const reorderQuantity = reorderNeeded ? predictedDemand - currentStock : 0;

            if (!reorderNeeded && predictedDemand === 0) return null; // No action needed, inactive product

            return {
                _id: product._id,
                name: product.name,
                category: product.category,
                currentStock,
                avgDailySales: parseFloat(avgDailySales.toFixed(2)),
                predictedDemand,
                reorderQuantity,
                boostFactor: parseFloat(boostFactor.toFixed(2)),
                boostReasons,
                status: reorderNeeded ? 'Reorder' : 'Sufficient'
            };
        }).filter(item => item !== null);

        // Sort by Reorder Needed priority (High Gap first)
        predictions.sort((a, b) => (b!.reorderQuantity || 0) - (a!.reorderQuantity || 0));

        return NextResponse.json({ predictions });

    } catch (error) {
        console.error("Demand Prediction Error:", error);
        return NextResponse.json({ error: 'Prediction failed' }, { status: 500 });
    }
}
