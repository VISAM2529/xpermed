import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { User, Tenant } from '@/models/TenantUser';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth/jwt';
import { getSubdomain } from '@/lib/tenant/context';

export async function POST(req: NextRequest) {
    await dbConnect();

    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        // 1. Determine Tenant (optional: if login is tenant-specific or global)
        // If we want global login, we find user by email and check tenant.
        // If strict tenant login, we check subdomain.

        // Simplest: Find globally by email (assuming unique emails per SaaS)
        const user = await User.findOne({ email }).populate('tenantId');
        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // NEW: Check Tenant Approval Status
        // NEW: Check Tenant Approval Status
        if (user.tenantId.onboardingStatus !== 'approved') {
            return NextResponse.json({
                error: `Your pharmacy is ${user.tenantId.onboardingStatus}. Please wait for System Admin approval.`
            }, { status: 403 });
        }

        // 2. Verify Password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // 3. Verify Tenant Match (if login happens on subdomain)
        // const subdomain = getSubdomain(req.headers.get('host') || '');
        // if (subdomain && user.tenantId.subdomain !== subdomain) ...
        // For now, we allow cross-tenant login or redirect.

        // 4. Generate Token
        const token = signToken({
            userId: user._id.toString(),
            tenantId: user.tenantId._id.toString(),
            role: user.role,
            email: user.email,
        });

        // 5. Set Cookie
        const response = NextResponse.json({
            message: 'Login successful',
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                tenant: user.tenantId.subdomain
            }
        });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 86400, // 1 day
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
