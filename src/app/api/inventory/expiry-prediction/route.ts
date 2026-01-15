import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Batch, Product } from '@/models/Inventory';
import { Order } from '@/models/Commerce';
import { Tenant } from '@/models/TenantUser';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
    await dbConnect();
    const tenantIdHeader = req.headers.get('x-tenant-id');
    const tenant = await Tenant.findOne({ subdomain: tenantIdHeader });

    if (!tenant) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    try {
        const today = new Date();
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setDate(today.getDate() + 180);

        // 1. Fetch batches expiring in next 180 days witb positive quantity
        const expiringBatches = await Batch.find({
            tenantId: tenant._id,
            expiryDate: { $gte: today, $lte: sixMonthsFromNow },
            quantity: { $gt: 0 }
        }).populate('productId');

        if (expiringBatches.length === 0) {
            return NextResponse.json({ riskItems: [], heatmapData: [] });
        }

        // 2. Fetch Sales History (Last 90 Days) for relevance
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(today.getDate() - 90);

        const recentOrders = await Order.find({
            tenantId: tenant._id,
            createdAt: { $gte: ninetyDaysAgo }
        }).select('items createdAt');

        // Map Product ID -> Total Sold Quantity in last 90 days
        const salesMap: Record<string, number> = {};
        recentOrders.forEach(order => {
            order.items.forEach((item: any) => {
                const pid = item.productId.toString();
                salesMap[pid] = (salesMap[pid] || 0) + item.quantity;
            });
        });

        // 3. Analyze Risk
        const riskItems = expiringBatches.map(batch => {
            const product = batch.productId as any;
            const soldLast90Days = salesMap[product._id.toString()] || 0;
            const dailySalesVelocity = soldLast90Days / 90; // Avg sold per day

            // Estimate how long current stock will last
            // If velocity is 0, daysToSell is Infinity (High Risk)
            const daysToSellStock = dailySalesVelocity > 0 ? batch.quantity / dailySalesVelocity : 9999;
            const daysToExpiry = Math.ceil((new Date(batch.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            // Risk Condition: Will we still have stock when it expires?
            // If Items takes 100 days to sell, but expires in 50 days -> LOSS
            const isRisk = daysToSellStock > daysToExpiry;

            if (!isRisk) return null;

            // Suggested Action
            let suggestion = 'None';
            if (daysToExpiry < 30) {
                suggestion = 'Liquidate (Heavy Discount)';
            } else if (daysToExpiry < 60) {
                suggestion = 'Discount Window';
            } else {
                suggestion = 'Transfer to Branch';
            }

            return {
                _id: batch._id,
                productName: product.name,
                batchNumber: batch.batchNumber,
                expiryDate: batch.expiryDate,
                quantity: batch.quantity,
                costPrice: batch.purchaseRate,
                estimatedLoss: batch.quantity * batch.purchaseRate,
                daysToExpiry,
                daysToSellStock: Math.round(daysToSellStock),
                suggestion
            };
        }).filter(item => item !== null);

        // Sort by highest estimated loss
        riskItems.sort((a, b) => (b?.estimatedLoss || 0) - (a?.estimatedLoss || 0));


        // 4. Generate Heatmap Data (Future 6 months)
        // Aggregate value of expiring goods by month
        const heatmapData: Record<string, number> = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        expiringBatches.forEach(batch => {
            const d = new Date(batch.expiryDate);
            const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
            // Value based on purchase rate (Loss Value)
            heatmapData[key] = (heatmapData[key] || 0) + (batch.quantity * batch.purchaseRate);
        });

        const formattedHeatmap = Object.entries(heatmapData).map(([month, value]) => ({ month, value }));


        return NextResponse.json({ riskItems, heatmapData: formattedHeatmap });

    } catch (error) {
        console.error("Prediction Error:", error);
        return NextResponse.json({ error: 'Prediction failed' }, { status: 500 });
    }
}
