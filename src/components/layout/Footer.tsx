import React from 'react';
import { ShoppingBag, Mail, Phone, MapPin, ShieldCheck, RefreshCw, Truck, Headphones, CreditCard } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Footer: React.FC = () => {
  const { settings, setActiveView, navigateToCatalogWithCategory } = useStore();

  return (
    <footer className="bg-zinc-900 text-zinc-300 border-t border-zinc-800 text-xs mt-16">
      {/* Service Guarantees Strip */}
      <div className="border-b border-zinc-800 py-8 bg-zinc-950/60">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Express Delivery</p>
              <p className="text-zinc-400 text-xs">Free shipping on orders &gt; $50</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">100% Genuine</p>
              <p className="text-zinc-400 text-xs">Direct brand authorized stock</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">7-Day Easy Returns</p>
              <p className="text-zinc-400 text-xs">Hassle-free refunds & exchanges</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">24/7 Priority Support</p>
              <p className="text-zinc-400 text-xs">Dedicated customer assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Brand & About */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">
              Bazaar<span className="text-orange-500">Nova</span>
            </span>
          </div>
          <p className="text-zinc-400 leading-relaxed text-xs max-w-sm">
            BazaarNova is a next-generation premier e-commerce marketplace delivering authentic consumer tech, fashion, lifestyle goods, and gourmet essentials with rapid dispatch and guaranteed buyer protection.
          </p>
          <div className="space-y-2 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
              <span>{settings?.address || '500 Innovation Way, San Francisco, CA'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-orange-500 shrink-0" />
              <span>{settings?.contactPhone || '+1 (800) 842-6272'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-orange-500 shrink-0" />
              <span>{settings?.contactEmail || 'support@bazaarnova.com'}</span>
            </div>
          </div>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="font-bold text-white mb-3 text-sm">Customer Care</h4>
          <ul className="space-y-2 text-xs text-zinc-400">
            <li>
              <button onClick={() => setActiveView('orders')} className="hover:text-orange-400 transition-colors">
                Track My Order
              </button>
            </li>
            <li>
              <button onClick={() => setActiveView('catalog')} className="hover:text-orange-400 transition-colors">
                Browse Products
              </button>
            </li>
            <li>
              <button onClick={() => setActiveView('cart')} className="hover:text-orange-400 transition-colors">
                Shopping Cart
              </button>
            </li>
            <li>
              <button onClick={() => setActiveView('wishlist')} className="hover:text-orange-400 transition-colors">
                Wishlist
              </button>
            </li>
            <li>
              <span className="hover:text-orange-400 transition-colors cursor-pointer">Shipping & Delivery Policy</span>
            </li>
            <li>
              <span className="hover:text-orange-400 transition-colors cursor-pointer">Returns & Refunds</span>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-bold text-white mb-3 text-sm">Top Categories</h4>
          <ul className="space-y-2 text-xs text-zinc-400">
            <li>
              <button onClick={() => navigateToCatalogWithCategory('mobile-phones')} className="hover:text-orange-400 transition-colors">
                Mobile Phones
              </button>
            </li>
            <li>
              <button onClick={() => navigateToCatalogWithCategory('laptops-computers')} className="hover:text-orange-400 transition-colors">
                Laptops & PCs
              </button>
            </li>
            <li>
              <button onClick={() => navigateToCatalogWithCategory('electronics-audio')} className="hover:text-orange-400 transition-colors">
                Audio & Headphones
              </button>
            </li>
            <li>
              <button onClick={() => navigateToCatalogWithCategory('fashion-apparel')} className="hover:text-orange-400 transition-colors">
                Fashion & Shoes
              </button>
            </li>
            <li>
              <button onClick={() => navigateToCatalogWithCategory('home-living')} className="hover:text-orange-400 transition-colors">
                Home & Living
              </button>
            </li>
            <li>
              <button onClick={() => navigateToCatalogWithCategory('beauty-skincare')} className="hover:text-orange-400 transition-colors">
                Beauty & Skincare
              </button>
            </li>
          </ul>
        </div>

        {/* Payment Methods & Verification */}
        <div>
          <h4 className="font-bold text-white mb-3 text-sm">Verified Payments</h4>
          <p className="text-zinc-400 text-xs mb-3">
            All transactions are 256-bit SSL encrypted.
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="px-2.5 py-1.5 bg-zinc-800 rounded border border-zinc-700 text-white flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-blue-400" /> PayPal
            </span>
            <span className="px-2.5 py-1.5 bg-zinc-800 rounded border border-zinc-700 text-white flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-orange-400" /> Payoneer
            </span>
            <span className="px-2.5 py-1.5 bg-zinc-800 rounded border border-zinc-700 text-white flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Visa / MC
            </span>
            <span className="px-2.5 py-1.5 bg-zinc-800 rounded border border-zinc-700 text-white">
              Cash on Delivery
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-800 py-4 text-center text-zinc-500 text-[11px]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2025 BazaarNova Marketplace Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span className="hover:underline cursor-pointer">Security Safeguards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
