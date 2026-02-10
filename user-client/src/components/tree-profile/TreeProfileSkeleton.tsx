
export function TreeProfileSkeleton() {
    return (
        <div className="min-h-screen bg-black flex justify-center pt-8 pb-8">
            <div className="w-full max-w-md px-4 space-y-8">
                {/* Header Skeleton */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-24 h-24 rounded-full bg-gray-800 animate-pulse" />
                    <div className="space-y-2 text-center w-full">
                        <div className="h-6 w-1/2 mx-auto bg-gray-800 rounded animate-pulse" />
                        <div className="h-4 w-3/4 mx-auto bg-gray-800 rounded animate-pulse" />
                        <div className="flex justify-center gap-2 mt-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-gray-800 animate-pulse" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Links Skeleton */}
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-14 w-full bg-gray-800/50 rounded-xl animate-pulse" />
                    ))}
                </div>

                {/* Catalog Skeleton */}
                <div className="space-y-4">
                    <div className="h-6 w-1/3 bg-gray-800 rounded animate-pulse" />
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-square bg-gray-800/50 rounded-xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
