'use client';

import { memo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
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
        </TreeProfileView>
    );
}

export default memo(TreeProfileEditor);
