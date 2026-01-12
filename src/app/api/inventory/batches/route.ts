import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Batch, Product } from '@/models/Inventory';
import { Tenant } from '@/models/TenantUser';

// GET: List Batches (optionally by Product)
export async function GET(req: NextRequest) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const tenantIdHeader = req.headers.get('x-tenant-id');

    const tenant = await Tenant.findOne({ subdomain: tenantIdHeader });

    try {
        let query: any = {};
        if (tenant) query.tenantId = tenant._id;
        if (productId) query.productId = productId;

        const batches = await Batch.find(query).populate('productId', 'name unit').sort({ expiryDate: 1 });
        return NextResponse.json({ batches });
    } catch (error) {
        return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }
}

// POST: Add New Batch (Inward)
export async function POST(req: NextRequest) {
    await dbConnect();
    try {
        const body = await req.json();
        const tenantIdHeader = req.headers.get('x-tenant-id');
        const tenant = await Tenant.findOne({ subdomain: tenantIdHeader });

        if (!tenant) return NextResponse.json({ error: 'Tenant ID missing' }, { status: 400 });

        const batch = await Batch.create({
            ...body,
            tenantId: tenant._id,
        });

        return NextResponse.json({ success: true, batch });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Create failed' }, { status: 500 });
    }
}
