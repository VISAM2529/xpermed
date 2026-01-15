
"use client";

import { useState, useEffect } from 'react';
import { UserPlus, User, Mail, Shield, Loader2 } from 'lucide-react';
import { useTenant } from '@/providers/TenantProvider';

export default function ManageSalesmenPage() {
    const { tenant } = useTenant();
    const [salesmen, setSalesmen] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    useEffect(() => {
        if (tenant) fetchSalesmen();
    }, [tenant]);

    const fetchSalesmen = async () => {
        try {
            const res = await fetch('/api/distributor/salesmen', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.salesmen) setSalesmen(data.salesmen);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleAddSalesman = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/distributor/salesmen', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                setSalesmen([...salesmen, data.salesman]);
                setIsAdding(false);
                setFormData({ name: '', email: '', password: '' });
                alert('Salesman added successfully!');
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manage Sales Team</h1>
                    <p className="text-slate-500">Add salesmen to handle deliveries and field work.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                    <UserPlus className="w-5 h-5" /> {isAdding ? 'Cancel' : 'Add New Salesman'}
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 animate-in slide-in-from-top-4 fade-in duration-200">
                    <h3 className="font-bold text-lg mb-4">Register New Salesman</h3>
                    <form onSubmit={handleAddSalesman} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="text"
                            placeholder="Full Name"
                            required
                            className="p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <input
                            type="email"
                            placeholder="Email Address"
                            required
                            className="p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Set Password"
                            required
                            className="p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                        <div className="md:col-span-3 flex justify-end">
                            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {salesmen.map((user) => (
                    <div key={user._id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900">{user.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Mail className="w-3 h-3" /> {user.email}
                            </div>
                            <div className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Shield className="w-3 h-3" /> Salesman
                            </div>
                        </div>
                    </div>
                ))}

                {!loading && salesmen.length === 0 && (
                    <div className="col-span-3 text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        No salesmen added yet.
                    </div>
                )}
            </div>
        </div>
    );
}
