import Link from 'next/link';
import { Home } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Page Not Found | Mark Morph',
    description: 'The page you are looking for could not be found.',
};

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-slate-50 to-white px-4">
            <div className="text-center max-w-md mx-auto">
                {/* 404 Number */}
                <h1 className="text-8xl md:text-9xl font-display font-bold text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/60">
                    404
                </h1>

                {/* Message */}
                <h2 className="mt-4 text-2xl font-semibold text-gray-900">
                    Page not found
                </h2>
                <p className="mt-2 text-muted-foreground">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>

                {/* Actions */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        <Home className="h-4 w-4" />
                        Go Home
                    </Link>
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
