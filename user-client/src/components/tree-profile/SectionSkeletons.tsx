'use client';

export function CatalogSkeleton() {
    return (
        <div className="w-full space-y-6 animate-pulse">
            {/* Title Skeleton */}
            <div className="flex items-center justify-between px-1 mb-4">
                <div className="h-4 w-32 bg-gray-500/20 rounded-full" />
                <div className="h-6 w-20 bg-gray-500/20 rounded-full" />
            </div>

            {/* Category Pills Skeleton */}
            <div className="flex gap-2 overflow-x-hidden mb-4">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="shrink-0 h-8 w-24 bg-gray-500/20 rounded-full"
                        style={{ opacity: 1 - i * 0.2 }}
                    />
                ))}
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-2xl overflow-hidden bg-gray-500/10 border border-gray-500/5">
                        {/* Image Area */}
                        <div className="aspect-square bg-gray-500/20 relative overflow-hidden" />
                        {/* Content Area */}
                        <div className="p-3 space-y-2">
                            <div className="h-4 w-3/4 bg-gray-500/20 rounded" />
                            <div className="h-3 w-1/2 bg-gray-500/20 rounded" />
                            <div className="flex justify-between items-center pt-1">
                                <div className="h-5 w-16 bg-gray-500/20 rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function LinksSkeleton() {
    return (
        <div className="w-full space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
                <div key={i} className="w-full h-20 bg-gray-500/10 border border-gray-500/5 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                        <div className="h-5 w-1/2 bg-gray-500/20 rounded" />
                        <div className="h-3 w-3/4 bg-gray-500/20 rounded" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-500/20" />
                </div>
            ))}
        </div>
    );
}
