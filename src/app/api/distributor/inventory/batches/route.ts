
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { Batch } from '@/models/Inventory';
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

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        // Fetch batches with quantity > 0
        const batches = await Batch.find({
            tenantId,
            productId,
            quantity: { $gt: 0 }
        }).sort({ expiryDate: 1 }); // FIFO suggestion (earliest expiry first)

        return NextResponse.json({ batches });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
