'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Loader2, TreePine } from 'lucide-react';
import { useBusiness } from '@/hooks/use-businesses';
import type { TreeProfileData, TreeProfileTheme } from '@/lib/treeProfileTypes';
import type { Business } from '@/lib/api';
import TreeProfileEditor from '@/components/tree-profile/TreeProfileEditor';

// Default theme for new/empty profiles
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

// Map Business API data -> TreeProfileData shape
function mapBusinessToTreeProfile(business: Business | null | undefined): TreeProfileData {
    if (!business) {
        return {
            businessName: '',
            tagline: '',
            profileImage: '',
            isVerified: false,
            sectionTitle: '✨ Our Menu',
            linksTitle: '🔗 Quick Links',
            theme: defaultTheme,
            socialLinks: [],
            customLinks: [],
            categories: [],
            catalogItems: [],
            banners: [],
            gallery: [],
            reviews: [],
        };
    }

    return {
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
}

export default function TreeProfilePage() {
    const params = useParams();
    const businessId = params.businessId as string;
    const { data: business, isLoading, error } = useBusiness(businessId);

    const profileData = useMemo(() => mapBusinessToTreeProfile(business), [business]);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="absolute inset-0 animated-gradient opacity-95" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center relative z-10"
                >
                    <div className="w-16 h-16 rounded-full gradient-lime-cyan flex items-center justify-center mx-auto mb-4 pulse-glow">
                        <Loader2 className="w-8 h-8 animate-spin text-[#222]" />
                    </div>
                    <div className="text-white font-medium">Loading profile...</div>
                </motion.div>
            </div>
        );
    }

    // Error state
    if (error || !business) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6">
                <div className="absolute inset-0 animated-gradient opacity-95" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 relative z-10"
                >
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <TreePine className="w-8 h-8 text-red-400" />
                    </div>
                    <div className="text-xl font-display font-bold text-white mb-2">
                        Profile not found
                    </div>
                    <div className="text-white/70">
                        {error?.message || 'Please check the URL and try again.'}
                    </div>
                </motion.div>
            </div>
        );
    }

    return <TreeProfileEditor initialData={profileData} />;
}
