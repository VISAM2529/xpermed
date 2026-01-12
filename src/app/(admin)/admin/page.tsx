"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Mock Data for Design - Will connect to API later
const STATS = [
    { label: 'Total Tenants', value: '124', change: '+12%', trend: 'up' },
    { label: 'Monthly Revenue', value: '₹4.2L', change: '+8%', trend: 'up' },
    { label: 'Pending Approvals', value: '5', change: '-2', trend: 'down', alert: true },
    { label: 'Active Subscriptions', value: '98', change: '+15%', trend: 'up' },
];

const REVENUE_DATA = [
    { name: 'Jan', value: 30000 },
    { name: 'Feb', value: 45000 },
    { name: 'Mar', value: 42000 },
    { name: 'Apr', value: 80000 },
    { name: 'May', value: 75000 },
    { name: 'Jun', value: 120000 },
    { name: 'Jul', value: 160000 },
];

const TENANTS = [
    { id: 1, name: 'Apollo Pharmacy', owner: 'Rahul Sharma', email: 'rahul@apollo.com', status: 'approved', date: '2 mins ago', plan: 'Pro' },
    { id: 2, name: 'MedPlus Chemist', owner: 'Anita Roy', email: 'anita@medplus.com', status: 'pending', date: '1 hour ago', plan: 'Starter' },
    { id: 3, name: 'Wellness Forever', owner: 'Vikas Gupta', email: 'vikas@wellness.com', status: 'pending', date: '3 hours ago', plan: 'Enterprise' },
    { id: 4, name: 'Frank Ross', owner: 'S. K. Das', email: 'skdas@frankross.com', status: 'rejected', date: '1 day ago', plan: 'Pro' },
    { id: 5, name: 'NetMeds Offline', owner: 'Pradeep Dadha', email: 'pradeep@netmeds.com', status: 'approved', date: '2 days ago', plan: 'Enterprise' },
];

export default function AdminDashboard() {
    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Platform Overview</h1>
                    <p className="text-slate-500 mt-1">Welcome back, Super Admin. Here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                        Download Report
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
                        Invite Tenant
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {STATS.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-slate-500 font-medium text-sm">{stat.label}</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                        {stat.alert && (
                            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                Action Required
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Charts & Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Growth Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-lg font-bold text-slate-900">Revenue Growth</h2>
                        <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-1 outline-none">
                            <option>Last 6 Months</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={REVENUE_DATA}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#4f46e5', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Tenants / Approvals */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                    <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Registrations</h2>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {TENANTS.map((tenant) => (
                            <div key={tenant.id} className="group relative p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-slate-50 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-bold text-slate-900">{tenant.name}</div>
                                        <div className="text-xs text-slate-500">{tenant.owner}</div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${tenant.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                            tenant.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                'bg-rose-100 text-rose-700'
                                        }`}>
                                        {tenant.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100/50">
                                    <div className="text-xs text-slate-400">{tenant.date}</div>
                                    {tenant.status === 'pending' ? (
                                        <div className="flex gap-2">
                                            <button className="px-3 py-1.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg hover:bg-rose-100">Reject</button>
                                            <button className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-emerald-500/20 hover:bg-emerald-600">Approve</button>
                                        </div>
                                    ) : (
                                        <button className="text-xs font-bold text-indigo-600 hover:underline">View Details</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 py-3 bg-slate-50 text-slate-600 text-sm font-bold rounded-xl border border-dashed border-slate-300 hover:bg-slate-100 hover:border-slate-400 transition-all">
                        View All Tenants
                    </button>
                </div>
            </div>
        </div>
    );
}
