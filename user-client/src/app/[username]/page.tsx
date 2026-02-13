import { TreeProfileView } from '@/components/tree-profile/TreeProfileView';
import { fetchBusinessByUsername } from '@/lib/api';
import type { TreeProfileData, TreeProfileTheme } from '@/lib/treeProfileTypes';
import { notFound } from 'next/navigation';

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

interface PublicProfilePageProps {
    params: Promise<{ username: string }>;
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
    const { username } = await params;

    let business;
    try {
        business = await fetchBusinessByUsername(username);
    } catch {
        notFound();
    }

    if (!business) {
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
    };

    return (
        <TreeProfileView
            businessId={business.id}
            data={profileData}
            isEditMode={false}
        />
    );
}
