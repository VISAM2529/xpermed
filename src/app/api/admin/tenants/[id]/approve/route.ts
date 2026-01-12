
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Tenant } from '@/models/TenantUser';

export async function PATCH(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id } = params;
        const body = await request.json();
        const { status } = body; // 'approved' | 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        await dbConnect();

        const tenant = await Tenant.findByIdAndUpdate(
            id,
            {
                onboardingStatus: status,
                approvedAt: status === 'approved' ? new Date() : undefined
            },
            { new: true }
        );

        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        return NextResponse.json({ tenant });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
