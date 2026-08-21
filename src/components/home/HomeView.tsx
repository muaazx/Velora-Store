import React from 'react';
import { HeroSlider } from './HeroSlider';
import { CategoryGrid } from './CategoryGrid';
import { FlashSaleSection } from './FlashSaleSection';
import { FeaturedDeals } from './FeaturedDeals';
import { PromoBanners } from './PromoBanners';

export const HomeView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-6 space-y-2">
      {/* 1. Hero Banner Slider */}
      <HeroSlider />

      {/* 2. Popular Categories Icon Strip */}
      <CategoryGrid />

      {/* 3. Flash Sale Section with Live Countdown */}
      <FlashSaleSection />

      {/* 4. Promotional Highlights Banners */}
      <PromoBanners />

      {/* 5. Curated & Tabbed Deals (Top Selling, Recommended, New Arrivals, Best Deals) */}
      <FeaturedDeals />
    </div>
  );
};
