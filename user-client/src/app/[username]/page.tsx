'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { businessApi } from '@/lib/api';

import { Loader2 } from 'lucide-react';

// Tree Profile Components
import { TreeProfileHeader } from '@/components/tree-profile/TreeProfileHeader';
import { LinksSection } from '@/components/tree-profile/LinksSection';
import { CatalogSection } from '@/components/tree-profile/CatalogSection';

// Dummy Data (fallback for missing fields)
import { dummyTreeProfileData, TreeProfileData } from '@/lib/dummyTreeProfileData';

export default function PublicProfilePage() {
    const params = useParams();
    const username = params.username as string;

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [profileData, setProfileData] = useState<TreeProfileData | null>(null);
    const [activeTab, setActiveTab] = useState<'links' | 'menu'>('links');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!username) return;

            try {
                const business = await businessApi.getPublicProfile(username);

                // Merge fetched business data with dummy structure for layout
                // In a real app, theme and links would come from the backend too
                const mergedData: TreeProfileData = {
                    ...dummyTreeProfileData,
                    businessName: business.businessName,
                    location: business.location || dummyTreeProfileData.location,
                    description: business.description || dummyTreeProfileData.description,
                    profileImage: business.logoUrl || dummyTreeProfileData.profileImage,
                    // If we had custom links in backend, we'd map them here
                    // customLinks: business.links || [],
                };

                setProfileData(mergedData);
            } catch (err) {
                console.error('Failed to fetch profile:', err);
                setError('Profile not found');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [username]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    if (error || !profileData) {
        return notFound();
    }

    return (
        <div
            className="min-h-screen relative overflow-hidden bg-black"
            style={{ fontFamily: profileData.theme.fontFamily }}
        >
            {/* Stunning Animated Background */}
            <div className="fixed inset-0 z-0">
                {/* Base gradient */}
                <div
                    className="absolute inset-0 transition-all duration-700 ease-in-out"
                    style={{
                        background: profileData.theme.backgroundType === 'solid'
                            ? profileData.theme.backgroundColor
                            : profileData.theme.backgroundType === 'gradient'
                                ? profileData.theme.backgroundValue
                                : `url(${profileData.theme.backgroundValue}) center/cover no-repeat`,
                    }}
                />

                {/* Animated gradient overlay (only if not solid/image override) */}
                {profileData.theme.backgroundType === 'gradient' && (
                    <motion.div
                        className="absolute inset-0 opacity-40 mix-blend-overlay"
                        style={{
                            background: `linear-gradient(-45deg, ${profileData.theme.primaryColor}, #A855F7, #E639D0, #3CEAC8)`,
                            backgroundSize: '400% 400%',
                        }}
                        animate={{
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                        }}
                        transition={{
                            duration: 15,
                            ease: 'linear',
                            repeat: Infinity,
                        }}
                    />
                )}

                {/* Image Background Dark Overlay to ensure text readability */}
                {profileData.theme.backgroundType === 'image' && (
                    <div className="absolute inset-0 bg-black/60 transition-opacity duration-700" />
                )}

                {/* Noise texture overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex justify-center">
                <div className="w-full max-w-md min-h-screen pt-0 pb-8 transition-all duration-300">
                    <div className="w-full">
                        {/* Header Section */}
                        <TreeProfileHeader
                            data={profileData}
                            isEditMode={false}
                            onUpdate={() => { }} // Read-only
                        />

                        <div className="px-4 space-y-8">
                            {/* Tab Navigation */}
                            <div className="flex items-center justify-center gap-2 mb-6 relative">
                                {/* Tab: Quick Links */}
                                <button
                                    onClick={() => setActiveTab('links')}
                                    className={`relative px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors duration-300 ${activeTab === 'links' ? '' : 'opacity-50 hover:opacity-80'}`}
                                    style={{ color: profileData.theme.textColor }}
                                >
                                    {profileData.linksTitle ?? "Quick Links"}
                                    {activeTab === 'links' && (
                                        <motion.div
                                            layoutId="activeTabIndicator"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                                            style={{ background: profileData.theme.primaryColor }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </button>

                                {/* Divider */}
                                <div className="w-px h-4 opacity-20" style={{ backgroundColor: profileData.theme.textColor }} />

                                {/* Tab: Our Menu */}
                                <button
                                    onClick={() => setActiveTab('menu')}
                                    className={`relative px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors duration-300 ${activeTab === 'menu' ? '' : 'opacity-50 hover:opacity-80'}`}
                                    style={{ color: profileData.theme.textColor }}
                                >
                                    {profileData.sectionTitle}
                                    {activeTab === 'menu' && (
                                        <motion.div
                                            layoutId="activeTabIndicator"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                                            style={{ background: profileData.theme.primaryColor }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </button>
                            </div>

                            {/* Content Area - Keep Mounted Strategy */}
                            <div className="relative min-h-[400px]">
                                {/* Links Section */}
                                <div className={cn(
                                    "transition-opacity duration-300",
                                    activeTab === 'links' ? "opacity-100 relative z-10" : "opacity-0 absolute inset-0 -z-10 pointer-events-none h-0 overflow-hidden"
                                )}>
                                    <LinksSection
                                        links={profileData.customLinks}
                                        theme={profileData.theme}
                                        isEditMode={false}
                                        onUpdate={() => { }} // Read-only
                                    />
                                </div>

                                {/* Menu/Catalog Section */}
                                <div className={cn(
                                    "transition-opacity duration-300",
                                    activeTab === 'menu' ? "opacity-100 relative z-10" : "opacity-0 absolute inset-0 -z-10 pointer-events-none h-0 overflow-hidden"
                                )}>
                                    <CatalogSection
                                        title={profileData.sectionTitle}
                                        categories={profileData.categories}
                                        items={profileData.catalogItems}
                                        theme={profileData.theme}
                                        isEditMode={false}
                                        onUpdateItems={() => { }} // Read-only
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="text-center pt-8 pb-4"
                            >
                                <span
                                    className="text-[11px] font-medium"
                                    style={{ color: profileData.theme.textColor, opacity: 0.4 }}
                                >
                                    Powered by{' '}
                                    <span
                                        className="font-semibold"
                                        style={{ color: `${profileData.theme.primaryColor}70` }}
                                    >
                                        MarkMorph
                                    </span>
                                </span>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
