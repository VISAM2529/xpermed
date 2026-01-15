
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Box, ChevronRight, CheckCircle, Package } from 'lucide-react';

export default function SalesmanOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/salesman/orders', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.orders) setOrders(data.orders);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading deliveries...</div>;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 mb-4">My Deliveries</h2>

            {orders.length === 0 && (
                <div className="bg-white p-8 rounded-2xl text-center border border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Box className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-slate-900">No Assignments</h3>
                    <p className="text-slate-500 text-sm">You have no pending deliveries.</p>
                </div>
            )}

            {orders.map((order) => (
                <Link href={`/salesman/orders/${order._id}`} key={order._id}>
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm active:scale-[0.98] transition-all mb-4 relative overflow-hidden">
                        {order.status === 'DELIVERED' && (
                            <div className="absolute right-0 top-0 bg-green-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl">
                                Completed
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">{order.pharmacyId?.name}</h3>
                                <p className="text-sm text-slate-500">{order.orderNumber}</p>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg">
                                <ChevronRight className="w-5 h-5 text-slate-400" />
                            </div>
                        </div>

                        <div className="flex items-start gap-3 mb-4">
                            <MapPin className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                            <span className="text-sm text-slate-600 leading-relaxed max-w-[80%]">
                                {order.pharmacyId?.address}, {order.pharmacyId?.city}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-medium pt-3 border-t border-slate-50">
                            <span className="flex items-center gap-1 text-slate-500 bg-slate-50 px-2 py-1 rounded">
                                <Box className="w-3 h-3" /> {order.items.length} Items
                            </span>
                            <span className={`px-2 py-1 rounded 
                                ${order.status === 'DELIVERED' ? 'text-green-600 bg-green-50' :
                                    order.status === 'SHIPPED' ? 'text-indigo-600 bg-indigo-50' : 'text-amber-600 bg-amber-50'}
                            `}>
                                {order.status}
                            </span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
