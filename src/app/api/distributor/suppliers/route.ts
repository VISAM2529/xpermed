
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Supplier } from '@/models/Supplier';
import { verifyToken } from '@/lib/auth/jwt';

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

        const suppliers = await Supplier.find({ tenantId, status: 'ACTIVE' }).sort({ name: 1 });
        return NextResponse.json({ suppliers });

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
        if (!tenantId && token) {
            const decoded = verifyToken(token);
            if (decoded) tenantId = decoded.tenantId;
        }
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const supplier = await Supplier.create({ ...body, tenantId });

        return NextResponse.json({ supplier }, { status: 201 });

    } catch (error: any) {
        if (error.code === 11000) return NextResponse.json({ error: 'Supplier already exists' }, { status: 409 });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
