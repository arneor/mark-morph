/**
 * SSR Splash Page - Server Component
 * 
 * This is the CRITICAL page for captive portal users.
 * It uses Server-Side Rendering (SSR) to ensure:
 * - Instant content visibility
 * - SEO optimization for business profiles
 * - Minimal TTI (Time to Interactive)
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchSplashData } from '@/lib/api';
import { SplashContent } from '@/components/splash/SplashContent';

// Force dynamic rendering (SSR) for every request
export const dynamic = 'force-dynamic';

// Types
interface SplashPageProps {
    params: Promise<{
        businessId: string;
    }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata(
    { params }: SplashPageProps
): Promise<Metadata> {
    const { businessId } = await params;
    const data = await fetchSplashData(businessId);

    if (!data) {
        return {
            title: 'Business Not Found | Mark Morph',
            description: 'The requested business could not be found.',
        };
    }

    const businessName = data.business.businessName || data.business.name || 'Business';
    const location = data.business.location || '';

    return {
        title: `Connect to ${businessName} WiFi | Mark Morph`,
        description: `Get free WiFi access at ${businessName}${location ? ` in ${location}` : ''}. View exclusive offers and discover local deals.`,
        openGraph: {
            title: `${businessName} - Free WiFi`,
            description: `Connect to free WiFi at ${businessName} and discover exclusive offers.`,
            images: data.business.logoUrl ? [{ url: data.business.logoUrl }] : [],
            type: 'website',
            locale: 'en_IN',
            siteName: 'Mark Morph',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${businessName} - Free WiFi`,
            description: `Connect to free WiFi at ${businessName} and discover exclusive offers.`,
            images: data.business.logoUrl ? [data.business.logoUrl] : [],
        },
        robots: {
            index: true,
            follow: true,
        },
        alternates: {
            canonical: `https://www.markmorph.in/splash/${businessId}`,
        },
    };
}

// Main Page Component (Server Component)
export default async function SplashPage({ params }: SplashPageProps) {
    const { businessId } = await params;

    // Fetch data on the server
    const data = await fetchSplashData(businessId);

    // Handle 404
    if (!data) {
        notFound();
    }

    // Pass server-fetched data to client component
    return (
        <main className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
            <SplashContent
                businessId={businessId}
                initialData={data}
            />
        </main>
    );
}
