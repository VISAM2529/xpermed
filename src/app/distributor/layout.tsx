"use client";

import { useTenant } from '@/providers/TenantProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Navbar from '@/components/dashboard/Navbar';

export default function DistributorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { tenant, isLoading } = useTenant();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && tenant?.type !== 'DISTRIBUTOR') {
            // Redirect non-distributors back to main dashboard
            router.push('/dashboard');
        }
    }, [tenant, isLoading, router]);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (tenant?.type !== 'DISTRIBUTOR') {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#F6F8FA]">
            {/* Sidebar with mobile state */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content Area */}
            <div className="lg:pl-[280px] min-h-screen flex flex-col transition-all duration-300">
                <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1  max-w-[1600px] mx-auto w-full overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
