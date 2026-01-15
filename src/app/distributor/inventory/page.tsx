
"use client";

import { useTenant } from '@/providers/TenantProvider';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function InventoryPage() {
    const { tenant } = useTenant();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, [tenant?.id, searchTerm]); // Debounce usually recommended, but simple for now

    const fetchProducts = async () => {
        try {
            const res = await fetch(`/api/distributor/inventory?search=${searchTerm}`);
            const data = await res.json();
            if (data.products) setProducts(data.products);
        } catch (error) {
            console.error("Failed to fetch inventory", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Inventory Management</h1>
                    <p className="text-slate-500 mt-1">Manage your product catalog and stock levels.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
                >
                    + Add Product
                </button>
            </header>

            {/* Search & Filters */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full max-w-md px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Product List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                            <th className="p-4">Product Name</th>
                            <th className="p-4">Category</th>
                            <th className="p-4 text-center">Batch Count</th>
                            <th className="p-4 text-right">Total Stock</th>
                            <th className="p-4 text-right">Price (MRP)</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={7} className="p-8 text-center text-slate-400">Loading inventory...</td></tr>
                        ) : products.length === 0 ? (
                            <tr><td colSpan={7} className="p-8 text-center text-slate-400">No products found. Add one to get started.</td></tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-medium text-slate-900">{product.name}
                                        <div className="text-xs text-slate-400 font-normal">{product.sku || 'No SKU'}</div>
                                    </td>
                                    <td className="p-4 text-slate-600">{product.category || 'General'}</td>
                                    <td className="p-4 text-center font-mono text-slate-500">{product.batchCount}</td>
                                    <td className="p-4 text-right font-bold text-slate-800">{product.stock}</td>
                                    <td className="p-4 text-right text-slate-600">₹{product.mrp || '-'}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${product.stock < (product.minStockLevel || 10) ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {product.stock < (product.minStockLevel || 10) ? 'Low Stock' : 'In Stock'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Edit</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Product Modal */}
            {isAddModalOpen && (
                <AddProductModal onClose={() => setIsAddModalOpen(false)} onSuccess={() => { setIsAddModalOpen(false); fetchProducts(); }} />
            )}
        </div>
    );
}

function AddProductModal({ onClose, onSuccess }: any) {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        minStockLevel: 10,
        initialStock: 0,
        mrp: 0,
        purchaseRate: 0
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/distributor/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) onSuccess();
            else alert('Failed to add product');
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl"
            >
                <h2 className="text-xl font-bold mb-4">Add New Product</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                        <input required className="w-full p-2 border rounded-lg" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                            <input className="w-full p-2 border rounded-lg" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Min Stock Alert</label>
                            <input type="number" className="w-full p-2 border rounded-lg" value={formData.minStockLevel} onChange={e => setFormData({ ...formData, minStockLevel: Number(e.target.value) })} />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900 mb-3">Initial Stock (First Batch)</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Quantity</label>
                                <input type="number" className="w-full p-2 border rounded-lg" value={formData.initialStock} onChange={e => setFormData({ ...formData, initialStock: Number(e.target.value) })} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">MRP</label>
                                <input type="number" className="w-full p-2 border rounded-lg" value={formData.mrp} onChange={e => setFormData({ ...formData, mrp: Number(e.target.value) })} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Cost Price</label>
                                <input type="number" className="w-full p-2 border rounded-lg" value={formData.purchaseRate} onChange={e => setFormData({ ...formData, purchaseRate: Number(e.target.value) })} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Cancel</button>
                        <button disabled={saving} type="submit" className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700">
                            {saving ? 'Saving...' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
