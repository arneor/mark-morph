import { useParams } from "wouter";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Wifi, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBusiness, useUpdateBusiness } from "@/hooks/use-businesses";
import type { Business } from "@shared/schema";

// Profile Components
import { EditModeProvider, useEditMode } from "@/components/profile/EditModeContext";
import { EditableProfileHeader } from "@/components/profile/EditableProfileHeader";
import { EditablePostGrid, PostItem } from "@/components/profile/EditablePostGrid";
import { EditableReviewSection } from "@/components/profile/EditableReviewSection";
import { ProfileEditControls } from "@/components/profile/ProfileEditControls";
import { EditableOfferCard, SpecialOffer } from "@/components/profile/EditableOfferCard";

// Dummy posts data (banners can have multiple featured images)
const DUMMY_POSTS: PostItem[] = [
  {
    id: "b1",
    type: "banner",
    url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop",
    title: "Morning Pastry Deal",
    isFeatured: true,
  },
  {
    id: "b2",
    type: "banner",
    url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop",
    title: "Happy Hour Special",
    isFeatured: true,
  },
  {
    id: "p1",
    type: "image",
    url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=500&fit=crop",
    title: "Premium Coffee Selection",
    isFeatured: false,
  },
  {
    id: "p2",
    type: "image",
    url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=500&fit=crop",
    title: "Cozy Atmosphere",
    isFeatured: false,
  },
];

// Inner component that uses EditMode context
function BusinessProfileContent() {
  const { id } = useParams();
  const businessId = parseInt(id || "0");
  const { toast } = useToast();

  const { data: business, isLoading, error } = useBusiness(businessId);
  const updateBusiness = useUpdateBusiness();

  const { setHasUnsavedChanges, setIsSaving, isEditMode } = useEditMode();

  // Local state for profile data
  const [profileData, setProfileData] = useState<Partial<Business>>({});
  const [posts, setPosts] = useState<PostItem[]>(DUMMY_POSTS);
  const [googlePlaceUrl, setGooglePlaceUrl] = useState("");

  // Special Offer State
  const [specialOffer, setSpecialOffer] = useState<SpecialOffer>({
    title: "Connect & Get 15% Off!",
    description: "Exclusive discount on your first order when you connect",
    isActive: true
  });

  // Load special offer from local storage
  useEffect(() => {
    const savedOffer = localStorage.getItem("mark-morph-special-offer");
    if (savedOffer) {
      try {
        setSpecialOffer(JSON.parse(savedOffer));
      } catch (e) {
        console.error("Failed to parse special offer", e);
      }
    }
  }, []);

  const handleOfferUpdate = (updates: Partial<SpecialOffer>) => {
    const newOffer = { ...specialOffer, ...updates };
    setSpecialOffer(newOffer);
    localStorage.setItem("mark-morph-special-offer", JSON.stringify(newOffer));
    setHasUnsavedChanges(true);
  };

  // Initialize profile data when business loads
  useEffect(() => {
    if (business) {
      setProfileData({
        name: business.name,
        address: business.address,
        logoUrl: business.logoUrl,
        description: business.description,
        primaryColor: business.primaryColor,
      });

      // Parse posts from business data
      const loadedPosts: PostItem[] = [];

      // Banners
      if (business.banners && Array.isArray(business.banners)) {
        (business.banners as any[]).forEach((b: any, idx: number) => {
          loadedPosts.push({
            id: `banner-${idx}`,
            type: "banner", // Explicitly set as banner
            url: b.url,
            title: b.title,
            isFeatured: true,
          });
        });
      }

      // Photos
      if (business.photos && Array.isArray(business.photos)) {
        (business.photos as any[]).forEach((p: any, idx: number) => {
          loadedPosts.push({
            id: `photo-${idx}`,
            type: "image",
            url: p.url,
            title: p.title,
            isFeatured: false,
          });
        });
      }

      // If no content (new user), clear defaults or set minimal default
      if (loadedPosts.length > 0) {
        setPosts(loadedPosts);
      } else {
        // Just keep dummy posts for demo businesses (id 1 usually) if desired,
        // OR better: if it's a fresh signup (no posts), give them a clean starting point
        // but with at least ONE banner as required by the UI rules.
        const defaultBanner: PostItem = {
          id: 'default-welcome',
          type: 'banner',
          url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=600&fit=crop',
          title: 'Welcome',
          isFeatured: true
        };
        setPosts([defaultBanner]);
      }
    }
  }, [business]);

  // Merged business data (original + edits)
  const mergedBusiness = useMemo(() => {
    if (!business) return null;
    return { ...business, ...profileData };
  }, [business, profileData]);

  // Handle profile updates
  const handleProfileUpdate = (updates: Partial<Business>) => {
    setProfileData((prev) => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  // Handle save/publish
  const handleSave = async () => {
    if (!business) return;

    setIsSaving(true);

    try {
      // Prepare data for API
      const updateData = {
        id: businessId,
        ...profileData,
        // Convert posts to photos/banners format for API
        photos: posts
          .filter((p) => p.type === "image" && !p.isFeatured)
          .map((p) => ({ url: p.url, title: p.title })),
        banners: posts
          .filter((p) => p.isFeatured)
          .map((p) => ({ url: p.url, title: p.title, type: p.type })),
      };

      await updateBusiness.mutateAsync(updateData as any);

      setHasUnsavedChanges(false);
      toast({
        title: "Profile Published!",
        description: "Your changes are now live.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          <div className="w-16 h-16 rounded-full gradient-lime-cyan flex items-center justify-center mx-auto mb-4 pulse-glow">
            <Loader2 className="w-8 h-8 animate-spin text-[#222]" />
          </div>
          <div className="text-white font-medium">Loading profile...</div>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !mergedBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="absolute inset-0 animated-gradient opacity-95" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 relative z-10"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <Wifi className="w-8 h-8 text-red-400" />
          </div>
          <div className="text-xl font-display font-bold text-white mb-2">
            Profile not found
          </div>
          <div className="text-white/70">
            {error?.message || "Please check the URL and try again."}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center relative overflow-hidden">
      {/* Vibrant animated gradient background */}
      <div className="absolute inset-0 animated-gradient opacity-95" />

      {/* Floating decorative blobs */}
      <div
        className="absolute top-10 -left-20 w-64 h-64 blob opacity-30 animate-float"
        style={{ background: "linear-gradient(135deg, #9EE53B, #43E660)" }}
      />
      <div
        className="absolute bottom-40 -right-10 w-80 h-80 blob opacity-25 animate-float-delayed"
        style={{ background: "linear-gradient(135deg, #A855F7, #E639D0)" }}
      />
      <div
        className="absolute top-1/3 right-0 w-48 h-48 blob opacity-20 animate-float-delayed-2"
        style={{ background: "linear-gradient(135deg, #28C5F5, #3CEAC8)" }}
      />

      {/* Mobile container */}
      <div className="w-full max-w-md min-h-screen flex flex-col relative z-10">
        {/* Edit Mode Controls */}
        <ProfileEditControls onSave={handleSave} businessId={businessId} />

        {/* Scrollable Content Area */}
        <div
          className={`flex-1 overflow-y-auto ${isEditMode ? "pt-32 pb-28" : "pt-20 pb-8"
            }`}
          style={{ scrollBehavior: "smooth" }}
        >
          {/* Editable Header / Brand Area */}
          <EditableProfileHeader
            business={mergedBusiness}
            onUpdate={handleProfileUpdate}
          />

          {/* Main Content Area */}
          <div className="px-4 space-y-6 mt-4">
            {/* Featured & Posts Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <EditablePostGrid
                posts={posts}
                onPostsChange={(newPosts) => {
                  setPosts(newPosts);
                }}
                maxPosts={10}
              />
            </motion.div>

            {/* Special Offer Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="mb-2 px-1">
                {/* Only show header in edit mode to avoid duplication since card has one */}
                {isEditMode && (
                  <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">
                    Limited Time Offer
                  </h3>
                )}
                <EditableOfferCard
                  offer={specialOffer}
                  onUpdate={handleOfferUpdate}
                  isEditMode={!!isEditMode}
                />
              </div>
            </motion.div>

            {/* Google Reviews Section - Just a link input */}
            <EditableReviewSection
              googlePlaceUrl={googlePlaceUrl}
              onGoogleUrlChange={setGooglePlaceUrl}
            />

            {/* Powered by Footer */}
            <div className="text-center py-4">
              <span className="text-[11px] text-white/40 font-medium">
                Powered by{" "}
                <span className="text-[#9EE53B]/70">MarkMorph</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main exported component with provider
export default function BusinessProfile() {
  return (
    <EditModeProvider>
      <BusinessProfileContent />
    </EditModeProvider>
  );
}
