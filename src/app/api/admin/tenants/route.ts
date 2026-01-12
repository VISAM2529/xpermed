
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Tenant } from '@/models/TenantUser';
import { User } from '@/models/TenantUser';

export async function GET() {
    try {
        await dbConnect();

        // Fetch all tenants sorted by newest first
        const tenants = await Tenant.find({}).sort({ createdAt: -1 });

        return NextResponse.json({ tenants });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
