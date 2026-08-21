import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Coupon, Product } from '../types';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface CartContextType {
  cart: CartItem[];
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  tax: number;
  total: number;
  appliedCoupon: Coupon | null;
  couponCodeInput: string;
  freeShippingProgress: number; // 0 to 100%
  amountNeededForFreeShipping: number;
  isLoading: boolean;
  setCouponCodeInput: (code: string) => void;
  addToCart: (product: Product, quantity?: number, variant?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code?: string) => Promise<boolean>;
  removeCoupon: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { success, error, info } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const userId = user?.id || 'user-cust-1';
  const FREE_SHIPPING_THRESHOLD = 50.0;
  const STANDARD_SHIPPING_CHARGE = 4.99;
  const TAX_RATE = 0.075; // 7.5%

  const refreshCart = useCallback(async () => {
    try {
      const items = await api.getCart(userId);
      setCart(items);
    } catch (err) {
      console.error('Failed to load cart', err);
    }
  }, [userId]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce((sum, item) => {
    const price = item.product.isFlashSale && item.product.flashSalePrice
      ? item.product.flashSalePrice
      : item.product.price * (1 - item.product.discount / 100);
    return sum + price * item.quantity;
  }, 0);

  // Free shipping progress calculation
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const shippingFee = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_CHARGE;

  // Coupon discount calculation
  let discount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minSpend) {
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      discount = (subtotal * appliedCoupon.value) / 100;
      if (appliedCoupon.maxDiscount) discount = Math.min(discount, appliedCoupon.maxDiscount);
    } else {
      discount = Math.min(appliedCoupon.value, subtotal);
    }
  }

  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Number((taxableAmount * TAX_RATE).toFixed(2));
  const total = Number((taxableAmount + shippingFee + tax).toFixed(2));

  const addToCart = async (product: Product, quantity = 1, variant?: string) => {
    setIsLoading(true);
    try {
      const updated = await api.addToCart(userId, product.id, quantity, variant);
      setCart(updated);
      success('Added to Cart!', `${product.name.slice(0, 30)}... (${quantity}x)`);
    } catch (err: any) {
      error('Could not add to cart', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const updated = await api.updateCartItem(userId, itemId, quantity);
      setCart(updated);
    } catch (err: any) {
      error('Could not update quantity', err.message);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const updated = await api.removeCartItem(userId, itemId);
      setCart(updated);
      info('Item removed from cart');
    } catch (err: any) {
      error('Could not remove item', err.message);
    }
  };

  const clearCart = async () => {
    try {
      await api.clearCart(userId);
      setCart([]);
      setAppliedCoupon(null);
    } catch (err: any) {
      error('Could not clear cart', err.message);
    }
  };

  const applyCoupon = async (code?: string): Promise<boolean> => {
    const codeToApply = code || couponCodeInput;
    if (!codeToApply) {
      error('Please enter a coupon code');
      return false;
    }

    try {
      const res = await api.validateCoupon(codeToApply, subtotal);
      if (res.valid && res.coupon) {
        setAppliedCoupon(res.coupon);
        setCouponCodeInput(res.coupon.code);
        success('Coupon Applied!', res.message);
        return true;
      } else {
        error('Invalid Coupon', res.message);
        return false;
      }
    } catch (err: any) {
      error('Failed to apply coupon', err.message);
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
    info('Coupon removed');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        subtotal: Number(subtotal.toFixed(2)),
        shippingFee,
        discount: Number(discount.toFixed(2)),
        tax,
        total,
        appliedCoupon,
        couponCodeInput,
        freeShippingProgress,
        amountNeededForFreeShipping: Number(amountNeededForFreeShipping.toFixed(2)),
        isLoading,
        setCouponCodeInput,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
