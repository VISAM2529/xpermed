"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PharmacyProfileModule from '@/components/dashboard/profile/PharmacyProfile';
import UserManagementModule from '@/components/dashboard/users/UserManagement';

// --- Icons ---
const Icons = {
    Store: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m8-2a2 2 0 100-4 2 2 0 000 4zm-2-4a2 2 0 100-4 2 2 0 000 4zm2-4a2 2 0 100-4 2 2 0 000 4zm-2-4a2 2 0 100-4 2 2 0 000 4z" /></svg>,
    Users: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    CreditCard: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
};

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'profile' | 'users' | 'billing'>('profile');

    const tabs = [
        { id: 'profile', label: 'Pharmacy Profile', icon: Icons.Store },
        { id: 'users', label: 'User Management', icon: Icons.Users },
        { id: 'billing', label: 'Billing & Plan', icon: Icons.CreditCard },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings & Configuration</h1>
                <p className="text-slate-500 mt-1">Manage system preferences and pharmacy details.</p>
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
                                layoutId="activeTabSettings"
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

            {/* Content Area */}
            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'profile' && <PharmacyProfileModule />}
                        {activeTab === 'users' && <UserManagementModule />}
                        {activeTab === 'billing' && (
                            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm border-dashed">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Icons.CreditCard />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Subscription & Billing</h3>
                                <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-8">
                                    View your current plan details and billing history. This module is coming soon.
                                </p>
                                <button className="px-6 py-3 bg-slate-100 text-slate-400 rounded-xl font-bold cursor-not-allowed">
                                    Manage Subscription
                                </button>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
