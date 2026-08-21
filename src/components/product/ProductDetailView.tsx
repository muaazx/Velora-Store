import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Heart,
  Truck,
  ShieldCheck,
  RefreshCw,
  Zap,
  Check,
  Plus,
  Minus,
  Star,
  Share2,
  Package,
  ArrowRight,
  Sparkles,
  MessageSquarePlus,
  X
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { RatingStars } from '../common/RatingStars';
import { ProductCard } from './ProductCard';
import { api } from '../../lib/api';
import { Product, Review } from '../../types';

export const ProductDetailView: React.FC = () => {
  const { selectedProductId, products, setActiveView } = useStore();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user, openAuthModal } = useAuth();
  const { success, error, info } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (selectedProductId) {
      const found = products.find(p => p.id === selectedProductId);
      if (found) {
        setProduct(found);
        setSelectedImageIndex(0);
        setQuantity(1);
        if (found.attributes && Object.keys(found.attributes).length > 0) {
          const firstAttrKey = Object.keys(found.attributes)[0];
          setSelectedVariant(found.attributes[firstAttrKey]);
        }
      }
    }
  }, [selectedProductId, products]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Package className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Product Not Found</h2>
        <button
          onClick={() => setActiveView('catalog')}
          className="mt-4 px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-lg"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const images = product.images && product.images.length > 0 ? product.images : [product.thumbnail];
  const effectivePrice = product.isFlashSale && product.flashSalePrice
    ? product.flashSalePrice
    : product.price * (1 - product.discount / 100);
  const discountPercent = product.isFlashSale && product.flashSalePrice
    ? Math.round(((product.price - product.flashSalePrice) / product.price) * 100)
    : product.discount;

  const relatedProducts = products
    .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  // Frequently Bought Together Complement
  const bundleProduct = relatedProducts[0];
  const bundleTotalOriginal = bundleProduct ? effectivePrice + bundleProduct.price : effectivePrice;
  const bundleTotalDiscounted = bundleProduct ? Number((bundleTotalOriginal * 0.9).toFixed(2)) : effectivePrice;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant);
  };

  const handleBuyNow = async () => {
    await addToCart(product, quantity, selectedVariant);
    setActiveView('checkout');
  };

  const handleAddBundle = async () => {
    if (!bundleProduct) return;
    await addToCart(product, 1);
    await addToCart(bundleProduct, 1);
    success('Bundle Added!', `Added ${product.name} and ${bundleProduct.name} to cart.`);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    info('Link copied to clipboard!');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (!newComment.trim()) {
      error('Please write a review message');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const reviewData = {
        userId: user.id,
        productId: product.id,
        rating: newRating,
        title: 'Customer Review',
        comment: newComment,
      };

      const updated = await api.createReview(reviewData);
      setProduct(prev => prev ? { ...prev, reviews: [updated, ...(prev.reviews || [])] } : null);
      setNewComment('');
      setIsWriteReviewOpen(false);
      success('Review Submitted', 'Thank you for your feedback!');
    } catch (err: any) {
      error('Failed to submit review', err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <button onClick={() => setActiveView('home')} className="hover:text-orange-600">Home</button>
        <span>/</span>
        <button onClick={() => setActiveView('catalog')} className="hover:text-orange-600">Catalog</button>
        <span>/</span>
        <span className="text-zinc-600 dark:text-zinc-300 font-medium truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Details Grid: Gallery + Details + Buy Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
            <img
              src={images[selectedImageIndex] || product.thumbnail}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discountPercent > 0 && (
              <span className="absolute top-3 left-3 px-2.5 py-1 bg-orange-600 text-white text-xs font-black rounded-lg shadow-md">
                -{discountPercent}% OFF
              </span>
            )}
            {product.isFlashSale && (
              <span className="absolute bottom-3 left-3 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-md">
                <Zap className="w-3.5 h-3.5 fill-white" /> FLASH SALE
              </span>
            )}
          </div>

          {/* Thumbnail Selector Strip */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-orange-500 ring-2 ring-orange-500/20'
                      : 'border-zinc-200 dark:border-zinc-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center & Right Column: Details & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                {product.brand} • SKU: {product.sku}
              </span>
              <button
                onClick={handleShare}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Ratings, Reviews and Sold summary */}
            <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <div className="flex items-center gap-2">
                <RatingStars rating={product.rating} showNumber reviewCount={product.reviewCount} />
              </div>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span className="text-zinc-600 dark:text-zinc-400 font-medium">
                {product.soldCount} units sold
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span className={`font-semibold ${product.quantity > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                {product.quantity > 0 ? `In Stock (${product.quantity} units available)` : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Pricing Block */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-orange-600 dark:text-orange-400">
                {formatCurrency(effectivePrice)}
              </span>
              {discountPercent > 0 && (
                <span className="text-base text-zinc-400 line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 font-extrabold text-xs rounded">
                  Save {formatCurrency(product.price - effectivePrice)} ({discountPercent}%)
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Price inclusive of all taxes. Free express shipping applied at checkout for orders &gt; $50.
            </p>
          </div>

          {/* Attributes / Variants if any */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="space-y-3">
              {Object.entries(product.attributes).map(([key, val]) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    {key}: <span className="text-zinc-900 dark:text-white font-normal">{val}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg border-2 border-orange-500 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 text-xs font-bold"
                    >
                      {val}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity Stepper & Action Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">
                Quantity:
              </label>
              <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 overflow-hidden shadow-xs">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="p-2.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-30 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-bold text-zinc-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= product.quantity}
                  onClick={() => setQuantity(prev => Math.min(product.quantity, prev + 1))}
                  className="p-2.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-30 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={product.quantity <= 0}
                className="sm:col-span-5 py-3 px-4 bg-orange-100 dark:bg-orange-950/40 hover:bg-orange-200 dark:hover:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-800 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.quantity <= 0}
                className="sm:col-span-5 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Zap className="w-4 h-4 fill-white" />
                Buy Now
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`sm:col-span-2 py-3 px-3 border rounded-xl flex items-center justify-center transition-colors ${
                  isFavorited
                    ? 'bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-950/40 dark:border-rose-900'
                    : 'border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Delivery, Guarantees & Safe Payments Card */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-3 pb-3">
              <Truck className="w-5 h-5 text-orange-500 shrink-0" />
              <div>
                <p className="font-bold text-zinc-900 dark:text-white">Standard & Express Delivery</p>
                <p className="text-[11px]">Estimated arrival in 2-3 business days. Free shipping over $50.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-3">
              <RefreshCw className="w-5 h-5 text-blue-500 shrink-0" />
              <div>
                <p className="font-bold text-zinc-900 dark:text-white">7-Day Return Policy</p>
                <p className="text-[11px]">Change of mind allowed. Quick refunds upon verified pickup.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <p className="font-bold text-zinc-900 dark:text-white">100% Authentic Guarantee</p>
                <p className="text-[11px]">Direct brand authorized stock with 1-Year official warranty.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Bought Together Bundle */}
      {bundleProduct && (
        <section className="p-6 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent dark:from-orange-950/30 dark:to-zinc-900 rounded-2xl border border-orange-200 dark:border-orange-900/40">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Frequently Bought Together (Save 10% Extra)
            </h3>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {/* Product 1 */}
              <div className="flex items-center gap-3">
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="w-16 h-16 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                />
                <div className="max-w-[140px]">
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 line-clamp-1">{product.name}</p>
                  <p className="text-xs text-orange-600 font-extrabold">{formatCurrency(effectivePrice)}</p>
                </div>
              </div>

              <span className="font-bold text-zinc-400 text-lg">+</span>

              {/* Product 2 */}
              <div className="flex items-center gap-3">
                <img
                  src={bundleProduct.thumbnail}
                  alt={bundleProduct.name}
                  className="w-16 h-16 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                />
                <div className="max-w-[140px]">
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 line-clamp-1">{bundleProduct.name}</p>
                  <p className="text-xs text-orange-600 font-extrabold">{formatCurrency(bundleProduct.price)}</p>
                </div>
              </div>
            </div>

            {/* Bundle Total & Add Button */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-zinc-500">Combo Total:</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-orange-600 dark:text-orange-400">
                    {formatCurrency(bundleTotalDiscounted)}
                  </span>
                  <span className="text-xs text-zinc-400 line-through">
                    {formatCurrency(bundleTotalOriginal)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleAddBundle}
                className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Add Both to Cart
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Tabs: Description / Specifications / Customer Reviews */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-xs">
        {/* Tab Headers */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm font-bold">
          <button
            onClick={() => setActiveTab('description')}
            className={`px-6 py-4 transition-colors border-b-2 ${
              activeTab === 'description'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/30 dark:bg-orange-950/20'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            Product Overview
          </button>
          <button
            onClick={() => setActiveTab('specifications')}
            className={`px-6 py-4 transition-colors border-b-2 ${
              activeTab === 'specifications'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/30 dark:bg-orange-950/20'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-4 transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/30 dark:bg-orange-950/20'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <span>Customer Reviews</span>
            <span className="px-2 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full">
              {product.reviews?.length || 0}
            </span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {activeTab === 'description' && (
            <div className="space-y-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              <p>{product.description}</p>
              <h4 className="font-bold text-zinc-900 dark:text-white pt-2">Key Highlights</h4>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Engineered with premium durable materials for extended longevity</li>
                <li>Certified official brand warranty coverage worldwide</li>
                <li>Complies with all international safety, energy and performance benchmarks</li>
                <li>Includes manufacturer original accessories and quick-start manuals in box</li>
              </ul>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
              <div className="py-2.5 grid grid-cols-3">
                <span className="font-semibold text-zinc-400">Brand</span>
                <span className="col-span-2 text-zinc-800 dark:text-zinc-200">{product.brand}</span>
              </div>
              <div className="py-2.5 grid grid-cols-3">
                <span className="font-semibold text-zinc-400">Model SKU</span>
                <span className="col-span-2 text-zinc-800 dark:text-zinc-200">{product.sku}</span>
              </div>
              <div className="py-2.5 grid grid-cols-3">
                <span className="font-semibold text-zinc-400">Category</span>
                <span className="col-span-2 text-zinc-800 dark:text-zinc-200">{product.category?.name}</span>
              </div>
              <div className="py-2.5 grid grid-cols-3">
                <span className="font-semibold text-zinc-400">Warranty</span>
                <span className="col-span-2 text-zinc-800 dark:text-zinc-200">1 Year Official Manufacturer Warranty</span>
              </div>
              <div className="py-2.5 grid grid-cols-3">
                <span className="font-semibold text-zinc-400">Condition</span>
                <span className="col-span-2 text-emerald-600 font-semibold">100% Brand New in Sealed Box</span>
              </div>
              {product.attributes && Object.entries(product.attributes).map(([k, v]) => (
                <div key={k} className="py-2.5 grid grid-cols-3">
                  <span className="font-semibold text-zinc-400 uppercase">{k}</span>
                  <span className="col-span-2 text-zinc-800 dark:text-zinc-200">{v}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Rating Overview and Write Review Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <span className="text-3xl font-black text-zinc-900 dark:text-white">
                      {product.rating.toFixed(1)}
                    </span>
                    <RatingStars rating={product.rating} size="sm" />
                    <p className="text-[10px] text-zinc-400 mt-1">Based on {product.reviewCount} reviews</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsWriteReviewOpen(true)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  Write a Customer Review
                </button>
              </div>

              {/* Review List */}
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 space-y-4">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map(review => (
                    <div key={review.id} className="pt-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={review.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt={review.userName}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-zinc-100">{review.userName}</p>
                            {review.isVerifiedPurchase && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" /> Verified Purchase
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-400">{formatDateTime(review.createdAt)}</span>
                      </div>

                      <RatingStars rating={review.rating} size="sm" />

                      <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-400 text-xs py-4 text-center">
                    No reviews yet. Be the first to review this product!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="my-10">
          <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-4">
            Customers Also Viewed
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Write Review Modal */}
      {isWriteReviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsWriteReviewOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                Review {product.name.slice(0, 30)}...
              </h3>
              <button onClick={() => setIsWriteReviewOpen(false)}>
                <X className="w-4 h-4 text-zinc-400 hover:text-zinc-600" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Overall Rating
                </label>
                <RatingStars
                  rating={newRating}
                  size="lg"
                  interactive
                  onRatingChange={r => setNewRating(r)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Your Review & Feedback
                </label>
                <textarea
                  rows={4}
                  required
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Share your experience with the item quality, delivery speed, and performance..."
                  className="w-full p-3 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                {isSubmittingReview ? 'Submitting...' : 'Post Public Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
