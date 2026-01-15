"use client";

import { useTenant } from '@/providers/TenantProvider';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DistributorDashboard() {
    const { tenant, user } = useTenant();
    const [stats, setStats] = useState({
        pendingOrders: 0,
        todayRevenue: 0,
        connectedPharmacies: 0,
        lowStock: 0
    });
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, ordersRes] = await Promise.all([
                    fetch('/api/distributor/stats'),
                    fetch('/api/distributor/orders?limit=5')
                ]);

                const statsData = await statsRes.json();
                const ordersData = await ordersRes.json();

                if (statsData.stats) setStats(statsData.stats);
                if (ordersData.orders) setOrders(ordersData.orders);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (tenant?.id) {
            fetchData();
        }
    }, [tenant?.id]);

    return (
        <div className="p-8">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900">Distributor Overview</h1>
                <p className="text-slate-500 mt-2">Welcome back, {user?.name}. Manage your pharmacy orders.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <StatCard label="Pending Orders" value={stats.pendingOrders} color="bg-orange-500" icon={<ClockIcon />} />
                <StatCard label="Today's Revenue" value={`₹${stats.todayRevenue.toLocaleString()}`} color="bg-emerald-500" icon={<MoneyIcon />} />
                <StatCard label="Connected Pharmacies" value={stats.connectedPharmacies} color="bg-blue-500" icon={<LinkIcon />} />
                <StatCard label="Low Stock Items" value={stats.lowStock} color="bg-red-500" icon={<AlertIcon />} />
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Recent Incoming Orders</h2>
                    <Link href="/distributor/orders" className="text-sm font-bold text-emerald-600 hover:text-emerald-700">View All</Link>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="h-40 flex items-center justify-center text-slate-400">Loading...</div>
                    ) : orders.length === 0 ? (
                        <div className="h-40 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-50 rounded-xl">
                            No recent orders found.
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                                    <th className="pb-3 pl-4">Order ID</th>
                                    <th className="pb-3">Pharmacy</th>
                                    <th className="pb-3">Date</th>
                                    <th className="pb-3 text-right">Amount</th>
                                    <th className="pb-3 pl-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {orders.map((order) => (
                                    <tr key={order._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 pl-4 font-mono font-medium text-slate-600">{order.orderNumber}</td>
                                        <td className="py-4 font-bold text-slate-800">{order.pharmacyId?.name || 'Unknown Pharmacy'}</td>
                                        <td className="py-4 text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="py-4 text-right font-mono">₹{order.totalAmount.toLocaleString()}</td>
                                        <td className="py-4 pl-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${order.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                                                    order.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' :
                                                        order.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                            'bg-slate-100 text-slate-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, color, icon }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100"
        >
            <div className={`w-12 h-12 ${color} bg-opacity-10 rounded-xl flex items-center justify-center mb-4 text-${color.replace('bg-', '')}`}>
                {icon}
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">{label}</h3>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
        </motion.div>
    );
}

// Simple Icons
const ClockIcon = () => <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const MoneyIcon = () => <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const LinkIcon = () => <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
const AlertIcon = () => <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
