import React from 'react';
import { Home, Grid, ShoppingCart, Heart, User, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

export const MobileNav: React.FC = () => {
  const { activeView, setActiveView, setFilterParams } = useStore();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, isAdmin, openAuthModal } = useAuth();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 py-1.5 px-4 shadow-lg">
      <div className="flex items-center justify-around">
        {/* Home */}
        <button
          onClick={() => setActiveView('home')}
          className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
            activeView === 'home'
              ? 'text-[#F85606] font-bold'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        {/* Catalog */}
        <button
          onClick={() => {
            setFilterParams(prev => ({ ...prev, category: 'all', search: '', flashSaleOnly: false }));
            setActiveView('catalog');
          }}
          className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
            activeView === 'catalog'
              ? 'text-[#F85606] font-bold'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px]">Categories</span>
        </button>

        {/* Cart */}
        <button
          onClick={() => setActiveView('cart')}
          className={`relative flex flex-col items-center gap-0.5 p-1 transition-colors ${
            activeView === 'cart'
              ? 'text-[#F85606] font-bold'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#F85606] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Cart</span>
        </button>

        {/* Wishlist */}
        <button
          onClick={() => setActiveView('wishlist')}
          className={`relative flex flex-col items-center gap-0.5 p-1 transition-colors ${
            activeView === 'wishlist'
              ? 'text-[#F85606] font-bold'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Wishlist</span>
        </button>

        {/* Account / Admin */}
        {user ? (
          <button
            onClick={() => setActiveView('admin')}
            className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
              activeView === 'admin'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            <div className="relative">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              {isAdmin && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-zinc-900" />
              )}
            </div>
            <span className="text-[10px]">Admin</span>
          </button>
        ) : (
          <button
            onClick={() => openAuthModal('login')}
            className="flex flex-col items-center gap-0.5 p-1 text-zinc-500 dark:text-zinc-400"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px]">Login</span>
          </button>
        )}
      </div>
    </div>
  );
};
