import { useParams, useLocation } from "wouter";
import { SplashCarousel } from "@/components/SplashCarousel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wifi,
  Loader2,
  MapPin,
  ExternalLink,
  Star,
  Sparkles,
  Gift,
  Zap,
  Clock,
  ArrowDown,
  Heart,
  Share2,
  Eye,
  Mail,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Image as ImageIcon,
  X,
  Copy,
  Check,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useConnectWifi, useSplashData } from "@/hooks/use-splash";
import { splashApi, analyticsApi } from "@/lib/api";

// Ad view countdown seconds before connect is enabled
const AD_VIEW_COUNTDOWN = 5;

// Helper to ensure URL is external (has protocol)
const ensureExternalUrl = (url: string | undefined): string | null => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
};

export default function Splash() {
  const { businessId } = useParams();
  const [, setLocation] = useLocation();
  const id = businessId || "";
  const { toast } = useToast();
  // Legacy connect step (keeping for backwards compatibility)
  const [connectStep, setConnectStep] = useState<
    "idle" | "connecting" | "success"
  >("idle");

  // NEW: Email verification flow state
  type VerificationStep = "email" | "otp" | "verified";
  const [verificationStep, setVerificationStep] = useState<VerificationStep>("email");
  const [userEmail, setUserEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Interaction State
  const [likedAds, setLikedAds] = useState<Set<string>>(new Set());
  const [expandedAd, setExpandedAd] = useState<any | null>(null);
  const [sessionId, setSessionId] = useState<string>("");

  // Initialize Session ID
  useEffect(() => {
    let sid = localStorage.getItem("mm_session_id");
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem("mm_session_id", sid);
    }
    setSessionId(sid);
  }, []);

  // Ad viewing state
  const [countdown, setCountdown] = useState(AD_VIEW_COUNTDOWN);
  const [canConnect, setCanConnect] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);

  const [adViews, setAdViews] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Sheet visibility state for desktop "Done" action
  const [isSheetHidden, setIsSheetHidden] = useState(false);

  // Check for mobile device
  const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Load liked ads from local storage
  useEffect(() => {
    const savedLikes = localStorage.getItem(`mm_liked_ads_${id}`);
    if (savedLikes) {
      try {
        setLikedAds(new Set(JSON.parse(savedLikes)));
      } catch (e) {
        console.error("Failed to parse liked ads", e);
      }
    }
  }, [id]);

  const { data, isLoading, error } = useSplashData(id);
  const connectMutation = useConnectWifi();

  const business = data?.business;
  // Map ads to campaigns structure and separate by placement
  const allAds = (data?.ads || [])
    .filter((ad: any) => ad.mediaType !== "video" && ad.status === "active");

  const featuredCampaigns = allAds.filter((c: any) => c.placement === 'BANNER');
  const galleryCampaigns = allAds.filter((c: any) => c.placement !== 'BANNER');

  // Countdown timer for ad viewing
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanConnect(true);
    }
  }, [countdown]);

  // Auto-close removed as per user request (manual close preferred)
  // User stays on page to browse ads

  // Track scroll to hide hint
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop > 100) {
        setShowScrollHint(false);
        // Bonus: reduce countdown when user scrolls (engagement reward)
        if (countdown > 2) {
          setCountdown(2);
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [countdown]);

  // Cooldown timer for resend OTP
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Handle email submission (Step 1 -> Step 2)
  const handleEmailSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userEmail || isSubmitting) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      setVerificationError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setVerificationError(null);

    try {
      const response = await splashApi.requestOtp(id, userEmail);

      if (response.success) {
        setVerificationStep("otp");
        setCooldown(60); // Start 60s cooldown for resend
        toast({
          title: "Verification Code Sent!",
          description: "Check your email for the 6-digit code.",
        });
      } else if (response.cooldown) {
        setCooldown(response.cooldown);
        setVerificationError(`Please wait ${response.cooldown} seconds before requesting again.`);
      }
    } catch (err: any) {
      setVerificationError(err.message || "Failed to send verification code. Please try again.");
      toast({
        title: "Error",
        description: err.message || "Failed to send code",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP verification (Step 2 -> Step 3)
  const handleOtpSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!otpCode || otpCode.length !== 6 || isSubmitting) return;

    setIsSubmitting(true);
    setVerificationError(null);

    try {
      const response = await splashApi.verifyOtp(id, userEmail, otpCode, sessionId);

      if (response.success) {
        setVerificationStep("verified");
        setConnectStep("success");
        toast({
          title: "Email Verified!",
          description: "You are now connected to WiFi.",
        });

        // No auto-redirect. Just show success state.
        // The captive portal "Done" button (native OS) will handle closing usually,
        // or user can manually click a link if they want.

        // On desktop, we might want to automatically hide the sheet after a delay?
        // User requested manual action, so we'll wait for button click.
      }
    } catch (err: any) {
      setVerificationError(err.message || "Invalid verification code. Please try again.");
      toast({
        title: "Verification Failed",
        description: err.message || "Invalid code",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    await handleEmailSubmit();
  };

  // Handle back to email step
  const handleBackToEmail = () => {
    setVerificationStep("email");
    setOtpCode("");
    setVerificationError(null);
  };

  // Legacy connect handler (now uses verification flow)
  const handleConnect = () => {
    // If already verified, proceed
    if (verificationStep === "verified") {
      setConnectStep("success");
      return;
    }
    // Otherwise, start verification flow (handled by email/otp forms)
  };

  const handleReview = () => {
    const rawUrl = (business as any)?.googleReviewUrl;
    const reviewUrl = ensureExternalUrl(rawUrl) ||
      `https://www.google.com/search?q=${encodeURIComponent(business?.businessName || '')}+reviews`;
    window.open(reviewUrl, "_blank", "noopener,noreferrer");
  };

  const handleAdClick = (campaignId: number) => {
    setAdViews((prev) => prev + 1);
    // Reward engagement: enable connect faster
    if (countdown > 1) {
      setCountdown(1);
    }
  };

  // --- Interaction Handlers ---

  const toggleLike = (e: React.MouseEvent, adId: string) => {
    e.stopPropagation(); // Prevent opening lightbox

    // Check if limit reached for session (optional, but good UX)
    // For now, just checking if already liked
    if (likedAds.has(adId)) return; // Already liked

    // Optimistic UI update
    const newLikedAds = new Set(likedAds);
    newLikedAds.add(adId);
    setLikedAds(newLikedAds);
    localStorage.setItem(`mm_liked_ads_${id}`, JSON.stringify(Array.from(newLikedAds)));

    // Fire API event
    analyticsApi.trackInteraction({
      adId,
      businessId: id,
      interactionType: 'LIKE',
      deviceType: 'mobile', // Simple assumption
      sessionId,
      email: userEmail || undefined
    }).catch(console.error);

    toast({
      description: "Thanks for the love!",
      className: "rounded-full bg-[#9EE53B] text-[#222] border-none font-bold text-center h-10 w-auto min-w-[150px] mx-auto",
      duration: 1500,
    });
  };

  const shareAd = async (e: React.MouseEvent, ad: any) => {
    e.stopPropagation();

    // Fire API event immediately
    analyticsApi.trackInteraction({
      adId: ad.id,
      businessId: id,
      interactionType: 'SHARE',
      deviceType: 'mobile',
      sessionId,
      email: userEmail || undefined
    }).catch(console.error);

    if (navigator.share) {
      try {
        await navigator.share({
          title: ad.title,
          text: `Check out this deal at ${business?.businessName}!`,
          url: window.location.href, // Or a specific deep link if we had one
        });
      } catch (err) {
        console.log("Share cancelled or failed", err);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied!",
          description: "Share this offer with friends.",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Could not share at this time.",
          variant: "destructive",
        });
      }
    }
  };

  // Track View Interactions
  const viewedAdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!id || allAds.length === 0) return;

    allAds.forEach((ad: any) => {
      if (!viewedAdsRef.current.has(ad.id)) {
        viewedAdsRef.current.add(ad.id);

        // Track View
        analyticsApi.trackInteraction({
          adId: ad.id,
          businessId: id,
          interactionType: 'view',
          deviceType: 'mobile',
          sessionId,
          email: userEmail || undefined
        }).catch(err => console.error("Failed to track view", err));
      }
    });
  }, [allAds, id]);

  const handleExpand = (ad: any) => {
    setExpandedAd(ad);

    // Fire API event for Expand
    analyticsApi.trackInteraction({
      adId: ad.id,
      businessId: id,
      interactionType: 'GALLERY_EXPAND',
      deviceType: 'mobile',
      sessionId,
      email: userEmail || undefined
    }).catch(console.error);

    // Fire API event for Click (General engagement)
    analyticsApi.trackInteraction({
      adId: ad.id,
      businessId: id,
      interactionType: 'click',
      deviceType: 'mobile',
      sessionId,
      email: userEmail || undefined
    }).catch(console.error);

    handleAdClick(ad.id); // Also count as a "click/engagement" for countdown
  };

  const closeExpand = () => {
    setExpandedAd(null);
  };

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
        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full gradient-lime-cyan flex items-center justify-center mx-auto mb-4 pulse-glow">
                <Loader2 className="w-8 h-8 animate-spin text-[#222]" />
              </div>
              <div className="text-white font-medium">Loading...</div>
            </motion.div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="flex-1 flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Wifi className="w-8 h-8 text-red-400" />
              </div>
              <div className="text-xl font-display font-bold text-white mb-2">
                Unable to load
              </div>
              <div className="text-white/70 mb-6">
                {error.message || "Please check the link and try again."}
              </div>
              <Button
                onClick={() => window.location.reload()}
                className="h-12 px-8 rounded-full gradient-lime-cyan text-[#222] font-bold hover:opacity-90 transition-all"
              >
                Retry
              </Button>
            </motion.div>
          </div>
        )}

        {/* Main Content */}
        {!isLoading && !error && business && (
          <>
            {/* Scrollable Content Area */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto pb-56"
              style={{ scrollBehavior: "smooth" }}
            >
              {/* Header / Brand Area */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="px-6 pt-8 pb-4 text-center"
              >
                {/* Logo with glowing ring */}
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full gradient-lime-cyan opacity-30 blur-xl animate-pulse" />
                  <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white/30 shadow-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    {business.logoUrl ? (
                      <img
                        src={business.logoUrl}
                        alt={business.businessName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Wifi className="w-10 h-10 text-white" />
                    )}
                  </div>
                </div>

                {/* Business Name */}
                <h1 className="text-2xl font-display font-extrabold text-white mb-1">
                  {business.businessName}
                </h1>

                {/* Location */}
                <div className="flex items-center justify-center gap-1.5 text-white/70 text-sm mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{(business as any).location || "Free Guest WiFi"}</span>
                </div>

                {/* Tags */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <div className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm text-white border border-white/30 flex items-center gap-1.5">
                    <Wifi className="w-3 h-3" />
                    Free WiFi
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-bold bg-[#9EE53B]/20 text-[#9EE53B] border border-[#9EE53B]/30 flex items-center gap-1.5">
                    <Gift className="w-3 h-3" />
                    {allAds.length} offers
                  </div>
                </div>
              </motion.div>

              {/* Scroll Hint */}
              <AnimatePresence>
                {showScrollHint && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center mb-2"
                  >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs">
                      <ArrowDown className="w-3 h-3 animate-bounce" />
                      <span>Scroll to explore exclusive offers</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Content Area - Ads Section */}
              <div className="px-4 space-y-4">
                {/* Featured Carousel - PRIORITY AD SLOT */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[#FFD93D]" />
                    <span className="text-xs font-bold text-white/80 uppercase tracking-wide">
                      Featured Offers
                    </span>
                  </div>
                  <SplashCarousel campaigns={featuredCampaigns as any} />
                </motion.div>

                {/* Premium Ad Banner - Shows by default, hidden only if showWelcomeBanner is explicitly false */}
                {(business as any)?.showWelcomeBanner !== false && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative overflow-hidden rounded-2xl gradient-purple-pink p-5 group"
                  >
                    <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-40 transition-opacity">
                      <Sparkles className="w-20 h-20 text-white" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-[#FFD93D]" />
                        <span className="text-xs font-bold text-white/80 uppercase tracking-wide">
                          Welcome to {business?.businessName || (business as any)?.businessName}
                        </span>
                      </div>
                      <h3 className="text-xl font-display font-bold text-white mb-1">
                        {(business as any)?.welcomeTitle || "Connect & Enjoy Free WiFi!"}
                      </h3>
                      <p className="text-sm text-white/80 mb-3">
                        {(business as any)?.description || `Explore exclusive offers from ${business?.businessName || (business as any)?.businessName}`}
                      </p>

                      {/* CTA Button - Directly open backend link */}
                      <div
                        onClick={() => {
                          const rawUrl = (business as any)?.ctaButtonUrl;
                          const url = ensureExternalUrl(rawUrl);
                          if (url) {
                            handleAdClick(0); // Still count as engagement
                            window.open(url, "_blank", "noopener,noreferrer");
                          }
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        {(business as any)?.ctaButtonText || "View Offers"}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Offer Cards Grid - MORE AD SLOTS */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Gift className="w-4 h-4 text-[#9EE53B]" />
                    <span className="text-xs font-bold text-white/80 uppercase tracking-wide">
                      Today's Deals
                    </span>
                  </div>
                  {galleryCampaigns.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {galleryCampaigns.slice(0, 4).map((c: any, index: number) => {
                        const isLiked = likedAds.has(c.id);
                        const likes = (c.likesCount || 0) + (isLiked ? 1 : 0);

                        return (
                          <motion.div
                            key={c.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleExpand(c)}
                            className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl cursor-pointer group"
                          >
                            <div className="aspect-[4/5]">
                              <img
                                src={c.mediaUrl}
                                alt={c.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            </div>

                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            {/* Content */}
                            <div className="absolute inset-x-0 bottom-0 p-3">
                              <div className="text-white font-bold text-sm leading-snug mb-1 line-clamp-2">
                                {c.title}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#9EE53B]/30 text-[#9EE53B]">
                                  Tap to view
                                </span>
                              </div>
                            </div>

                            {/* Interaction icons */}
                            <div className="absolute top-2 right-2 flex flex-col gap-2">
                              <button
                                onClick={(e) => toggleLike(e, c.id)}
                                className={`w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors ${isLiked ? 'bg-[#FF4D4D] text-white' : 'bg-black/40 text-white hover:bg-black/60'}`}
                              >
                                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                              </button>
                              <button
                                onClick={(e) => shareAd(e, c)}
                                className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Like Count Badge (if > 0) */}
                            {likes > 0 && (
                              <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm flex items-center gap-1 text-[10px] text-white font-medium">
                                <Heart className="w-3 h-3 text-[#FF4D4D] fill-[#FF4D4D]" />
                                {likes}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-white/50 text-sm bg-white/5 rounded-2xl border border-white/10">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No offers available today
                    </div>
                  )}
                </motion.div>

                {/* Additional Ad Slots - Horizontal Scroll */}
                {galleryCampaigns.length > 4 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-[#FFD93D]" />
                      <span className="text-xs font-bold text-white/80 uppercase tracking-wide">
                        More From Our Partners
                      </span>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                      {galleryCampaigns.slice(4).map((c: any, index: number) => (
                        <motion.div
                          key={c.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                          onClick={() => handleAdClick(c.id)}
                          className="flex-shrink-0 w-40 overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 cursor-pointer group"
                        >
                          <div className="aspect-[3/4]">
                            <img
                              src={c.mediaUrl}
                              alt={c.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute bottom-0 inset-x-0 p-2">
                            <div className="text-white font-semibold text-xs line-clamp-2">
                              {c.title}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Engagement CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-[#FFD93D]" />
                    <span className="text-white font-bold">
                      Enjoying the offers?
                    </span>
                  </div>
                  <p className="text-white/70 text-sm mb-3">
                    Leave a review and help others discover great deals!
                  </p>
                  <Button
                    variant="ghost"
                    className="h-10 px-6 rounded-full text-white/90 hover:text-white hover:bg-white/10 border border-white/20 text-sm font-semibold"
                    onClick={handleReview}
                  >
                    <Star className="w-4 h-4 mr-2 text-[#FFD93D]" />
                    Leave a Google Review
                    <ExternalLink className="w-3 h-3 ml-2 opacity-60" />
                  </Button>
                </motion.div>

                {/* Spacer for bottom bar */}
                {/* Spacer for bottom bar - Increased to prevent overlap */}
                <div className="h-32" />
              </div>
            </div>

            {/* Fixed Bottom Action Bar with Email Verification Flow */}
            {!isSheetHidden && (
              <div className="fixed inset-x-0 bottom-0 max-w-md mx-auto z-50">
                {/* Glass blur background */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl border-t border-white/10" />

                <div className="relative p-4 space-y-3">
                  {/* Step Indicator */}
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full transition-colors ${verificationStep !== "email" ? "bg-[#9EE53B]" : "bg-white/30"}`} />
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors ${verificationStep === "otp" ? "bg-white" : verificationStep === "verified" ? "bg-[#9EE53B]" : "bg-white/30"}`} />
                    <div className={`w-2 h-2 rounded-full transition-colors ${verificationStep === "verified" ? "bg-[#9EE53B]" : "bg-white/30"}`} />
                  </div>

                  <AnimatePresence mode="wait">
                    {/* Countdown / wait message */}
                    {!canConnect && verificationStep === "email" && (
                      <motion.div
                        key="countdown"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-center gap-2 text-white/80 text-sm"
                      >
                        <Clock className="w-4 h-4 text-[#9EE53B]" />
                        <span>
                          WiFi ready in{" "}
                          <span className="font-bold text-[#9EE53B]">{countdown}s</span>
                        </span>
                        <span className="text-white/50">• Explore offers!</span>
                      </motion.div>
                    )}

                    {/* Step 1: Email Input */}
                    {verificationStep === "email" && canConnect && (
                      <motion.form
                        key="email-form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        onSubmit={handleEmailSubmit}
                        className="space-y-3"
                      >
                        <div className="text-center text-sm text-white/80">
                          <Mail className="w-5 h-5 inline-block mr-2 text-[#9EE53B]" />
                          Enter your email to connect to WiFi
                        </div>

                        {verificationError && (
                          <div className="text-red-400 text-xs text-center py-1">
                            {verificationError}
                          </div>
                        )}

                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            value={userEmail}
                            onChange={(e) => {
                              setUserEmail(e.target.value);
                              setVerificationError(null);
                            }}
                            className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-2xl text-lg focus:border-[#9EE53B] focus:ring-[#9EE53B]"
                            required
                            disabled={isSubmitting}
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-14 text-lg font-bold rounded-2xl transition-all duration-300"
                          style={{ background: "linear-gradient(135deg, #9EE53B, #43E660)" }}
                          disabled={!userEmail || isSubmitting}
                        >
                          <span className="flex items-center justify-center gap-2 text-[#222]">
                            {isSubmitting ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Sending Code...
                              </>
                            ) : (
                              <>
                                Get Verification Code
                                <ArrowRight className="w-5 h-5" />
                              </>
                            )}
                          </span>
                        </Button>
                      </motion.form>
                    )}

                    {/* Step 2: OTP Verification */}
                    {verificationStep === "otp" && (
                      <motion.form
                        key="otp-form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        onSubmit={handleOtpSubmit}
                        className="space-y-3"
                      >
                        <div className="text-center">
                          <div className="text-sm text-white/80 mb-1">
                            <KeyRound className="w-5 h-5 inline-block mr-2 text-[#9EE53B]" />
                            Enter the 6-digit code sent to
                          </div>
                          <div className="text-[#9EE53B] font-medium text-sm">{userEmail}</div>
                        </div>

                        {verificationError && (
                          <div className="text-red-400 text-xs text-center py-1">
                            {verificationError}
                          </div>
                        )}

                        <div className="relative">
                          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                          <Input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="123456"
                            value={otpCode}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                              setOtpCode(value);
                              setVerificationError(null);
                            }}
                            className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-2xl text-lg text-center tracking-[0.5em] font-mono focus:border-[#9EE53B] focus:ring-[#9EE53B]"
                            required
                            disabled={isSubmitting}
                            autoFocus
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-14 text-lg font-bold rounded-2xl transition-all duration-300"
                          style={{ background: "linear-gradient(135deg, #9EE53B, #43E660)" }}
                          disabled={otpCode.length !== 6 || isSubmitting}
                        >
                          <span className="flex items-center justify-center gap-2 text-[#222]">
                            {isSubmitting ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              <>
                                <Wifi className="w-5 h-5" />
                                Verify & Connect
                              </>
                            )}
                          </span>
                        </Button>

                        <div className="flex items-center justify-between text-xs">
                          <button
                            type="button"
                            onClick={handleBackToEmail}
                            className="text-white/60 hover:text-white transition-colors"
                          >
                            ← Change email
                          </button>
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={cooldown > 0}
                            className={`flex items-center gap-1 transition-colors ${cooldown > 0 ? "text-white/40 cursor-not-allowed" : "text-[#9EE53B] hover:text-[#B5F84F]"}`}
                          >
                            <RotateCcw className="w-3 h-3" />
                            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                          </button>
                        </div>
                      </motion.form>
                    )}

                    {/* Step 3: Success */}
                    {verificationStep === "verified" && (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-4"
                      >
                        <div className="w-16 h-16 rounded-full bg-[#9EE53B]/20 flex items-center justify-center mx-auto mb-3">
                          <CheckCircle2 className="w-10 h-10 text-[#9EE53B]" />
                        </div>
                        <div className="text-xl font-bold text-white mb-1">You're Connected!</div>
                        <div className="text-white/70 text-sm">Enjoy free WiFi at {business?.businessName}</div>

                        {/* Done Button & Auto Close */}
                        <div className="mt-6 w-full max-w-xs mx-auto space-y-3">
                          <Button
                            onClick={() => setIsSheetHidden(true)}
                            className="w-full h-12 rounded-full bg-[#9EE53B] hover:bg-[#8CD035] text-[#222] font-bold text-lg transition-transform active:scale-95 shadow-lg shadow-[#9EE53B]/20"
                          >
                            Done
                          </Button>
                          <p className="text-white/40 text-[10px]">
                            Click Done to browse offers
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Powered by */}
                  <div className="text-center">
                    <span className="text-[11px] text-white/40 font-medium">
                      Powered by{" "}
                      <span className="text-[#9EE53B]/70">MarkMorph</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {/* Lightbox Modal */}
      <AnimatePresence>
        {expandedAd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col"
            onClick={closeExpand}
          >
            {/* Close Button */}
            <button
              onClick={closeExpand}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Main Image Area */}
            <div className="flex-1 flex items-center justify-center p-4">
              <motion.img
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={expandedAd.mediaUrl}
                alt={expandedAd.title}
                className="max-w-full max-h-[70vh] rounded-lg shadow-2xl object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Bottom Actions Panel */}
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-zinc-900/90 border-t border-white/10 p-6 pb-10"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-white mb-2">{expandedAd.title}</h2>
              {expandedAd.description && (
                <p className="text-white/70 mb-6">{expandedAd.description}</p>
              )}

              <div className="flex items-center gap-4">
                <Button
                  onClick={(e) => toggleLike(e, expandedAd.id)}
                  className={`flex-1 h-12 rounded-full font-bold text-lg gap-2 ${likedAds.has(expandedAd.id)
                    ? "bg-[#FF4D4D] text-white hover:bg-[#FF3333]"
                    : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                >
                  <Heart className={`w-5 h-5 ${likedAds.has(expandedAd.id) ? "fill-current" : ""}`} />
                  {likedAds.has(expandedAd.id) ? "Liked" : "Like"}
                </Button>

                <Button
                  onClick={(e) => shareAd(e, expandedAd)}
                  className="flex-1 h-12 rounded-full bg-white text-black font-bold text-lg gap-2 hover:bg-white/90"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
