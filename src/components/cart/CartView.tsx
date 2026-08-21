import React from 'react';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  Truck,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { formatCurrency } from '../../lib/utils';

export const CartView: React.FC = () => {
  const {
    cart,
    subtotal,
    shippingFee,
    discount,
    tax,
    total,
    appliedCoupon,
    couponCodeInput,
    setCouponCodeInput,
    applyCoupon,
    removeCoupon,
    updateQuantity,
    removeFromCart,
    clearCart,
    freeShippingProgress,
    amountNeededForFreeShipping,
  } = useCart();

  const { setActiveView, navigateToProduct } = useStore();

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
          Your Shopping Cart is Empty
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
          Looks like you haven't added anything to your cart yet. Explore our flash sales and top deals!
        </p>
        <div className="pt-2">
          <button
            onClick={() => setActiveView('catalog')}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all inline-flex items-center gap-2"
          >
            <span>Start Shopping Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Title & Continue shopping button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Shopping Cart ({cart.length} items)
          </h1>
          <p className="text-xs text-zinc-500">
            Review your chosen items before heading to secure checkout
          </p>
        </div>

        <button
          onClick={() => setActiveView('catalog')}
          className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Continue Shopping
        </button>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="p-4 bg-gradient-to-r from-orange-500/10 to-amber-500/10 dark:from-orange-950/40 dark:to-amber-950/20 rounded-2xl border border-orange-200 dark:border-orange-900/50 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
          <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
            <Truck className="w-4 h-4" />
            {freeShippingProgress >= 100 ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                You've earned FREE Express Delivery!
              </span>
            ) : (
              <span>
                Add {formatCurrency(amountNeededForFreeShipping)} more to qualify for FREE Shipping
              </span>
            )}
          </span>
          <span>{freeShippingProgress}%</span>
        </div>
        <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              freeShippingProgress >= 100
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-orange-500 to-amber-500'
            }`}
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      {/* Main Cart Grid: Items List + Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Cart Items (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-xs divide-y divide-zinc-100 dark:divide-zinc-800">
            {cart.map(item => {
              const effectivePrice = item.product.isFlashSale && item.product.flashSalePrice
                ? item.product.flashSalePrice
                : item.product.price * (1 - item.product.discount / 100);
              const itemTotal = effectivePrice * item.quantity;

              return (
                <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div
                    onClick={() => navigateToProduct(item.productId)}
                    className="flex items-center gap-4 cursor-pointer flex-1 min-w-0"
                  >
                    <img
                      src={item.product.thumbnail}
                      alt={item.product.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                        {item.product.brand}
                      </span>
                      <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate hover:text-orange-600 transition-colors">
                        {item.product.name}
                      </h3>
                      {item.variant && (
                        <span className="inline-block mt-0.5 text-[11px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded">
                          Option: {item.variant}
                        </span>
                      )}
                      <p className="text-xs font-semibold text-orange-600 mt-1">
                        {formatCurrency(effectivePrice)} each
                      </p>
                    </div>
                  </div>

                  {/* Quantity Stepper & Total */}
                  <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6">
                    <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-l transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.quantity}
                        className="p-1.5 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-r transition-colors disabled:opacity-30"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <span className="font-black text-sm text-zinc-900 dark:text-white">
                        {formatCurrency(itemTotal)}
                      </span>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs pt-2">
            <button
              onClick={clearCart}
              className="text-zinc-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Empty Shopping Cart
            </button>
            <span className="text-zinc-400">
              Prices guaranteed for 60 minutes
            </span>
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 space-y-4 shadow-xs text-xs">
            <h3 className="font-black text-sm text-zinc-900 dark:text-white uppercase tracking-wider pb-3 border-b border-zinc-100 dark:border-zinc-800">
              Order Summary
            </h3>

            {/* Coupon Code Input */}
            <div className="space-y-2">
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300">
                Have a Promo Voucher?
              </label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Tag className="w-3.5 h-3.5" />
                    <span>{appliedCoupon.code} Applied</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-emerald-600 underline font-semibold hover:text-emerald-800"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={e => setCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder="e.g. FLASH25, SAVE10"
                    className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs uppercase font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 dark:text-white"
                  />
                  <button
                    onClick={() => applyCoupon()}
                    className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
              <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Try coupon codes: <strong className="text-orange-600">SAVE10</strong>, <strong className="text-orange-600">FLASH25</strong></span>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span>Subtotal</span>
                <span className="font-semibold text-zinc-900 dark:text-white">{formatCurrency(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Voucher Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    formatCurrency(shippingFee)
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span>Estimated Tax (7.5%)</span>
                <span className="font-semibold text-zinc-900 dark:text-white">{formatCurrency(tax)}</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-700 text-sm font-black text-zinc-900 dark:text-white">
                <span>Total Amount</span>
                <span className="text-lg text-orange-600 dark:text-orange-400">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Proceed to Checkout Button */}
            <button
              onClick={() => setActiveView('checkout')}
              className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Trust badge */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>256-Bit SSL Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
