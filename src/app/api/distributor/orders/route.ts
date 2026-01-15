
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { DistributorOrder } from '@/models/DistributorOrder';
import { verifyToken } from '@/lib/auth/jwt';
import { Tenant } from '@/models/TenantUser';

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

        // Fetch Incoming Orders
        const orders = await DistributorOrder.find({ distributorId: tenantId })
            .populate('pharmacyId', 'name city') // Populate Pharmacy Details
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ orders });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
