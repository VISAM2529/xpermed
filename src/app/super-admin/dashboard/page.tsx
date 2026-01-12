"use client";

import { useEffect, useState } from 'react';
import { Button, Card } from '@/components/ui/Base';

export default function SuperAdminDashboard() {
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            const res = await fetch('/api/admin/tenants'); // Need to implement this
            const data = await res.json();
            setTenants(data.tenants || []);
        } catch (error) {
            console.error('Failed to fetch', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (tenantId: string, status: 'approved' | 'rejected') => {
        try {
            const res = await fetch('/api/admin/tenants', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tenantId, status })
            });
            if (res.ok) fetchTenants();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Super Admin Control</h1>
                        <p className="text-slate-500">Manage onboarding requests and system health</p>
                    </div>
                    <Button variant="outline" onClick={fetchTenants}>Refresh List</Button>
                </header>

                <Card>
                    <h3 className="text-lg font-semibold mb-4">Pending Requests</h3>
                    {loading ? <p>Loading...</p> : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b text-slate-500 text-sm">
                                        <th className="p-3">Pharmacy Name</th>
                                        <th className="p-3">Owner / Email</th>
                                        <th className="p-3">License Info</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tenants.map((t) => (
                                        <tr key={t._id} className="border-b last:border-0 hover:bg-slate-50 text-sm">
                                            <td className="p-3 font-medium">
                                                {t.name}<br />
                                                <span className="text-xs text-slate-400 font-mono">{t.subdomain}.app.com</span>
                                            </td>
                                            <td className="p-3">
                                                {t.email}<br />
                                                <span className="text-xs text-slate-500">{t.phone}</span>
                                            </td>
                                            <td className="p-3">
                                                GST: {t.gstNumber || 'N/A'}<br />
                                                DL: {t.licenseNumber || 'N/A'}
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${t.onboardingStatus === 'approved' ? 'bg-green-100 text-green-700' :
                                                        t.onboardingStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {t.onboardingStatus.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-3 flex gap-2">
                                                {t.onboardingStatus === 'pending' && (
                                                    <>
                                                        <Button size="sm" onClick={() => handleStatusChange(t._id, 'approved')}>Approve</Button>
                                                        <Button size="sm" variant="danger" onClick={() => handleStatusChange(t._id, 'rejected')}>Reject</Button>
                                                    </>
                                                )}
                                                {t.onboardingStatus === 'approved' && (
                                                    <span className="text-xs text-slate-400">Archived</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {tenants.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-400">No pending requests found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
