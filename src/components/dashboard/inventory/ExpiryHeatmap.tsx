"use client";

export default function ExpiryHeatmap({ data, loading }: { data: { month: string, value: number }[], loading: boolean }) {
    if (loading) return <div className="h-40 flex items-center justify-center text-slate-400 text-sm">Loading heatmap...</div>;
    if (data.length === 0) return <div className="h-40 flex items-center justify-center text-slate-400 text-sm">No expiry data for heatmap.</div>;

    // Find max value for normalization
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <div className="w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Expiry Risk Heatmap (6 Months)</h3>
            <div className="grid grid-cols-6 gap-2">
                {data.map((d, i) => {
                    // Check if value is high (risk)
                    const intensity = d.value / maxValue;
                    // Color logic: Higher value -> More Red. Low value -> More Green/Neutral
                    // We'll use simple classes based on thresholds for Tailwind
                    let bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                    if (intensity > 0.7) bgClass = 'bg-rose-100 text-rose-800 border-rose-200';
                    else if (intensity > 0.3) bgClass = 'bg-amber-50 text-amber-700 border-amber-100';

                    return (
                        <div key={i} className={`rounded-xl border p-3 flex flex-col items-center justify-center gap-1 ${bgClass}`}>
                            <span className="text-xs font-bold uppercase opacity-70">{d.month}</span>
                            <span className="text-sm font-bold">₹{(d.value / 1000).toFixed(1)}k</span>
                        </div>
                    );
                })}
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">Estimated loss value per month based on expiring batches.</p>
        </div>
    );
}
