"use client";

import { Button } from '@/components/ui/Base';

// --- Icons ---
const Icons = {
    Store: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m8-2a2 2 0 100-4 2 2 0 000 4zm-2-4a2 2 0 100-4 2 2 0 000 4zm2-4a2 2 0 100-4 2 2 0 000 4zm-2-4a2 2 0 100-4 2 2 0 000 4z" /></svg>,
    Shield: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    Document: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
};

export default function PharmacyProfileModule() {
    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Icons.Store /> Pharmacy Profile
                </h2>
                <p className="text-slate-500 text-sm mt-1">Manage your business identity and operational settings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Business Info */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500">
                            <Icons.Store />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Business Details</h3>
                            <p className="text-xs text-slate-400 font-medium">Public facing information</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pharmacy Name</label>
                            <input
                                className="w-full p-3 bg-slate-50 border-none rounded-xl font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-300"
                                defaultValue="Apollo Pharmacy"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                                <input
                                    className="w-full p-3 bg-slate-50 border-none rounded-xl font-medium text-slate-700 outline-none"
                                    defaultValue="+91 9876543210"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Currency</label>
                                <select className="w-full p-3 bg-slate-50 border-none rounded-xl font-medium text-slate-700 outline-none">
                                    <option>INR (₹)</option>
                                    <option>USD ($)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address</label>
                            <textarea
                                className="w-full p-3 bg-slate-50 border-none rounded-xl font-medium text-slate-700 min-h-[100px] resize-none outline-none"
                                defaultValue="Shop 12, Main Market, Mumbai"
                            />
                        </div>
                    </div>
                </div>

                {/* Compliance & Settings */}
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                <Icons.Shield />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Legal & Compliance</h3>
                                <p className="text-xs text-slate-400 font-medium">Regulatory numbers</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">GST Number</label>
                                <div className="flex items-center">
                                    <input
                                        className="w-full p-3 bg-slate-50 border-none rounded-xl font-mono font-medium text-slate-600 outline-none opacity-70"
                                        defaultValue="27ABCDE1234F1Z5"
                                        readOnly
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1 pl-1">Contact Support to update GST details</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Drug License</label>
                                <input
                                    className="w-full p-3 bg-slate-50 border-none rounded-xl font-mono font-medium text-slate-600 outline-none opacity-70"
                                    defaultValue="MH-TZ-123456"
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>

                    {/* Invoice Settings */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                <Icons.Document />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Invoice Settings</h3>
                                <p className="text-xs text-slate-400 font-medium">Customization for bills</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prefix</label>
                                <input className="w-full p-3 bg-slate-50 border-none rounded-xl font-bold text-slate-900 outline-none" defaultValue="INV-" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Start #</label>
                                <input className="w-full p-3 bg-slate-50 border-none rounded-xl font-bold text-slate-900 outline-none" defaultValue="1001" type="number" />
                            </div>
                        </div>

                        <label className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                            <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" defaultChecked />
                            <span className="text-sm font-bold text-slate-700">Print Terms & Conditions on Bill</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
                <button className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    Save Configuration
                </button>
            </div>
        </div>
    );
}
