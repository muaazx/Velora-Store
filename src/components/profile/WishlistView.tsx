import React from 'react';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { formatCurrency } from '../../lib/utils';

export const WishlistView: React.FC = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { setActiveView, navigateToProduct } = useStore();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
          Your Wishlist is Empty
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
          Save your favorite gadgets and apparel to get notified on special flash discount drops.
        </p>
        <div className="pt-2">
          <button
            onClick={() => setActiveView('catalog')}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all inline-flex items-center gap-2"
          >
            <span>Discover Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
          My Saved Wishlist ({wishlist.length} items)
        </h1>
        <p className="text-xs text-zinc-500">
          Items you've bookmarked for later purchase
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {wishlist.map(item => {
          const product = item.product;
          const effPrice = product.isFlashSale && product.flashSalePrice
            ? product.flashSalePrice
            : product.price * (1 - product.discount / 100);

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div
                onClick={() => navigateToProduct(product.id)}
                className="cursor-pointer"
              >
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="w-full aspect-square object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="p-3">
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">
                    {product.brand}
                  </span>
                  <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 line-clamp-2 mt-0.5">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-black text-sm text-orange-600 dark:text-orange-400">
                      {formatCurrency(effPrice)}
                    </span>
                    {product.discount > 0 && (
                      <span className="text-[11px] text-zinc-400 line-through">
                        {formatCurrency(product.price)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 pt-0 flex items-center gap-2">
                <button
                  onClick={() => addToCart(product, 1)}
                  className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Add to Cart
                </button>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="p-2 border border-zinc-200 dark:border-zinc-700 hover:bg-rose-50 text-zinc-400 hover:text-rose-600 rounded-lg transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
