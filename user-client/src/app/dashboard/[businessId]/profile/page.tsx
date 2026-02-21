'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

import { Wifi, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBusiness, useUpdateBusiness } from '@/hooks/use-businesses';
import { businessApi } from '@/lib/api';

// Profile Components
import { EditModeProvider, useEditMode } from '@/components/profile/EditModeContext';
import { EditableProfileHeader } from '@/components/profile/EditableProfileHeader';
import { EditablePostGrid, PostItem } from '@/components/profile/EditablePostGrid';
import { EditableReviewSection } from '@/components/profile/EditableReviewSection';
import { ProfileEditControls } from '@/components/profile/ProfileEditControls';
import { EditableOfferCard } from '@/components/profile/EditableOfferCard';

// Inner component that uses EditMode context
interface LocalProfileData {
    businessName: string;
    location: string;
    logoUrl?: string;
    description?: string;
    primaryColor?: string;
    logoFile?: File;
    // Splash screen customization
    welcomeTitle?: string;
    ctaButtonText?: string;
    ctaButtonUrl?: string;
    showWelcomeBanner?: boolean;
}

function BusinessProfileContent() {
    const params = useParams();
    const businessId = params.businessId as string;
    const { toast } = useToast();

    const { data: business, isLoading, error } = useBusiness(businessId);
    const updateBusiness = useUpdateBusiness();

    const { setHasUnsavedChanges, setIsSaving, isEditMode, setIsEditMode } = useEditMode();

    // Local state for profile data
    const [profileData, setProfileData] = useState<LocalProfileData>({
        businessName: '',
        location: '',
    });
    const [posts, setPosts] = useState<PostItem[]>([]);
    const [googlePlaceUrl, setGooglePlaceUrl] = useState('');

    // Handle splash customization updates
    const handleSplashUpdate = (updates: Partial<LocalProfileData>) => {
        setProfileData((prev) => ({ ...prev, ...updates }));
        setHasUnsavedChanges(true);
    };

    // Initialize profile data when business loads
    useEffect(() => {
        if (business) {
            setProfileData({
                businessName: business.businessName,
                location: business.location || '',
                logoUrl: business.logoUrl,
                description: business.description,
                primaryColor: business.primaryColor,
                // Splash screen customization
                welcomeTitle: business.welcomeTitle,
                ctaButtonText: business.ctaButtonText,
                ctaButtonUrl: business.ctaButtonUrl,
                showWelcomeBanner: business.showWelcomeBanner !== false,
            });

            // Initialize Google Review URL from backend
            if (business.googleReviewUrl) {
                setGooglePlaceUrl(business.googleReviewUrl);
            }

            // Parse posts from business data
            const loadedPosts: PostItem[] = [];
            const ads = business.ads || [];

            if (Array.isArray(ads)) {
                ads.forEach((ad, idx: number) => {
                    loadedPosts.push({
                        id: ad.id || `ad-${idx}`,
                        type: (ad.placement === 'BANNER' ? 'banner' : 'image') as PostItem['type'],
                        url: ad.mediaUrl,
                        title: ad.title,
                        isFeatured: ad.placement === 'BANNER',
                        s3Key: ad.s3Key,
                    });
                });
            }

            setPosts(loadedPosts);
        }
    }, [business]);

    // Merged business data (original + edits)
    const mergedBusiness = useMemo(() => {
        if (!business) return null;
        return {
            ...business,
            ...profileData,
        };
    }, [business, profileData]);

    // Handle profile updates
    const handleProfileUpdate = (updates: Partial<LocalProfileData>) => {
        setProfileData((prev) => ({ ...prev, ...updates }));
        setHasUnsavedChanges(true);
    };

    // Handle save/publish
    const handleSave = async () => {
        try {
            setIsSaving(true);

            // 1. Upload Logo if pending
            let finalLogoUrl = profileData.logoUrl;

            if (profileData.logoFile) {
                try {
                    const { url } = await businessApi.uploadMedia(
                        businessId,
                        profileData.logoFile,
                        'branding'
                    );
                    finalLogoUrl = url;
                } catch (e: unknown) {
                    const err = e as { status?: number; message?: string };
                    console.error('Logo upload failed', err);
                    if (err.status === 403 || err.message?.includes('403')) {
                        throw new Error('S3 Access Denied. Check Bucket Policy.');
                    }
                    throw new Error('Failed to upload logo');
                }
            }

            // 2. Upload pending posts (banners/gallery) in parallel for speed
            const finalPosts = [...posts];

            await Promise.all(
                finalPosts.map(async (post, index) => {
                    if (post.file) {
                        try {
                            const { url, key } = await businessApi.uploadMedia(
                                businessId,
                                post.file,
                                post.isFeatured ? 'banner' : 'gallery'
                            );
                            // Update the post with S3 data
                            finalPosts[index] = {
                                ...post,
                                url,
                                s3Key: key,
                                file: undefined, // Clear file so we don't re-upload
                            };
                        } catch (e: unknown) {
                            const err = e as { status?: number; message?: string };
                            console.error(`Post upload failed: ${post.title}`, err);
                            if (err.status === 403 || err.message?.includes('403')) {
                                throw new Error('S3 Access Denied. Check Bucket Policy.');
                            }
                            throw new Error(`Failed to upload ${post.title}`);
                        }
                    }
                })
            );

            // Update local state with uploaded posts (so UI reflects S3 URLs)
            setPosts(finalPosts);

            // 3. Prepare data for API
            const updateData = {
                id: businessId,
                businessName: profileData.businessName,
                location: profileData.location,
                description: profileData.description,
                primaryColor: profileData.primaryColor,
                logoUrl: finalLogoUrl?.startsWith('blob:') ? undefined : finalLogoUrl,
                googleReviewUrl: googlePlaceUrl,
                // Splash screen customization
                welcomeTitle: profileData.welcomeTitle,
                ctaButtonText: profileData.ctaButtonText,
                ctaButtonUrl: profileData.ctaButtonUrl,
                showWelcomeBanner: profileData.showWelcomeBanner,

                // Map photos/banners to unified 'ads' structure
                // Filter out any persistent blobs that failed to upload
                ads: finalPosts
                    .filter((p) => !p.url?.startsWith('blob:'))
                    .map((p) => ({
                        title: p.title || 'Untitled Ad',
                        mediaUrl: p.url,
                        mediaType: (p.type === 'banner' ? 'image' : p.type || 'image') as 'image' | 'video',
                        placement: p.isFeatured ? 'BANNER' : 'GALLERY',
                        ctaUrl: googlePlaceUrl,
                        s3Key: p.s3Key,
                    })) as unknown as typeof updateBusiness extends { mutateAsync: (data: { ads?: infer T }) => unknown } ? T : never,
            };

            await updateBusiness.mutateAsync(updateData as Parameters<typeof updateBusiness.mutateAsync>[0]);

            setHasUnsavedChanges(false);
            setIsEditMode(false);
            toast({
                title: 'Profile Published!',
                description: 'Your changes are now live.',
            });
        } catch (err) {
            toast({
                title: 'Error',
                description:
                    err instanceof Error
                        ? err.message
                        : 'Failed to save changes. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="absolute inset-0 animated-gradient opacity-95" />
                <div
                    className="text-center relative z-10 animate-fade-in"
                >
                    <div className="w-16 h-16 rounded-full gradient-lime-cyan flex items-center justify-center mx-auto mb-4 pulse-glow">
                        <Loader2 className="w-8 h-8 animate-spin text-[#222]" />
                    </div>
                    <div className="text-white font-medium">Loading profile...</div>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !mergedBusiness) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6">
                <div className="absolute inset-0 animated-gradient opacity-95" />
                <div
                    className="text-center bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 relative z-10 animate-fade-in"
                >
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <Wifi className="w-8 h-8 text-red-400" />
                    </div>
                    <div className="text-xl font-display font-bold text-white mb-2">
                        Profile not found
                    </div>
                    <div className="text-white/70">
                        {error?.message || 'Please check the URL and try again.'}
                    </div>
                </div>
            </div>
        );
    }

    const displayBusiness = mergedBusiness;

    return (
        <div className="min-h-screen flex justify-center relative overflow-hidden">
            {/* Vibrant animated gradient background */}
            <div className="absolute inset-0 animated-gradient opacity-95" />

            {/* Floating decorative blobs */}
            <div
                className="absolute top-10 -left-20 w-64 h-64 blob opacity-30 animate-float"
                style={{ background: 'linear-gradient(135deg, #9EE53B, #43E660)' }}
            />
            <div
                className="absolute bottom-40 -right-10 w-80 h-80 blob opacity-25 animate-float-delayed"
                style={{ background: 'linear-gradient(135deg, #A855F7, #E639D0)' }}
            />
            <div
                className="absolute top-1/3 right-0 w-48 h-48 blob opacity-20 animate-float-delayed-2"
                style={{ background: 'linear-gradient(135deg, #28C5F5, #3CEAC8)' }}
            />

            {/* Mobile container */}
            <div className="w-full max-w-md min-h-screen flex flex-col relative z-10">
                {/* Edit Mode Controls */}
                <ProfileEditControls onSave={handleSave} businessId={businessId} />

                {/* Scrollable Content Area */}
                <div
                    className={`flex-1 overflow-y-auto ${isEditMode ? 'pt-32 pb-28' : 'pt-20 pb-8'}`}
                    style={{ scrollBehavior: 'smooth' }}
                >
                    {/* Editable Header / Brand Area */}
                    <EditableProfileHeader
                        business={displayBusiness}
                        onUpdate={handleProfileUpdate}
                    />

                    {/* Main Content Area */}
                    <div className="px-4 space-y-6 mt-4">
                        {/* Featured & Posts Grid */}
                        <div className="animate-fade-in">
                            <EditablePostGrid
                                posts={posts}
                                onPostsChange={(newPosts) => {
                                    setPosts(newPosts);
                                }}
                                maxPosts={10}
                                businessId={businessId}
                            />
                        </div>

                        {/* Special Offer Section */}
                        <div className="animate-fade-in">
                            <div className="mb-2 px-1">
                                {/* Only show header in edit mode to avoid duplication since card has one */}
                                {isEditMode && (
                                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">
                                        Splash Screen Customization
                                    </h3>
                                )}
                                <EditableOfferCard
                                    data={{
                                        welcomeTitle: profileData.welcomeTitle,
                                        description: profileData.description,
                                        ctaButtonText: profileData.ctaButtonText,
                                        ctaButtonUrl: profileData.ctaButtonUrl,
                                        showWelcomeBanner: profileData.showWelcomeBanner,
                                    }}
                                    businessName={profileData.businessName}
                                    onUpdate={handleSplashUpdate}
                                    isEditMode={!!isEditMode}
                                />
                            </div>
                        </div>

                        {/* Google Reviews Section - Just a link input */}
                        <EditableReviewSection
                            googlePlaceUrl={googlePlaceUrl}
                            onGoogleUrlChange={setGooglePlaceUrl}
                        />

                        {/* Powered by Footer */}
                        <div className="text-center py-4">
                            <span className="text-[11px] text-white/40 font-medium">
                                Powered by{' '}
                                <span className="text-[#9EE53B]/70">LinkBeet</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Main exported component with provider
export default function BusinessProfilePage() {
    return (
        <EditModeProvider>
            <BusinessProfileContent />
        </EditModeProvider>
    );
}
