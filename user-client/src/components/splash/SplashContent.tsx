/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { splashApi, analyticsApi, SplashData } from '@/lib/api';
import { SplashCarousel } from '@/components/SplashCarousel';

// Google Identity Services types
declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: {
                        client_id: string;
                        callback: (response: { credential: string }) => void;
                        auto_select?: boolean;
                        cancel_on_tap_outside?: boolean;
                        use_fedcm_for_prompt?: boolean;
                    }) => void;
                    prompt: (callback?: (notification: {
                        isNotDisplayed: () => boolean;
                        isSkippedMoment: () => boolean;
                        isDismissedMoment: () => boolean;
                        getNotDisplayedReason: () => string;
                        getSkippedReason: () => string;
                        getDismissedReason: () => string;
                    }) => void) => void;
                    renderButton: (element: HTMLElement, options: {
                        theme?: 'outline' | 'filled_blue' | 'filled_black';
                        size?: 'large' | 'medium' | 'small';
                        text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
                        shape?: 'rectangular' | 'pill' | 'circle' | 'square';
                        logo_alignment?: 'left' | 'center';
                        width?: number;
                    }) => void;
                    cancel: () => void;
                };
            };
        };
    }
}

// Ad view countdown seconds before connect is enabled
const AD_VIEW_COUNTDOWN = 5;

// Helper to ensure URL is external (has protocol)
const ensureExternalUrl = (url: string | undefined): string | null => {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url}`;
};

interface SplashContentProps {
    businessId: string;
    initialData: SplashData;
}

export function SplashContent({ businessId: id, initialData }: SplashContentProps) {
    const { toast } = useToast();

    // Legacy connect step
    const [, setConnectStep] = useState<
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

    // Google OAuth state
    const [authMethod, setAuthMethod] = useState<'google' | 'email' | null>(null);
    const [googleUserName, setGoogleUserName] = useState<string | null>(null);

    // Interaction State
    const [likedAds, setLikedAds] = useState<Set<string>>(new Set());
    const [expandedAd, setExpandedAd] = useState<SplashData['ads'][number] | null>(null);
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

    const [, setAdViews] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Sheet visibility state for desktop "Done" action
    const [isSheetHidden, setIsSheetHidden] = useState(false);

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

    const business = initialData.business;
    type SplashAd = SplashData['ads'][number];
    const allAds = (initialData.ads || [])
        .filter((ad: SplashAd) => ad.mediaType !== "video" && ad.status === "active");

    const featuredCampaigns = allAds.filter((c: SplashAd) => c.placement === 'BANNER');
    const galleryCampaigns = allAds.filter((c: SplashAd) => c.placement !== 'BANNER');

    // Countdown timer for ad viewing
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanConnect(true);
        }
    }, [countdown]);

    // SMART AUTO-RECOVERY: Preload Google Script & Detect Blocks
    useEffect(() => {
        const preloadGoogleScript = async () => {
            // If already loaded, do nothing
            if (window.google) return;

            try {
                await new Promise<void>((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://accounts.google.com/gsi/client';
                    script.async = true;
                    script.defer = true;
                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error('Network block'));
                    document.head.appendChild(script);
                });
                // Script loaded successfully
            } catch {
                console.warn("Google Sign-In blocked/unavailable. Switching to email fallback.");
                // Auto-switch to email view if Google is blocked
                setAuthMethod('email');
            }
        };

        // Slight delay to prioritize main content paint
        const timer = setTimeout(preloadGoogleScript, 1000);
        return () => clearTimeout(timer);
    }, []);

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

    // Handle Google Sign-In
    const handleGoogleSignIn = async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        setAuthMethod('google');
        setVerificationError(null);

        try {
            // Dynamically load Google Identity Services
            const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

            if (!googleClientId) {
                throw new Error('Google Sign-In is not configured');
            }

            // Load Google Identity Services script if not already loaded
            if (!window.google) {
                await new Promise<void>((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://accounts.google.com/gsi/client';
                    script.async = true;
                    script.defer = true;
                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error('Failed to load Google Sign-In'));
                    document.head.appendChild(script);
                });
            }

            // Initialize Google Sign-In
            if (!window.google) {
                throw new Error('Google Sign-In failed to load');
            }

            window.google.accounts.id.initialize({
                client_id: googleClientId,
                callback: async (response: { credential: string }) => {
                    try {
                        // Send credential to backend for verification
                        const result = await splashApi.googleAuth(id, response.credential, sessionId);

                        if (result.success) {
                            setGoogleUserName(result.name || null);
                            setUserEmail(result.email || '');
                            setVerificationStep("verified");
                            setConnectStep("success");
                            toast({
                                title: result.isNewUser ? "Welcome!" : "Welcome back!",
                                description: result.message,
                            });
                        }
                    } catch (err: unknown) {
                        const error = err as Error;
                        setVerificationError(error.message || "Google sign-in failed. Please try again.");
                        toast({
                            title: "Sign-in Failed",
                            description: error.message || "Please try again",
                            variant: "destructive",
                        });
                    } finally {
                        setIsSubmitting(false);
                        setAuthMethod(null);
                    }
                },
                auto_select: false,
                cancel_on_tap_outside: true,
                use_fedcm_for_prompt: true,
            });

            // Trigger Google One Tap or popup
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            window.google.accounts.id.prompt((notification: any) => {
                if (notification.isNotDisplayed()) {
                    const reason = notification.getNotDisplayedReason();
                    console.warn('Google One Tap not displayed:', reason);

                    // Handle specific reasons
                    if (reason === 'opt_out_or_no_session') {
                        // User opted out or no Google session - show email option
                        setVerificationError("No Google account detected. Please use email verification or sign in to Google in another tab.");
                    } else if (reason === 'browser_not_supported') {
                        setVerificationError("Google Sign-In is not supported on this browser. Please use email verification.");
                    } else {
                        // Other reasons (including 403 from misconfigured origins)
                        setVerificationError("Google Sign-In unavailable. Please try email verification instead.");
                    }

                    setIsSubmitting(false);
                    setAuthMethod('email'); // Fallback to email
                } else if (notification.isSkippedMoment()) {
                    // User dismissed the prompt
                    setIsSubmitting(false);
                    setAuthMethod(null);
                } else if (notification.isDismissedMoment()) {
                    // User closed the prompt without selecting an account
                    setIsSubmitting(false);
                    setAuthMethod(null);
                }
            });

        } catch (err: unknown) {
            console.error('Google Sign-In error:', err);

            // Check for specific error types
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const error = err as any; // Needed for specific google error properties
            let errorMessage = "Google sign-in failed. Please try again.";
            if (error.message?.includes('idpiframe_initialization_failed') || error.message?.includes('403')) {
                errorMessage = "Google Sign-In configuration error. Please use email verification.";
            } else if (error.message?.includes('popup_closed')) {
                errorMessage = "Sign-in popup was closed. Please try again.";
            }

            setVerificationError(errorMessage);
            toast({
                title: "Sign-In Error",
                description: errorMessage,
                variant: "destructive",
            });
            setIsSubmitting(false);
            setAuthMethod('email'); // Fallback to email
        }
    };

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
        setAuthMethod('email');
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
        } catch (err: unknown) {
            const error = err as Error;
            setVerificationError(error.message || "Failed to send verification code. Please try again.");
            toast({
                title: "Error",
                description: error.message || "Failed to send code",
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
            }
        } catch (err: unknown) {
            const error = err as Error;
            setVerificationError(error.message || "Invalid verification code. Please try again.");
            toast({
                title: "Verification Failed",
                description: error.message || "Invalid code",
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

    const handleReview = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawUrl = (business as any)?.googleReviewUrl;
        const reviewUrl = ensureExternalUrl(rawUrl) ||
            `https://www.google.com/search?q=${encodeURIComponent(business?.businessName || '')}+reviews`;
        window.open(reviewUrl, "_blank", "noopener,noreferrer");
    };

    const handleAdClick = () => {
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
            sessionId,
            email: userEmail || undefined
        }).catch(console.error);

        toast({
            description: "Thanks for the love!",
            className: "rounded-full bg-[#9EE53B] text-[#222] border-none font-bold text-center h-10 w-auto min-w-[150px] mx-auto",
            duration: 1500,
        });
    };

    const shareAd = async (e: React.MouseEvent, ad: SplashData['ads'][number]) => {
        e.stopPropagation();

        // Fire API event immediately
        analyticsApi.trackInteraction({
            adId: ad.id,
            businessId: id,
            interactionType: 'SHARE',
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
            } catch {
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

        allAds.forEach((ad: SplashData['ads'][number]) => {
            if (!viewedAdsRef.current.has(ad.id)) {
                viewedAdsRef.current.add(ad.id);

                // Track View
                analyticsApi.trackInteraction({
                    adId: ad.id,
                    businessId: id,
                    interactionType: 'view',
                    sessionId,
                    email: userEmail || undefined
                }).catch(err => console.error("Failed to track view", err));
            }
        });
    }, [allAds, id, sessionId, userEmail]);

    const handleExpand = (ad: SplashData['ads'][number]) => {
        setExpandedAd(ad);

        // Fire API event for Expand
        analyticsApi.trackInteraction({
            adId: ad.id,
            businessId: id,
            interactionType: 'GALLERY_EXPAND',
            sessionId,
            email: userEmail || undefined
        }).catch(console.error);

        // Fire API event for Click (General engagement)
        analyticsApi.trackInteraction({
            adId: ad.id,
            businessId: id,
            interactionType: 'click',
            sessionId,
            email: userEmail || undefined
        }).catch(console.error);

        handleAdClick(); // Also count as a "click/engagement" for countdown
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

                {/* Main Content */}
                {business && (
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
                                    <span>{business?.location || "Free Guest WiFi"}</span>
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
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    <SplashCarousel campaigns={featuredCampaigns as any} />
                                </motion.div>

                                {/* Premium Ad Banner - Shows by default, hidden only if showWelcomeBanner is explicitly false */}
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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
                                                    Welcome to {business?.businessName || business?.name}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-display font-bold text-white mb-1">
                                                {business?.welcomeTitle || "Connect & Enjoy Free WiFi!"}
                                            </h3>
                                            <p className="text-sm text-white/80 mb-3">
                                                {business?.description || `Explore exclusive offers from ${business?.businessName || business?.name}`}
                                            </p>

                                            {/* CTA Button - Directly open backend link */}
                                            <div
                                                onClick={() => {
                                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                    const rawUrl = (business as any)?.ctaButtonUrl;
                                                    const url = ensureExternalUrl(rawUrl);
                                                    if (url) {
                                                        handleAdClick(); // Still count as engagement
                                                        window.open(url, "_blank", "noopener,noreferrer");
                                                    }
                                                }}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition-colors cursor-pointer"
                                            >
                                                <Eye className="w-4 h-4" />
                                                {business?.ctaButtonText || "View Offers"}
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
                                            Today&apos;s Deals
                                        </span>
                                    </div>
                                    {galleryCampaigns.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            {galleryCampaigns.slice(0, 4).map((c: SplashData['ads'][number], index: number) => {
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
                                                        <div className="aspect-4/5">
                                                            <img
                                                                src={c.mediaUrl}
                                                                alt={c.title}
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                            />
                                                        </div>

                                                        {/* Gradient overlay */}
                                                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

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
                                            {galleryCampaigns.slice(4).map((c: SplashData['ads'][number], index: number) => (
                                                <motion.div
                                                    key={c.id}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.6 + index * 0.1 }}
                                                    onClick={() => handleAdClick()}
                                                    className="shrink-0 w-40 overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 cursor-pointer group"
                                                >
                                                    <div className="aspect-3/4">
                                                        <img
                                                            src={c.mediaUrl}
                                                            alt={c.title}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                        />
                                                    </div>
                                                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
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

                                {/* Spacer for bottom bar - Increased to prevent overlap */}
                                <div className="h-32" />
                            </div>
                        </div>

                        {/* Fixed Bottom Action Bar with Google OAuth as Primary + Email Verification as Secondary */}
                        {!isSheetHidden && (
                            <div className="fixed inset-x-0 bottom-0 max-w-md mx-auto z-50">
                                {/* Glass blur background */}
                                <div className="absolute inset-0 bg-[#1a3a3a]/95 backdrop-blur-2xl border-t border-white/10" />

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

                                        {/* === MAIN AUTH FLOW === */}
                                        {verificationStep === "email" && canConnect && (
                                            <motion.div
                                                key="auth-flow"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                className="space-y-4" // Increased spacing for cleaner look
                                            >
                                                {/* VIEW 1: GOOGLE PRIMARY (Default) */}
                                                {authMethod !== 'email' && (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="space-y-4"
                                                    >
                                                        {/* Header */}
                                                        <div className="text-center space-y-1 mb-2">
                                                            <h3 className="text-lg font-bold text-white">Connect to WiFi</h3>
                                                            <p className="text-white/60 text-xs">Secure, one-tap access</p>
                                                        </div>

                                                        {/* === GOOGLE SIGN-IN (HERO BUTTON) === */}
                                                        <Button
                                                            onClick={handleGoogleSignIn}
                                                            disabled={isSubmitting}
                                                            className="w-full h-[56px] text-[17px] font-medium rounded-2xl bg-white hover:bg-gray-50 text-gray-700 shadow-xl hover:shadow-2xl hover:-translate-y-px active:scale-[0.98] transition-all duration-200 relative overflow-hidden group border-0 ring-0"
                                                        >
                                                            <div className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-10 transition-opacity" />
                                                            <span className="flex items-center justify-center gap-3 relative z-10">
                                                                {isSubmitting ? (
                                                                    <>
                                                                        <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                                                                        <span className="text-gray-500">Signing in...</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {/* Google Logo SVG */}
                                                                        <svg width="24" height="24" viewBox="0 0 24 24" className="shrink-0">
                                                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                                        </svg>
                                                                        <span>Sign in with Google</span>
                                                                    </>
                                                                )}
                                                            </span>
                                                        </Button>

                                                        {/* Subtle Alternative Link (Progressive Disclosure) */}
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: 0.8, duration: 0.5 }} // Delayed reveal
                                                            className="text-center pt-2"
                                                        >
                                                            <button
                                                                onClick={() => setAuthMethod('email')}
                                                                className="text-white/50 hover:text-white/90 text-sm font-medium transition-colors hover:underline decoration-white/30 underline-offset-4"
                                                                aria-label="Use alternative sign-in method"
                                                            >
                                                                Trouble signing in? Try another method →
                                                            </button>
                                                        </motion.div>
                                                    </motion.div>
                                                )}

                                                {/* VIEW 2: EMAIL FALLBACK (Hidden by default) */}
                                                {authMethod === 'email' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="space-y-4"
                                                    >
                                                        {/* Back Button */}
                                                        <div className="flex items-center justify-between mb-2">
                                                            <button
                                                                onClick={() => {
                                                                    setAuthMethod(null); // Go back to Google view
                                                                    setVerificationError(null);
                                                                }}
                                                                className="text-white/60 hover:text-white flex items-center gap-1 text-sm font-medium transition-colors pl-1"
                                                            >
                                                                ← Back
                                                            </button>
                                                            <span className="text-white/40 text-xs uppercase tracking-wider font-semibold">Alternative Login</span>
                                                        </div>

                                                        <div className="rounded-2xl bg-white/5 p-4 border border-white/10 space-y-4">
                                                            <div className="text-center">
                                                                <div className="text-sm text-white/90 font-medium mb-1">
                                                                    Use Email Verification
                                                                </div>
                                                                <div className="text-xs text-white/50">
                                                                    We&apos;ll send a temporary code to your inbox
                                                                </div>
                                                            </div>

                                                            <motion.form
                                                                onSubmit={handleEmailSubmit}
                                                                className="space-y-3"
                                                            >
                                                                {verificationError && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, height: 0 }}
                                                                        animate={{ opacity: 1, height: 'auto' }}
                                                                        className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-red-200 text-xs text-center"
                                                                    >
                                                                        {verificationError}
                                                                    </motion.div>
                                                                )}

                                                                <div className="relative group">
                                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#9EE53B] transition-colors" />
                                                                    <Input
                                                                        type="email"
                                                                        placeholder="your@email.com"
                                                                        value={userEmail}
                                                                        onChange={(e) => {
                                                                            setUserEmail(e.target.value);
                                                                            setVerificationError(null);
                                                                        }}
                                                                        className="pl-12 h-14 bg-black/20 border-white/10 text-white placeholder:text-white/30 rounded-xl text-base focus:border-[#9EE53B]/50 focus:ring-[#9EE53B]/20 transition-all font-medium"
                                                                        required
                                                                        disabled={isSubmitting}
                                                                        autoFocus // Auto-focus when this view activates
                                                                        aria-label="Email Address"
                                                                    />
                                                                </div>

                                                                <Button
                                                                    type="submit"
                                                                    className="w-full h-14 text-base font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98]"
                                                                    style={{ background: "linear-gradient(135deg, #9EE53B, #4AE660)" }}
                                                                    disabled={!userEmail || isSubmitting}
                                                                >
                                                                    <span className="flex items-center justify-center gap-2 text-[#0f2525]">
                                                                        {isSubmitting ? (
                                                                            <>
                                                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                                                Sending...
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
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {/* Terms - Consistent Footer */}
                                                <div className="text-center pt-1">
                                                    <p className="text-white/30 text-[10px]">
                                                        By connecting, you agree to our{" "}
                                                        <a href="/terms" className="underline hover:text-white/50 transition-colors">Terms</a>
                                                        {" "}and{" "}
                                                        <a href="/privacy" className="underline hover:text-white/50 transition-colors">Privacy</a>
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Step 2: OTP Verification (Same as before but refined styling) */}
                                        {verificationStep === "otp" && (
                                            <motion.form
                                                key="otp-form"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                onSubmit={handleOtpSubmit}
                                                className="space-y-4"
                                            >
                                                <div className="text-center pb-2">
                                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#9EE53B]/10 mb-3 text-[#9EE53B]">
                                                        <KeyRound className="w-6 h-6" />
                                                    </div>
                                                    <div className="text-base font-semibold text-white">Verification Code</div>
                                                    <div className="text-sm text-white/60">Sent to <span className="text-white font-medium">{userEmail}</span></div>
                                                </div>

                                                {verificationError && (
                                                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-red-200 text-xs text-center">
                                                        {verificationError}
                                                    </div>
                                                )}

                                                <div className="relative">
                                                    <Input
                                                        type="text"
                                                        inputMode="numeric"
                                                        maxLength={6}
                                                        placeholder="000000"
                                                        value={otpCode}
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                                                            setOtpCode(value);
                                                            setVerificationError(null);
                                                        }}
                                                        className="h-16 bg-black/20 border-white/20 text-white placeholder:text-white/10 rounded-2xl text-2xl text-center tracking-[0.7em] font-mono focus:border-[#9EE53B]/50 focus:ring-[#9EE53B]/20 transition-all font-bold"
                                                        required
                                                        disabled={isSubmitting}
                                                        autoFocus
                                                        aria-label="6-digit verification code"
                                                    />
                                                </div>

                                                <Button
                                                    type="submit"
                                                    className="w-full h-14 text-lg font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98]"
                                                    style={{ background: "linear-gradient(135deg, #9EE53B, #4AE660)" }}
                                                    disabled={otpCode.length !== 6 || isSubmitting}
                                                >
                                                    <span className="flex items-center justify-center gap-2 text-[#0f2525]">
                                                        {isSubmitting ? (
                                                            <>
                                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                                Verifying...
                                                            </>
                                                        ) : (
                                                            <>
                                                                Verify & Connect
                                                                <Wifi className="w-5 h-5" />
                                                            </>
                                                        )}
                                                    </span>
                                                </Button>

                                                <div className="flex items-center justify-between text-xs px-2 pt-2">
                                                    <button
                                                        type="button"
                                                        onClick={handleBackToEmail}
                                                        className="text-white/50 hover:text-white transition-colors flex items-center gap-1"
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

                                        {/* Step 3: Success (Minor visual polish) */}
                                        {verificationStep === "verified" && (
                                            <motion.div
                                                key="success"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="text-center py-6"
                                            >
                                                <div className="w-20 h-20 rounded-full bg-[#9EE53B] flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_-10px_#9EE53B]">
                                                    <CheckCircle2 className="w-10 h-10 text-[#0f2525]" />
                                                </div>
                                                <div className="text-2xl font-bold text-white mb-1">
                                                    {googleUserName ? `Welcome, ${googleUserName.split(' ')[0]}!` : "You're Connected!"}
                                                </div>
                                                <div className="text-white/60 text-sm mb-6">Enjoy secure, high-speed WiFi at {business?.businessName}</div>

                                                <Button
                                                    onClick={() => setIsSheetHidden(true)}
                                                    className="w-full h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg transition-transform active:scale-95 border border-white/20"
                                                >
                                                    Continue Browsing
                                                </Button>
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
                        className="fixed inset-0 z-100 bg-black/95 backdrop-blur-xl flex flex-col"
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
