
"use client";

import { useTenant } from '@/providers/TenantProvider';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function NewPurchasePage() {
    const { tenant } = useTenant();
    const router = useRouter();

    // Form State
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]); // For search
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        supplierId: '',
        billNumber: '',
        billDate: new Date().toISOString().split('T')[0],
        totalAmount: 0,
        discountAmount: 0,
        taxAmount: 0,
        items: [] as any[]
    });

    // Load Suppliers and Products (Search Cache)
    useEffect(() => {
        const loadData = async () => {
            try {
                const [supRes, prodRes] = await Promise.all([
                    fetch('/api/distributor/suppliers'),
                    fetch('/api/distributor/inventory') // Reusing inventory list for product search
                ]);
                const supData = await supRes.json();
                const prodData = await prodRes.json();

                if (supData.suppliers) setSuppliers(supData.suppliers);
                if (prodData.products) setProducts(prodData.products);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        if (tenant?.id) loadData();
    }, [tenant?.id]);

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, {
                productId: '',
                batchNumber: '',
                expiryDate: '',
                quantity: 1,
                purchaseRate: 0,
                mrp: 0,
                totalAmount: 0
            }]
        });
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;

        // Auto-calculate Item Total
        if (field === 'quantity' || field === 'purchaseRate') {
            newItems[index].totalAmount = newItems[index].quantity * newItems[index].purchaseRate;
        }

        setFormData({ ...formData, items: newItems });
    };

    const removeItem = (index: number) => {
        const newItems = [...formData.items];
        newItems.splice(index, 1);
        setFormData({ ...formData, items: newItems });
    };

    // Auto-calculate Grand Total
    useEffect(() => {
        const itemsTotal = formData.items.reduce((acc, item) => acc + (item.totalAmount || 0), 0);
        // Simple logic: Grand Total = Items Total + Tax - Discount
        // If items are inclusive/exclusive is complex, we assume Items Total is Base, Tax is added on top in global field for simplicity, 
        // OR Tax is derived. For now simpler: Validated against standard ERP screenshots often having global adjustments.

        const finalTotal = itemsTotal + Number(formData.taxAmount) - Number(formData.discountAmount);
        setFormData(prev => ({ ...prev, totalAmount: finalTotal }));
    }, [formData.items, formData.taxAmount, formData.discountAmount]);

    const [isNewSupplier, setIsNewSupplier] = useState(false);
    const [newSupplierName, setNewSupplierName] = useState('');

    // ... existing useEffect ...

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let finalSupplierId = formData.supplierId;

            // 1. Create Supplier if New
            if (isNewSupplier) {
                if (!newSupplierName.trim()) {
                    alert('Please enter a supplier name');
                    setSubmitting(false);
                    return;
                }
                const supRes = await fetch('/api/distributor/suppliers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newSupplierName, status: 'ACTIVE' })
                });
                const supData = await supRes.json();
                if (!supRes.ok) throw new Error(supData.error || 'Failed to create supplier');
                finalSupplierId = supData.supplier._id;
            }

            // 2. Create Purchase
            const res = await fetch('/api/distributor/purchases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    supplierId: finalSupplierId
                })
            });

            if (res.ok) {
                alert('Purchase Entry Saved!');
                router.push('/distributor/inventory');
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to save');
            }
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Error saving purchase');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading procurement data...</div>;

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">New Purchase Entry</h1>
                    <p className="text-slate-500 mt-1">Record incoming stock from suppliers.</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header Details */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="col-span-2">
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-slate-700">Supplier</label>
                            <button
                                type="button"
                                onClick={() => { setIsNewSupplier(!isNewSupplier); setFormData({ ...formData, supplierId: '' }); setNewSupplierName(''); }}
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                            >
                                {isNewSupplier ? 'Select Existing' : '+ Add New'}
                            </button>
                        </div>

                        {isNewSupplier ? (
                            <input
                                required
                                type="text"
                                placeholder="Enter Supplier Name"
                                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                value={newSupplierName}
                                onChange={e => setNewSupplierName(e.target.value)}
                            />
                        ) : (
                            <select
                                required
                                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                value={formData.supplierId}
                                onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                            >
                                <option value="">Select Supplier</option>
                                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Bill Number</label>
                        <input
                            required
                            type="text"
                            className="w-full p-3 border border-slate-200 rounded-xl"
                            value={formData.billNumber}
                            onChange={e => setFormData({ ...formData, billNumber: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Bill Date</label>
                        <input
                            required
                            type="date"
                            className="w-full p-3 border border-slate-200 rounded-xl"
                            value={formData.billDate}
                            onChange={e => setFormData({ ...formData, billDate: e.target.value })}
                        />
                    </div>
                </div>

                {/* Items Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-100">
                                <th className="p-4 w-[25%]">Product</th>
                                <th className="p-4">Batch No</th>
                                <th className="p-4">Expiry</th>
                                <th className="p-4 w-20">Qty</th>
                                <th className="p-4">Rate (Buying)</th>
                                <th className="p-4">MRP</th>
                                <th className="p-4 text-right">Total</th>
                                <th className="p-4 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {formData.items.map((item, index) => (
                                <tr key={index} className="hover:bg-slate-50/50">
                                    <td className="p-2">
                                        <select
                                            required
                                            className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                                            value={item.productId}
                                            onChange={e => updateItem(index, 'productId', e.target.value)}
                                        >
                                            <option value="">Select Product...</option>
                                            {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <input
                                            required
                                            placeholder="Batch #001"
                                            className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none"
                                            value={item.batchNumber}
                                            onChange={e => updateItem(index, 'batchNumber', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="date"
                                            required
                                            className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none"
                                            value={item.expiryDate ? item.expiryDate.split('T')[0] : ''}
                                            onChange={e => updateItem(index, 'expiryDate', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none text-center"
                                            value={item.quantity}
                                            onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            min="0"
                                            required
                                            className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none"
                                            value={item.purchaseRate}
                                            onChange={e => updateItem(index, 'purchaseRate', Number(e.target.value))}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            min="0"
                                            required
                                            className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none"
                                            value={item.mrp}
                                            onChange={e => updateItem(index, 'mrp', Number(e.target.value))}
                                        />
                                    </td>
                                    <td className="p-4 text-right font-mono font-bold text-slate-700">
                                        {item.totalAmount.toLocaleString()}
                                    </td>
                                    <td className="p-2 text-center">
                                        <button type="button" onClick={() => removeItem(index)} className="text-red-500 font-bold hover:bg-red-50 p-1.5 rounded-lg">×</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button
                        type="button"
                        onClick={addItem}
                        className="w-full py-4 text-sm font-bold text-indigo-600 bg-slate-50 hover:bg-slate-100 transition-colors border-t border-slate-100"
                    >
                        + Add Item
                    </button>
                </div>

                {/* Footer Totals */}
                <div className="flex justify-end mt-8">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 w-full max-w-sm space-y-4">
                        <div className="flex justify-between text-slate-500 text-sm">
                            <span>Subtotal</span>
                            <span>₹{formData.items.reduce((acc, i) => acc + (i.totalAmount || 0), 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 text-sm items-center">
                            <span>Tax Amount (+)</span>
                            <input
                                type="number"
                                className="w-24 p-1 text-right border rounded hover:border-indigo-400 outline-none"
                                value={formData.taxAmount}
                                onChange={e => setFormData({ ...formData, taxAmount: Number(e.target.value) })}
                            />
                        </div>
                        <div className="flex justify-between text-slate-500 text-sm items-center">
                            <span>Discount (-)</span>
                            <input
                                type="number"
                                className="w-24 p-1 text-right border rounded hover:border-indigo-400 outline-none"
                                value={formData.discountAmount}
                                onChange={e => setFormData({ ...formData, discountAmount: Number(e.target.value) })}
                            />
                        </div>
                        <div className="border-t border-slate-100 pt-4 flex justify-between font-bold text-xl text-slate-900">
                            <span>Grand Total</span>
                            <span>₹{formData.totalAmount.toLocaleString()}</span>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-70"
                        >
                            {submitting ? 'Saving...' : 'Save Purchase'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
