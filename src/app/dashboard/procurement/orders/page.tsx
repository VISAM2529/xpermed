
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Clock, CheckCircle, XCircle, ChevronRight, Plus } from 'lucide-react';

interface Order {
    _id: string;
    orderNumber: string;
    distributorId: { name: string; city: string }; // Populated
    totalAmount: number;
    status: string;
    createdAt: string;
    itemCount: number;
}

export default function OrderHistory() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/pharmacy/orders/list') // New endpoint needed
            .then(res => res.json())
            .then(data => {
                if (data.orders) setOrders(data.orders);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACCEPTED': return 'bg-green-100 text-green-700';
            case 'REJECTED': return 'bg-red-100 text-red-700';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">My Orders</h1>
                    <p className="text-gray-500">Track current and past orders with distributors.</p>
                </div>
                <Link href="/dashboard/procurement/orders/new">
                    <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
                        <Plus className="w-5 h-5" /> New Order
                    </button>
                </Link>
            </header>

            {loading ? <div className="text-center py-10">Loading Orders...</div> : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Order ID</th>
                                <th className="p-4 font-semibold text-gray-600">Distributor</th>
                                <th className="p-4 font-semibold text-gray-600">Date</th>
                                <th className="p-4 font-semibold text-gray-600">Amount</th>
                                <th className="p-4 font-semibold text-gray-600">Status</th>
                                <th className="p-4 font-semibold text-gray-600">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {orders.map(order => (
                                <tr key={order._id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="p-4 font-medium text-slate-900 flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <Package className="w-4 h-4" />
                                        </div>
                                        {order.orderNumber}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {order.distributorId?.name || 'Unknown'}
                                        <div className="text-xs text-gray-400">{order.distributorId?.city}</div>
                                    </td>
                                    <td className="p-4 text-gray-500 text-sm">
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
                                        <Link href={`/dashboard/procurement/orders/${order._id}`}>
                                            <button className="text-gray-400 hover:text-blue-600 transition-colors">
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {orders.length === 0 && (
                        <div className="p-12 text-center text-gray-400">
                            No orders found. Create your first order!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
