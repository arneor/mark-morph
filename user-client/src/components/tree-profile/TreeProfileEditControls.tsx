'use client';

import { useState } from 'react';
import { Eye, Pencil, Save, X, Palette, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTreeProfileStore } from '@/stores/useTreeProfileStore';
import { businessApi } from '@/lib/api';

export function TreeProfileEditControls() {
    const {
        isEditMode,
        setIsEditMode,
        hasChanges,
        setHasChanges,
        setIsThemeOpen,
        profileData,
        updateGallery,
        updateBanners
    } = useTreeProfileStore();

    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const businessId = params.businessId as string;

    const handleSave = async () => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            // 1. Process Gallery Uploads (Batch Upload)
            const currentGallery = profileData.gallery || [];
            const processedGallery = await Promise.all(currentGallery.map(async (img) => {
                if (img.file && img.file.name) { // Ensure it's not just an empty object {} from state hydration
                    try {
                        const { url } = await businessApi.uploadMedia(businessId, img.file, 'tree-profile-gallery');
                        // Revoke blob URL to prevent memory leaks
                        if (img.imageUrl.startsWith('blob:')) {
                            URL.revokeObjectURL(img.imageUrl);
                        }
                        return { ...img, imageUrl: url, file: undefined };
                    } catch (err) {
                        console.error(`Failed to upload gallery image ${img.id}:`, err);
                        throw new Error(`Failed to upload image: ${img.caption || 'Gallery Image'}`);
                    }
                }
                // If it's a blob and hasn't been replaced by a real URL (i.e., file was lost), we will filter it out subsequently.
                return img;
            }));

            // 2. Process Banner Uploads (Batch Upload)
            const currentBanners = profileData.banners || [];
            const processedBanners = await Promise.all(currentBanners.map(async (banner) => {
                if (banner.file && banner.file.name) { // Ensure it's not just an empty object {} from state hydration
                    try {
                        const { url } = await businessApi.uploadMedia(businessId, banner.file, 'tree-profile-banners');
                        if (banner.imageUrl.startsWith('blob:')) {
                            URL.revokeObjectURL(banner.imageUrl);
                        }
                        return { ...banner, imageUrl: url, file: undefined };
                    } catch (err) {
                        console.error(`Failed to upload banner ${banner.id}:`, err);
                        throw new Error(`Failed to upload banner: ${banner.title || 'Banner'}`);
                    }
                }
                // If it's a blob and hasn't been replaced by a real URL (i.e., file was lost), we will filter it out subsequently.
                return banner;
            }));

            // 3. Update Store with resolved URLs immediately
            // This ensures that if the API update fails, or if user continues editing,
            // they are working with the uploaded URLs, not pending files.
            updateGallery(processedGallery);
            updateBanners(processedBanners);

            // 4. Prepare Business Update Payload
            const updatePayload = {
                businessName: profileData.businessName,
                location: profileData.location,
                description: profileData.description,
                primaryColor: profileData.theme.primaryColor,
                tagline: profileData.tagline,
                sectionTitle: profileData.sectionTitle,
                linksTitle: profileData.linksTitle,
                openingHours: profileData.openingHours,
                // Direct Image URLs - Sanitize to prevent blob leakage
                profileImage: profileData.profileImage?.startsWith('blob:') ? undefined : profileData.profileImage,
                bannerImage: profileData.bannerImage?.startsWith('blob:') ? undefined : profileData.bannerImage,

                // Theme Settings
                theme: {
                    templateId: profileData.theme.templateId,
                    primaryColor: profileData.theme.primaryColor,
                    secondaryColor: profileData.theme.secondaryColor,
                    backgroundColor: profileData.theme.backgroundColor,
                    backgroundType: profileData.theme.backgroundType,
                    backgroundValue: profileData.theme.backgroundValue,
                    textColor: profileData.theme.textColor,
                    fontFamily: profileData.theme.fontFamily,
                    buttonStyle: profileData.theme.buttonStyle,
                    cardStyle: profileData.theme.cardStyle,
                },

                // Links
                customLinks: profileData.customLinks.map(link => ({
                    id: link.id,
                    title: link.title,
                    url: link.url,
                    description: link.description,
                    icon: link.icon,
                    style: link.style,
                    isActive: link.isActive
                })),

                socialLinks: profileData.socialLinks.map(link => ({
                    id: link.id,
                    platform: link.platform,
                    url: link.url,
                    label: link.label
                })),

                // Tree Profile Data - Use PROCESSED lists and block legacy/ghost blob URLs from hitting the database
                banners: processedBanners
                    .filter(b => !b.imageUrl.startsWith('blob:'))
                    .map(b => ({
                        id: b.id,
                        imageUrl: b.imageUrl, // Guaranteed Real URL
                        title: b.title,
                        linkUrl: b.linkUrl,
                        isActive: b.isActive,
                    })),

                gallery: processedGallery
                    .filter(g => !g.imageUrl.startsWith('blob:'))
                    .map(g => ({
                        id: g.id,
                        imageUrl: g.imageUrl, // Guaranteed Real URL
                        caption: g.caption,
                    })),

                categories: profileData.categories.map(c => ({
                    id: c.id,
                    name: c.name,
                    emoji: c.emoji,
                })),

                catalogItems: profileData.catalogItems
                    .filter(item => !item.imageUrl?.startsWith('blob:'))
                    .map(item => ({
                        id: item.id,
                        categoryId: item.categoryId,
                        title: item.title,
                        description: item.description,
                        price: item.price,
                        currency: item.currency,
                        imageUrl: item.imageUrl,
                        tags: item.tags,
                        isAvailable: item.isAvailable,
                    })),

                reviews: (profileData.reviews || []).map(r => ({
                    id: r.id,
                    reviewerName: r.reviewerName,
                    rating: r.rating,
                    comment: r.comment,
                    date: r.date,
                    avatarUrl: r.avatarUrl,
                })),
            };

            await businessApi.update(businessId, updatePayload);

            setHasChanges(false);
            setIsEditMode(false);

            toast({
                title: '✨ Changes Saved',
                description: 'Your profile has been updated successfully.',
            });
        } catch (error) {
            console.error('Failed to save profile:', error);
            const message = error instanceof Error ? error.message : 'Could not update profile. Please try again.';
            toast({
                title: 'Save Failed',
                description: message,
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDiscard = () => {
        setIsEditMode(false);
    };

    const handleBack = () => {
        if (hasChanges && !isLoading) {
            const confirmExit = window.confirm(
                "You have unsaved changes. Are you sure you want to leave?"
            );
            if (!confirmExit) return;
        }
        router.push(`/dashboard/${businessId}`);
    };

    return (
        <>
            {/* Top Navigation Bar */}
            <div
                className="fixed top-0 inset-x-0 max-w-md mx-auto z-50 pointer-events-none animate-fade-in"
            >
                <div className="flex items-center justify-between p-4 pointer-events-auto">
                    {/* Back button */}
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleBack}
                        disabled={isLoading}
                        className="w-10 h-10 rounded-full bg-black/30 text-white hover:bg-black/50 disabled:opacity-50"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>

                    {/* Right side controls - Edit Mode Toggle */}
                    <Button
                        onClick={() => setIsEditMode(!isEditMode)}
                        disabled={isLoading}
                        className={`h-10 px-4 rounded-full font-semibold transition-all shadow-lg ${isEditMode
                            ? "bg-white text-black hover:bg-gray-200"
                            : "bg-black/80 text-white hover:bg-black"
                            }`}
                    >
                        {isEditMode ? (
                            <>
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                            </>
                        ) : (
                            <>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Edit Mode Banner */}
            {isEditMode && (
                <div
                    className="fixed top-16 inset-x-0 max-w-md mx-auto z-40 px-4 animate-fade-in"
                >
                    <div className="bg-black/80 border border-white/10 rounded-2xl p-3 flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white drop-shadow-md tracking-wide pl-2">
                                Edit Mode
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setIsThemeOpen(true)}
                                disabled={isLoading}
                                className="h-8 w-8 p-0 text-white hover:text-white hover:bg-white/20 rounded-full"
                                title="Customize Theme"
                            >
                                <Palette className="w-4 h-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleDiscard}
                                disabled={isLoading}
                                className="h-8 px-3 text-white hover:text-white hover:bg-white/20 rounded-lg"
                            >
                                <X className="w-4 h-4 mr-1" />
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={!hasChanges || isLoading}
                                className="h-8 px-4 bg-white text-black hover:bg-gray-200 disabled:opacity-50 font-bold rounded-lg shadow-sm"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4 mr-1" />
                                )}
                                {isLoading ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Fixed Bottom Save Bar (when unsaved changes exist in edit mode) */}
            {isEditMode && hasChanges && (
                <div
                    className="fixed bottom-0 inset-x-0 max-w-md mx-auto z-50 animate-fade-in"
                >
                    <div className="bg-black/80 border-t border-white/10 p-4">
                        <Button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="w-full h-14 text-lg font-bold rounded-2xl bg-white text-black hover:bg-gray-200 shadow-xl"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5 mr-2" />
                            )}
                            {isLoading ? 'Publishing Changes...' : 'Publish Changes'}
                        </Button>
                    </div>
                </div>
            )}
            {isLoading && (
                <div className="fixed inset-0 z-100 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in">
                    <div className="bg-white/10 p-6 rounded-2xl border border-white/20 shadow-2xl flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-white animate-spin" />
                        <div className="text-center">
                            <h3 className="text-white font-bold text-lg">Saving Changes...</h3>
                            <p className="text-white/60 text-sm">Please wait while we update your profile.</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
