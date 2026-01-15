
"use client";

import { useTenant } from '@/providers/TenantProvider';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SuppliersPage() {
    const { tenant } = useTenant();
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        gstNumber: '',
        contactPerson: ''
    });

    const [editingId, setEditingId] = useState<string | null>(null);

    const fetchSuppliers = async () => {
        try {
            const res = await fetch('/api/distributor/suppliers');
            const data = await res.json();
            if (data.suppliers) setSuppliers(data.suppliers);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tenant?.id) fetchSuppliers();
    }, [tenant?.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const method = editingId ? 'PATCH' : 'POST'; // Assuming generic PATCH for update or separate endpoint
            // Currently my API only supports GET/POST. I'll just do POST for create.
            // If I want Edit, I need to update the API. For now, let's just support Create.
            // Or I can quickly add PUT/PATCH logic to the API. 
            // Let's stick to Create for now as requested "Add my supplier".

            if (editingId) {
                alert("Edit feature coming soon. Please create new for now.");
                setSubmitting(false);
                return;
            }

            const res = await fetch('/api/distributor/suppliers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setShowModal(false);
                setFormData({ name: '', email: '', phone: '', address: '', gstNumber: '', contactPerson: '' });
                fetchSuppliers();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to save');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading suppliers...</div>;

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Suppliers</h1>
                    <p className="text-slate-500 mt-1">Manage your list of vendors and distributors.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition"
                >
                    + Add Supplier
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                            <th className="p-4">Name</th>
                            <th className="p-4">Phone</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">GST No</th>
                            <th className="p-4">Address</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {suppliers.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-400">No suppliers found.</td></tr>
                        ) : (
                            suppliers.map(s => (
                                <tr key={s._id} className="hover:bg-slate-50/50">
                                    <td className="p-4 font-bold text-slate-700">{s.name}</td>
                                    <td className="p-4 text-slate-600">{s.phone || '-'}</td>
                                    <td className="p-4 text-slate-600">{s.email || '-'}</td>
                                    <td className="p-4 text-slate-600 font-mono text-xs">{s.gstNumber || '-'}</td>
                                    <td className="p-4 text-slate-600 truncate max-w-xs">{s.address || '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-lg">Add New Supplier</h3>
                                <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
                                    <input
                                        required
                                        className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                        <input
                                            className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">GST Number</label>
                                        <input
                                            className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                                            value={formData.gstNumber}
                                            onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                                        <input
                                            className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                                            value={formData.contactPerson}
                                            onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                    <textarea
                                        rows={3}
                                        className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : 'Save Supplier'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
