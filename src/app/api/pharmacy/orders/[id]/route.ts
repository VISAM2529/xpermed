
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { DistributorOrder } from '@/models/DistributorOrder';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;

        // Auth check could be added here to ensure pharmacy owns this order

        const order = await DistributorOrder.findById(id)
            .populate('distributorId', 'name city address phone contactEmail') // Populate Distributor details
            .lean();

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ order });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
