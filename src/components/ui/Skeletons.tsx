import { motion } from "framer-motion";

export function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`bg-slate-200 animate-pulse rounded-full ${className}`} />
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="space-y-4">
                <Skeleton className="h-4 w-1/3 bg-slate-100" />
                <Skeleton className="h-8 w-1/2 bg-slate-200" />
                <div className="flex gap-2 pt-2">
                    <Skeleton className="h-4 w-16 bg-slate-100" />
                    <Skeleton className="h-4 w-12 bg-slate-100" />
                </div>
            </div>
            {/* Shimmer Overlay */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        </div>
    );
}

export function TableSkeleton() {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between">
                <Skeleton className="h-8 w-48 rounded-xl" />
                <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
            <div className="p-4 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-4 items-center">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-1/4 bg-slate-100" />
                        </div>
                        <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64 bg-slate-300" />
                    <Skeleton className="h-4 w-96 bg-slate-200" />
                </div>
                <Skeleton className="h-10 w-32 rounded-xl bg-slate-300" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <TableSkeleton />
                </div>
                <div className="space-y-6">
                    <CardSkeleton />
                    <CardSkeleton />
                </div>
            </div>
        </div>
    );
}
