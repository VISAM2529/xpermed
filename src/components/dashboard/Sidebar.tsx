"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTenant } from '@/providers/TenantProvider';

const MENU_ITEMS = [
    { label: 'Dashboard', href: '/dashboard', icon: (active: boolean) => <svg className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
    { label: 'Inventory', href: '/dashboard/inventory', icon: (active: boolean) => <svg className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
    { label: 'Sales (POS)', href: '/dashboard/sales', icon: (active: boolean) => <svg className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
    { label: 'Purchases', href: '/dashboard/purchases', icon: (active: boolean) => <svg className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
    { label: 'Reports', href: '/dashboard/reports', icon: (active: boolean) => <svg className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
    { label: 'Settings', href: '/dashboard/settings', icon: (active: boolean) => <svg className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { tenant } = useTenant();
    const [tenantName, setTenantName] = useState('Loading...');

    useEffect(() => {
        if (tenant?.name) {
            setTenantName(tenant.name);
        }
    }, [tenant]);

    const SidebarContent = (
        <div className="w-[280px] h-screen bg-white flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-slate-100">
            <div className="h-24 flex items-center px-8 cursor-pointer group shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-900/20 group-hover:scale-105 transition-transform duration-200">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 leading-none">{tenantName}</h2>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1 block">XperMed</span>
                    </div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2 custom-scrollbar">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} onClick={onClose}>
                            <div className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${isActive ? 'bg-slate-900 shadow-lg shadow-slate-900/20' : 'hover:bg-slate-50'}`}>
                                <div className="relative z-10">{item.icon(isActive)}</div>
                                <span className={`text-sm font-bold relative z-10 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-900'}`}>{item.label}</span>
                                {isActive && <motion.div layoutId="active-pill" className="absolute inset-0 bg-slate-900 rounded-xl" />}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 shrink-0">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 relative overflow-hidden border border-emerald-100">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                            <span className="font-bold text-emerald-600">%</span>
                        </div>
                        <h4 className="font-bold text-slate-900 mb-1">Current Plan</h4>
                        <p className="text-xs text-slate-500 mb-3">You are on the Pro Plan.</p>
                        <button className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors">
                            Upgrade
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar - Hidden on Mobile, Fixed on Desktop */}
            <aside className="hidden lg:flex fixed left-0 top-0 z-30 h-screen">
                {SidebarContent}
            </aside>

            {/* Mobile Sidebar - Overlay with High Z-Index */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 lg:hidden"
                    >
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

                        {/* Drawer */}
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                            className="absolute left-0 top-0 h-full bg-white shadow-2xl z-50"
                        >
                            {SidebarContent}
                        </motion.aside>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
