
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Phone, CheckCircle, Package, Clock, ShieldCheck } from 'lucide-react';
import { useSocket } from '@/providers/SocketProvider';

export default function SalesmanOrderDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();

    useEffect(() => {
        if (id) fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            // Reusing distributor API as Salesman belongs to same tenant
            const res = await fetch(`/api/distributor/orders/${id}`);
            const data = await res.json();
            if (data.order) setOrder(data.order);
            setLoading(false);
        } catch (error) {
            console.error(error);
        }
    };

    const markDelivered = async () => {
        const otp = window.prompt("Ask Pharmacy for Delivery OTP:");
        if (!otp) return;

        try {
            const res = await fetch(`/api/distributor/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'DELIVERED', otp }) // Server verifies OTP
            });
            const data = await res.json();

            if (res.ok) {
                setOrder(data.order);
                alert('Success! Order marked as Delivered.');
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Failed to update status');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading order...</div>;
    if (!order) return <div className="p-8 text-center text-red-500">Order not found</div>;

    return (
        <div>
            <button onClick={() => router.back()} className="flex items-center text-slate-500 hover:text-slate-800 mb-6 font-medium">
                <ArrowLeft className="w-5 h-5 mr-2" /> Back
            </button>

            {/* Status Card */}
            <div className={`p-6 rounded-2xl mb-6 text-center border ${order.status === 'DELIVERED' ? 'bg-green-50 border-green-200' : 'bg-indigo-50 border-indigo-200'
                }`}>
                <div className="font-bold text-2xl mb-1">{order.status}</div>
                <div className="text-xs opacity-70 uppercase tracking-widest font-bold">Current Status</div>
            </div>

            {/* Pharmacy Info */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{order.pharmacyId?.name}</h1>
                    <p className="text-slate-500">Order #{order.orderNumber}</p>
                </div>

                <div className="flex gap-4">
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.pharmacyId?.address}, ${order.pharmacyId?.city}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 bg-slate-100 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                        <MapPin className="w-5 h-5" /> Navigate
                    </a>
                    <a
                        href={`tel:${order.pharmacyId?.phone}`}
                        className="flex-1 bg-slate-100 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                        <Phone className="w-5 h-5" /> Call
                    </a>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-50">
                    <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                        <span className="text-slate-600 s">{order.pharmacyId?.address}, {order.pharmacyId?.city}</span>
                    </div>
                </div>
            </div>

            {/* Delivery Action */}
            {order.status !== 'DELIVERED' ? (
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg fixed bottom-6 left-4 right-4 max-w-4xl mx-auto z-40">
                    <button
                        onClick={markDelivered}
                        className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-emerald-200 shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <ShieldCheck className="w-6 h-6" /> Verify & Mark Delivered
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-3">Requires OTP from Pharmacy</p>
                </div>
            ) : (
                <div className="text-center p-6 bg-green-50 text-green-700 rounded-2xl font-bold border border-green-100 flex items-center justify-center gap-2">
                    <CheckCircle className="w-6 h-6" /> Delivery Completed
                </div>
            )}

            {/* Spacer for fixed bottom button */}
            <div className="h-32"></div>
        </div>
    );
}
