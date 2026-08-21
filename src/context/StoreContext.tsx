import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  Category,
  Banner,
  NotificationItem,
  StoreSettings,
  ProductFilterParams
} from '../types';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export type ActiveView =
  | 'home'
  | 'catalog'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'orders'
  | 'order-detail'
  | 'wishlist'
  | 'profile'
  | 'admin';

export type AdminTab =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'coupons'
  | 'banners'
  | 'reviews'
  | 'notifications'
  | 'settings';

interface StoreContextType {
  // Navigation
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  navigateToProduct: (productId: string) => void;
  navigateToOrder: (orderId: string) => void;
  navigateToCatalogWithCategory: (categorySlug: string) => void;
  navigateToCatalogWithSearch: (query: string) => void;

  // Data
  products: Product[];
  categories: Category[];
  banners: Banner[];
  notifications: NotificationItem[];
  unreadNotifsCount: number;
  settings: StoreSettings | null;
  isLoading: boolean;
  filterParams: ProductFilterParams;
  setFilterParams: React.Dispatch<React.SetStateAction<ProductFilterParams>>;
  resetFilters: () => void;

  // Actions
  refreshAllData: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { error } = useToast();

  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [filterParams, setFilterParams] = useState<ProductFilterParams>({
    category: 'all',
    brand: 'all',
    minPrice: 0,
    maxPrice: 2500,
    minRating: 0,
    inStockOnly: false,
    onSaleOnly: false,
    flashSaleOnly: false,
    sortBy: 'popular',
    search: '',
  });

  const refreshAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [prodsRes, cats, bans, notifs, sets] = await Promise.all([
        api.getProducts({ limit: 100 }),
        api.getCategories(),
        api.getBanners(),
        api.getNotifications(user?.id),
        api.getSettings(),
      ]);

      setProducts(prodsRes.products);
      setCategories(cats);
      setBanners(bans);
      setNotifications(notifs);
      setSettings(sets);
    } catch (err: any) {
      console.error('Failed to load store data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

  const navigateToProduct = (productId: string) => {
    setSelectedProductId(productId);
    setActiveView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setActiveView('order-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCatalogWithCategory = (categorySlug: string) => {
    setFilterParams(prev => ({ ...prev, category: categorySlug, search: '', flashSaleOnly: false }));
    setActiveView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCatalogWithSearch = (query: string) => {
    setFilterParams(prev => ({ ...prev, search: query, category: 'all', flashSaleOnly: false }));
    setActiveView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setFilterParams({
      category: 'all',
      brand: 'all',
      minPrice: 0,
      maxPrice: 2500,
      minRating: 0,
      inStockOnly: false,
      onSaleOnly: false,
      flashSaleOnly: false,
      sortBy: 'popular',
      search: '',
    });
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err: any) {
      error('Notification error', err.message);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await api.markAllNotificationsRead(user?.id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err: any) {
      error('Notification error', err.message);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedProductId,
        setSelectedProductId,
        selectedOrderId,
        setSelectedOrderId,
        adminTab,
        setAdminTab,
        navigateToProduct,
        navigateToOrder,
        navigateToCatalogWithCategory,
        navigateToCatalogWithSearch,
        products,
        categories,
        banners,
        notifications,
        unreadNotifsCount,
        settings,
        isLoading,
        filterParams,
        setFilterParams,
        resetFilters,
        refreshAllData,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
