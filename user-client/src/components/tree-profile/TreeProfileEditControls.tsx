'use client';

import { Eye, Pencil, Save, X, Palette, ArrowLeft } from 'lucide-react';
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
        profileData
    } = useTreeProfileStore();

    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const businessId = params.businessId as string;

    const handleSave = async () => {
        try {
            // Prepare Business Update Payload
            const updatePayload = {
                businessName: profileData.businessName,
                location: profileData.location,
                description: profileData.description,
                primaryColor: profileData.theme.primaryColor,
                tagline: profileData.tagline,
                sectionTitle: profileData.sectionTitle,
                linksTitle: profileData.linksTitle,
                openingHours: profileData.openingHours,
                profileImage: profileData.profileImage,
                bannerImage: profileData.bannerImage,

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

                // Tree Profile Data
                banners: (profileData.banners || []).map(b => ({
                    id: b.id,
                    imageUrl: b.imageUrl,
                    title: b.title,
                    linkUrl: b.linkUrl,
                    isActive: b.isActive,
                })),

                gallery: (profileData.gallery || []).map(g => ({
                    id: g.id,
                    imageUrl: g.imageUrl,
                    caption: g.caption,
                })),

                categories: profileData.categories.map(c => ({
                    id: c.id,
                    name: c.name,
                    emoji: c.emoji,
                })),

                catalogItems: profileData.catalogItems.map(item => ({
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
            toast({
                title: 'Save Failed',
                description: 'Could not update profile. Please try again.',
                variant: 'destructive'
            });
        }
    };

    const handleDiscard = () => {
        setIsEditMode(false);
    };

    const handleBack = () => {
        if (hasChanges) {
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
                        className="w-10 h-10 rounded-full bg-black/30 text-white hover:bg-black/50"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>

                    {/* Right side controls - Edit Mode Toggle */}
                    <Button
                        onClick={() => setIsEditMode(!isEditMode)}
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
                                className="h-8 w-8 p-0 text-white hover:text-white hover:bg-white/20 rounded-full"
                                title="Customize Theme"
                            >
                                <Palette className="w-4 h-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleDiscard}
                                className="h-8 px-3 text-white hover:text-white hover:bg-white/20 rounded-lg"
                            >
                                <X className="w-4 h-4 mr-1" />
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={!hasChanges}
                                className="h-8 px-4 bg-white text-black hover:bg-gray-200 disabled:opacity-50 font-bold rounded-lg shadow-sm"
                            >
                                <Save className="w-4 h-4 mr-1" />
                                Save
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
                            className="w-full h-14 text-lg font-bold rounded-2xl bg-white text-black hover:bg-gray-200 shadow-xl"
                        >
                            <Save className="w-5 h-5 mr-2" />
                            Publish Changes
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}
