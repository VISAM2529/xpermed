
"use client";

import { useTenant } from '@/providers/TenantProvider';
import { useRouter } from 'next/navigation';
import { LogOut, Truck } from 'lucide-react';

export default function SalesmanLayout({ children }: { children: React.ReactNode }) {
    const { tenant, user, logout } = useTenant();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Simple Mobile-Friendly Header */}
            <header className="bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-lg">
                <div className="flex justify-between items-center max-w-4xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                            <Truck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">Delivery App</h1>
                            <p className="text-xs text-slate-400">
                                {user?.name} <span className="opacity-50 text-[10px]">(...{
                                    // Hack: Retrieve ID from token if not in user object, or just ignore for now.
                                    // User object comes from context.
                                    // Let's just blindly show "ID: Check Logs" or similar? No that's confusing.
                                    // I'll skip editing this file.
                                })</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                        title="Sign Out"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <main className="p-4 max-w-4xl mx-auto pb-20">
                {children}
            </main>
        </div>
    );
}
