import React from 'react';
import { ArrowRight, Tag, Truck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const PromoBanners: React.FC = () => {
  const { setActiveView, setFilterParams } = useStore();

  return (
    <section className="my-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {/* Promo Banner 1 */}
      <div
        onClick={() => {
          setFilterParams(prev => ({ ...prev, flashSaleOnly: true, category: 'all', search: '' }));
          setActiveView('catalog');
        }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 p-6 sm:p-8 text-white flex items-center justify-between shadow-lg cursor-pointer group hover:scale-[1.01] transition-transform"
      >
        <div className="relative z-10 max-w-[65%] space-y-2">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold">
            <Tag className="w-3 h-3" /> COUPON: FLASH25
          </div>
          <h3 className="text-xl sm:text-2xl font-black leading-tight">
            Extra 25% Off Flash Tech & Audio
          </h3>
          <p className="text-xs text-orange-100 line-clamp-2">
            Apply discount code FLASH25 during checkout for orders above $100.
          </p>
          <div className="pt-2 flex items-center gap-1 text-xs font-bold group-hover:translate-x-1 transition-transform">
            <span>Shop The Flash Sale</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <img
          src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80"
          alt="Audio Tech Promo"
          className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-xl shadow-2xl rotate-3 group-hover:rotate-6 transition-transform shrink-0"
        />
      </div>

      {/* Promo Banner 2 */}
      <div
        onClick={() => {
          setFilterParams(prev => ({ ...prev, category: 'fashion-apparel', search: '' }));
          setActiveView('catalog');
        }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 to-blue-600 p-6 sm:p-8 text-white flex items-center justify-between shadow-lg cursor-pointer group hover:scale-[1.01] transition-transform"
      >
        <div className="relative z-10 max-w-[65%] space-y-2">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold">
            <Truck className="w-3 h-3" /> ZERO SHIPPING FEES
          </div>
          <h3 className="text-xl sm:text-2xl font-black leading-tight">
            New Urban Streetwear & Footwear
          </h3>
          <p className="text-xs text-indigo-100 line-clamp-2">
            Guaranteed 2-day express delivery with free returns within 7 days.
          </p>
          <div className="pt-2 flex items-center gap-1 text-xs font-bold group-hover:translate-x-1 transition-transform">
            <span>Browse Urban Collection</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <img
          src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80"
          alt="Footwear Promo"
          className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-xl shadow-2xl -rotate-3 group-hover:-rotate-6 transition-transform shrink-0"
        />
      </div>
    </section>
  );
};
