"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Base';
import { useToast } from '@/components/ui/Toast';
import { DashboardSkeleton } from '@/components/ui/Skeletons';

// --- Icons ---
const Icons = {
    Search: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    Print: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>,
    Plus: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
    Minus: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
};

export default function POSModule() {
    const { showToast } = useToast();
    const searchInputRef = useRef<HTMLInputElement>(null);

    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<any[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [allProducts, setAllProducts] = useState<any[]>([]); // Cache for "All" view
    const [isLoading, setIsLoading] = useState(true);

    // Billing Details
    const [customerName, setCustomerName] = useState('');
    const [doctorName, setDoctorName] = useState('');

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'F10') {
                e.preventDefault();
                if (cart.length > 0) handleCheckout();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart, customerName]);

    // Initial Load
    // Initial Load
    const loadProducts = async () => {
        try {
            const res = await fetch('/api/inventory/products', { headers: { 'x-tenant-id': 'demo-pharmacy' } });
            const data = await res.json();
            setAllProducts(data.products || []);
            setSearchResults(data.products || []);
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    // Search Logic (Moved up to avoid conditional hook call)
    useEffect(() => {
        if (!searchTerm) {
            setSearchResults(allProducts);
            return;
        }
        const filtered = allProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        setSearchResults(filtered);
    }, [searchTerm, allProducts]);

    if (isLoading) return <div className="p-4"><DashboardSkeleton /></div>;



    const addToCart = async (product: any) => {
        // Check stock API
        try {
            const res = await fetch(`/api/inventory/batches?productId=${product._id}`, { headers: { 'x-tenant-id': 'demo-pharmacy' } });
            const data = await res.json();
            const batches = data.batches || [];
            const validBatch = batches.find((b: any) => b.quantity > 0);

            if (!validBatch) {
                showToast(`Out of Stock: ${product.name}`, 'error');
                return;
            }

            // Check if already in cart
            const existingIndex = cart.findIndex(item => item.productId === product._id);
            if (existingIndex >= 0) {
                updateQty(existingIndex, 1);
                showToast(`Added +1 ${product.name}`, 'success');
            } else {
                setCart(prev => [...prev, {
                    productId: product._id,
                    name: product.name,
                    quantity: 1,
                    unitPrice: validBatch.mrp,
                    total: validBatch.mrp,
                    batchId: validBatch._id,
                    stock: validBatch.quantity // Track max stock
                }]);
                showToast(`Added ${product.name} to Cart`, 'success');
            }
        } catch (e) {
            showToast('Failed to check stock', 'error');
        }
    };

    const updateQty = (index: number, delta: number) => {
        const newCart = [...cart];
        const item = newCart[index];
        const newQty = item.quantity + delta;

        if (newQty > item.stock) {
            showToast(`Max stock available is ${item.stock}`, 'warning');
            return;
        }

        if (newQty <= 0) {
            newCart.splice(index, 1);
            showToast(`Removed ${item.name}`, 'warning');
        } else {
            item.quantity = newQty;
            item.total = item.quantity * item.unitPrice;
        }
        setCart(newCart);
    };

    const calculateTotal = () => cart.reduce((sum, item) => sum + item.total, 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        try {
            const grandTotal = calculateTotal();
            const payload = {
                items: cart,
                customerName: customerName || 'Walk-in',
                doctorName,
                paymentMethod: 'cash',
                subTotal: grandTotal,
                taxTotal: 0,
                grandTotal
            };

            const res = await fetch('/api/sales/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': 'demo-pharmacy'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                showToast(`Order Placed: ₹${grandTotal}`, 'success');
                setCart([]);
                setCustomerName('');
                setDoctorName('');
                loadProducts(); // Refresh Stock
            } else {
                const err = await res.json();
                showToast(err.error || 'Checkout Failed', 'error');
            }
        } catch (e) {
            showToast('Network Error', 'error');
        }
    };

    return (
        <div className="h-full flex flex-col md:flex-row gap-6 p-2">

            {/* LEFT: Product Catalog */}
            <div className="flex-1 flex flex-col gap-6">

                {/* Search Bar */}
                <div className="relative group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                        <Icons.Search />
                    </span>
                    <input
                        ref={searchInputRef}
                        autoFocus
                        className="w-full text-lg py-5 pl-14 pr-6 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 font-medium"
                        placeholder="Scan barcode or type medicine name... (Ctrl + S)"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-500 border border-slate-200">Ctrl + S</span>
                    </div>
                </div>

                {/* Quick Categories */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {['All Items', 'Tablets', 'Syrups', 'Injections', 'Surgicals', 'Generics'].map((cat, i) => (
                        <button
                            key={cat}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${i === 0 ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {searchResults.map((product) => (
                            <motion.div
                                key={product._id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => addToCart(product)}
                                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md cursor-pointer group flex flex-col justify-between h-[160px] relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                                        <Icons.Plus />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 line-clamp-2 mb-1">{product.name}</h3>
                                    <p className="text-xs text-slate-400 font-medium bg-slate-50 inline-block px-2 py-1 rounded-lg">{product.category || 'Medicine'}</p>
                                </div>
                                <div className="mt-4 flex items-end justify-between">
                                    <p className="text-xs font-semibold text-slate-400">Stock: <span className={`${(product.totalStock || 0) < 10 ? 'text-rose-500' : 'text-slate-600'}`}>{product.totalStock || 0}</span></p>
                                    <p className="text-lg font-bold text-emerald-600">₹{product.currentMrp || product.mrp || '0'}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    {searchResults.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <Icons.Search />
                            <p className="mt-2 font-medium">No products found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: Cart & Checkout */}
            <div className="w-full md:w-[420px] bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col overflow-hidden">
                {/* Cart Header */}
                <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                    <div className="flex justify-between items-center mb-1">
                        <h2 className="text-xl font-bold text-slate-900">Current Order</h2>
                        <span className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded-lg">{cart.length} items</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Order ID: #ORD-{Math.floor(Math.random() * 10000)}</p>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <AnimatePresence>
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-dashed border-slate-200">
                                    <Icons.Plus />
                                </div>
                                <p className="font-bold text-sm">Cart is empty</p>
                                <p className="text-xs text-center px-10">Scan barcode or click products to add items.</p>
                            </div>
                        ) : (
                            cart.map((item, i) => (
                                <motion.div
                                    key={i}
                                    layout
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl shadow-sm group hover:border-emerald-100 transition-colors"
                                >
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{item.name}</h4>
                                        <p className="text-xs text-slate-400 font-medium">₹{item.unitPrice} / unit</p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                                        <button onClick={() => updateQty(i, -1)} className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-500 hover:text-rose-500 font-bold transition-colors">
                                            {item.quantity === 1 ? <Icons.Trash /> : <Icons.Minus />}
                                        </button>
                                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQty(i, 1)} className="w-7 h-7 flex items-center justify-center bg-slate-900 rounded-md shadow-sm text-white hover:bg-slate-800 transition-colors">
                                            <Icons.Plus />
                                        </button>
                                    </div>
                                    <div className="w-16 text-right font-bold text-slate-900 text-sm">
                                        ₹{item.total}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                {/* Checkout Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Customer Name</label>
                            <input
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                placeholder="Guest"
                                value={customerName}
                                onChange={e => setCustomerName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Doctor (Optional)</label>
                            <input
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                placeholder="Dr. Name"
                                value={doctorName}
                                onChange={e => setDoctorName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <div className="flex justify-between items-center text-slate-500 text-sm font-medium">
                            <span>Subtotal</span>
                            <span>₹{calculateTotal()}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 text-sm font-medium">
                            <span>Tax (0%)</span>
                            <span>₹0</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-900 text-xl font-bold pt-2 border-t border-slate-200/50">
                            <span>Grand Total</span>
                            <span>₹{calculateTotal().toLocaleString()}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        <Icons.Print />
                        <span>Process & Print Bill</span>
                        <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-medium border border-slate-700">F10</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
