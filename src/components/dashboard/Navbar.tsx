"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTenant } from '@/providers/TenantProvider';

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
    const { tenant, user } = useTenant();
    const [tenantName, setTenantName] = useState('Loading...');
    const [initials, setInitials] = useState('DA');
    const [role, setRole] = useState('Administrator');

    useEffect(() => {
        if (tenant?.name) {
            setTenantName(tenant.name);

            // Set Initials
            const words = tenant.name.split(' ');
            if (words.length >= 2) {
                setInitials((words[0][0] + words[1][0]).toUpperCase());
            } else {
                setInitials(tenant.name.slice(0, 2).toUpperCase());
            }
        }

        if (user?.role) {
            setRole(user.role === 'super_admin' ? 'Owner' : 'Administrator');
        }
    }, [tenant, user]);

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 shadow-sm gap-4"
        >
            {/* Hamburger for Mobile */}
            <button onClick={onMenuClick} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl hidden md:block">
                <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search medicines, orders..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1">
                        <kbd className="px-2 py-1 text-xs font-semibold text-slate-400 bg-white border border-slate-200 rounded-md shadow-sm">Ctrl</kbd>
                        <kbd className="px-2 py-1 text-xs font-semibold text-slate-400 bg-white border border-slate-200 rounded-md shadow-sm">K</kbd>
                    </div>
                </div>
            </div>

            {/* Mobile Search Icon */}
            <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>

            {/* Right Actions */}
            <div className="flex items-center gap-3 lg:gap-6">
                <div className="flex items-center gap-2">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg relative"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                    </motion.button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden lg:block">
                        <div className="text-sm font-bold text-slate-900">{tenantName}</div>
                        <div className="text-xs text-slate-500">{role}</div>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="h-9 w-9 lg:h-10 lg:w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20 cursor-pointer"
                    >
                        {initials}
                    </motion.div>
                </div>
            </div>
        </motion.header>
    );
}
