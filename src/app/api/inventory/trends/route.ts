import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Trend } from '@/models/Trend';
import { Tenant } from '@/models/TenantUser';

// GET: Fetch Active Trends
export async function GET(req: NextRequest) {
    await dbConnect();
    const tenantIdHeader = req.headers.get('x-tenant-id');
    const tenant = await Tenant.findOne({ subdomain: tenantIdHeader });

    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    const trends = await Trend.find({ tenantId: tenant._id, isActive: true });
    return NextResponse.json({ trends });
}

// POST: Create New Trend
export async function POST(req: NextRequest) {
    await dbConnect();
    const tenantIdHeader = req.headers.get('x-tenant-id');
    const tenant = await Tenant.findOne({ subdomain: tenantIdHeader });

    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    try {
        const body = await req.json();
        // body: { name: "Flu Season", affectedCategories: ["Syrups", "Antibiotics"] }

        const trend = await Trend.create({
            ...body,
            tenantId: tenant._id,
        });

        return NextResponse.json({ success: true, trend });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create trend' }, { status: 500 });
    }
}
