
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { DistributorOrder } from '@/models/DistributorOrder';
import { verifyToken } from '@/lib/auth/jwt';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(authHeader.split(' ')[1]);
        if (!decoded) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });

        console.log('Salesman Orders Query. UserID:', decoded.userId);

        // Fetch Orders assigned to this user (salesman)
        // Explicitly cast to ObjectId to ensure matching works even if Schema is flaky
        // DEBUGGING: Inspect what is in the DB
        const allOrders = await DistributorOrder.find({}).select('orderNumber assignedTo').lean();
        console.log('DEBUG: All Orders in DB:', JSON.stringify(allOrders, null, 2));

        const orders = await DistributorOrder.find({
            assignedTo: new mongoose.Types.ObjectId(decoded.userId)
        })
            .populate('pharmacyId', 'name city address phone')
            .sort({ updatedAt: -1 })
            .lean();

        console.log('Orders found:', orders.length);

        return NextResponse.json({ orders });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
