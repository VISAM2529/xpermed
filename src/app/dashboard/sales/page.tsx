"use client";

import POSModule from '@/components/dashboard/sales/POSModule';
import { ToastProvider } from '@/components/ui/Toast';

export default function SalesPage() {
    return (
        <ToastProvider>
            <div className="h-[calc(100vh-100px)]">
                <POSModule />
            </div>
        </ToastProvider>
    );
}
