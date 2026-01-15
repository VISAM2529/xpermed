"use client";

import { useTenant } from '@/providers/TenantProvider';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewSalePage() {
    const { tenant } = useTenant();
    const router = useRouter();

    // Data
    const [pharmacies, setPharmacies] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    // Cache available batches for selected products: { productId: [Batches] }
    const [productBatches, setProductBatches] = useState<Record<string, any[]>>({});

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form
    const [formData, setFormData] = useState({
        pharmacyId: '',
        billDate: new Date().toISOString().split('T')[0],
        items: [] as any[],
        totalAmount: 0,
        discountAmount: 0,
        taxAmount: 0
    });

    // Load Initial Data
    useEffect(() => {
        const loadData = async () => {
            try {
                const [connRes, prodRes] = await Promise.all([
                    fetch('/api/distributor/connections'),
                    fetch('/api/distributor/inventory')
                ]);

                const connData = await connRes.json();
                if (connData.connections) {
                    setPharmacies(connData.connections
                        .filter((c: any) => c.status === 'APPROVED')
                        .map((c: any) => c.pharmacyId));
                }

                const prodData = await prodRes.json();
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
                batchId: '',
                availableQty: 0,
                quantity: 1,
                rate: 0,
                total: 0
            }]
        });
    };

    const removeItem = (index: number) => {
        const newItems = [...formData.items];
        newItems.splice(index, 1);
        setFormData({ ...formData, items: newItems });
    };

    const handleProductChange = async (index: number, productId: string) => {
        const newItems = [...formData.items];
        newItems[index].productId = productId;
        newItems[index].batchId = ''; // Reset batch
        newItems[index].availableQty = 0;
        newItems[index].rate = 0;

        setFormData({ ...formData, items: newItems });

        // Fetch batches if not in cache
        if (productId && !productBatches[productId]) {
            try {
                const res = await fetch(`/api/distributor/inventory/batches?productId=${productId}`);
                const data = await res.json();
                setProductBatches(prev => ({ ...prev, [productId]: data.batches || [] }));
            } catch (e) {
                console.error("Failed to fetch batches", e);
            }
        }
    };

    const handleBatchChange = (index: number, batchId: string) => {
        const productId = formData.items[index].productId;
        const batch = productBatches[productId]?.find((b: any) => b._id === batchId);

        const newItems = [...formData.items];
        newItems[index].batchId = batchId;

        if (batch) {
            newItems[index].availableQty = batch.quantity;
            newItems[index].rate = batch.mrp; // Default sale price to MRP, editable
        }

        setFormData({ ...formData, items: newItems });
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;

        // Recalc Item Total
        if (field === 'quantity' || field === 'rate') {
            newItems[index].total = newItems[index].quantity * newItems[index].rate;
        }

        setFormData({ ...formData, items: newItems });
    };

    // Auto-calculate Totals
    useEffect(() => {
        const itemsTotal = formData.items.reduce((acc, item) => acc + (item.total || 0), 0);
        const finalTotal = itemsTotal + Number(formData.taxAmount) - Number(formData.discountAmount);
        setFormData(prev => ({ ...prev, totalAmount: finalTotal }));
    }, [formData.items, formData.taxAmount, formData.discountAmount]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Basic Validation
            for (const item of formData.items) {
                if (item.quantity > item.availableQty) {
                    alert(`Quantity exceeds stock for a product`);
                    setSubmitting(false);
                    return;
                }
            }

            const res = await fetch('/api/distributor/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert('Sale Recorded Successfully!');
                router.push('/distributor/orders');
            } else {
                const err = await res.json();
                alert(err.error || 'Sale Failed');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-400">Loading sales module...</div>;

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">New Sale Entry</h1>
                    <p className="text-slate-500 mt-1">Create sales orders for pharmacies.</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Customer (Pharmacy)</label>
                        <select
                            required
                            className="w-full p-3 border border-slate-200 rounded-xl outline-none"
                            value={formData.pharmacyId}
                            onChange={e => setFormData({ ...formData, pharmacyId: e.target.value })}
                        >
                            <option value="">Select Pharmacy...</option>
                            {pharmacies.map(p => <option key={p._id} value={p._id}>{p.name} ({p.subdomain})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Bill Date</label>
                        <input
                            type="date"
                            required
                            className="w-full p-3 border border-slate-200 rounded-xl outline-none"
                            value={formData.billDate}
                            onChange={e => setFormData({ ...formData, billDate: e.target.value })}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-100">
                                <th className="p-4 w-[25%]">Product</th>
                                <th className="p-4 w-[20%]">Batch (Stock)</th>
                                <th className="p-4 w-[15%]">Sell Qty</th>
                                <th className="p-4 w-[15%]">Rate</th>
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
                                            className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none"
                                            value={item.productId}
                                            onChange={e => handleProductChange(index, e.target.value)}
                                        >
                                            <option value="">Select Product...</option>
                                            {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <select
                                            required
                                            className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none disabled:bg-slate-50"
                                            value={item.batchId}
                                            onChange={e => handleBatchChange(index, e.target.value)}
                                            disabled={!item.productId}
                                        >
                                            <option value="">Select Batch...</option>
                                            {productBatches[item.productId]?.map((b: any) => (
                                                <option key={b._id} value={b._id}>
                                                    {b.batchNumber} (Qty: {b.quantity}, Exp: {new Date(b.expiryDate).toLocaleDateString()})
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            min="1"
                                            max={item.availableQty}
                                            required
                                            className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none"
                                            value={item.quantity}
                                            onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                                        />
                                        <div className="text-[10px] text-slate-400 mt-1">Max: {item.availableQty}</div>
                                    </td>
                                    <td className="p-2">
                                        <input
                                            type="number"
                                            min="0"
                                            required
                                            className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none"
                                            value={item.rate}
                                            onChange={e => updateItem(index, 'rate', Number(e.target.value))}
                                        />
                                    </td>
                                    <td className="p-4 text-right font-mono font-bold text-slate-700">
                                        {item.total.toLocaleString()}
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
                            <span>₹{formData.items.reduce((acc, i) => acc + (i.total || 0), 0).toLocaleString()}</span>
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
                            {submitting ? 'Processing Sale...' : 'Finalize Sale'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
