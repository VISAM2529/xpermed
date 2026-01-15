"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Input } from '@/components/ui/Base';
import { useToast } from '@/components/ui/Toast';
import { TableSkeleton } from '@/components/ui/Skeletons';
import ExpiryPredictionWidget from './ExpiryPredictionWidget';
import ExpiryHeatmap from './ExpiryHeatmap';
import DemandPredictionWidget from './DemandPredictionWidget';

// --- Icons ---
const Icons = {
    Plus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
    Search: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Edit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
    Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
};

export default function InventoryModule() {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('products');
    const [showAddModal, setShowAddModal] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);

    // Prediction State
    const [predictionData, setPredictionData] = useState<{ riskItems: any[], heatmapData: any[] }>({ riskItems: [], heatmapData: [] });
    const [loadingPredictions, setLoadingPredictions] = useState(false);
    const [predictionSubTab, setPredictionSubTab] = useState('expiry'); // 'expiry' | 'demand'

    const [loading, setLoading] = useState(true);

    // Form State
    const [newProduct, setNewProduct] = useState({ name: '', sku: '', category: '', minStockLevel: 5, unit: 'Tablets' });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (activeTab === 'predictions' && predictionData.riskItems.length === 0) {
            fetchPredictions();
        }
    }, [activeTab]);

    async function fetchData() {
        try {
            const [pRes, bRes] = await Promise.all([
                fetch('/api/inventory/products'),
                fetch('/api/inventory/batches')
            ]);
            const pData = await pRes.json();
            const bData = await bRes.json();
            setProducts(pData.products || []);
            setBatches(bData.batches || []);
        } catch (error) {
            console.error(error);
            showToast('Failed to load inventory data', 'error');
        } finally {
            setLoading(false);
        }
    }

    async function fetchPredictions() {
        setLoadingPredictions(true);
        try {
            const res = await fetch('/api/inventory/expiry-prediction');
            const data = await res.json();
            if (res.ok) {
                setPredictionData(data);
            } else {
                showToast('Failed to load predictions', 'error');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingPredictions(false);
        }
    }

    async function handleAddProduct() {
        if (!newProduct.name || !newProduct.sku) {
            showToast('Product Name and SKU are required', 'warning');
            return;
        }

        try {
            const res = await fetch('/api/inventory/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct)
            });

            if (res.ok) {
                showToast('Product added successfully!', 'success');
                setShowAddModal(false);
                setNewProduct({ name: '', sku: '', category: '', minStockLevel: 5, unit: 'Tablets' });
                fetchData();
            } else {
                const err = await res.json();
                showToast(err.error || 'Failed to add product', 'error');
            }
        } catch (error) {
            showToast('Something went wrong', 'error');
        }
    }

    if (loading) return (
        // ... (Loading Skeleton) ...
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Inventory Management</h1>
                    <p className="text-slate-500 mt-1">Manage products, stock levels, and batch expiries.</p>
                </div>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-[500px]">
                <TableSkeleton />
            </div>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Inventory Management</h1>
                    <p className="text-slate-500 mt-1">Manage products, stock levels, and batch expiries.</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-slate-100 p-1 rounded-xl flex">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'products' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Products
                        </button>
                        <button
                            onClick={() => setActiveTab('batches')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'batches' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Batches (Stock)
                        </button>
                        <button
                            onClick={() => setActiveTab('predictions')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'predictions' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                Predictions
                            </div>
                        </button>
                    </div>
                    {/* ... (Add Product Button) ... */}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20"
                    >
                        <Icons.Plus /> Add Product
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-[500px]">
                {/* Search & Filter Bar */}
                {activeTab !== 'predictions' && (
                    <div className="flex justify-between items-center mb-6">
                        <div className="relative w-full max-w-sm">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search /></span>
                            <input
                                type="text"
                                placeholder={`Search ${activeTab === 'products' ? 'products' : 'batches'}...`}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400 transition-all font-medium"
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'products' ? (
                    <ProductTable products={products} />
                ) : activeTab === 'batches' ? (
                    <BatchTable batches={batches} />
                ) : (
                    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                        {/* Sub-Tabs for Predictions */}
                        <div className="flex gap-4 border-b border-slate-100 pb-1">
                            <button
                                onClick={() => setPredictionSubTab('expiry')}
                                className={`text-sm font-bold pb-2 transition-all ${predictionSubTab === 'expiry' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Expiry Risks
                            </button>
                            <button
                                onClick={() => setPredictionSubTab('demand')}
                                className={`text-sm font-bold pb-2 transition-all ${predictionSubTab === 'demand' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Demand & Auto-Reorder
                            </button>
                        </div>

                        {predictionSubTab === 'expiry' ? (
                            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                                <ExpiryHeatmap data={predictionData.heatmapData} loading={loadingPredictions} />
                                <div className="w-full h-px bg-slate-100" />
                                <ExpiryPredictionWidget riskItems={predictionData.riskItems} loading={loadingPredictions} />
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <DemandPredictionWidget />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add Product Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-colors"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 m-auto w-full max-w-lg h-fit bg-white rounded-2xl shadow-2xl z-50 p-8 border border-slate-100"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-900">Add New Product</h2>
                                <button onClick={() => setShowAddModal(false)} className="bg-slate-50 p-2 rounded-full text-slate-400 hover:text-slate-600">✕</button>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Product Name</label>
                                    <input
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                        placeholder="e.g. Dolo 650"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">SKU Code</label>
                                        <input
                                            value={newProduct.sku}
                                            onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                                            placeholder="e.g. MED-001"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                                        <input
                                            value={newProduct.category}
                                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                            placeholder="e.g. Tablet"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Min Stock Level</label>
                                        <input
                                            type="number"
                                            value={newProduct.minStockLevel}
                                            onChange={(e) => setNewProduct({ ...newProduct, minStockLevel: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Unit</label>
                                        <select
                                            value={newProduct.unit}
                                            onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                        >
                                            <option>Tablets</option>
                                            <option>Bottles</option>
                                            <option>Strips</option>
                                            <option>Tubes</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddProduct}
                                    className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                                >
                                    Create Product
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function ProductTable({ products }: { products: any[] }) {
    if (products.length === 0) return <div className="text-center py-20 text-slate-400">No products found. Start by adding one.</div>;

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="pb-4 pl-4">Product Name</th>
                        <th className="pb-4">Category</th>
                        <th className="pb-4">SKU</th>
                        <th className="pb-4">Alert Level</th>
                        <th className="pb-4 text-right pr-4">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {products.map((p) => (
                        <tr key={p._id} className="group hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 pl-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                                        {p.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="font-bold text-sm text-slate-900">{p.name}</span>
                                </div>
                            </td>
                            <td className="py-4 text-sm font-medium text-slate-500">{p.category || 'Medicine'}</td>
                            <td className="py-4 text-sm font-medium text-slate-500 font-mono">{p.sku}</td>
                            <td className="py-4">
                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200">
                                    &lt; {p.minStockLevel || 5} {p.unit || 'Units'}
                                </span>
                            </td>
                            <td className="py-4 text-right pr-4">
                                <button className="text-slate-400 hover:text-emerald-600 transition-colors p-2 hover:bg-emerald-50 rounded-lg">
                                    <Icons.Edit />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function BatchTable({ batches }: { batches: any[] }) {
    if (batches.length === 0) return <div className="text-center py-20 text-slate-400">No batches in stock.</div>;

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="pb-4 pl-4">Product</th>
                        <th className="pb-4">Batch No.</th>
                        <th className="pb-4">Stock</th>
                        <th className="pb-4">Expiry</th>
                        <th className="pb-4">MRP</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {batches.map((b) => (
                        <tr key={b._id} className="group hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 pl-4 font-bold text-sm text-slate-900">{b.productId?.name || 'Unknown'}</td>
                            <td className="py-4 text-sm font-medium text-slate-500 font-mono">{b.batchNumber}</td>
                            <td className="py-4">
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${b.quantity > 10 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                    {b.quantity} left
                                </span>
                            </td>
                            <td className="py-4 text-sm font-medium text-slate-500">{new Date(b.expiryDate).toLocaleDateString()}</td>
                            <td className="py-4 text-sm font-bold text-slate-900">₹{b.mrp}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
