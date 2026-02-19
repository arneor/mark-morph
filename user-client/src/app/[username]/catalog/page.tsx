import { cache } from 'react';
import { fetchBusinessByUsername } from '@/lib/api';
import type { Metadata } from 'next';

/**
 * Performance: React cache() deduplicates this fetch across
 * generateMetadata() and the page component (single API call per render)
 */
const getBusinessByUsername = cache((username: string) =>
    fetchBusinessByUsername(username)
);

interface CatalogPageProps {
    params: Promise<{ username: string }>;
}

/**
 * Performance: Dynamic metadata for SEO + social sharing
 * Generates unique title, description, and OG images per business profile
 */
export async function generateMetadata({ params }: CatalogPageProps): Promise<Metadata> {
    const { username } = await params;

    try {
        const business = await getBusinessByUsername(username);
        if (!business) return { title: 'Profile Not Found' };

        const title = business.sectionTitle || 'Our Menu';

        return {
            title: `${title} | ${business.businessName}`,
            description: `Explore the ${title} at ${business.businessName}. ${business.tagline || ''}`,
            openGraph: {
                title: `${title} | ${business.businessName}`,
                description: business.tagline || business.description || '',
                images: business.profileImage || business.logoUrl
                    ? [{ url: business.profileImage || business.logoUrl || '' }]
                    : undefined,
                type: 'profile',
            },
            twitter: {
                card: 'summary',
                title: `${title} | ${business.businessName}`,
                description: business.tagline || '',
                images: business.profileImage || business.logoUrl
                    ? [business.profileImage || business.logoUrl || '']
                    : undefined,
            },
        };
    } catch {
        return { title: 'Catalog | LinkBeet' };
    }
}

export default function CatalogPage() {
    /* 
     * Rendering is delegated to [username]/layout.tsx which maintains the shell (TreeProfileView).
     * TreeProfileView handles tab switching client-side based on URL segment.
     * This component exists solely for Route Resolution and Metadata.
     */
    return null;
}
