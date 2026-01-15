
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { User, Tenant } from '@/models/TenantUser';
import { verifyToken } from '@/lib/auth/jwt';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(authHeader.split(' ')[1]);
        if (!decoded) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

        console.log('Fetching Salesmen for Tenant:', decoded.tenantId);

        const salesmen = await User.find({
            tenantId: decoded.tenantId,
            role: 'salesman',
            isActive: true
        }).select('-passwordHash');

        console.log('Salesmen Found:', JSON.stringify(salesmen.map(s => ({ id: s._id, name: s.name }))));

        return NextResponse.json({ salesmen });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(authHeader.split(' ')[1]);
        if (!decoded) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

        const body = await request.json();
        const { name, email, password } = body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const salesman = await User.create({
            name,
            email,
            passwordHash,
            role: 'salesman',
            tenantId: decoded.tenantId,
            permissions: ['view_orders', 'deliver_orders']
        });

        return NextResponse.json({ salesman: { _id: salesman._id, name: salesman.name, email: salesman.email } });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
