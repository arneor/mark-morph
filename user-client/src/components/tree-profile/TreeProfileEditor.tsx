
'use client';

import { useState, useMemo, memo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { TreeProfileData } from '@/lib/dummyTreeProfileData';

// Critical components loaded immediately
import { TreeProfileHeader } from '@/components/tree-profile/TreeProfileHeader';
import { LinksSection } from '@/components/tree-profile/LinksSection';
import { useTreeProfileStore } from '@/stores/useTreeProfileStore';
import { CarouselSection } from '@/components/tree-profile/CarouselSection';
import { GallerySection } from '@/components/tree-profile/GallerySection';

const TreeProfileBackground = dynamic(() => import('@/components/tree-profile/TreeProfileBackground').then(mod => mod.TreeProfileBackground));

import { CatalogSection } from '@/components/tree-profile/CatalogSection';

const TreeProfileEditControls = dynamic(() =>
    import('@/components/tree-profile/TreeProfileEditControls').then(mod => mod.TreeProfileEditControls), {
    ssr: false
});

const ThemeCustomizer = dynamic(() =>
    import('@/components/tree-profile/ThemeCustomizer').then(mod => mod.ThemeCustomizer), {
    ssr: false
});

interface TreeProfileEditorProps {
    initialData: TreeProfileData;
}

function TreeProfileEditor({ initialData }: TreeProfileEditorProps) {
    // Zustand Store
    const {
        profileData,
        isEditMode,
        isThemeOpen,
        setProfileData,
        setIsThemeOpen,
        updateHeader,
        updateLinks,
        updateCatalogItems,
        updateSectionTitle,

        updateLinksTitle,
        updateBanners,
        updateGallery
    } = useTreeProfileStore();

    // Tab State
    const [activeTab, setActiveTab] = useState<'links' | 'menu'>('links');

    // Initialize Store
    useEffect(() => {
        if (initialData) {
            setProfileData(initialData);
        }
    }, [initialData, setProfileData]);

    // CSS Variables for HIGH PERFORMANCE (No JS re-renders for styles)
    const cssVariables = useMemo(() => ({
        '--primary': profileData.theme?.primaryColor || '#9EE53B',
        '--bg-color': profileData.theme?.backgroundColor || '#000000',
        '--font-main': profileData.theme?.fontFamily || 'Inter',
        '--text-color': profileData.theme?.textColor || '#FFFFFF',
    } as React.CSSProperties), [profileData.theme]);

    if (!profileData.theme) return null; // Prevent render before hydration

    return (
        <div
            className="min-h-screen relative overflow-hidden bg-black text-rendering-optimize-legibility"
            style={cssVariables}
        >
            {/* Optimized Background */}
            <TreeProfileBackground theme={profileData.theme} />

            {/* Edit Controls - Lazy Loaded */}
            <TreeProfileEditControls />

            {/* Main Content */}
            <div className="relative z-10 flex justify-center transform-gpu">
                <main className={`w-full max-w-md min-h-screen ${isEditMode ? 'pt-20 pb-40' : 'pt-0 pb-8'} transition-[padding] duration-300 will-change-[padding]`}>
                    <div className="w-full">
                        {/* Header Section */}
                        <TreeProfileHeader
                            data={profileData}
                            isEditMode={isEditMode}
                            onUpdate={updateHeader}
                        />

                        <div className="px-4 space-y-8 content-visibility-auto contain-content">
                            {/* Animated Tab Navigation */}
                            <div className="flex items-center justify-center gap-2 mb-6 relative">
                                {/* Tab: Quick Links */}
                                <button
                                    onClick={() => setActiveTab('links')}
                                    className={`relative px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors duration-300 ${activeTab === 'links' ? 'text-(--text-color)' : 'text-(--text-color) opacity-50 hover:opacity-80'}`}
                                >
                                    {isEditMode ? (
                                        <input
                                            value={profileData.linksTitle ?? "Quick Links"}
                                            onChange={(e) => updateLinksTitle(e.target.value)}
                                            className="bg-transparent text-center outline-none w-full min-w-[80px]"
                                            style={{ color: 'inherit' }}
                                        />
                                    ) : (
                                        profileData.linksTitle ?? "Quick Links"
                                    )}
                                    {activeTab === 'links' && (
                                        <motion.div
                                            layoutId="activeTabIndicator"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                                            style={{ background: 'var(--primary)' }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </button>

                                {/* Divider */}
                                <div className="w-px h-4 bg-(--text-color) opacity-20" />

                                {/* Tab: Our Menu */}
                                <button
                                    onClick={() => setActiveTab('menu')}
                                    className={`relative px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors duration-300 ${activeTab === 'menu' ? 'text-(--text-color)' : 'text-(--text-color) opacity-50 hover:opacity-80'}`}
                                >
                                    {isEditMode ? (
                                        <input
                                            value={profileData.sectionTitle}
                                            onChange={(e) => updateSectionTitle(e.target.value)}
                                            className="bg-transparent text-center outline-none w-full min-w-[80px]"
                                            style={{ color: 'inherit' }}
                                        />
                                    ) : (
                                        profileData.sectionTitle
                                    )}
                                    {activeTab === 'menu' && (
                                        <motion.div
                                            layoutId="activeTabIndicator"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                                            style={{ background: 'var(--primary)' }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </button>
                            </div>

                            {/* Content Area - Keep Mounted Strategy for Instant Switching */}
                            <div className="relative min-h-[400px]">
                                {/* Links Section */}
                                <div className={cn(
                                    "transition-opacity duration-300",
                                    activeTab === 'links' ? "opacity-100 relative z-10" : "opacity-0 absolute inset-0 -z-10 pointer-events-none h-0 overflow-hidden"
                                )}>
                                    <LinksSection
                                        links={profileData.customLinks}
                                        theme={profileData.theme}
                                        isEditMode={isEditMode}
                                        onUpdate={updateLinks}
                                    />

                                    {/* New Sections Below Links */}
                                    <div className="mt-8 space-y-8">
                                        <CarouselSection
                                            banners={profileData.banners || []} // Provide fallback empty array
                                            theme={profileData.theme}
                                            isEditMode={isEditMode}
                                            onUpdate={updateBanners}
                                        />

                                        <GallerySection
                                            images={profileData.gallery || []}
                                            theme={profileData.theme}
                                            isEditMode={isEditMode}
                                            onUpdate={updateGallery}
                                        />
                                    </div>
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
                                        isEditMode={isEditMode}
                                        onUpdateItems={updateCatalogItems}
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <Footer />
                        </div>
                    </div>
                </main>
            </div>

            {/* Theme Customizer Sheet - Lazy Loaded & AnimatePresence */}
            <AnimatePresence>
                {isEditMode && isThemeOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsThemeOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                            style={{ willChange: 'opacity' }}
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto"
                            style={{ willChange: 'transform' }}
                        >
                            <ThemeCustomizer />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

// Memoized Footer Component
const Footer = memo(function Footer() {
    return (
        <div className="text-center pt-8 pb-4 opacity-100 transition-opacity duration-500">
            <span
                className="text-[11px] font-medium"
                style={{ color: 'var(--text-color)', opacity: 0.4 }}
            >
                Powered by{' '}
                <span
                    className="font-semibold"
                    style={{ color: 'color-mix(in srgb, var(--primary) 70%, transparent)' }}
                >
                    MarkMorph
                </span>
            </span>
        </div>
    );
});

export default memo(TreeProfileEditor);
