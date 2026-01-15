"use client";

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';

export default function DemandPredictionWidget() {
    const { showToast } = useToast();
    const [activeTrends, setActiveTrends] = useState<any[]>([]);
    const [predictions, setPredictions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // New Trend State
    const [showTrendInput, setShowTrendInput] = useState(false);
    const [newTrend, setNewTrend] = useState({ name: '', category: '', boost: 1.5 });

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        try {
            const [tRes, pRes] = await Promise.all([
                fetch('/api/inventory/trends'),
                fetch('/api/inventory/demand-prediction')
            ]);

            if (tRes.ok) {
                const data = await tRes.json();
                setActiveTrends(data.trends || []);
            }
            if (pRes.ok) {
                const data = await pRes.json();
                setPredictions(data.predictions || []);
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to load demand data', 'error');
        } finally {
            setLoading(false);
        }
    }

    async function handleAddTrend() {
        if (!newTrend.name || !newTrend.category) return;

        try {
            const res = await fetch('/api/inventory/trends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newTrend.name,
                    affectedCategories: [newTrend.category],
                    boostFactor: newTrend.boost
                })
            });

            if (res.ok) {
                showToast('Trend added successfully', 'success');
                setShowTrendInput(false);
                setNewTrend({ name: '', category: '', boost: 1.5 });
                fetchData(); // Refresh predictions
            }
        } catch (error) {
            showToast('Failed to add trend', 'error');
        }
    }

    if (loading) return <div className="p-8 text-center text-slate-400">Analyzing demand signals...</div>;

    const reorderItems = predictions.filter(p => p.status === 'Reorder');

    return (
        <div className="space-y-8">
            {/* Top Section: Active Trends & Controls */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h4 className="font-bold text-slate-900">Active Disease Trends</h4>
                        <p className="text-xs text-slate-500 mt-1">These trends temporarily boost demand for related categories.</p>
                    </div>
                    <button
                        onClick={() => setShowTrendInput(!showTrendInput)}
                        className="text-xs font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all text-slate-600"
                    >
                        + Add Local Trend
                    </button>
                </div>

                {showTrendInput && (
                    <div className="mb-4 bg-white p-4 rounded-xl shadow-sm border border-emerald-100 space-y-3 animate-in fade-in zoom-in duration-200">
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Trend Name</label>
                                <input
                                    value={newTrend.name}
                                    onChange={(e) => setNewTrend({ ...newTrend, name: e.target.value })}
                                    placeholder="e.g. Flu Season"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                                <input
                                    value={newTrend.category}
                                    onChange={(e) => setNewTrend({ ...newTrend, category: e.target.value })}
                                    placeholder="e.g. Antibiotics"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Boost (1.5 = 50%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={newTrend.boost}
                                    onChange={(e) => setNewTrend({ ...newTrend, boost: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button onClick={handleAddTrend} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700">Save Trend</button>
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    {activeTrends.length === 0 && <span className="text-xs text-slate-400 italic">No active trends.</span>}
                    {activeTrends.map(t => (
                        <div key={t._id} className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-full">
                            <span className="text-xs font-bold">{t.name}</span>
                            <span className="text-[10px] bg-rose-200 px-1.5 py-0.5 rounded-full text-rose-800 font-mono">x{t.boostFactor}</span>
                        </div>
                    ))}
                    {/* Suggest Seasonality based on Month */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full">
                        <span className="text-xs font-bold">Season: Winter</span>
                        <span className="text-[10px] bg-blue-200 px-1.5 py-0.5 rounded-full text-blue-800 font-mono">x1.2</span>
                    </div>
                </div>
            </div>

            {/* Reorder Suggestions */}
            <div className="overflow-x-auto">
                <h3 className="text-lg font-bold text-slate-900 mb-4 px-4 pt-2">Auto-Reorder Suggestions</h3>
                {reorderItems.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        Stocks are healthy! No immediate reorders needed.
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                <th className="pb-4 pl-4">Product</th>
                                <th className="pb-4">Demand Analysis</th>
                                <th className="pb-4">Stock vs Target</th>
                                <th className="pb-4">Reason</th>
                                <th className="pb-4 text-right pr-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {reorderItems.map((item) => (
                                <tr key={item._id} className="group hover:bg-slate-50/80 transition-colors">
                                    <td className="py-4 pl-4">
                                        <span className="block font-bold text-sm text-slate-900">{item.name}</span>
                                        <span className="text-xs text-slate-400">{item.category}</span>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-medium text-slate-600">Avg Sales: {item.avgDailySales}/day</span>
                                            <span className="text-xs font-bold text-emerald-600">Forecast: {item.predictedDemand} units</span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-rose-500 h-full rounded-full"
                                                    style={{ width: `${Math.min((item.currentStock / item.predictedDemand) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-rose-600">{item.currentStock} / {item.predictedDemand}</span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {item.boostReasons.length > 0 ? item.boostReasons.map((r: string, i: number) => (
                                                <span key={i} className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[10px] font-bold">{r}</span>
                                            )) : <span className="text-xs text-slate-400">-</span>}
                                        </div>
                                    </td>
                                    <td className="py-4 text-right pr-4">
                                        <button className="text-xs font-bold px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">
                                            Order +{item.reorderQuantity}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
