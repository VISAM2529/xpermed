
"use client";

import { useTenant } from '@/providers/TenantProvider';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConnectionsPage() {
    const { tenant } = useTenant();
    const [connections, setConnections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'APPROVED' | 'PENDING'>('APPROVED');

    useEffect(() => {
        fetchConnections();
    }, [tenant?.id]);

    const fetchConnections = async () => {
        try {
            const res = await fetch('/api/distributor/connections');
            const data = await res.json();
            if (data.connections) setConnections(data.connections);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (linkId: string, status: 'APPROVED' | 'REJECTED', creditLimit = 0) => {
        try {
            const res = await fetch('/api/distributor/connections', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ linkId, status, creditLimit })
            });
            if (res.ok) fetchConnections();
        } catch (error) {
            alert('Action failed');
        }
    };

    const filteredList = connections.filter(c => c.status === activeTab || (activeTab === 'APPROVED' && c.status === 'REJECTED'));
    // Show Approved and Rejected in history? Or strictly separate. Let's just do status-based filters.

    return (
        <div className="p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Pharmacy Connections</h1>
                <p className="text-slate-500 mt-1">Manage B2B relationships and credit terms.</p>
            </header>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-slate-200 mb-6">
                <button
                    onClick={() => setActiveTab('APPROVED')}
                    className={`pb-3 text-sm font-bold duration-200 ${activeTab === 'APPROVED' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Active Connections
                </button>
                <button
                    onClick={() => setActiveTab('PENDING')}
                    className={`pb-3 text-sm font-bold duration-200 ${activeTab === 'PENDING' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Pending Requests
                    {connections.filter(c => c.status === 'PENDING').length > 0 &&
                        <span className="ml-2 bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                            {connections.filter(c => c.status === 'PENDING').length}
                        </span>
                    }
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-slate-400">Loading connections...</div>
                ) : filteredList.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                        No {activeTab.toLowerCase()} connections found.
                    </div>
                ) : (
                    <AnimatePresence>
                        {filteredList.map((link) => (
                            <motion.div
                                key={link._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                            >
                                {link.status === 'PENDING' && <div className="absolute top-0 right-0 w-2 h-2 m-4 bg-orange-500 rounded-full animate-pulse" />}

                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">{link.pharmacyId.name}</h3>
                                        <div className="text-xs text-slate-500">{link.pharmacyId.email}</div>
                                        <div className="text-xs text-slate-400 max-w-[200px] truncate">{link.pharmacyId.address?.city || 'Location Unknown'}</div>
                                    </div>
                                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                        {link.pharmacyId.name.substring(0, 2).toUpperCase()}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Requested</span>
                                        <span className="font-medium text-slate-700">{new Date(link.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {link.status === 'APPROVED' && (
                                        <>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Credit Limit</span>
                                                <span className="font-bold text-emerald-600">₹{link.creditLimit.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Terms</span>
                                                <span className="font-medium text-slate-700">{link.paymentTerms || 'Net 30'}</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {link.status === 'PENDING' ? (
                                    <div className="mt-6 flex gap-3">
                                        <button
                                            onClick={() => handleAction(link._id, 'REJECTED')}
                                            className="flex-1 py-2 bg-rose-50 text-rose-600 font-bold text-sm rounded-xl hover:bg-rose-100"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleAction(link._id, 'APPROVED', 50000)} // Default 50k Limit
                                            className="flex-1 py-2 bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600"
                                        >
                                            Approve
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                                        <span className={`text-xs font-bold uppercase tracking-wide ${link.status === 'APPROVED' ? 'text-emerald-600' : 'text-rose-600'
                                            }`}>
                                            {link.status}
                                        </span>
                                        <button className="text-indigo-600 text-sm font-bold hover:underline">Manage Limits</button>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
