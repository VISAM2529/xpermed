"use client";

import { useToast } from '@/components/ui/Toast';

export default function ExpiryPredictionWidget({ riskItems, loading }: { riskItems: any[], loading: boolean }) {
    const { showToast } = useToast();

    const handleAction = (action: string, item: any) => {
        // In a real app, this would open a modal or call an API
        showToast(`Initiated ${action} for ${item.productName} (Batch: ${item.batchNumber})`, 'success');
        console.log(`Action: ${action}`, item);
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Analyzing inventory risks...</div>;
    if (riskItems.length === 0) return <div className="p-8 text-center text-slate-400">Great job! No high-risk expiring items detected.</div>;

    return (
        <div className="overflow-x-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-4 px-4 pt-2">High Risk Expiries</h3>
            <table className="w-full">
                <thead>
                    <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="pb-4 pl-4">Product</th>
                        <th className="pb-4">Risk Factor</th>
                        <th className="pb-4">Est. Loss</th>
                        <th className="pb-4">Suggestion</th>
                        <th className="pb-4 text-right pr-4">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {riskItems.map((item) => (
                        <tr key={item._id} className="group hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 pl-4">
                                <span className="block font-bold text-sm text-slate-900">{item.productName}</span>
                                <span className="text-xs text-slate-400 font-mono">Batch: {item.batchNumber}</span>
                            </td>
                            <td className="py-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-medium text-slate-600">Expires in <span className="text-rose-600 font-bold">{item.daysToExpiry} days</span></span>
                                    <span className="text-xs text-slate-400">Stock lasts {item.daysToSellStock} days</span>
                                </div>
                            </td>
                            <td className="py-4">
                                <span className="text-sm font-bold text-slate-900">₹{item.estimatedLoss.toLocaleString()}</span>
                            </td>
                            <td className="py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold border ${item.suggestion.includes('Discount') ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                    {item.suggestion}
                                </span>
                            </td>
                            <td className="py-4 text-right pr-4">
                                {item.suggestion.includes('Discount') ? (
                                    <button
                                        onClick={() => handleAction('Discount', item)}
                                        className="text-xs font-bold px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                                    >
                                        Apply Discount
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleAction('Transfer', item)}
                                        className="text-xs font-bold px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                    >
                                        Transfer
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
