"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const MENU_ITEMS = [
    { label: 'Overview', href: '/admin', icon: (active: boolean) => <svg className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
    { label: 'Tenants', href: '/admin/tenants', icon: (active: boolean) => <svg className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
    { label: 'Plans & Billing', href: '/admin/billing', icon: (active: boolean) => <svg className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: 'System Logs', href: '/admin/logs', icon: (active: boolean) => <svg className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
    { label: 'Settings', href: '/admin/settings', icon: (active: boolean) => <svg className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="w-[280px] h-screen bg-slate-950 flex flex-col border-r border-slate-800 text-slate-300">
            <div className="h-20 flex items-center px-8 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
                        SA
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white leading-none">Super Admin</h2>
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1 block">Platform Control</span>
                    </div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <div className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive ? 'bg-indigo-600/10 text-indigo-400' : 'hover:bg-slate-900 hover:text-white'}`}>
                                <div className="relative z-10">{item.icon(isActive)}</div>
                                <span className={`text-sm font-bold relative z-10`}>{item.label}</span>
                                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full" />}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 shrink-0 border-t border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                        A
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white">Administrator</div>
                        <div className="text-xs text-slate-500">platform@xpermed.com</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
