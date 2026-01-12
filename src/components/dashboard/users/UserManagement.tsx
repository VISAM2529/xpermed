"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Base';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons ---
const Icons = {
    Users: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    Plus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
    Close: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
};

interface StaffUser {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'pharmacist' | 'accountant' | 'cashier';
    isActive: boolean;
}

export default function UserManagementModule() {
    const [users, setUsers] = useState<StaffUser[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        // Mock Data for now
        setUsers([
            { _id: '1', name: 'Dr. Sameer', email: 'sam@pharmacy.com', role: 'admin', isActive: true },
            { _id: '2', name: 'John Doe', email: 'john@pharmacy.com', role: 'pharmacist', isActive: true },
        ]);
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Icons.Users /> Staff Management
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Manage access privileges for your team members.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Icons.Plus /> Add Staff
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="p-5 font-bold text-slate-500 uppercase text-xs tracking-wider">Name</th>
                                <th className="p-5 font-bold text-slate-500 uppercase text-xs tracking-wider">Role</th>
                                <th className="p-5 font-bold text-slate-500 uppercase text-xs tracking-wider">Status</th>
                                <th className="p-5 font-bold text-slate-500 uppercase text-xs tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-5">
                                        <div className="font-bold text-slate-900">{user.name}</div>
                                        <div className="text-slate-400 text-xs font-medium">{user.email}</div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold capitalize border
                                            ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                user.role === 'pharmacist' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                    'bg-slate-50 text-slate-700 border-slate-100'}
                                        `}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <span className={`flex items-center gap-2 text-xs font-bold ${user.isActive ? 'text-emerald-600' : 'text-rose-500'}`}>
                                            <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-rose-500'}`} />
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <button className="text-slate-400 hover:text-slate-900 font-bold text-xs transition-colors opacity-0 group-hover:opacity-100">Edit Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-lg font-bold text-slate-900">Invite New Staff</h3>
                                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                                    <Icons.Close />
                                </button>
                            </div>

                            <div className="p-8 space-y-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                                    <input className="w-full p-3 bg-slate-50 border-none rounded-xl font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="e.g. Rahul Sharma" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                                    <input className="w-full p-3 bg-slate-50 border-none rounded-xl font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="e.g. rahul@pharmacy.com" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                                    <select className="w-full p-3 bg-slate-50 border-none rounded-xl font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none">
                                        <option value="pharmacist">Pharmacist</option>
                                        <option value="cashier">Cashier</option>
                                        <option value="accountant">Accountant</option>
                                    </select>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
                                    >
                                        Send Invite
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
