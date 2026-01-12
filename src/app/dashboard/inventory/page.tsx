"use client";

import InventoryModule from '@/components/dashboard/inventory/InventoryModule';
import { ToastProvider } from '@/components/ui/Toast';

export default function InventoryPage() {
    return (
        <ToastProvider>
            <div className="space-y-6">
                {/* Page Header is handled inside Module for better control */}
                <InventoryModule />
            </div>
        </ToastProvider>
    );
}
