import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import type { Ad } from "@/lib/api";

interface SplashCarouselProps {
  campaigns: Ad[];
}

export function SplashCarousel({ campaigns }: SplashCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Filter only banner/static type campaigns for the carousel
  const carouselItems = campaigns.filter((c) => c.mediaType !== "video" && c.status === "active");

  useEffect(() => {
    if (carouselItems.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
        setIsTransitioning(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselItems.length]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  }, [isTransitioning]);

  const goToPrev = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
      setIsTransitioning(false);
    }, 300);
  }, [isTransitioning, carouselItems.length]);

  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
      setIsTransitioning(false);
    }, 300);
  }, [isTransitioning, carouselItems.length]);

  if (carouselItems.length === 0) {
    // Fallback if no ads - vibrant gradient welcome
    return (
      <div className="w-full aspect-video relative overflow-hidden rounded-2xl">
        {/* Animated gradient background */}
        <div className="absolute inset-0 gradient-purple-pink" />

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 opacity-20">
          <Sparkles className="w-20 h-20 text-white" />
        </div>
        <div className="absolute bottom-4 left-4 w-32 h-32 rounded-full bg-white/10" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center">
          <div
            className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 border border-white/30 animate-fade-in"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-display font-bold text-white mb-2">
            Welcome to Free WiFi
          </h3>
          <p className="text-white/80 text-sm">
            Enjoy high-speed internet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-2xl group">
      {/* Glow effect behind carousel */}
      {/* Glow effect - hidden on mobile for performance (blur-2xl causes paint storms) */}
      <div className="absolute -inset-2 gradient-lime-cyan opacity-20 blur-2xl hidden md:block" />

      {/* Main carousel container */}
      <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/20 bg-black/20">
        {/* CSS-driven slide transition */}
        <div
          className="absolute inset-0 transition-opacity duration-300 ease-out"
          style={{ opacity: isTransitioning ? 0 : 1 }}
        >
          {/* Performance: Next.js Image for auto AVIF/WebP + responsive sizing */}
          <div className="relative w-full h-full">
            <Image
              src={carouselItems[currentIndex].mediaUrl}
              alt={carouselItems[currentIndex].title}
              fill
              sizes="(max-width: 768px) 100vw, 448px"
              className="object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
                e.currentTarget.parentElement?.classList.add(
                  "gradient-purple-pink"
                );
              }}
            />
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-5">
            {/* Sponsored badge */}
            <div className="mb-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#9EE53B]/30 text-[#9EE53B] border border-[#9EE53B]/30 uppercase tracking-wide">
                Featured
              </span>
            </div>

            {/* Title */}
            <h3
              className="text-white font-display font-bold text-xl drop-shadow-lg animate-fade-in"
              style={{ animationDelay: '50ms' }}
            >
              {carouselItems[currentIndex].title}
            </h3>
          </div>
        </div>

        {/* Navigation arrows - show on hover */}
        {carouselItems.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Progress dots */}
        {carouselItems.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
            {carouselItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`h-2 rounded-full transition-all duration-500 ${idx === currentIndex
                  ? "w-8 bg-[#9EE53B] shadow-lg shadow-[#9EE53B]/50"
                  : "w-2 bg-white/40 hover:bg-white/60"
                  }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
