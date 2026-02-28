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
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Performance: Dynamic metadata for SEO + social sharing
 * Generates unique title, description, and OG images per business profile
 * Also handles specific catalog item metadata if ?item=ID is present
 */
export async function generateMetadata({ params, searchParams }: CatalogPageProps): Promise<Metadata> {
    const { username } = await params;
    const query = await searchParams;
    const itemId = query?.item as string | undefined;

    try {
        const business = await getBusinessByUsername(username);
        if (!business) return { title: 'Profile Not Found' };

        const sectionTitle = business.sectionTitle || 'Our Menu';

        let title = `${sectionTitle} | ${business.businessName}`;
        let description = `Explore the ${sectionTitle} at ${business.businessName}. ${business.tagline || ''}`;
        let image = business.profileImage || business.logoUrl || '';
        const validImage = (url: string | null | undefined): url is string => !!url && url.length > 0;

        if (itemId && business.catalogItems) {
            const catalogItem = business.catalogItems.find(i => i.id === itemId);
            if (catalogItem) {
                const formattedPrice = catalogItem.price ? ` (₹${catalogItem.price})` : '';
                title = `${catalogItem.title}${formattedPrice} from ✨ ${sectionTitle} | ${business.businessName}`;

                const baseDescription = catalogItem.description ? `${catalogItem.description}. ` : '';
                description = `${baseDescription}Order directly from ${business.businessName}. ${business.tagline || ''}`.trim();

                if (catalogItem.imageUrl) {
                    image = catalogItem.imageUrl;
                }
            }
        }

        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.linkbeet.in';
        let ogImageUrl = image;

        if (validImage(image) && image.startsWith('http')) {
            // Proxy via Next.js Edge Image Optimizer to guarantee WhatsApp <300KB constraint
            // Format: /_next/image?url=ENCODED_URL&w=384&q=75
            ogImageUrl = `${baseUrl}/_next/image?url=${encodeURIComponent(image)}&w=384&q=75`;
        }

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images: validImage(image) ? [
                    {
                        url: ogImageUrl,
                        width: 384,
                        height: 384,
                        alt: title,
                    }
                ] : undefined,
                type: itemId ? 'article' : 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: validImage(image) ? [ogImageUrl] : undefined,
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
