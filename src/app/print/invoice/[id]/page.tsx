"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Base';

export default function PrintInvoicePage() {
    const params = useParams();
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetch(`/api/purchases/${params.id}`, { headers: { 'x-tenant-id': 'demo-pharmacy' } })
                .then(res => res.json())
                .then(data => {
                    setInvoice(data.purchase);
                    setLoading(false);
                    // Auto-print after a short delay to ensure rendering
                    // setTimeout(() => window.print(), 500); 
                })
                .catch(err => setLoading(false));
        }
    }, [params.id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold">Loading Invoice...</div>;
    if (!invoice) return <div className="min-h-screen flex items-center justify-center text-rose-500 font-bold">Invoice not found.</div>;

    return (
        <div className="min-h-screen bg-slate-100 p-8 print:p-0 print:bg-white flex justify-center">

            {/* A4 Paper Container */}
            <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl print:shadow-none p-12 relative flex flex-col justify-between">

                {/* Print Fab (Hidden in Print) */}
                <div className="absolute top-0 right-0 -mr-20 top-0 hidden md:block print:hidden space-y-2">
                    <button onClick={() => window.print()} className="bg-slate-900 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    </button>
                    <div className="text-center text-xs font-bold text-slate-400">Print</div>
                </div>

                <div>
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-slate-900 pb-8 mb-8">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Purchase Invoice</h1>
                            <p className="text-slate-500 font-medium mt-1">Original Receipt</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold text-emerald-600">XperMed ERP</h2>
                            <p className="text-slate-500 text-sm mt-1">Demo Pharmacy Pvt Ltd</p>
                            <p className="text-slate-400 text-xs">Lic: MH-PUNE-123456</p>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-12 mb-12">
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Billed From (Supplier)</h3>
                            <p className="font-bold text-slate-900 text-lg">{invoice.supplierId?.name || 'Unknown Supplier'}</p>
                            <p className="text-slate-500 text-sm whitespace-pre-line">{invoice.supplierId?.address || 'No Address Provided'}</p>
                            <p className="text-slate-500 text-sm">GST: <span className="font-mono text-slate-700">{invoice.supplierId?.gstNumber || 'N/A'}</span></p>
                        </div>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Invoice No.</h3>
                                    <p className="font-mono font-bold text-slate-900 text-xl">{invoice.invoiceNumber}</p>
                                </div>
                                <div className="text-right">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</h3>
                                    <p className="font-bold text-slate-900">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Status</span>
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${invoice.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                        {invoice.paymentStatus || 'Due'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Line Items */}
                    <table className="w-full text-sm mb-12">
                        <thead>
                            <tr className="border-b-2 border-slate-900 text-left">
                                <th className="py-3 font-bold text-slate-900 w-12">#</th>
                                <th className="py-3 font-bold text-slate-900">Item Description</th>
                                <th className="py-3 font-bold text-slate-900 text-right">Batch</th>
                                <th className="py-3 font-bold text-slate-900 text-right">Expiry</th>
                                <th className="py-3 font-bold text-slate-900 text-right">Qty</th>
                                <th className="py-3 font-bold text-slate-900 text-right">Rate</th>
                                <th className="py-3 font-bold text-slate-900 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {invoice.items.map((item: any, i: number) => (
                                <tr key={i}>
                                    <td className="py-3 text-slate-500 font-mono">{i + 1}</td>
                                    <td className="py-3 font-bold text-slate-800">{item.productId?.name || 'Item'}</td>
                                    <td className="py-3 text-slate-600 font-mono text-right">{item.batchNumber}</td>
                                    <td className="py-3 text-slate-600 text-right">{new Date(item.expiryDate).toLocaleDateString()}</td>
                                    <td className="py-3 font-bold text-slate-900 text-right">{item.quantity}</td>
                                    <td className="py-3 text-slate-600 text-right">₹{item.costPrice}</td>
                                    <td className="py-3 font-bold text-slate-900 text-right">₹{(item.quantity * item.costPrice).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Totals */}
                <div className="border-t-2 border-slate-900 pt-8 mt-auto">
                    <div className="flex justify-end">
                        <div className="w-1/2 space-y-3">
                            <div className="flex justify-between text-slate-500">
                                <span>Subtotal</span>
                                <span>₹{invoice.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                                <span>Tax (0%)</span>
                                <span>₹0.00</span>
                            </div>
                            <div className="flex justify-between text-2xl font-black text-slate-900 border-t border-slate-200 pt-3">
                                <span>Total</span>
                                <span>₹{invoice.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 text-center text-xs text-slate-400">
                        <p>Computer generated invoice. No signature required.</p>
                        <p>© XperMed ERP</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
