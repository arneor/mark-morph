
'use client';

import { useState, useCallback, useMemo, memo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { TreeProfileData, CustomLink, CatalogItem, TreeProfileTheme } from '@/lib/dummyTreeProfileData';

// Critical components loaded immediately
import { TreeProfileHeader } from '@/components/tree-profile/TreeProfileHeader';
import { LinksSection } from '@/components/tree-profile/LinksSection';
import { TreeProfileBackground } from '@/components/tree-profile/TreeProfileBackground';

// Heavy interactive components loaded lazily
const CatalogSection = dynamic(() =>
    import('@/components/tree-profile/CatalogSection').then(mod => mod.CatalogSection), {
    loading: () => <div className="h-64 w-full bg-gray-800/10 rounded-xl animate-pulse" />,
    ssr: false // Client-only interaction usually
});

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
    // State
    const [isEditMode, setIsEditMode] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [isThemeOpen, setIsThemeOpen] = useState(false);
    const [profileData, setProfileData] = useState<TreeProfileData>(initialData);

    // Optimized Handlers with useCallback
    const handleSave = useCallback(() => {
        // console.log('Saving profile data:', profileData);
        // Implement actual save logic here
        setHasChanges(false);
        setIsEditMode(false);
        setIsThemeOpen(false);
    }, [profileData]); // Dependency on profileData is necessary for the log/save

    const handleDiscard = useCallback(() => {
        setProfileData(initialData);
        setHasChanges(false);
        setIsThemeOpen(false);
    }, [initialData]);

    const handleUpdateLinks = useCallback((links: CustomLink[]) => {
        setProfileData(prev => ({ ...prev, customLinks: links }));
        setHasChanges(true);
    }, []);

    const handleUpdateItems = useCallback((items: CatalogItem[]) => {
        setProfileData(prev => ({ ...prev, catalogItems: items }));
        setHasChanges(true);
    }, []);

    const handleUpdateHeader = useCallback((updates: Partial<TreeProfileData>) => {
        setProfileData(prev => ({ ...prev, ...updates }));
        setHasChanges(true);
    }, []);

    const handleUpdateTitle = useCallback((title: string) => {
        setProfileData(prev => ({ ...prev, sectionTitle: title }));
        setHasChanges(true);
    }, []);

    const handleThemeUpdate = useCallback((updates: Partial<TreeProfileTheme>) => {
        setProfileData(prev => ({
            ...prev,
            theme: { ...prev.theme, ...updates }
        }));
        setHasChanges(true);
    }, []);

    const toggleTheme = useCallback(() => {
        setIsThemeOpen(prev => !prev);
    }, []);

    return (
        <div
            className="min-h-screen relative overflow-hidden bg-black text-rendering-optimize-legibility"
            style={{ fontFamily: profileData.theme.fontFamily }}
        >
            {/* Optimized Background */}
            <TreeProfileBackground theme={profileData.theme} />

            {/* Edit Controls - Lazy Loaded */}
            <TreeProfileEditControls
                isEditMode={isEditMode}
                setIsEditMode={setIsEditMode}
                hasChanges={hasChanges}
                onSave={handleSave}
                onDiscard={handleDiscard}
                onOpenTheme={toggleTheme}
            />

            {/* Main Content */}
            <div className="relative z-10 flex justify-center transform-gpu">
                <main className={`w-full max-w-md min-h-screen ${isEditMode ? 'pt-20 pb-40' : 'pt-0 pb-8'} transition-[padding] duration-300 will-change-[padding]`}>
                    <div className="w-full">
                        {/* Header Section */}
                        <TreeProfileHeader
                            data={profileData}
                            isEditMode={isEditMode}
                            onUpdate={handleUpdateHeader}
                        />

                        <div className="px-4 space-y-8 content-visibility-auto contain-content">
                            {/* Links Section */}
                            <div className="mt-2">
                                <LinksSection
                                    links={profileData.customLinks}
                                    theme={profileData.theme}
                                    isEditMode={isEditMode}
                                    onUpdate={handleUpdateLinks}
                                />
                            </div>

                            {/* Catalog Section - Dynamic Import */}
                            <CatalogSection
                                title={profileData.sectionTitle}
                                categories={profileData.categories}
                                items={profileData.catalogItems}
                                theme={profileData.theme}
                                isEditMode={isEditMode}
                                onUpdateItems={handleUpdateItems}
                                onUpdateTitle={handleUpdateTitle}
                            />

                            {/* Footer */}
                            <Footer theme={profileData.theme} />
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
                            <ThemeCustomizer
                                theme={profileData.theme}
                                onUpdate={handleThemeUpdate}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

// Memoized Footer Component
const Footer = memo(function Footer({ theme }: { theme: TreeProfileTheme }) {
    return (
        <div className="text-center pt-8 pb-4 opacity-100 transition-opacity duration-500">
            <span
                className="text-[11px] font-medium"
                style={{ color: theme.textColor, opacity: 0.4 }}
            >
                Powered by{' '}
                <span
                    className="font-semibold"
                    style={{ color: `${theme.primaryColor}70` }}
                >
                    MarkMorph
                </span>
            </span>
        </div>
    );
});

export default memo(TreeProfileEditor);
