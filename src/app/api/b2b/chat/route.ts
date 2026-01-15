
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import { OrderChat } from '@/models/OrderChat';
import { verifyToken } from '@/lib/auth/jwt';

// GET: Fetch Chat History for an Order
export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');

        if (!orderId) return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });

        const messages = await OrderChat.find({ orderId })
            .sort({ timestamp: 1 }) // Oldest first
            .lean();

        return NextResponse.json({ messages });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Send New Message
export async function POST(request: Request) {
    try {
        await dbConnect();

        // Auth
        const token = request.headers.get('cookie')?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        let senderId = '';
        if (token) {
            const decoded = verifyToken(token);
            if (decoded) senderId = decoded.tenantId; // Or userId depending on requirements
        }
        if (!senderId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { orderId, message, senderName } = body; // SenderName can be passed from frontend for display

        const chat = await OrderChat.create({
            orderId,
            senderId,
            senderName: senderName || 'User',
            message,
            timestamp: new Date()
        });

        return NextResponse.json({ chat }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
