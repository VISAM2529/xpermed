"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// --- Icons ---
const Icons = {
    Filter: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
    Sort: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>,
    Dots: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>,
    Edit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
    Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
};

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
};

// Helper to generate SVG path from data
const generateSmoothPath = (data: number[], width: number, height: number) => {
    if (data.length < 2) return "";
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const maxVal = Math.max(...data, 1); // Avoid div by 0
        const y = height - (val / maxVal) * height * 0.8 - 10; // 10px padding
        return [x, y];
    });

    return points.reduce((acc, [x, y], i, arr) => {
        if (i === 0) return `M ${x},${y}`;
        const [px, py] = arr[i - 1];
        const cx = (px + x) / 2;
        return `${acc} C ${cx},${py} ${cx},${y} ${x},${y}`;
    }, "");
};

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/dashboard/stats');
                const data = await res.json();
                setStats(data.stats);
                setOrders(data.recentOrders || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) return (
        <div className="h-[80vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
        </div>
    );

    // Prepare chart data
    const monthlySales = stats?.monthlyData?.map((m: any) => m.sales) || new Array(12).fill(0);
    const chartPath = generateSmoothPath(monthlySales, 800, 200); // SVG ViewBox logic

    // Fallback Mock line for 2025 comparison (simulated)
    const mock2025 = generateSmoothPath(monthlySales.map((v: number) => v * 1.2 + 5000), 800, 200);

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">

            <div className="flex justify-between items-end">
                <h1 className="text-3xl font-bold text-slate-900">Orders Management</h1>
                <button className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20">
                    <span className="text-lg">+</span> Create Order
                </button>
            </div>

            {/* Top Charts Row */}
            <div className="grid grid-cols-12 gap-6">

                {/* Main Large Chart */}
                <motion.div variants={item} className="col-span-12 lg:col-span-8 bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Total Orders (Trend)</h3>
                            <div className="text-sm text-slate-500">Monthly sales performance</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm font-medium"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> 2024</div>
                            <div className="flex items-center gap-2 text-sm font-medium"><span className="w-2.5 h-2.5 rounded-full bg-rose-300"></span> Target</div>
                            <div className="bg-slate-50 px-3 py-1 rounded-lg text-sm text-slate-600 font-bold border border-slate-100">Yearly ▼</div>
                        </div>
                    </div>
                    {/* Dynamic Chart Area */}
                    <div className="h-[250px] w-full relative">
                        {/* Grid Lines */}
                        {[0, 1, 2, 3, 4].map(i => <div key={i} className="absolute w-full border-t border-slate-50" style={{ bottom: `${i * 25}%` }}></div>)}

                        {/* Labels */}
                        <div className="absolute inset-0 flex items-end justify-between px-0 pb-0 text-xs text-slate-400 font-medium">
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                                <span key={m}>{m}</span>
                            ))}
                        </div>

                        {/* Lines (SVG) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 800 200" preserveAspectRatio="none">
                            {/* Teal Line (Actual) */}
                            <path d={chartPath || "M0,200 L800,200"} fill="none" stroke="#34d399" strokeWidth="3" />
                            {/* Mock/Target Line (Pink) */}
                            <path d={mock2025} fill="none" stroke="#fca5a5" strokeWidth="3" strokeDasharray="5,5" />
                        </svg>
                    </div>
                </motion.div>

                {/* Right Side Stats */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    {/* Revenue Card (Dynamic) */}
                    <motion.div variants={item} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 min-h-[190px] relative overflow-hidden group">
                        <div className="sticky z-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-slate-500 font-medium mb-1">Revenue This Month</h3>
                                    <div className="text-3xl font-bold text-slate-900 mb-1">₹{(stats?.salesMonth || 0).toLocaleString()}</div>
                                    <div className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded inline-block font-bold">↑ Actual</div>
                                </div>
                                <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">↗</div>
                            </div>
                        </div>
                        {/* Decorative Sparkline */}
                        <div className="absolute bottom-0 left-0 w-full h-24 opacity-30 group-hover:opacity-40 transition-opacity">
                            <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                                <path d="M0,40 L0,20 Q20,5 40,25 T80,15 L100,5 L100,40 Z" fill="#10b981" />
                            </svg>
                        </div>
                    </motion.div>

                    {/* Pending Card (Dynamic) */}
                    <motion.div variants={item} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 min-h-[190px] relative overflow-hidden group">
                        <div className="sticky z-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-slate-500 font-medium mb-1">Pending Orders</h3>
                                    <div className="text-3xl font-bold text-slate-900 mb-1">{stats?.pendingOrders || 0}</div>
                                    <div className="text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded inline-block font-bold">Needs Action</div>
                                </div>
                                <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">↗</div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-24 opacity-30 group-hover:opacity-40 transition-opacity">
                            <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                                <path d="M0,40 L0,15 Q30,35 50,10 T100,25 L100,40 Z" fill="#f43f5e" />
                            </svg>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Recent Orders Table (Dynamic) */}
            <motion.div variants={item} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h3 className="text-xl font-bold text-slate-900">Recent Orders</h3>
                    <div className="flex gap-2">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                            <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 bg-slate-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-slate-900/10 placeholder:text-slate-400 w-48" />
                        </div>
                        <button className="px-4 py-2 bg-slate-50 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-2 border border-slate-50">
                            <Icons.Filter /> Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                <th className="pb-4 pl-4">Customer</th>
                                <th className="pb-4">Order ID</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4">Total Price</th>
                                <th className="pb-4">Date</th>
                                <th className="pb-4 text-right pr-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-400">No orders found.</td>
                                </tr>
                            ) : (
                                orders.map((order: any) => (
                                    <tr key={order._id} className="group hover:bg-slate-50/80 transition-colors">
                                        <td className="py-4 pl-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">
                                                    {order.customerName ? order.customerName[0].toUpperCase() : 'W'}
                                                </div>
                                                <span className="font-bold text-sm text-slate-700">{order.customerName || 'Walk-in Customer'}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-sm font-medium text-slate-500 whitespace-nowrap">#{order.orderNumber}</td>
                                        <td className="py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {order.paymentStatus || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="py-4 text-sm font-bold text-slate-900">₹{order.grandTotal?.toLocaleString()}</td>
                                        <td className="py-4 text-sm font-medium text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="py-4 text-right pr-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Icons.Edit /></button>
                                                <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Icons.Trash /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}
