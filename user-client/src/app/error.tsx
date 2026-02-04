'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application Error:', error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-slate-50 to-white px-4">
            <div className="text-center max-w-md mx-auto">
                {/* Error Icon */}
                <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                </div>

                {/* Message */}
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Something went wrong!
                </h2>
                <p className="text-muted-foreground mb-6">
                    We apologize for the inconvenience. An unexpected error has occurred.
                </p>

                {/* Error details (development only) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
                        <p className="text-sm font-mono text-red-800 break-all">
                            {error.message}
                        </p>
                        {error.digest && (
                            <p className="text-xs text-red-600 mt-2">
                                Error ID: {error.digest}
                            </p>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={reset} variant="default" size="lg">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Go Home
                        </Link>
                    </Button>
                </div>

                {/* Support Link */}
                <p className="mt-8 text-sm text-muted-foreground">
                    Need help?{' '}
                    <Link
                        href="mailto:support@markmorph.com"
                        className="text-primary hover:underline"
                    >
                        Contact Support
                    </Link>
                </p>
            </div>
        </div>
    );
}
