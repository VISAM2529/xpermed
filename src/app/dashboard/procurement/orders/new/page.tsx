
"use client";

import { useEffect, useState } from 'react';
import { useSocket } from '@/providers/SocketProvider';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Plus, Minus, Check, ArrowRight, Store } from 'lucide-react';

interface Product {
    _id: string;
    name: string;
    manufacturer: string;
    stock: number;
    mrp: number;
}

interface CartItem extends Product {
    quantity: number;
}

export default function NewOrderPage() {
    const [distributors, setDistributors] = useState<any[]>([]);
    const [selectedDistributor, setSelectedDistributor] = useState<string>('');
    const [catalog, setCatalog] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { socket } = useSocket();

    // 1. Fetch Approved Distributors
    useEffect(() => {
        fetch('/api/pharmacy/market/distributors')
            .then(res => res.json())
            .then(data => {
                if (data.distributors) {
                    // Filter only connected ones
                    const approved = data.distributors.filter((d: any) => d.connectionStatus === 'APPROVED');
                    setDistributors(approved);
                }
            });
    }, []);

    // 2. Fetch Catalog when Distributor Selected
    useEffect(() => {
        if (!selectedDistributor) return;
        setLoading(true);
        fetch(`/api/pharmacy/orders?distributorId=${selectedDistributor}`)
            .then(res => res.json())
            .then(data => {
                if (data.catalog) setCatalog(data.catalog);
                setLoading(false);
            });
    }, [selectedDistributor]);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(p => p._id === product._id);
            if (existing) {
                return prev.map(p => p._id === product._id ? { ...p, quantity: p.quantity + 1 } : p);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(p => {
            if (p._id === productId) {
                return { ...p, quantity: Math.max(0, p.quantity + delta) };
            }
            return p;
        }).filter(p => p.quantity > 0));
    };

    const placeOrder = async () => {
        if (cart.length === 0) return;

        try {
            const res = await fetch('/api/pharmacy/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    distributorId: selectedDistributor,
                    items: cart.map(item => ({
                        productId: item._id,
                        productName: item.name,
                        quantity: item.quantity,
                        unitPrice: item.mrp // Simple assumption for now
                    })),
                    totalAmount: cart.reduce((acc, item) => acc + (item.mrp * item.quantity), 0)
                })
            });
            const data = await res.json();

            if (res.ok) {
                if (socket && data.notification) {
                    socket.emit('send_notification', data.notification);
                }
                alert('Order Placed Successfully!');
                router.push('/dashboard/procurement/orders');
            } else {
                alert(data.error);
            }

        } catch (error) {
            console.error("Order failed", error);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto flex gap-6 h-screen overflow-hidden">
            {/* Left: Catalog */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold mb-4">New Purchase Order</h1>

                    <div className="flex items-center gap-4">
                        <div className="relative w-full max-w-sm">
                            <Store className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <select
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white appearance-none focus:ring-2 focus:ring-blue-500 outline-none"
                                value={selectedDistributor}
                                onChange={(e) => {
                                    setSelectedDistributor(e.target.value);
                                    setCart([]); // Clear cart on vendor switch
                                }}
                            >
                                <option value="">Select Distributor...</option>
                                {distributors.map(d => (
                                    <option key={d._id} value={d._id}>{d.name} ({d.city})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </header>

                {selectedDistributor ? (
                    <div className="flex-1 overflow-y-auto pr-2 pb-20">
                        {loading ? <div className="p-8 text-center text-gray-500">Loading Catalog...</div> : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {catalog.map(product => {
                                    const inCart = cart.find(c => c._id === product._id);
                                    return (
                                        <div key={product._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                                                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">Stock: {product.stock}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-4">{product.manufacturer}</p>

                                            <div className="mt-auto flex justify-between items-center">
                                                <span className="font-bold text-blue-600">₹{product.mrp}</span>

                                                {inCart ? (
                                                    <div className="flex items-center gap-2 bg-blue-50 px-2 py-1 rounded-lg">
                                                        <button onClick={() => updateQuantity(product._id, -1)} className="p-1 hover:bg-blue-100 rounded"><Minus className="w-3 h-3 text-blue-600" /></button>
                                                        <span className="text-sm font-bold w-4 text-center">{inCart.quantity}</span>
                                                        <button onClick={() => updateQuantity(product._id, 1)} className="p-1 hover:bg-blue-100 rounded"><Plus className="w-3 h-3 text-blue-600" /></button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => addToCart(product)}
                                                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <Store className="w-16 h-16 mb-4 opacity-50" />
                        <p>Select a distributor to view their products.</p>
                    </div>
                )}
            </div>

            {/* Right: Cart Summary */}
            <div className="w-96 bg-white border-l border-gray-100 p-6 flex flex-col h-full shadow-xl z-10">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" /> Current Order
                </h2>

                <div className="flex-1 overflow-y-auto mb-6 space-y-4">
                    {cart.map(item => (
                        <div key={item._id} className="flex justify-between items-center pb-4 border-b border-gray-50 last:border-0">
                            <div>
                                <h4 className="font-medium text-sm text-gray-900">{item.name}</h4>
                                <div className="text-xs text-gray-400">₹{item.mrp} x {item.quantity}</div>
                            </div>
                            <span className="font-bold text-gray-700">₹{item.mrp * item.quantity}</span>
                        </div>
                    ))}
                    {cart.length === 0 && <p className="text-center text-gray-400 text-sm mt-10">Cart is empty</p>}
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-gray-500">Total Amount</span>
                        <span className="text-2xl font-bold text-gray-900">
                            ₹{cart.reduce((acc, item) => acc + (item.mrp * item.quantity), 0).toLocaleString()}
                        </span>
                    </div>

                    <button
                        onClick={placeOrder}
                        disabled={cart.length === 0}
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Place Order <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
