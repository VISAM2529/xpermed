"use client";
import { useState, useEffect } from 'react';
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

export default function AdminDashboard() {
    const [tenants, setTenants] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Tenants
    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const res = await fetch('/api/admin/tenants');
                const data = await res.json();
                if (data.tenants) {
                    setTenants(data.tenants);
                }
            } catch (error) {
                console.error('Failed to fetch tenants:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTenants();
    }, []);

    // Handle Approval
    const handleApprove = async (id: string) => {
        if (!id) {
            console.error("Invalid Tenant ID");
            return;
        }
        try {
            const res = await fetch(`/api/admin/tenants/${id}/approve`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' })
            });

            if (res.ok) {
                // Update local state
                setTenants(tenants.map(t => t._id === id ? { ...t, onboardingStatus: 'approved' } : t));
            } else {
                const err = await res.json();
                alert(`Failed: ${err.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error approving tenant:', error);
        }
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            {/* ... Header & Stats (Keep mock stats for now or calculate from tenants) ... */}

            {/* ... Charts ... */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ... Revenue Chart ... */}

                {/* Recent Tenants / Approvals */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                    <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Registrations</h2>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar max-h-[400px]">
                        {isLoading ? (
                            <p className="text-center text-slate-400 py-4">Loading...</p>
                        ) : tenants.length === 0 ? (
                            <p className="text-center text-slate-400 py-4">No registrations yet.</p>
                        ) : (
                            tenants.map((tenant) => (
                                <div key={tenant._id} className="group relative p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-slate-50 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-bold text-slate-900">{tenant.name}</div>
                                            <div className="text-xs text-slate-500">{tenant.subdomain}.xpermed.com</div>
                                            <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{tenant.type}</div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${tenant.onboardingStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                            tenant.onboardingStatus === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                'bg-rose-100 text-rose-700'
                                            }`}>
                                            {tenant.onboardingStatus}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100/50">
                                        <div className="text-xs text-slate-400">
                                            {new Date(tenant.createdAt).toLocaleDateString()}
                                        </div>
                                        {tenant.onboardingStatus === 'pending' ? (
                                            <div className="flex gap-2">
                                                <button className="px-3 py-1.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg hover:bg-rose-100">Reject</button>
                                                <button
                                                    onClick={() => handleApprove(tenant._id)}
                                                    className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-emerald-500/20 hover:bg-emerald-600"
                                                >
                                                    Approve
                                                </button>
                                            </div>
                                        ) : (
                                            <button className="text-xs font-bold text-indigo-600 hover:underline">View Details</button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {/* ... View All Button ... */}
                </div>
            </div>
        </div>
    );
}
