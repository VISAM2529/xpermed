"use client";

import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside className="sticky top-0 h-screen shrink-0 hidden lg:block">
                <AdminSidebar />
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="min-h-screen">
                    {children}
                </div>
            </main>
        </div>
    );
}
