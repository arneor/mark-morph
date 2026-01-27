import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Campaign } from "@shared/schema";

interface SplashCarouselProps {
  campaigns: Campaign[];
}

export function SplashCarousel({ campaigns }: SplashCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter only banner/static type campaigns for the carousel
  const carouselItems = campaigns.filter(c => c.type !== 'video' && c.isActive);

  useEffect(() => {
    if (carouselItems.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
    }, 5000); // 5 seconds per slide

    return () => clearInterval(interval);
  }, [carouselItems.length]);

  if (carouselItems.length === 0) {
    // Fallback if no ads
    return (
      <div className="w-full aspect-[16/9] bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center border border-primary/10">
        <div className="text-center p-6">
          <h3 className="text-lg font-display font-semibold text-primary">Welcome to Free WiFi</h3>
          <p className="text-sm text-muted-foreground">Enjoy high-speed internet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl shadow-xl shadow-black/5 bg-black/5">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {/* Descriptive comment for Unsplash fallback */}
          {/* dynamic ad content placeholder */}
          <img
            src={carouselItems[currentIndex].contentUrl}
            alt={carouselItems[currentIndex].title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to a nice gradient if image breaks
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.classList.add('bg-gradient-to-br', 'from-blue-400', 'to-purple-500');
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
            <h3 className="text-white font-semibold font-display text-lg shadow-black/50 drop-shadow-md">
              {carouselItems[currentIndex].title}
            </h3>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Dots indicator */}
      {carouselItems.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
          {carouselItems.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
