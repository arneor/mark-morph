import { Suspense, cache } from 'react';
import { notFound } from 'next/navigation';
import { fetchBusinessByUsername } from '@/lib/api';
import { TreeProfileView } from '@/components/tree-profile/TreeProfileView';
import { TreeProfileSkeleton } from '@/components/tree-profile/TreeProfileSkeleton';
import type { TreeProfileData, TreeProfileTheme } from '@/lib/treeProfileTypes';

/**
 * Performance: React cache() deduplicates this fetch across
 * generateMetadata() and the layout which shares the same request lifecycle.
 */
const getBusinessByUsername = cache((username: string) =>
    fetchBusinessByUsername(username)
);

// Default theme for profiles without theme data
const defaultTheme: TreeProfileTheme = {
    primaryColor: '#6366f1',
    backgroundColor: '#ffffff',
    backgroundType: 'solid',
    backgroundValue: '#ffffff',
    textColor: '#1f2937',
    fontFamily: 'Inter',
    buttonStyle: 'rounded',
    cardStyle: 'solid',
};

export default async function ProfileLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;

    let business;
    try {
        business = await getBusinessByUsername(username);
    } catch {
        notFound();
    }

    if (!business || business.status !== 'active' || business.isBeetLinkSuspended) {
        notFound();
    }

    const profileData: TreeProfileData = {
        businessName: business.businessName || '',
        tagline: business.tagline || '',
        description: business.description || '',
        location: business.location || '',
        profileImage: business.profileImage || business.logoUrl || '',
        bannerImage: business.bannerImage || '',
        isVerified: business.status === 'active',
        sectionTitle: business.sectionTitle || '✨ Our Menu',
        linksTitle: business.linksTitle || '🔗 Quick Links',
        openingHours: business.openingHours,
        theme: business.theme ? {
            templateId: (business.theme as Record<string, string>).templateId,
            primaryColor: business.theme.primaryColor || defaultTheme.primaryColor,
            secondaryColor: business.theme.secondaryColor,
            backgroundColor: business.theme.backgroundColor || defaultTheme.backgroundColor,
            backgroundType: (business.theme.backgroundType as TreeProfileTheme['backgroundType']) || defaultTheme.backgroundType,
            backgroundValue: business.theme.backgroundValue || defaultTheme.backgroundValue,
            textColor: business.theme.textColor || defaultTheme.textColor,
            fontFamily: business.theme.fontFamily || defaultTheme.fontFamily,
            buttonStyle: (business.theme.buttonStyle as TreeProfileTheme['buttonStyle']) || defaultTheme.buttonStyle,
            cardStyle: (business.theme.cardStyle as TreeProfileTheme['cardStyle']) || defaultTheme.cardStyle,
        } : defaultTheme,
        socialLinks: (business.socialLinks || []).map(sl => ({
            id: sl.id,
            platform: sl.platform as 'instagram' | 'facebook' | 'whatsapp' | 'twitter' | 'tiktok' | 'youtube' | 'linkedin' | 'email' | 'phone',
            url: sl.url,
            label: sl.label,
        })),
        customLinks: (business.customLinks || []).map(cl => ({
            id: cl.id,
            title: cl.title,
            url: cl.url,
            description: cl.description,
            icon: cl.icon,
            style: (cl.style as 'default' | 'featured' | 'outline' | 'gradient') || 'default',
            isActive: cl.isActive,
        })),
        categories: business.categories || [],
        catalogItems: (business.catalogItems || []).map(ci => ({
            ...ci,
            tags: ci.tags as ('bestseller' | 'new' | 'veg' | 'non-veg' | 'spicy' | 'featured')[] | undefined,
        })),
        banners: business.banners || [],
        gallery: business.gallery || [],
        reviews: business.reviews || [],
        whatsappNumber: business.whatsappNumber,
        whatsappEnquiryEnabled: business.whatsappEnquiryEnabled ?? false,
    };

    return (
        /* Performance: Suspense boundary enables streaming SSR */
        <Suspense fallback={<TreeProfileSkeleton />}>
            <TreeProfileView
                businessId={business.id}
                username={username}
                data={profileData}
                isEditMode={false}
            >
                {/* 
                    The "children" prop technically contains the output of page.tsx. 
                    Since we moved logic to Layout + client-side toggling in TreeProfileView, 
                    we can render children here, but TreeProfileView now ignores it or treats it as an overlay 
                    (which it does in our manual edit, it renders {children} after background).
                    
                    Wait, in the updated TreeProfileView, {children} is rendered before the Main Content.
                    We actually want page.tsx to render NOTHING because TreeProfileView handles the content now.
                    So passing children is irrelevant if page.tsx returns null.  
                 */}
                {children}
            </TreeProfileView>
        </Suspense>
    );
}
