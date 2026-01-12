import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Batch } from '@/models/Inventory';
import { Tenant } from '@/models/TenantUser';

export async function GET(req: NextRequest) {
    await dbConnect();
    const tenantIdHeader = req.headers.get('x-tenant-id');
    const tenant = await Tenant.findOne({ subdomain: tenantIdHeader });
    if (!tenant) return NextResponse.json({ error: 'Tenant context missing' }, { status: 400 });

    try {
        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get('days') || '30');

        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() + days);

        // Find batches expiring before threshold (and not already expired/empty ideally, but lets show all soon-expiring)
        const expiringBatches = await Batch.find({
            tenantId: tenant._id,
            expiryDate: { $lte: thresholdDate },
            quantity: { $gt: 0 } // Only show stock that exists
        })
            .populate('productId', 'name')
            .sort({ expiryDate: 1 });

        return NextResponse.json({
            batches: expiringBatches
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Report fetch failed' }, { status: 500 });
    }
}
