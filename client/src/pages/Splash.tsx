import { useParams, useLocation } from "wouter";
import { SplashCarousel } from "@/components/SplashCarousel";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useConnectWifi, useSplashData } from "@/hooks/use-splash";

// Ad view countdown seconds before connect is enabled
const AD_VIEW_COUNTDOWN = 5;

export default function Splash() {
  const { businessId } = useParams();
  const [, setLocation] = useLocation();
  const id = parseInt(businessId || "0");
  const { toast } = useToast();
  const [connectStep, setConnectStep] = useState<
    "idle" | "connecting" | "success"
  >("idle");

  // Ad viewing state
  const [countdown, setCountdown] = useState(AD_VIEW_COUNTDOWN);
  const [canConnect, setCanConnect] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [adViews, setAdViews] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Special Offer State
  const [specialOffer, setSpecialOffer] = useState<{
    title: string;
    description: string;
    isActive: boolean;
  } | null>(null);

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

  const { data, isLoading, error } = useSplashData(id);
  const connectMutation = useConnectWifi();

  const business = data?.business;
  const campaigns = (data?.campaigns || []).filter((c) => c.isActive && c.type !== "video");

  // Countdown timer for ad viewing
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanConnect(true);
    }
  }, [countdown]);

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

  const handleConnect = () => {
    if (!canConnect || connectStep !== "idle") return;
    setConnectStep("connecting");

    connectMutation.mutate(
      { businessId: id, deviceType: "mobile" },
      {
        onSuccess: (res) => {
          setConnectStep("success");
          setTimeout(() => {
            if (res.redirectUrl) {
              window.location.href = res.redirectUrl;
              return;
            }
            toast({
              title: "Connected!",
              description: "You are now online.",
            });
            setLocation("/");
          }, 900);
        },
        onError: () => {
          setConnectStep("idle");
          toast({
            title: "Connection Failed",
            description: "Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  };

  const handleReview = () => {
    window.open(
      "https://www.google.com/search?q=coffee+shop+reviews",
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleAdClick = (campaignId: number) => {
    setAdViews((prev) => prev + 1);
    // Reward engagement: enable connect faster
    if (countdown > 1) {
      setCountdown(1);
    }
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
                        alt={business.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Wifi className="w-10 h-10 text-white" />
                    )}
                  </div>
                </div>

                {/* Business Name */}
                <h1 className="text-2xl font-display font-extrabold text-white mb-1">
                  {business.name}
                </h1>

                {/* Location */}
                <div className="flex items-center justify-center gap-1.5 text-white/70 text-sm mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{business.address || "Free Guest WiFi"}</span>
                </div>

                {/* Tags */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <div className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm text-white border border-white/30 flex items-center gap-1.5">
                    <Wifi className="w-3 h-3" />
                    Free WiFi
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-bold bg-[#9EE53B]/20 text-[#9EE53B] border border-[#9EE53B]/30 flex items-center gap-1.5">
                    <Gift className="w-3 h-3" />
                    {campaigns.length} offers
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
                  <SplashCarousel campaigns={campaigns as any} />
                </motion.div>

                {/* Premium Ad Banner */}
                {(!specialOffer || specialOffer.isActive) && ( // Show if active or if no data (default behavior fallback)
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => handleAdClick(0)}
                    className="relative overflow-hidden rounded-2xl gradient-purple-pink p-5 cursor-pointer group"
                  >
                    <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-40 transition-opacity">
                      <Sparkles className="w-20 h-20 text-white" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-[#FFD93D]" />
                        <span className="text-xs font-bold text-white/80 uppercase tracking-wide">
                          Limited Time Offer
                        </span>
                      </div>
                      <h3 className="text-xl font-display font-bold text-white mb-1">
                        {specialOffer ? specialOffer.title : "Connect & Get 15% Off!"}
                      </h3>
                      <p className="text-sm text-white/80 mb-3">
                        {specialOffer ? specialOffer.description : "Exclusive discount on your first order when you connect"}
                      </p>
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition-colors">
                        <Eye className="w-4 h-4" />
                        View Offer
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
                  <div className="grid grid-cols-2 gap-3">
                    {campaigns.slice(0, 4).map((c, index) => (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAdClick(c.id)}
                        className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl cursor-pointer group"
                      >
                        <div className="aspect-[4/5]">
                          <img
                            src={c.contentUrl}
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
                        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                            <Heart className="w-4 h-4 text-white" />
                          </div>
                          <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                            <Share2 className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Additional Ad Slots - Horizontal Scroll */}
                {campaigns.length > 4 && (
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
                      {campaigns.slice(4).map((c, index) => (
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
                              src={c.contentUrl}
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
                <div className="h-4" />
              </div>
            </div>

            {/* Fixed Bottom Action Bar */}
            <div className="fixed inset-x-0 bottom-0 max-w-md mx-auto z-50">
              {/* Glass blur background */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl border-t border-white/10" />

              <div className="relative p-4 space-y-3">
                {/* Countdown / Status indicator */}
                <AnimatePresence mode="wait">
                  {!canConnect ? (
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
                        <span className="font-bold text-[#9EE53B]">
                          {countdown}s
                        </span>
                      </span>
                      <span className="text-white/50">• Explore offers above!</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="ready"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-center gap-2 text-[#9EE53B] text-sm font-semibold"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>WiFi is ready to connect!</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Connect Button */}
                <motion.div
                  whileHover={canConnect ? { scale: 1.02 } : undefined}
                  whileTap={canConnect ? { scale: 0.98 } : undefined}
                >
                  <Button
                    onClick={handleConnect}
                    className={`w-full h-14 text-lg font-bold rounded-2xl transition-all duration-300 relative overflow-hidden ${!canConnect
                      ? "bg-gray-500/50 cursor-not-allowed"
                      : ""
                      }`}
                    style={{
                      background: canConnect
                        ? connectStep === "success"
                          ? "linear-gradient(135deg, #43E660, #9EE53B)"
                          : "linear-gradient(135deg, #9EE53B, #43E660)"
                        : undefined,
                    }}
                    disabled={!canConnect || connectStep !== "idle"}
                  >
                    {/* Shimmer effect - only when enabled */}
                    {canConnect && (
                      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />
                      </div>
                    )}

                    <span
                      className={`relative z-10 flex items-center justify-center gap-2 ${canConnect ? "text-[#222]" : "text-white/70"
                        }`}
                    >
                      {!canConnect && (
                        <>
                          <Clock className="w-5 h-5" />
                          Wait {countdown}s...
                        </>
                      )}
                      {canConnect && connectStep === "idle" && (
                        <>
                          <Wifi className="w-5 h-5" />
                          Connect to WiFi
                        </>
                      )}
                      {connectStep === "connecting" && (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Connecting...
                        </>
                      )}
                      {connectStep === "success" && (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Connected!
                        </>
                      )}
                    </span>
                  </Button>
                </motion.div>

                {/* Powered by */}
                <div className="text-center">
                  <span className="text-[11px] text-white/40 font-medium">
                    Powered by{" "}
                    <span className="text-[#9EE53B]/70">MarkMorph</span>
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
