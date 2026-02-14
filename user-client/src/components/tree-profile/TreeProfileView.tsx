'use client';

import { useState, useMemo, memo } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import {
    TreeProfileData,
    CustomLink,
    ProfileBanner,
    ProfileGalleryImage,
    CatalogItem,
    CatalogCategory
} from '@/lib/treeProfileTypes';

// Performance: Critical above-fold components loaded eagerly
import { TreeProfileHeader } from '@/components/tree-profile/TreeProfileHeader';
import { LinksSection } from '@/components/tree-profile/LinksSection';
import { TreeProfileBackground } from '@/components/tree-profile/TreeProfileBackground';

// Performance: Below-fold components loaded via dynamic import (code splitting)
import { CatalogSkeleton } from '@/components/tree-profile/SectionSkeletons';

const CarouselSection = dynamic(
    () => import('@/components/tree-profile/CarouselSection').then(mod => ({ default: mod.CarouselSection })),
    { loading: () => <div className="mb-8 w-full aspect-video rounded-2xl bg-white/5 animate-pulse" /> }
);

const GallerySection = dynamic(
    () => import('@/components/tree-profile/GallerySection').then(mod => ({ default: mod.GallerySection })),
    { loading: () => <div className="mb-8 grid grid-cols-3 gap-3">{[1, 2, 3].map(i => <div key={i} className="aspect-square rounded-3xl bg-white/5 animate-pulse" />)}</div> }
);

const CatalogSection = dynamic(
    () => import('@/components/tree-profile/CatalogSection').then(mod => ({ default: mod.CatalogSection })),
    { loading: () => <CatalogSkeleton /> }
);

const ReviewsSection = dynamic(
    () => import('@/components/tree-profile/ReviewsSection').then(mod => ({ default: mod.ReviewsSection })),
    { loading: () => <div className="mb-8 space-y-4">{[1, 2].map(i => <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />)}</div> }
);

// Footer Component
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

interface TreeProfileViewProps {
    businessId: string;
    data: TreeProfileData;
    isEditMode?: boolean;
    activeTab?: 'links' | 'menu';
    onTabChange?: (tab: 'links' | 'menu') => void;

    // Update Callbacks (Optional - only needed for Edit Mode)
    onUpdateHeader?: (data: Partial<TreeProfileData>) => void;
    onUpdateLinks?: (links: CustomLink[]) => void;
    onUpdateBanners?: (banners: ProfileBanner[]) => void;
    onUpdateGallery?: (images: ProfileGalleryImage[]) => void;
    onUpdateCatalogItems?: (items: CatalogItem[]) => void;
    onUpdateCategories?: (categories: CatalogCategory[]) => void;
    onUpdateSectionTitle?: (title: string) => void;
    onUpdateLinksTitle?: (title: string) => void;

    // Optional children for overlays (like Edit Controls or Theme Customizer)
    children?: React.ReactNode;
}

export function TreeProfileView({
    businessId,
    data,
    isEditMode = false,
    activeTab: controlledActiveTab,
    onTabChange,
    onUpdateHeader,
    onUpdateLinks,
    onUpdateBanners,
    onUpdateGallery,
    onUpdateCatalogItems,
    onUpdateCategories,
    onUpdateSectionTitle,
    onUpdateLinksTitle,
    children
}: TreeProfileViewProps) {
    // Internal state for tab if not controlled
    const [internalActiveTab, setInternalActiveTab] = useState<'links' | 'menu'>('links');
    const activeTab = controlledActiveTab ?? internalActiveTab;

    const handleTabChange = (tab: 'links' | 'menu') => {
        if (onTabChange) {
            onTabChange(tab);
        } else {
            setInternalActiveTab(tab);
        }
    };

    // CSS Variables for HIGH PERFORMANCE (No JS re-renders for styles)
    const cssVariables = useMemo(() => ({
        '--primary': data.theme?.primaryColor || '#9EE53B',
        '--bg-color': data.theme?.backgroundColor || '#000000',
        '--font-main': data.theme?.fontFamily || 'Inter',
        '--text-color': data.theme?.textColor || '#FFFFFF',
    } as React.CSSProperties), [data.theme]);

    if (!data.theme) return null; // Prevent render before hydration/data load

    return (
        <div
            className="min-h-screen relative overflow-x-hidden bg-black text-rendering-optimize-legibility touch-optimized"
            style={cssVariables}
        >
            {/* Optimized Background */}
            <TreeProfileBackground theme={data.theme} />

            {/* Render any children (Overlays like EditControls) */}
            {children}

            {/* Main Content */}
            <div className="relative z-10 flex justify-center">
                <main className={`w-full max-w-md min-h-screen ${isEditMode ? 'pt-20 pb-40' : 'pt-0 pb-8'}`}>
                    <div className="w-full">
                        {/* Header Section */}
                        <TreeProfileHeader
                            businessId={businessId}
                            data={data}
                            isEditMode={isEditMode}
                            onUpdate={onUpdateHeader}
                        />

                        <div className="px-4 space-y-8 content-visibility-auto contain-content">
                            {/* Animated Tab Navigation */}
                            <div className="flex items-center justify-center gap-2 mb-6 relative">
                                {/* Tab: Quick Links */}
                                <button
                                    onClick={() => handleTabChange('links')}
                                    className={`relative px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors duration-300 ${activeTab === 'links' ? 'text-(--text-color)' : 'text-(--text-color) opacity-50 hover:opacity-80'}`}
                                >
                                    {isEditMode && onUpdateLinksTitle ? (
                                        <input
                                            value={data.linksTitle ?? "Quick Links"}
                                            onChange={(e) => onUpdateLinksTitle(e.target.value)}
                                            className="bg-transparent text-center outline-none w-full min-w-[80px]"
                                            style={{ color: 'inherit' }}
                                        />
                                    ) : (
                                        data.linksTitle ?? "Quick Links"
                                    )}
                                    {activeTab === 'links' && (
                                        /* Performance: CSS-only tab indicator instead of framer-motion layoutId */
                                        <div
                                            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-300"
                                            style={{ background: 'var(--primary)' }}
                                        />
                                    )}
                                </button>

                                {/* Divider */}
                                <div className="w-px h-4 bg-(--text-color) opacity-20" />

                                {/* Tab: Our Menu */}
                                <button
                                    onClick={() => handleTabChange('menu')}
                                    className={`relative px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors duration-300 ${activeTab === 'menu' ? 'text-(--text-color)' : 'text-(--text-color) opacity-50 hover:opacity-80'}`}
                                >
                                    {isEditMode && onUpdateSectionTitle ? (
                                        <input
                                            value={data.sectionTitle}
                                            onChange={(e) => onUpdateSectionTitle(e.target.value)}
                                            className="bg-transparent text-center outline-none w-full min-w-[80px]"
                                            style={{ color: 'inherit' }}
                                        />
                                    ) : (
                                        data.sectionTitle
                                    )}
                                    {activeTab === 'menu' && (
                                        /* Performance: CSS-only tab indicator instead of framer-motion layoutId */
                                        <div
                                            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-300"
                                            style={{ background: 'var(--primary)' }}
                                        />
                                    )}
                                </button>
                            </div>

                            {/* Performance: Conditional rendering for public view, keep-mounted for edit mode */}
                            <div className="relative min-h-[400px]">
                                {isEditMode ? (
                                    /* Edit Mode: Keep both tabs mounted for instant switching */
                                    <>
                                        <div className={cn(
                                            "transition-opacity duration-300",
                                            activeTab === 'links' ? "opacity-100 relative z-10" : "opacity-0 absolute inset-0 -z-10 pointer-events-none h-0 overflow-hidden"
                                        )}>
                                            <LinksSection
                                                links={data.customLinks}
                                                theme={data.theme}
                                                isEditMode={isEditMode}
                                                onUpdate={onUpdateLinks || (() => { })}
                                            />
                                            <div className="mt-8 space-y-8">
                                                <CarouselSection
                                                    businessId={businessId}
                                                    banners={data.banners || []}
                                                    theme={data.theme}
                                                    isEditMode={isEditMode}
                                                    onUpdate={onUpdateBanners || (() => { })}
                                                />
                                                <GallerySection
                                                    businessId={businessId}
                                                    images={data.gallery || []}
                                                    theme={data.theme}
                                                    isEditMode={isEditMode}
                                                    onUpdate={onUpdateGallery || (() => { })}
                                                />
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "transition-opacity duration-300",
                                            activeTab === 'menu' ? "opacity-100 relative z-10" : "opacity-0 absolute inset-0 -z-10 pointer-events-none h-0 overflow-hidden"
                                        )}>
                                            <CatalogSection
                                                title={data.sectionTitle}
                                                categories={data.categories}
                                                items={data.catalogItems}
                                                theme={data.theme}
                                                isEditMode={isEditMode}
                                                onUpdateItems={onUpdateCatalogItems}
                                                onUpdateCategories={onUpdateCategories}
                                                businessId={businessId}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    /* Public View: Only render active tab (reduces DOM nodes ~50%) */
                                    <>
                                        {activeTab === 'links' && (
                                            <div>
                                                <LinksSection
                                                    links={data.customLinks}
                                                    theme={data.theme}
                                                    isEditMode={false}
                                                    onUpdate={() => { }}
                                                />
                                                <div className="mt-8 space-y-8">
                                                    <CarouselSection
                                                        businessId={businessId}
                                                        banners={data.banners || []}
                                                        theme={data.theme}
                                                        isEditMode={false}
                                                        onUpdate={() => { }}
                                                    />
                                                    <GallerySection
                                                        businessId={businessId}
                                                        images={data.gallery || []}
                                                        theme={data.theme}
                                                        isEditMode={false}
                                                        onUpdate={() => { }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {activeTab === 'menu' && (
                                            <CatalogSection
                                                title={data.sectionTitle}
                                                categories={data.categories}
                                                items={data.catalogItems}
                                                theme={data.theme}
                                                isEditMode={false}
                                                businessId={businessId}
                                            />
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Footer */}
                            <Footer />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
