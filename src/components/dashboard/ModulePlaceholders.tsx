import { Card } from '@/components/ui/Base';

// --- Inventory Page ---
export function InventoryPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">Inventory Management</h1>
            <div className="grid gap-4">
                <Card className="border-dashed border-2 border-slate-200 h-64 flex items-center justify-center">
                    <p className="text-slate-400">Inventory Module Blueprint</p>
                </Card>
            </div>
        </div>
    );
}

// --- Sales Page ---
export function SalesPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">Sales & POS</h1>
            <Card className="border-dashed border-2 border-slate-200 h-64 flex items-center justify-center">
                <p className="text-slate-400">POS Module Blueprint</p>
            </Card>
        </div>
    );
}

// --- Purchases Page ---
export function PurchasesPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">Purchase Management</h1>
            <Card className="border-dashed border-2 border-slate-200 h-64 flex items-center justify-center">
                <p className="text-slate-400">Purchase Module Blueprint</p>
            </Card>
        </div>
    );
}

// --- Reports Page ---
export function ReportsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">Analytics & Reports</h1>
            <Card className="border-dashed border-2 border-slate-200 h-64 flex items-center justify-center">
                <p className="text-slate-400">Reports Module Blueprint</p>
            </Card>
        </div>
    );
}

// --- Settings Page ---
export function SettingsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">Settings</h1>
            <Card className="border-dashed border-2 border-slate-200 h-64 flex items-center justify-center">
                <p className="text-slate-400">Settings Module Blueprint</p>
            </Card>
        </div>
    );
}
