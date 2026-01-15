
"use client";

import { useTenant } from '@/providers/TenantProvider';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
    const { tenant } = useTenant();
    const [settings, setSettings] = useState({
        minOrderAmount: 0,
        paymentTerms: '',
        paymentInstructions: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, [tenant?.id]);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/distributor/settings');
            const data = await res.json();
            if (data.settings) setSettings(data.settings);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/distributor/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) alert('Settings saved successfully');
            else alert('Failed to save settings');
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900">Distributor Settings</h1>
                <p className="text-slate-500 mt-2">Configure your B2B ordering parameters.</p>
            </header>

            {loading ? (
                <div className="text-center py-12 text-slate-400">Loading settings...</div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm"
                >
                    <form onSubmit={handleSave} className="space-y-8">
                        {/* Order Rules */}
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Order Rules</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Order Amount (₹)</label>
                                    <p className="text-xs text-slate-500 mb-2">Pharmacies cannot place orders below this value.</p>
                                    <input
                                        type="number"
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={settings.minOrderAmount}
                                        onChange={(e) => setSettings({ ...settings, minOrderAmount: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Settings */}
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Payment Configuration</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Default Payment Terms</label>
                                    <p className="text-xs text-slate-500 mb-2">e.g., "Net 30", "Advance Payment Only"</p>
                                    <input
                                        type="text"
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={settings.paymentTerms || ''}
                                        onChange={(e) => setSettings({ ...settings, paymentTerms: e.target.value })}
                                        placeholder="Net 30"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Payment Instructions</label>
                                    <p className="text-xs text-slate-500 mb-2">Bank details or UPI ID shown to pharmacies.</p>
                                    <textarea
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-32 resize-none"
                                        value={settings.paymentInstructions || ''}
                                        onChange={(e) => setSettings({ ...settings, paymentInstructions: e.target.value })}
                                        placeholder="Bank Name: HDFC&#10;Account No: XXXXXXXX&#10;IFSC: HDFC0001234"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-70 transition-all"
                            >
                                {saving ? 'Saving Changes...' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}
        </div>
    );
}
