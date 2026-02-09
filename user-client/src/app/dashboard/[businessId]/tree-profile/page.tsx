'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Tree Profile Components
import { TreeProfileHeader } from '@/components/tree-profile/TreeProfileHeader';
import { LinksSection } from '@/components/tree-profile/LinksSection';
import { CatalogSection } from '@/components/tree-profile/CatalogSection';
import { TreeProfileEditControls } from '@/components/tree-profile/TreeProfileEditControls';
import { ThemeCustomizer } from '@/components/tree-profile/ThemeCustomizer';

// Dummy Data
import { dummyTreeProfileData, TreeProfileData, CustomLink, CatalogItem } from '@/lib/dummyTreeProfileData';

function TreeProfileContent() {
    const params = useParams();
    const businessId = params.businessId as string;

    // Edit mode state
    const [isEditMode, setIsEditMode] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [isThemeOpen, setIsThemeOpen] = useState(false);

    // Profile data state (using dummy data)
    const [profileData, setProfileData] = useState<TreeProfileData>(dummyTreeProfileData);

    // Handlers
    const handleSave = () => {
        console.log('Saving profile data:', profileData);
        setHasChanges(false);
        setIsEditMode(false);
        setIsThemeOpen(false);
    };

    const handleDiscard = () => {
        setProfileData(dummyTreeProfileData);
        setHasChanges(false);
        setIsThemeOpen(false);
    };

    const handleUpdateLinks = (links: CustomLink[]) => {
        setProfileData(prev => ({ ...prev, customLinks: links }));
        setHasChanges(true);
    };

    const handleUpdateItems = (items: CatalogItem[]) => {
        setProfileData(prev => ({ ...prev, catalogItems: items }));
        setHasChanges(true);
    };

    // Suppress unused variable warning for businessId
    void businessId;

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

                {/* Floating orbs */}
                <motion.div
                    className="absolute top-20 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
                    style={{ background: profileData.theme.primaryColor }}
                    animate={{
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{
                        duration: 8,
                        ease: 'easeInOut',
                        repeat: Infinity,
                    }}
                />
                <motion.div
                    className="absolute bottom-40 -right-32 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
                    style={{ background: '#A855F7' }}
                    animate={{
                        x: [0, -40, 0],
                        y: [0, -40, 0],
                    }}
                    transition={{
                        duration: 10,
                        ease: 'easeInOut',
                        repeat: Infinity,
                    }}
                />
            </div>

            {/* Edit Controls */}
            <TreeProfileEditControls
                isEditMode={isEditMode}
                setIsEditMode={setIsEditMode}
                hasChanges={hasChanges}
                onSave={handleSave}
                onDiscard={handleDiscard}
                onOpenTheme={() => setIsThemeOpen(!isThemeOpen)}
            />

            {/* Main Content */}
            <div className="relative z-10 flex justify-center">
                <div className={`w-full max-w-md min-h-screen ${isEditMode ? 'pt-20 pb-40' : 'pt-0 pb-8'} transition-all duration-300`}>
                    {/* Scrollable Content */}
                    <div className="w-full">
                        {/* Header Section (Handles its own spacing for Banner) */}
                        <TreeProfileHeader
                            data={profileData}
                            isEditMode={isEditMode}
                            onUpdate={(updates) => {
                                setProfileData(prev => ({ ...prev, ...updates }));
                                setHasChanges(true);
                            }}
                        />

                        <div className="px-4 space-y-8">
                            {/* Links Section */}
                            <div className="mt-2">
                                <LinksSection
                                    links={profileData.customLinks}
                                    theme={profileData.theme}
                                    isEditMode={isEditMode}
                                    onUpdate={handleUpdateLinks}
                                />
                            </div>

                            {/* Catalog Section */}
                            <CatalogSection
                                title={profileData.sectionTitle}
                                categories={profileData.categories}
                                items={profileData.catalogItems}
                                theme={profileData.theme}
                                isEditMode={isEditMode}
                                onUpdateItems={handleUpdateItems}
                                onUpdateTitle={(title) => {
                                    setProfileData(prev => ({ ...prev, sectionTitle: title }));
                                    setHasChanges(true);
                                }}
                            />

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

            {/* Theme Customizer Sheet */}
            <AnimatePresence>
                {isEditMode && isThemeOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsThemeOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto"
                        >
                            <ThemeCustomizer
                                theme={profileData.theme}
                                onUpdate={(updates) => {
                                    setProfileData(prev => ({
                                        ...prev,
                                        theme: { ...prev.theme, ...updates }
                                    }));
                                    setHasChanges(true);
                                }}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function TreeProfilePage() {
    return <TreeProfileContent />;
}
