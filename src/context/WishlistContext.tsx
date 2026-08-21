import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WishlistItem } from '../types';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface WishlistContextType {
  wishlist: WishlistItem[];
  count: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { success, info, error } = useToast();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const userId = user?.id || 'user-cust-1';

  const refreshWishlist = useCallback(async () => {
    try {
      const items = await api.getWishlist(userId);
      setWishlist(items);
    } catch (err) {
      console.error('Failed to load wishlist', err);
    }
  }, [userId]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.productId === productId);
  };

  const toggleWishlist = async (productId: string): Promise<boolean> => {
    try {
      const res = await api.toggleWishlist(userId, productId);
      setWishlist(res.wishlist);
      if (res.isAdded) {
        success('Added to Wishlist', 'Item saved to your favorites');
      } else {
        info('Removed from Wishlist', 'Item removed from favorites');
      }
      return res.isAdded;
    } catch (err: any) {
      error('Wishlist error', err.message);
      return false;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        count: wishlist.length,
        isInWishlist,
        toggleWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
