import React from 'react';
import { ShoppingCart, Heart, Zap, Truck } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { RatingStars } from '../common/RatingStars';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useStore } from '../../context/StoreContext';

interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, layout = 'grid' }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { navigateToProduct } = useStore();

  const isFavorited = isInWishlist(product.id);
  const effectivePrice = product.isFlashSale && product.flashSalePrice
    ? product.flashSalePrice
    : product.price * (1 - product.discount / 100);

  const discountPercent = product.isFlashSale && product.flashSalePrice
    ? Math.round(((product.price - product.flashSalePrice) / product.price) * 100)
    : product.discount;

  const handleCardClick = () => {
    navigateToProduct(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  if (layout === 'list') {
    return (
      <div
        onClick={handleCardClick}
        className="group flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-transparent hover:border-[#F85606] hover:shadow-md transition-all cursor-pointer"
      >
        <div className="relative w-full sm:w-48 h-48 sm:h-40 rounded-lg overflow-hidden bg-[#F5F5F5] dark:bg-zinc-800 shrink-0">
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {discountPercent > 0 && (
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#F85606] text-white text-[10px] font-black rounded-md shadow-xs">
              -{discountPercent}%
            </span>
          )}
          {product.isFlashSale && (
            <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded flex items-center gap-0.5">
              <Zap className="w-3 h-3 fill-white" /> FLASH
            </span>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
              <span className="font-semibold text-[#F85606] uppercase tracking-wider text-[10px]">
                {product.brand}
              </span>
              <span>SKU: {product.sku}</span>
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-[#F85606] transition-colors line-clamp-2">
              {product.name}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
              {product.description}
            </p>

            <div className="flex items-center gap-3 mt-2">
              <RatingStars rating={product.rating} size="sm" showNumber reviewCount={product.reviewCount} />
              <span className="text-[11px] text-zinc-400">• {product.soldCount} sold</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800 mt-3">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-[#F85606]">
                  {formatCurrency(effectivePrice)}
                </span>
                {discountPercent > 0 && (
                  <span className="text-xs text-zinc-400 line-through">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium mt-0.5">
                <Truck className="w-3 h-3" /> Free Express Shipping
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleWishlist}
                className={`p-2 rounded-lg border transition-colors ${
                  isFavorited
                    ? 'bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-950/40 dark:border-rose-900'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-zinc-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
              </button>
              <button
                onClick={handleAddToCart}
                className="px-4 py-2 bg-[#F85606] hover:bg-[#e04c04] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-transparent hover:border-[#F85606] hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer"
    >
      {/* Thumbnail Container */}
      <div className="relative w-full aspect-square bg-[#F5F5F5] dark:bg-zinc-800 overflow-hidden">
        <img
          src={product.thumbnail}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {discountPercent > 0 && (
            <span className="px-2 py-0.5 bg-[#F85606] text-white text-[10px] font-black rounded-md shadow-xs">
              -{discountPercent}%
            </span>
          )}
          {product.isFlashSale && (
            <span className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-black rounded flex items-center gap-0.5 shadow-xs">
              <Zap className="w-2.5 h-2.5 fill-white" /> FLASH
            </span>
          )}
        </div>

        {/* Wishlist Button Top Right */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-xs transition-all z-10 ${
            isFavorited
              ? 'bg-white text-rose-500 shadow-md'
              : 'bg-black/30 text-white hover:bg-white hover:text-zinc-800 opacity-90'
          }`}
          aria-label="Toggle Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Quick Add To Cart Overlay on Hover */}
        <div className="absolute bottom-2 inset-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={handleAddToCart}
            className="w-full py-2 bg-[#F85606] hover:bg-[#e04c04] text-white text-xs font-bold rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Quick Add
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <span className="text-[10px] font-bold text-[#F85606] uppercase tracking-wider block">
            {product.brand}
          </span>
          <h3 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:text-[#F85606] transition-colors mt-0.5">
            {product.name}
          </h3>
        </div>

        <div>
          {/* Price */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-[#F85606]">
              {formatCurrency(effectivePrice)}
            </span>
            {discountPercent > 0 && (
              <span className="text-[11px] text-zinc-400 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {/* Rating and Sold */}
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <RatingStars rating={product.rating} size="sm" showNumber />
            <span className="text-[10px] text-zinc-400">{product.soldCount} sold</span>
          </div>

          {/* Guarantee pill */}
          <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <Truck className="w-2.5 h-2.5" /> Free Delivery
            </span>
            {product.quantity <= 5 && product.quantity > 0 && (
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                Only {product.quantity} left
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
