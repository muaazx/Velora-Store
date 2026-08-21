import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const HeroSlider: React.FC = () => {
  const { banners, navigateToCatalogWithCategory } = useStore();
  const heroBanners = banners.filter(b => b.type === 'HERO_SLIDER');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % heroBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroBanners.length]);

  if (heroBanners.length === 0) return null;

  const currentBanner = heroBanners[currentIndex] || heroBanners[0];

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % heroBanners.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + heroBanners.length) % heroBanners.length);
  };

  const handleBannerAction = () => {
    if (currentBanner.linkUrl?.includes('category=')) {
      const cat = currentBanner.linkUrl.split('category=')[1];
      navigateToCatalogWithCategory(cat);
    } else {
      navigateToCatalogWithCategory('electronics-audio');
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-zinc-200/60 dark:border-zinc-800 bg-[#111] aspect-[21/9] min-h-[260px] md:min-h-[380px] max-h-[440px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner.id}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {/* Background image */}
          <img
            src={currentBanner.imageUrl}
            alt={currentBanner.title}
            className="w-full h-full object-cover"
          />

          {/* Radial & Linear Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent flex items-center p-6 md:p-12">
            <div className="max-w-xl text-white space-y-3 md:space-y-4">
              {currentBanner.badge && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F85606] text-white text-xs font-bold uppercase tracking-wider shadow-md">
                  <Zap className="w-3.5 h-3.5" />
                  {currentBanner.badge}
                </div>
              )}

              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-md">
                {currentBanner.title}
              </h1>

              {currentBanner.subtitle && (
                <p className="text-xs sm:text-sm md:text-base text-zinc-200 font-normal leading-relaxed max-w-md drop-shadow-xs line-clamp-2 sm:line-clamp-none">
                  {currentBanner.subtitle}
                </p>
              )}

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleBannerAction}
                  className="px-5 py-2.5 sm:px-6 sm:py-3 bg-[#F85606] hover:bg-[#e04c04] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-300 bg-black/40 backdrop-blur-xs px-3 py-2 rounded-lg border border-white/10">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Buyer Protection Guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {heroBanners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition-colors z-20"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition-colors z-20"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-full">
            {heroBanners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === i ? 'w-6 bg-[#F85606]' : 'w-2 bg-white/50 hover:bg-white'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
