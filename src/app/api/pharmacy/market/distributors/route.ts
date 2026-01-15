
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Tenant } from '@/models/TenantUser';
import { DistributorLink } from '@/models/DistributorLink';
import { Notification } from '@/models/Notification';
import { verifyToken } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

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

        // 1. Get Distributors with Filter
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query') || '';

        console.log("Search Query:", query);

        const filter: any = { type: 'DISTRIBUTOR' };
        if (query) {
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { organizationName: { $regex: query, $options: 'i' } },
                { city: { $regex: query, $options: 'i' } }
            ];
        }
        console.log("Mongo Filter:", JSON.stringify(filter));

        const distributors = await Tenant.find(filter).select('name organizationName address city state contactEmail phone type').lean();

        // 2. Get existing links for this pharmacy to show status
        const myLinks = await DistributorLink.find({ pharmacyId: tenantId }).lean();

        // Map links for easy lookup
        const linkMap = new Map();
        myLinks.forEach((link: any) => {
            linkMap.set(link.distributorId.toString(), link.status);
        });

        // Combine data
        const results = distributors.map((d: any) => ({
            ...d,
            connectionStatus: linkMap.get(d._id.toString()) || 'NOT_CONNECTED'
        }));

        return NextResponse.json({ distributors: results });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();

        // Auth
        const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        let tenantId = request.headers.get('x-tenant-id');
        let userName = "Pharmacy Owner"; // Default fallback

        if (!tenantId && token) {
            const decoded = verifyToken(token);
            if (decoded) {
                tenantId = decoded.tenantId;
                userName = decoded.email; // or fetch user name
            }
        }
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { distributorId } = await request.json();

        // Check if link exists
        const existing = await DistributorLink.findOne({ pharmacyId: tenantId, distributorId });
        if (existing) {
            return NextResponse.json({ error: 'Connection already exists' }, { status: 400 });
        }

        // Create Link
        const link = await DistributorLink.create({
            pharmacyId: tenantId,
            distributorId,
            status: 'PENDING'
        });

        // Create Notification for Distributor
        // note: In a real app we would fetch the Pharmacy Name to make the message better
        const notification = await Notification.create({
            recipientId: distributorId,
            type: 'CONNECTION_REQ',
            title: 'New Connection Request',
            message: `A new pharmacy has requested to connect with you.`,
            referenceId: link._id,
            referenceLink: '/distributor/connections'
        });

        // We return the notification so the frontend can emit the socket event
        return NextResponse.json({ link, notification }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
