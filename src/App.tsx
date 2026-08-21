import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';
import { AuthModal } from './components/common/AuthModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';

import { HomeView } from './components/home/HomeView';
import { ProductCatalogView } from './components/product/ProductCatalogView';
import { ProductDetailView } from './components/product/ProductDetailView';
import { CartView } from './components/cart/CartView';
import { CheckoutView } from './components/checkout/CheckoutView';
import { OrdersListView } from './components/order/OrdersListView';
import { OrderDetailView } from './components/order/OrderDetailView';
import { ProfileView } from './components/profile/ProfileView';
import { WishlistView } from './components/profile/WishlistView';
import { AdminPortal } from './components/admin/AdminPortal';
import { AdminLoginGate } from './components/admin/AdminLoginGate';

import { ThemeToggleFAB } from './components/common/ThemeToggleFAB';

const AppContent: React.FC = () => {
  const { activeView } = useStore();
  const { isAdminAuthenticated } = useAuth();

  if (activeView === 'admin') {
    // Gate: show login screen if not admin-authenticated
    if (!isAdminAuthenticated) {
      return (
        <>
          <AdminLoginGate />
          <AuthModal />
          <NotificationDrawer />
        </>
      );
    }
    return (
      <>
        <AdminPortal />
        <AuthModal />
        <NotificationDrawer />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#EFF0F5] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased transition-colors duration-200">
      <Header />

      <main className="flex-1 pb-16 md:pb-8">
        {activeView === 'home' && <HomeView />}
        {activeView === 'catalog' && <ProductCatalogView />}
        {activeView === 'product' && <ProductDetailView />}
        {activeView === 'cart' && <CartView />}
        {activeView === 'checkout' && <CheckoutView />}
        {activeView === 'orders' && <OrdersListView />}
        {activeView === 'order-detail' && <OrderDetailView />}
        {activeView === 'profile' && <ProfileView />}
        {activeView === 'wishlist' && <WishlistView />}
      </main>

      <Footer />
      <MobileNav />
      <AuthModal />
      <NotificationDrawer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <StoreProvider>
            <CartProvider>
              <WishlistProvider>
                <AppContent />
                <ThemeToggleFAB />
              </WishlistProvider>
            </CartProvider>
          </StoreProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
