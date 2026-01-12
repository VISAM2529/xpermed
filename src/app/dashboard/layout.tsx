"use client";

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Navbar from '@/components/dashboard/Navbar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#F6F8FA]">
            {/* Sidebar with mobile state */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content Area */}
            <div className="lg:pl-[280px] min-h-screen flex flex-col transition-all duration-300">
                <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 p-4 lg:p-8 max-w-[1600px] mx-auto w-full overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
