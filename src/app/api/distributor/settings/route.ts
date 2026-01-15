
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Tenant } from '@/models/TenantUser';
import { verifyToken } from '@/lib/auth/jwt';

// GET: Current Settings
export async function GET(request: Request) {
    try {
        await dbConnect();

        // Auth
        const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        let tenantId = request.headers.get('x-tenant-id');
        if (!tenantId && token) {
            const decoded = verifyToken(token);
            if (decoded) tenantId = decoded.tenantId;
        }
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const tenant = await Tenant.findById(tenantId).select('distributorSettings');
        if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

        return NextResponse.json({ settings: tenant.distributorSettings || {} });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH: Update Settings
export async function PATCH(request: Request) {
    try {
        await dbConnect();

        // Auth
        const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        let tenantId = request.headers.get('x-tenant-id');
        if (!tenantId && token) {
            const decoded = verifyToken(token);
            if (decoded) tenantId = decoded.tenantId;
        }
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();

        const updatedTenant = await Tenant.findByIdAndUpdate(
            tenantId,
            {
                $set: {
                    'distributorSettings.minOrderAmount': body.minOrderAmount,
                    'distributorSettings.paymentTerms': body.paymentTerms,
                    'distributorSettings.paymentInstructions': body.paymentInstructions
                }
            },
            { new: true }
        ).select('distributorSettings');

        return NextResponse.json({ settings: updatedTenant?.distributorSettings });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
