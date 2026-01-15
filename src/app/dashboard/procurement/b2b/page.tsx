
"use client";

import { useEffect, useState } from 'react';
import { useSocket } from '@/providers/SocketProvider';
import { useTenant } from '@/providers/TenantProvider';
import { Building2, MapPin, Send, Check, Clock, Search } from 'lucide-react';

interface Distributor {
    _id: string;
    name: string;
    organizationName?: string;
    city: string;
    state: string;
    contactEmail: string;
    connectionStatus: 'NOT_CONNECTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function B2BMarketplace() {
    const [distributors, setDistributors] = useState<Distributor[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();
    const { tenant } = useTenant();

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchDistributors(searchTerm);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const fetchDistributors = async (query = '') => {
        setLoading(true);
        console.log("Fetching distributors with query:", query);
        try {
            const res = await fetch(`/api/pharmacy/market/distributors?query=${encodeURIComponent(query)}`, { cache: 'no-store' });
            const data = await res.json();
            if (data.distributors) setDistributors(data.distributors);
        } catch (error) {
            console.error("Failed to fetch distributors", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (distributorId: string) => {
        try {
            const res = await fetch('/api/pharmacy/market/distributors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ distributorId })
            });
            const data = await res.json();

            if (res.ok) {
                // Update local state
                setDistributors(prev => prev.map(d =>
                    d._id === distributorId ? { ...d, connectionStatus: 'PENDING' } : d
                ));

                // Emit Real-time Notification
                if (socket && data.notification) {
                    socket.emit('send_notification', data.notification);
                }

                alert("Connection Request Sent!");
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error("Connection failed", error);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <header className="mb-8 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">Find Nearby <span className='text-blue-600'>Distributors</span></h1>
                <p className="text-gray-500 mb-8">Connect with verified suppliers in your area to restock efficiently.</p>

                <div className="flex justify-center md:justify-start">
                    <div className="relative w-full max-w-xl flex gap-2">
                        <input
                            type="text"
                            placeholder="Search by name, city (e.g. Metro Pharma)..."
                            className="w-full pl-5 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button
                            onClick={() => fetchDistributors(searchTerm)}
                            className="bg-[#0b1425] text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors font-medium"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Searching network...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {distributors.map(dist => (
                        <div key={dist._id} className="bg-white rounded-2xl border border-gray-100 hover:border-blue-100 shadow-sm hover:shadow-md transition-all p-6 group relative overflow-hidden">
                            {/* Decorative Background Blob */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />

                            <div className="relative mb-4">
                                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-lg mb-2">
                                    {dist.name.charAt(0)}
                                </span>
                                <div className="absolute top-0 right-0">
                                    <span className="text-xs font-semibold px-2 py-1 bg-white border border-gray-100 rounded-md text-gray-500 shadow-sm">
                                        {(Math.random() * 5).toFixed(1)} km
                                    </span>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-1">{dist.organizationName || dist.name}</h3>

                            <div className="flex items-center text-gray-400 text-sm mb-2">
                                <span className="text-yellow-500 mr-1">★ 4.8</span>
                                <span className="mx-2">•</span>
                                <span className="text-gray-500">Min Order: ₹5,000</span>
                            </div>

                            <div className="flex items-center text-gray-500 text-sm mb-6">
                                <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                {dist.city || 'Local'}, {dist.state}
                            </div>

                            <div className="border-t border-gray-50 pt-4">
                                {dist.connectionStatus === 'NOT_CONNECTED' && (
                                    <button
                                        onClick={() => handleConnect(dist._id)}
                                        className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-sm flex items-center justify-center gap-2"
                                    >
                                        Request Connection
                                    </button>
                                )}

                                {dist.connectionStatus === 'PENDING' && (
                                    <button disabled className="w-full bg-yellow-50 text-yellow-700 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 cursor-wait">
                                        <Clock className="w-4 h-4" /> Request Sent
                                    </button>
                                )}

                                {dist.connectionStatus === 'APPROVED' && (
                                    <button className="w-full bg-emerald-50 text-emerald-700 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                                        <Check className="w-4 h-4" /> Connected
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && distributors.length === 0 && (
                <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900">No distributors found</h3>
                    <p>Try searching for a different name or location.</p>
                </div>
            )}
        </div>
    );
}
