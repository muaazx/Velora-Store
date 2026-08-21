import React, { useState, useEffect } from 'react';
import { Flame, ArrowRight, Zap } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../product/ProductCard';

export const FlashSaleSection: React.FC = () => {
  const { products, setActiveView, setFilterParams } = useStore();
  const flashProducts = products.filter(p => p.isFlashSale).slice(0, 4);

  // Live Countdown Timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 12, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (flashProducts.length === 0) return null;

  const handleShopMore = () => {
    setFilterParams(prev => ({ ...prev, flashSaleOnly: true, category: 'all', search: '' }));
    setActiveView('catalog');
  };

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <section className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 my-8 shadow-xs">
      {/* Header with Countdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#F85606] text-white shadow-md shadow-orange-500/25">
            <Flame className="w-6 h-6 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                FLASH SALE
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-[#F85606] text-white rounded-full">
                UP TO 50% OFF
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Limited inventory deals updated every 12 hours
            </p>
          </div>
        </div>

        {/* Countdown Box */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mr-1 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            Ending in:
          </span>
          <div className="flex items-center gap-1 font-mono font-bold text-xs sm:text-sm">
            <span className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center shadow-xs">
              {pad(timeLeft.hours)}
            </span>
            <span className="text-zinc-500 font-bold">:</span>
            <span className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center shadow-xs">
              {pad(timeLeft.minutes)}
            </span>
            <span className="text-zinc-500 font-bold">:</span>
            <span className="w-8 h-8 rounded-lg bg-[#F85606] text-white flex items-center justify-center shadow-xs">
              {pad(timeLeft.seconds)}
            </span>
          </div>

          <button
            onClick={handleShopMore}
            className="ml-3 hidden md:flex items-center gap-1 px-3.5 py-1.5 bg-white dark:bg-zinc-800 hover:bg-orange-50 dark:hover:bg-zinc-700 text-[#F85606] border border-orange-200 dark:border-zinc-700 rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <span>Shop All Deals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {flashProducts.map(product => (
          <div key={product.id} className="flex flex-col">
            <ProductCard product={product} />
            {/* Flash Stock Meter */}
            <div className="mt-2 px-1">
              <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                <span className="font-semibold text-[#F85606]">
                  {Math.min(95, Math.max(40, product.soldCount % 100))}% claimed
                </span>
                <span>{product.quantity} remaining</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#F85606] rounded-full"
                  style={{ width: `${Math.min(95, Math.max(40, product.soldCount % 100))}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center md:hidden">
        <button
          onClick={handleShopMore}
          className="w-full py-2.5 bg-white dark:bg-zinc-800 text-[#F85606] border border-orange-200 dark:border-zinc-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
        >
          <span>View All Flash Deals</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
