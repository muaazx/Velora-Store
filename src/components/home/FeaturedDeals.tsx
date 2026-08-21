import React, { useState } from 'react';
import { Star, TrendingUp, Sparkles, Tag, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../product/ProductCard';

type DealTab = 'recommended' | 'topSelling' | 'newArrivals' | 'bestDeals';

export const FeaturedDeals: React.FC = () => {
  const { products, setActiveView, setFilterParams } = useStore();
  const [activeTab, setActiveTab] = useState<DealTab>('recommended');

  const getFilteredProducts = () => {
    switch (activeTab) {
      case 'topSelling':
        return [...products].sort((a, b) => b.soldCount - a.soldCount).slice(0, 8);
      case 'newArrivals':
        return [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);
      case 'bestDeals':
        return [...products].sort((a, b) => b.discount - a.discount).slice(0, 8);
      case 'recommended':
      default:
        return products.filter(p => p.featured || p.rating >= 4.7).slice(0, 8);
    }
  };

  const displayedProducts = getFilteredProducts();

  const handleViewAll = () => {
    if (activeTab === 'topSelling') {
      setFilterParams(prev => ({ ...prev, sortBy: 'popular', category: 'all', search: '', flashSaleOnly: false }));
    } else if (activeTab === 'newArrivals') {
      setFilterParams(prev => ({ ...prev, sortBy: 'newest', category: 'all', search: '', flashSaleOnly: false }));
    } else if (activeTab === 'bestDeals') {
      setFilterParams(prev => ({ ...prev, onSaleOnly: true, category: 'all', search: '', flashSaleOnly: false }));
    } else {
      setFilterParams(prev => ({ ...prev, category: 'all', search: '', flashSaleOnly: false }));
    }
    setActiveView('catalog');
  };

  return (
    <section className="my-10">
      {/* Section Header & Tab Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Curated For You
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Top rated gadgets, apparel, and lifestyle items ready to dispatch
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F5F5F5] dark:bg-zinc-800/80 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('recommended')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'recommended'
                ? 'bg-white dark:bg-zinc-900 text-[#F85606] shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Recommended
          </button>

          <button
            onClick={() => setActiveTab('topSelling')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'topSelling'
                ? 'bg-white dark:bg-zinc-900 text-[#F85606] shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Top Selling
          </button>

          <button
            onClick={() => setActiveTab('newArrivals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'newArrivals'
                ? 'bg-white dark:bg-zinc-900 text-[#F85606] shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            New Arrivals
          </button>

          <button
            onClick={() => setActiveTab('bestDeals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'bestDeals'
                ? 'bg-white dark:bg-zinc-900 text-[#F85606] shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            Biggest Discounts
          </button>
        </div>
      </div>

      {/* Grid of Product Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* View All Button */}
      <div className="mt-8 text-center">
        <button
          onClick={handleViewAll}
          className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs sm:text-sm rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-md"
        >
          <span>Explore Entire Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
