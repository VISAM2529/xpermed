
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSocket } from '@/providers/SocketProvider';

interface Order {
    _id: string;
    orderNumber: string;
    pharmacyId: { name: string; city: string };
    totalAmount: number;
    status: string;
    createdAt: string;
    itemCount: number;
}

export default function IncomingOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/distributor/orders');
            const data = await res.json();
            if (data.orders) setOrders(data.orders);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();

        if (socket) {
            socket.on('receive_notification', (data) => {
                if (data.type === 'ORDER_REQ') {
                    fetchOrders();
                    // alert(`New Order Received: ${data.message}`);
                }
            });

            return () => {
                socket.off('receive_notification');
            };
        }
    }, [socket]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACCEPTED': return 'bg-green-100 text-green-700';
            case 'REJECTED': return 'bg-red-100 text-red-700';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Incoming Orders</h1>
                    <p className="text-slate-500">Manage orders from connected pharmacies.</p>
                </div>
            </header>

            {loading ? <div className="text-center py-12">Loading Orders...</div> : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600">Order ID</th>
                                <th className="p-4 font-semibold text-slate-600">Pharmacy</th>
                                <th className="p-4 font-semibold text-slate-600">Date</th>
                                <th className="p-4 font-semibold text-slate-600">Amount</th>
                                <th className="p-4 font-semibold text-slate-600">Status</th>
                                <th className="p-4 font-semibold text-slate-600">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {orders.map(order => (
                                <tr key={order._id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                                    <td className="p-4 font-medium text-slate-900">
                                        {order.orderNumber}
                                    </td>
                                    <td className="p-4 text-slate-600">
                                        {order.pharmacyId?.name || 'Unknown'}
                                        <div className="text-xs text-slate-400">{order.pharmacyId?.city}</div>
                                    </td>
                                    <td className="p-4 text-slate-500 text-sm">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 font-bold text-slate-900">
                                        ₹{order.totalAmount.toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <Link href={`/distributor/orders/${order._id}`}>
                                            <button className="text-blue-600 font-bold hover:underline">View Details</button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {orders.length === 0 && (
                        <div className="p-12 text-center text-slate-400">
                            No active orders.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
