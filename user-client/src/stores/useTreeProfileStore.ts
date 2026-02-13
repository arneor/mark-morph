import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TreeProfileData, TreeProfileTheme, CatalogItem, CatalogCategory, CustomLink, ProfileBanner, ProfileGalleryImage, ProfileReview } from '@/lib/treeProfileTypes';

interface TreeProfileState {
    profileData: TreeProfileData;
    isEditMode: boolean;
    isThemeOpen: boolean;
    hasChanges: boolean;

    // Actions
    setProfileData: (data: TreeProfileData) => void;
    setIsEditMode: (value: boolean) => void;
    setIsThemeOpen: (value: boolean) => void;
    setHasChanges: (value: boolean) => void;

    updateHeader: (updates: Partial<TreeProfileData>) => void;
    updateTheme: (updates: Partial<TreeProfileTheme>) => void;
    updateLinks: (links: CustomLink[]) => void;
    updateCatalogItems: (items: CatalogItem[]) => void;
    updateSectionTitle: (title: string) => void;
    updateLinksTitle: (title: string) => void;

    updateCategories: (categories: CatalogCategory[]) => void;

    // New Feature Actions
    updateBanners: (banners: ProfileBanner[]) => void;
    updateGallery: (images: ProfileGalleryImage[]) => void;
    updateReviews: (reviews: ProfileReview[]) => void;

    resetChanges: (originalData: TreeProfileData) => void;
}

export const useTreeProfileStore = create<TreeProfileState>()(
    persist(
        (set) => ({
            profileData: {} as TreeProfileData, // Initial state will be set by the component
            isEditMode: false,
            isThemeOpen: false,
            hasChanges: false,

            setProfileData: (data) => set({ profileData: data }),
            setIsEditMode: (value) => set({ isEditMode: value }),
            setIsThemeOpen: (value) => set({ isThemeOpen: value }),
            setHasChanges: (value) => set({ hasChanges: value }),

            updateHeader: (updates) => set((state) => ({
                profileData: { ...state.profileData, ...updates },
                hasChanges: true
            })),

            updateTheme: (updates) => set((state) => ({
                profileData: {
                    ...state.profileData,
                    theme: { ...state.profileData.theme, ...updates }
                },
                hasChanges: true
            })),

            updateLinks: (links) => set((state) => ({
                profileData: { ...state.profileData, customLinks: links },
                hasChanges: true
            })),

            updateCatalogItems: (items) => set((state) => ({
                profileData: { ...state.profileData, catalogItems: items },
                hasChanges: true
            })),

            updateCategories: (categories) => set((state) => ({
                profileData: { ...state.profileData, categories: categories },
                hasChanges: true
            })),

            updateSectionTitle: (title) => set((state) => ({
                profileData: { ...state.profileData, sectionTitle: title },
                hasChanges: true
            })),

            updateLinksTitle: (title) => set((state) => ({
                profileData: { ...state.profileData, linksTitle: title },
                hasChanges: true
            })),

            updateBanners: (banners) => set((state) => ({
                profileData: { ...state.profileData, banners },
                hasChanges: true
            })),

            updateGallery: (images) => set((state) => ({
                profileData: { ...state.profileData, gallery: images },
                hasChanges: true
            })),

            updateReviews: (reviews) => set((state) => ({
                profileData: { ...state.profileData, reviews },
                hasChanges: true
            })),

            resetChanges: (originalData) => set({
                profileData: originalData,
                hasChanges: false,
                isThemeOpen: false
            }),
        }),
        {
            name: 'tree-profile-store', // LocalStorage key
            partialize: (state) => ({ profileData: state.profileData }), // Only persist data, not UI state like edit mode
        }
    )
);
