"use client";

import PurchaseModule from '@/components/dashboard/sales/PurchaseModule';
import { ToastProvider } from '@/components/ui/Toast';

export default function PurchasesPage() {
    return (
        <ToastProvider>
            <PurchaseModule />
        </ToastProvider>
    );
}
