"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Base';

// --- Icons ---
const Icons = {
    Chart: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    Clock: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Document: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    Download: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
    TrendingUp: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
};

export default function ReportsModule() {
    const [activeTab, setActiveTab] = useState<'sales' | 'expiry' | 'gst'>('sales');
    const [salesData, setSalesData] = useState<any>(null);
    const [expiryData, setExpiryData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                if (activeTab === 'sales') {
                    const res = await fetch('/api/reports/sales');
                    const data = await res.json();
                    setSalesData(data);
                } else if (activeTab === 'expiry') {
                    const res = await fetch('/api/reports/expiry?days=60'); // Next 60 days
                    const data = await res.json();
                    setExpiryData(data.batches || []);
                }
            } catch (e) {
                console.error("Report Fetch Error", e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [activeTab]);

    const tabs = [
        { id: 'sales', label: 'Sales & Profit', icon: Icons.Chart },
        { id: 'expiry', label: 'Expiry & Stock', icon: Icons.Clock },
    ];

    // Helper to generate graph path
    const getGraphPath = (data: any[], width: number, height: number) => {
        if (!data || data.length === 0) return '';
        const maxVal = Math.max(...data.map(d => d.sales), 1000); // Min 1000 to avoid flatline
        const stepX = width / (data.length - 1);

        let path = `M0,${height} `; // Start bottom-left

        data.forEach((d: any, i: number) => {
            const x = i * stepX;
            const y = height - (d.sales / maxVal) * height; // Invert Y
            path += `L${x},${y} `;
        });

        path += `L${width},${height} Z`; // Close path
        return path;
    };

    const getLinePath = (data: any[], width: number, height: number) => {
        if (!data || data.length === 0) return '';
        const maxVal = Math.max(...data.map(d => d.sales), 1000);
        const stepX = width / (data.length - 1);

        // Build M x y L x y ...
        return data.map((d: any, i: number) => {
            const x = i * stepX;
            const y = height - (d.sales / maxVal) * height * 0.8; // Scale to 80% height to leave headroom
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics & Reports</h1>
                <p className="text-slate-500 mt-1">Monitor business performance and inventory health.</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === tab.id ? 'text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-white rounded-xl"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <tab.icon />
                            {tab.label}
                        </span>
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-20 text-center"
                    >
                        <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-400 font-medium text-sm">Crunching the numbers...</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'sales' && salesData && (
                            <div className="space-y-6">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-emerald-100 transition-colors">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <div className="w-24 h-24 bg-emerald-500 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
                                        </div>
                                        <h3 className="text-slate-500 font-medium text-sm">Total Sales (Today)</h3>
                                        <p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">₹ {(salesData.summary?.salesToday || 0).toLocaleString()}</p>
                                        <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-lg">
                                            <Icons.TrendingUp />
                                            <span>+12.5% vs yesterday</span>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-blue-100 transition-colors">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <div className="w-24 h-24 bg-blue-500 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
                                        </div>
                                        <h3 className="text-slate-500 font-medium text-sm">Gross Profit</h3>
                                        <p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">₹ {(salesData.summary?.grossProfit || 0).toLocaleString()}</p>
                                        <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-lg">
                                            <span>~20% Margin</span>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-purple-100 transition-colors">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <div className="w-24 h-24 bg-purple-500 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
                                        </div>
                                        <h3 className="text-slate-500 font-medium text-sm">Total Orders</h3>
                                        <p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{salesData.summary?.ordersToday || 0}</p>
                                        <div className="mt-4 text-xs font-medium text-slate-400">
                                            Across all counters
                                        </div>
                                    </div>
                                </div>

                                {/* Graph Section */}
                                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                                    <h3 className="font-bold text-slate-900 mb-6 relative z-10">Sales Trend (Last 7 Days)</h3>

                                    <div className="h-64 flex items-end w-full relative">
                                        {/* SVG Graph */}
                                        {salesData.trend?.length > 1 ? (
                                            <div className="absolute inset-0 top-10 pointer-events-none">
                                                <svg viewBox="0 0 1000 300" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                                    <defs>
                                                        <linearGradient id="gradientGraph" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
                                                            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                                                        </linearGradient>
                                                    </defs>
                                                    {/* Area */}
                                                    <motion.path
                                                        initial={{ opacity: 0, pathLength: 0 }}
                                                        animate={{ opacity: 1, pathLength: 1 }}
                                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                                        d={`${getLinePath(salesData.trend, 1000, 300)} L 1000 300 L 0 300 Z`}
                                                        fill="url(#gradientGraph)"
                                                    />
                                                    {/* Line */}
                                                    <motion.path
                                                        initial={{ pathLength: 0 }}
                                                        animate={{ pathLength: 1 }}
                                                        transition={{ duration: 1.5, ease: "easeInOut" }}
                                                        d={getLinePath(salesData.trend, 1000, 300)}
                                                        fill="none"
                                                        stroke="#059669"
                                                        strokeWidth="4"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                    {/* Dots */}
                                                    {salesData.trend.map((d: any, i: number) => {
                                                        const width = 1000;
                                                        const height = 300;
                                                        const maxVal = Math.max(...salesData.trend.map((t: any) => t.sales), 1000);
                                                        const x = i * (width / (salesData.trend.length - 1));
                                                        const y = height - (d.sales / maxVal) * height * 0.8;
                                                        return (
                                                            <motion.circle
                                                                key={i}
                                                                cx={x}
                                                                cy={y}
                                                                r="6"
                                                                fill="#fff"
                                                                stroke="#059669"
                                                                strokeWidth="3"
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                transition={{ delay: 1 + i * 0.1 }}
                                                            />
                                                        );
                                                    })}
                                                </svg>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">
                                                Not enough data for graph
                                            </div>
                                        )}

                                        {/* X-Axis Labels positioned relatively */}
                                        <div className="w-full flex justify-between absolute bottom-0 text-xs font-bold text-slate-400 uppercase pt-4 border-t border-slate-100">
                                            {salesData.trend?.map((day: any) => (
                                                <span key={day.date}>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'expiry' && (
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-slate-900">Expiring Items</h3>
                                        <p className="text-xs text-slate-400 mt-1">Stock expiring within the next 60 days.</p>
                                    </div>
                                    <Button size="sm" className="bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-100">
                                        <Icons.Download /> <span className="ml-2">Download List</span>
                                    </Button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50/50 text-slate-500">
                                            <tr>
                                                <th className="p-4 font-bold text-xs uppercase">Medicine</th>
                                                <th className="p-4 font-bold text-xs uppercase">Batch</th>
                                                <th className="p-4 font-bold text-xs uppercase">Expiry Date</th>
                                                <th className="p-4 font-bold text-xs uppercase">Qty</th>
                                                <th className="p-4 font-bold text-xs uppercase">Value (MRP)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {expiryData.map((item: any) => (
                                                <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-4 font-bold text-slate-700">{item.productId?.name || 'Unknown'}</td>
                                                    <td className="p-4 font-mono text-slate-500">{item.batchNumber}</td>
                                                    <td className="p-4 font-bold text-rose-500 bg-rose-50/50 w-fit rounded-lg px-2 py-1 inline-flex items-center gap-2 mt-2 ml-2">
                                                        <span>{new Date(item.expiryDate).toLocaleDateString()}</span>
                                                    </td>
                                                    <td className="p-4 font-medium text-slate-900">{item.quantity}</td>
                                                    <td className="p-4 text-slate-500">₹ {(item.mrp * item.quantity).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                            {expiryData.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="py-20 text-center">
                                                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                        </div>
                                                        <p className="text-slate-900 font-bold">No expiring items</p>
                                                        <p className="text-xs text-slate-400 mt-1">Your inventory is fresh!</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
