import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import type { Ad } from "@/lib/api";

interface SplashCarouselProps {
  campaigns: Ad[];
}

export function SplashCarousel({ campaigns }: SplashCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Filter only banner/static type campaigns for the carousel
  const carouselItems = campaigns.filter((c) => c.mediaType !== "video" && c.status === "active");

  useEffect(() => {
    if (carouselItems.length <= 1) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
    }, 5000); // 5 seconds per slide

    return () => clearInterval(interval);
  }, [carouselItems.length]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const goToPrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
  };

  if (carouselItems.length === 0) {
    // Fallback if no ads - vibrant gradient welcome
    return (
      <div className="w-full aspect-[16/9] relative overflow-hidden rounded-2xl">
        {/* Animated gradient background */}
        <div className="absolute inset-0 gradient-purple-pink" />

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 opacity-20">
          <Sparkles className="w-20 h-20 text-white" />
        </div>
        <div className="absolute bottom-4 left-4 w-32 h-32 rounded-full bg-white/10 blur-2xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 border border-white/30"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
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
    <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl group">
      {/* Glow effect behind carousel */}
      <div className="absolute -inset-2 gradient-lime-cyan opacity-20 blur-2xl" />

      {/* Main carousel container */}
      <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/20 bg-black/20 backdrop-blur-sm">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 },
            }}
            className="absolute inset-0"
          >
            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={carouselItems[currentIndex].mediaUrl}
              alt={carouselItems[currentIndex].title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.parentElement?.classList.add(
                  "gradient-purple-pink"
                );
              }}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Content overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-5">
              {/* Sponsored badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-2"
              >
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#9EE53B]/30 text-[#9EE53B] backdrop-blur-sm border border-[#9EE53B]/30 uppercase tracking-wide">
                  Featured
                </span>
              </motion.div>

              {/* Title */}
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-white font-display font-bold text-xl drop-shadow-lg"
              >
                {carouselItems[currentIndex].title}
              </motion.h3>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows - show on hover */}
        {carouselItems.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/50 hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/50 hover:scale-110"
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

        {/* Shimmer effect on active slide */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500" />
        </div>
      </div>
    </div>
  );
}
