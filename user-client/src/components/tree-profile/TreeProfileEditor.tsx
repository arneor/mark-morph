'use client';

import { memo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TreeProfileData } from '@/lib/treeProfileTypes';
import { useTreeProfileStore } from '@/stores/useTreeProfileStore';
import { TreeProfileView } from '@/components/tree-profile/TreeProfileView';

const TreeProfileEditControls = dynamic(() =>
    import('@/components/tree-profile/TreeProfileEditControls').then(mod => mod.TreeProfileEditControls), {
    ssr: false
});

const ThemeCustomizer = dynamic(() =>
    import('@/components/tree-profile/ThemeCustomizer').then(mod => mod.ThemeCustomizer), {
    ssr: false
});

import { useParams } from 'next/navigation';

interface TreeProfileEditorProps {
    initialData: TreeProfileData;
}

function TreeProfileEditor({ initialData }: TreeProfileEditorProps) {
    const params = useParams();
    const businessId = params.businessId as string;
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
        updateGallery,
        updateCategories
    } = useTreeProfileStore();

    // Initialize Store
    useEffect(() => {
        if (initialData) {
            setProfileData(initialData);
        }
    }, [initialData, setProfileData]);

    // CSS Variables logic moved to TreeProfileView

    if (!profileData.theme) return null; // Prevent render before hydration

    return (
        <TreeProfileView
            businessId={businessId}
            data={profileData}
            isEditMode={isEditMode}
            onUpdateHeader={updateHeader}
            onUpdateLinks={updateLinks}
            onUpdateBanners={updateBanners}
            onUpdateGallery={updateGallery}
            onUpdateCatalogItems={updateCatalogItems}
            onUpdateCategories={updateCategories}
            onUpdateSectionTitle={updateSectionTitle}
            onUpdateLinksTitle={updateLinksTitle}
        >
            {/* Edit Controls - Lazy Loaded */}
            <TreeProfileEditControls />

            {/* Theme Customizer Sheet - CSS transition */}
            {isEditMode && isThemeOpen && (
                <>
                    <div
                        onClick={() => setIsThemeOpen(false)}
                        className="fixed inset-0 bg-black/60 z-40 animate-fade-in"
                    />
                    <div
                        className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto animate-slide-up"
                    >
                        <ThemeCustomizer />
                    </div>
                </>
            )}
        </TreeProfileView>
    );
}

export default memo(TreeProfileEditor);
