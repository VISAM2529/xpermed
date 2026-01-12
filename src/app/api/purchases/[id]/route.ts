import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Purchase } from '@/models/Procurement';
import { Tenant } from '@/models/TenantUser';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();

    const { id } = await params;

    // Verify Tenant Context
    const tenantIdHeader = req.headers.get('x-tenant-id');
    const tenant = await Tenant.findOne({ subdomain: tenantIdHeader });
    if (!tenant) return NextResponse.json({ error: 'Tenant context missing' }, { status: 400 });

    try {
        const purchase = await Purchase.findOne({ _id: id, tenantId: tenant._id })
            .populate('supplierId', 'name address phone gstNumber email') // Populate Supplier details for Invoice
            .populate('items.productId', 'name'); // Populate Product names

        if (!purchase) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        return NextResponse.json({ purchase });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
    }
}
