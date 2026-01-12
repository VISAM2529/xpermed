"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/Toast';

// --- Icons ---
const Icons = {
    Plus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
    Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    Save: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>,
    Back: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
};

export default function PurchaseModule() {
    const { showToast } = useToast();
    const [view, setView] = useState<'list' | 'create'>('list');
    const [products, setProducts] = useState<any[]>([]);
    const [purchases, setPurchases] = useState<any[]>([]);

    // Load Data
    useEffect(() => {
        fetchInvoices();
        fetch('/api/inventory/products', { headers: { 'x-tenant-id': 'demo-pharmacy' } })
            .then(res => res.json())
            .then(data => setProducts(data.products || []));
    }, []);

    const fetchInvoices = () => {
        fetch('/api/purchases/inward', { headers: { 'x-tenant-id': 'demo-pharmacy' } })
            .then(res => res.json())
            .then(data => setPurchases(data.purchases || []));
    };

    // Inward Form State
    const [inward, setInward] = useState({
        supplierName: '',
        invoiceNo: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        items: [] as any[]
    });

    // Current Item Entry
    const [currentItem, setCurrentItem] = useState({
        productId: '',
        batchNumber: '',
        expiryDate: '',
        quantity: 0,
        mrp: 0,
        purchaseRate: 0
    });

    const addItem = () => {
        if (!currentItem.productId || !currentItem.batchNumber || currentItem.quantity <= 0) {
            showToast('Please fill all item details', 'warning');
            return;
        }
        const prod = products.find(p => p._id === currentItem.productId);

        setInward(prev => ({
            ...prev,
            items: [...prev.items, {
                ...currentItem,
                productName: prod?.name || 'Unknown',
                amount: currentItem.quantity * currentItem.purchaseRate
            }]
        }));

        setCurrentItem({
            productId: '',
            batchNumber: '',
            expiryDate: '',
            quantity: 0,
            mrp: 0,
            purchaseRate: 0
        });
        showToast('Item Added', 'success');
    };

    const removeItem = (index: number) => {
        setInward(prev => {
            const newItems = [...prev.items];
            newItems.splice(index, 1);
            return { ...prev, items: newItems };
        });
    };

    const saveInvoice = async () => {
        if (!inward.supplierName || !inward.invoiceNo || inward.items.length === 0) {
            showToast('Please fill invoice details and add items', 'warning');
            return;
        }

        try {
            const res = await fetch('/api/purchases/inward', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': 'demo-pharmacy'
                },
                body: JSON.stringify({
                    supplierName: inward.supplierName,
                    invoiceNumber: inward.invoiceNo,
                    invoiceDate: inward.invoiceDate,
                    totalAmount: inward.items.reduce((sum, i) => sum + i.amount, 0),
                    items: inward.items
                })
            });

            if (res.ok) {
                showToast('Purchase Invoice Saved!', 'success');
                setView('list');
                setInward({ supplierName: '', invoiceNo: '', invoiceDate: '', items: [] });
                fetchInvoices();
            } else {
                const err = await res.json();
                showToast(err.error || 'Failed to save', 'error');
            }
        } catch (e) {
            showToast('Network Error', 'error');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Purchase Management</h1>
                    <p className="text-slate-500 mt-1">Record supplier invoices and update stock.</p>
                </div>
                {view === 'list' && (
                    <button
                        onClick={() => setView('create')}
                        className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20"
                    >
                        <Icons.Plus /> New Invoice
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {view === 'list' ? (
                    purchases.length === 0 ? (
                        <motion.div
                            key="empty-list"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-[400px]"
                        >
                            <div className="text-center py-20 text-slate-400 font-medium">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                                    <Icons.Save />
                                </div>
                                <p>No recent invoices found.</p>
                                <p className="text-xs mt-2">Create a new invoice to get started.</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="data-list"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100"
                        >
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="p-4 font-bold text-slate-500 uppercase text-xs w-[15%]">Date</th>
                                        <th className="p-4 font-bold text-slate-500 uppercase text-xs w-[20%]">Invoice</th>
                                        <th className="p-4 font-bold text-slate-500 uppercase text-xs w-[25%]">Supplier</th>
                                        <th className="p-4 font-bold text-slate-500 uppercase text-xs w-[15%]">Amount</th>
                                        <th className="p-4 font-bold text-slate-500 uppercase text-xs w-[15%]">Status</th>
                                        <th className="p-4 font-bold text-slate-500 uppercase text-xs w-[10%] text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {purchases.map((inv, i) => (
                                        <tr key={inv._id} className="hover:bg-slate-50">
                                            <td className="p-4 text-slate-500 font-medium">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                                            <td className="p-4 font-mono font-bold text-slate-700">{inv.invoiceNumber}</td>
                                            <td className="p-4 font-bold text-slate-900">{inv.supplierId?.name || 'Unknown'}</td>
                                            <td className="p-4 font-bold text-slate-900">₹{inv.totalAmount?.toLocaleString()}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${inv.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {inv.paymentStatus || 'Due'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() => window.open(`/print/invoice/${inv._id}`, '_blank')}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                                        title="Print Invoice"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                                    </button>
                                                    <button onClick={() => removeItem(i)} className="hidden text-slate-300 hover:text-rose-500 transition-colors"><Icons.Trash /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    )
                ) : (
                    <motion.div
                        key="create-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        {/* 1. Invoice Metadata */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-900">Invoice Details</h3>
                                <button onClick={() => setView('list')} className="text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1">
                                    <Icons.Back /> Cancel
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Invoice No.</label>
                                    <input
                                        value={inward.invoiceNo}
                                        onChange={e => setInward({ ...inward, invoiceNo: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                        placeholder="e.g. INV-2024-001"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Values Date</label>
                                    <input
                                        type="date"
                                        value={inward.invoiceDate}
                                        onChange={e => setInward({ ...inward, invoiceDate: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Supplier Name</label>
                                    <input
                                        value={inward.supplierName}
                                        onChange={e => setInward({ ...inward, supplierName: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                        placeholder="Search Supplier..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Add Item Section */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-4">Add Items</h3>
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end">
                                <div className="col-span-2 space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Product</label>
                                    <select
                                        value={currentItem.productId}
                                        onChange={e => setCurrentItem({ ...currentItem, productId: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                    >
                                        <option value="">Select Product...</option>
                                        {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Batch No.</label>
                                    <input
                                        value={currentItem.batchNumber}
                                        onChange={e => setCurrentItem({ ...currentItem, batchNumber: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Expiry</label>
                                    <input
                                        type="date"
                                        value={currentItem.expiryDate}
                                        onChange={e => setCurrentItem({ ...currentItem, expiryDate: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Qty</label>
                                    <input
                                        type="number"
                                        value={currentItem.quantity}
                                        onChange={e => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <button
                                        onClick={addItem}
                                        className="w-full p-2.5 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>

                                {/* Additional Pricing Row */}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">MRP</label>
                                    <input
                                        type="number"
                                        value={currentItem.mrp}
                                        onChange={e => setCurrentItem({ ...currentItem, mrp: parseFloat(e.target.value) })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Rate</label>
                                    <input
                                        type="number"
                                        value={currentItem.purchaseRate}
                                        onChange={e => setCurrentItem({ ...currentItem, purchaseRate: parseFloat(e.target.value) })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. Items Table & Submit */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-4">Items List</h3>
                            <div className="overflow-x-auto mb-6">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-left text-xs text-slate-400 font-bold uppercase">
                                            <th className="pb-3 pl-2">Product</th>
                                            <th className="pb-3">Batch</th>
                                            <th className="pb-3">Qty</th>
                                            <th className="pb-3">Rate</th>
                                            <th className="pb-3">Total</th>
                                            <th className="pb-3 text-right pr-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {inward.items.length === 0 ? (
                                            <tr><td colSpan={6} className="py-8 text-center text-slate-400">No items added yet.</td></tr>
                                        ) : (
                                            inward.items.map((item, i) => (
                                                <tr key={i} className="group hover:bg-slate-50">
                                                    <td className="py-3 pl-2 font-bold text-slate-700">{item.productName}</td>
                                                    <td className="py-3 font-mono text-slate-500">{item.batchNumber}</td>
                                                    <td className="py-3 font-bold text-slate-900">{item.quantity}</td>
                                                    <td className="py-3 text-slate-500">₹{item.purchaseRate}</td>
                                                    <td className="py-3 font-bold text-emerald-600">₹{item.amount}</td>
                                                    <td className="py-3 text-right pr-2">
                                                        <button onClick={() => removeItem(i)} className="text-slate-300 hover:text-rose-500 transition-colors"><Icons.Trash /></button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end items-center gap-6 pt-4 border-t border-slate-100">
                                <div className="text-right">
                                    <span className="text-xs font-bold text-slate-400 uppercase block">Grand Total</span>
                                    <span className="text-2xl font-bold text-slate-900">₹{inward.items.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}</span>
                                </div>
                                <button
                                    onClick={saveInvoice}
                                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all"
                                >
                                    Save & Update Stock
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
