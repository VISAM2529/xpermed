
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { DistributorLink } from '@/models/DistributorLink';
import { verifyToken } from '@/lib/auth/jwt';

// GET: Fetch Connections (Pending & Approved)
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

        // Get Links populated with Pharmacy details
        const connections = await DistributorLink.find({ distributorId: tenantId })
            .populate('pharmacyId', 'name subdomain email phone address')
            .sort({ status: 1, createdAt: -1 }); // Pending first, then by date

        return NextResponse.json({ connections });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH: Approve or Reject Connection
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

        const { linkId, status, creditLimit, paymentTerms } = await request.json();

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const link = await DistributorLink.findOneAndUpdate(
            { _id: linkId, distributorId: tenantId },
            {
                status,
                creditLimit: status === 'APPROVED' ? (creditLimit || 0) : 0,
                paymentTerms: status === 'APPROVED' ? paymentTerms : undefined,
                approvedAt: status === 'APPROVED' ? new Date() : undefined
            },
            { new: true }
        );

        if (!link) return NextResponse.json({ error: 'Connection not found' }, { status: 404 });

        return NextResponse.json({ link });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
