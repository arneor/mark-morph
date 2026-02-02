/**
 * ISR Business Profile Page
 * 
 * Uses Incremental Static Regeneration (ISR) to cache public profiles.
 * Revalidates every 60 seconds to ensure data freshness while maintaining near-instant load times.
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchBusinessById } from '@/lib/api';
import { ProfileContent } from '@/components/profile/ProfileContent';

// ISR: Revalidate this page every 60 seconds
export const revalidate = 60;

// Dynamic Params handling
export const dynamicParams = true; // Allow paths not returned by generateStaticParams

interface ProfilePageProps {
    params: Promise<{
        businessId: string;
    }>;
}

// Generate static params for top businesses (Stub for now)
export async function generateStaticParams() {
    // TODO: Fetch top 100 popular businesses to pre-render
    // const businesses = await fetchTopBusinesses(100);
    // return businesses.map((b) => ({ businessId: b.id }));

    return []; // Fallback to on-demand generation
}

// Generate dynamic metadata
export async function generateMetadata(
    { params }: ProfilePageProps
): Promise<Metadata> {
    const { businessId } = await params;
    const business = await fetchBusinessById(businessId);

    if (!business) {
        return {
            title: 'Profile Not Found',
        };
    }

    return {
        title: `${business.businessName} | Mark Morph`,
        description: business.description || `Check out ${business.businessName} on Mark Morph.`,
        openGraph: {
            title: business.businessName,
            description: business.description || `Check out ${business.businessName} on Mark Morph.`,
            images: business.logoUrl ? [{ url: business.logoUrl }] : [],
        },
    };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { businessId } = await params;
    const business = await fetchBusinessById(businessId);

    if (!business) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <ProfileContent business={business} />
        </main>
    );
}
