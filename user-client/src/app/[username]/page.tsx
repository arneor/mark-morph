import { cache } from 'react';
import { fetchBusinessByUsername } from '@/lib/api';
import type { Metadata } from 'next';

/**
 * Performance: React cache() deduplicates this fetch across
 * generateMetadata() and the layout (single API call per render)
 */
const getBusinessByUsername = cache((username: string) =>
    fetchBusinessByUsername(username)
);

interface PublicProfilePageProps {
    params: Promise<{ username: string }>;
}

/**
 * Performance: Dynamic metadata for SEO + social sharing
 * Generates unique title, description, and OG images per business profile
 */
export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
    const { username } = await params;

    try {
        const business = await getBusinessByUsername(username);
        if (!business) return { title: 'Profile Not Found' };

        return {
            title: `${business.businessName} | LinkBeet`,
            description: business.tagline || business.description || `Visit ${business.businessName} on LinkBeet`,
            openGraph: {
                title: business.businessName,
                description: business.tagline || business.description || '',
                images: business.profileImage || business.logoUrl
                    ? [{ url: business.profileImage || business.logoUrl || '' }]
                    : undefined,
                type: 'profile',
            },
            twitter: {
                card: 'summary',
                title: business.businessName,
                description: business.tagline || '',
                images: business.profileImage || business.logoUrl
                    ? [business.profileImage || business.logoUrl || '']
                    : undefined,
            },
        };
    } catch {
        return { title: 'Profile | LinkBeet' };
    }
}

export default function PublicProfilePage() {
    /* 
     * Rendering is delegated to [username]/layout.tsx which maintains the shell (TreeProfileView).
     * TreeProfileView handles tab switching client-side based on URL segment.
     * This component exists solely for Route Resolution and Metadata.
     */
    return null;
}
