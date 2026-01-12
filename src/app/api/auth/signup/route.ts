import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { User, Tenant } from '@/models/TenantUser';
import { Plan, Subscription } from '@/models/SubscriptionPlan';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    await dbConnect();

    try {
        const body = await req.json();
        const {
            tenantName,
            subdomain,
            email,
            password,
            phone,
            gstNumber,
            licenseNumber,
            address
        } = body;

        // Validation
        if (!tenantName || !subdomain || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Check if subdomain or email exists
        const existingTenant = await Tenant.findOne({ subdomain });
        if (existingTenant) {
            return NextResponse.json({ error: 'Subdomain already taken' }, { status: 409 });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }

        // 2. Create Tenant (Pending Approval)
        const tenant = await Tenant.create({
            name: tenantName,
            subdomain: subdomain.toLowerCase(),
            email,
            phone,
            address,
            gstNumber,
            licenseNumber,
            onboardingStatus: 'pending', // Explicitly pending
            subscriptionStatus: 'trialing',
            subscriptionExpiry: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial starts but access blocked until approval
        });

        // 3. Create Admin User
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name: 'Admin', // Default name or ask in form
            email,
            passwordHash: hashedPassword,
            role: 'super_admin', // Tenant Super Admin
            tenantId: tenant._id,
        });

        // 4. Create Trial Subscription (Optional: create Plan first if not exists)
        // We assume a 'Trial' plan exists or we create a dummy one.
        // For blueprint, we skip strict Plan linkage or find 'Basic'.

        return NextResponse.json({ message: 'Tenant registered successfully', tenantId: tenant._id }, { status: 201 });

    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
