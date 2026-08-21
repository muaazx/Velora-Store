import React from 'react';
import {
  Smartphone,
  Laptop,
  Headphones,
  Shirt,
  Watch,
  Home,
  Sparkles,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const CategoryGrid: React.FC = () => {
  const { categories, navigateToCatalogWithCategory } = useStore();

  const getIcon = (slug: string) => {
    switch (slug) {
      case 'mobile-phones':
        return <Smartphone className="w-6 h-6 text-orange-500" />;
      case 'laptops-computers':
        return <Laptop className="w-6 h-6 text-indigo-500" />;
      case 'electronics-audio':
        return <Headphones className="w-6 h-6 text-sky-500" />;
      case 'fashion-apparel':
        return <Shirt className="w-6 h-6 text-pink-500" />;
      case 'accessories-watches':
        return <Watch className="w-6 h-6 text-amber-500" />;
      case 'home-living':
        return <Home className="w-6 h-6 text-emerald-500" />;
      case 'beauty-skincare':
        return <Sparkles className="w-6 h-6 text-purple-500" />;
      default:
        return <ShoppingBag className="w-6 h-6 text-teal-500" />;
    }
  };

  return (
    <section className="my-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white tracking-tight">
            Popular Categories
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Explore curated collections from verified global brands
          </p>
        </div>
        <button
          onClick={() => navigateToCatalogWithCategory('all')}
          className="text-xs font-bold text-[#F85606] hover:underline flex items-center gap-1"
        >
          <span>All Departments</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {categories.map(cat => (
          <div
            key={cat.id}
            onClick={() => navigateToCatalogWithCategory(cat.slug)}
            className="group flex flex-col items-center justify-center p-3 sm:p-4 bg-white dark:bg-zinc-900 rounded-xl border border-transparent hover:border-[#F85606] hover:shadow-md transition-all cursor-pointer text-center"
          >
            <div className="w-12 h-12 rounded-full bg-[#F5F5F5] dark:bg-zinc-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              {getIcon(cat.slug)}
            </div>
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-[#F85606] transition-colors line-clamp-1">
              {cat.name}
            </span>
            <span className="text-[10px] text-zinc-400 mt-0.5">
              {cat.productCount || 0} items
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
