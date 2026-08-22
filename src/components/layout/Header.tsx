import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  Bell,
  User,
  ShieldCheck,
  Menu,
  ChevronDown,
  Sun,
  Moon,
  Sparkles,
  Flame,
  Smartphone,
  Laptop,
  Headphones,
  Shirt,
  Watch,
  Home,
  LogOut,
  ShoppingBag,
  HelpCircle,
  Truck,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useStore } from '../../context/StoreContext';
import { useTheme } from '../../context/ThemeContext';
import { NotificationDrawer } from '../common/NotificationDrawer';
import { formatCurrency } from '../../lib/utils';

export const Header: React.FC = () => {
  const { user, isAdmin, openAuthModal, logout } = useAuth();
  const { itemCount, subtotal } = useCart();
  const { count: wishlistCount } = useWishlist();
  const {
    activeView,
    setActiveView,
    categories,
    products,
    navigateToProduct,
    navigateToCatalogWithCategory,
    navigateToCatalogWithSearch,
    unreadNotifsCount,
    setAdminTab,
  } = useStore();
  const { theme, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCategoriesMenuOpen, setIsCategoriesMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products for live suggestions
  const liveSuggestions = searchQuery.trim()
    ? products
        .filter(p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateToCatalogWithSearch(searchQuery.trim());
      setIsSearchFocused(false);
    }
  };

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'mobile-phones':
        return <Smartphone className="w-4 h-4" />;
      case 'laptops-computers':
        return <Laptop className="w-4 h-4" />;
      case 'electronics-audio':
        return <Headphones className="w-4 h-4" />;
      case 'fashion-apparel':
        return <Shirt className="w-4 h-4" />;
      case 'accessories-watches':
        return <Watch className="w-4 h-4" />;
      case 'home-living':
        return <Home className="w-4 h-4" />;
      default:
        return <ShoppingBag className="w-4 h-4" />;
    }
  };

  return (
    <>
      <header id="main-header" className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-xs">
        {/* Top Utility Bar */}
        <div className="bg-[#F85606] text-white text-[11px] font-medium border-b border-orange-600/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 hover:text-orange-100 transition-colors cursor-pointer">
                <Sparkles className="w-3 h-3 text-orange-200" />
                Free Express Delivery on orders over $50
              </span>
              <span className="hidden sm:inline text-orange-300">|</span>
              <button
                onClick={() => setActiveView('orders')}
                className="hidden sm:flex items-center gap-1 hover:text-orange-100 transition-colors"
              >
                <Truck className="w-3 h-3" />
                Track Order
              </button>
              <span className="hidden md:inline text-orange-300">|</span>
              <button
                onClick={() => {
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }}
                className="hidden md:flex items-center gap-1 hover:text-orange-100 transition-colors"
              >
                <HelpCircle className="w-3 h-3" />
                Help & Support
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* View Switcher */}
              <div className="flex items-center bg-black/15 rounded-full p-0.5 border border-white/20">
                <button
                  onClick={() => setActiveView('home')}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
                    activeView !== 'admin'
                      ? 'bg-white text-[#F85606] font-bold shadow-xs'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Customer View
                </button>
                <button
                  onClick={() => {
                    setAdminTab('dashboard');
                    setActiveView('admin');
                  }}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all flex items-center gap-1 ${
                    activeView === 'admin'
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-2.5 h-2.5" />
                  Admin View
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className="p-1 rounded-full hover:bg-white/20 transition-colors text-white"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-white" />}
              </button>
            </div>
          </div>
        </div>

        {/* Main Header Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3">
          <div className="flex items-center justify-between gap-3 md:gap-6">
            {/* Logo */}
            <div
              onClick={() => setActiveView('home')}
              className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F85606] via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/25">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-0.5">
                  Velora<span className="text-[#F85606]">Store</span>
                </span>
                <span className="text-[10px] font-semibold text-zinc-400 tracking-wider uppercase block -mt-1">
                  Super Marketplace
                </span>
              </div>
            </div>

            {/* Mega Search Bar */}
            <div ref={searchRef} className="relative flex-1 max-w-2xl hidden md:block">
              <form onSubmit={handleSearchSubmit} className="flex">
                {/* Category selector in search */}
                <div className="relative shrink-0">
                  <select
                    value={selectedCategorySlug}
                    onChange={e => setSelectedCategorySlug(e.target.value)}
                    className="h-10 pl-3 pr-7 bg-[#F5F5F5] dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 border-none rounded-l-lg focus:outline-none cursor-pointer appearance-none"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Input */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    placeholder="Search for smartphones, laptops, fashion, beauty, electronics..."
                    className="w-full h-10 px-4 text-xs md:text-sm bg-[#F5F5F5] dark:bg-zinc-800 text-zinc-900 dark:text-white border-l border-zinc-200 dark:border-zinc-700 focus:outline-none focus:bg-white dark:focus:bg-zinc-800"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="h-10 px-5 bg-[#F85606] hover:bg-[#e04c04] text-white rounded-r-lg font-medium text-sm flex items-center justify-center transition-colors shadow-xs"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Live Search Suggestions Dropdown */}
              {isSearchFocused && liveSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-2 z-50 overflow-hidden">
                  <div className="px-3 py-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Suggested Products
                  </div>
                  {liveSuggestions.map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        navigateToProduct(p.id);
                        setIsSearchFocused(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                    >
                      <img src={p.thumbnail} alt={p.name} className="w-8 h-8 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">
                          {p.name}
                        </p>
                        <p className="text-[11px] text-zinc-400">{p.brand}</p>
                      </div>
                      <span className="text-xs font-bold text-[#F85606]">
                        {formatCurrency(p.isFlashSale && p.flashSalePrice ? p.flashSalePrice : p.price * (1 - p.discount / 100))}
                      </span>
                    </div>
                  ))}
                  <div
                    onClick={() => {
                      navigateToCatalogWithSearch(searchQuery);
                      setIsSearchFocused(false);
                    }}
                    className="mt-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800/60 border-t border-zinc-100 dark:border-zinc-800 text-xs font-semibold text-[#F85606] flex items-center justify-between cursor-pointer hover:bg-orange-50 dark:hover:bg-zinc-800"
                  >
                    <span>View all matching results for "{searchQuery}"</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Admin Portal Shortcut (for all logged-in users) */}
              {user && (
                <button
                  onClick={() => {
                    setAdminTab('dashboard');
                    setActiveView('admin');
                  }}
                  className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    isAdmin
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                      : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Dashboard
                  {isAdmin && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                </button>
              )}

              {/* Notification Bell */}
              <button
                onClick={() => setIsNotifOpen(true)}
                className="relative p-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#F85606] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Wishlist */}
              <button
                onClick={() => setActiveView('wishlist')}
                className="relative p-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                onClick={() => setActiveView('cart')}
                className="flex items-center gap-2 p-2 sm:px-3 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-[#F85606] hover:bg-orange-100 dark:hover:bg-orange-950/50 border border-orange-200/80 dark:border-orange-900 transition-colors"
                aria-label="Cart"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#F85606] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                      {itemCount}
                    </span>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight">My Cart</p>
                  <p className="text-xs font-bold leading-tight">{formatCurrency(subtotal)}</p>
                </div>
              </button>

              {/* User Account / Profile Menu */}
              <div ref={userMenuRef} className="relative">
                {user ? (
                  <button
                    onClick={() => setIsUserMenuOpen(prev => !prev)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                    />
                    <span className="hidden lg:block text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[100px]">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-zinc-400 hidden lg:block" />
                  </button>
                ) : (
                  <button
                    onClick={() => openAuthModal('login')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign In</span>
                  </button>
                )}

                {/* User Dropdown */}
                {isUserMenuOpen && user && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="font-bold text-zinc-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setActiveView('profile');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 text-zinc-700 dark:text-zinc-300"
                      >
                        <User className="w-4 h-4 text-zinc-400" />
                        Manage Profile & Addresses
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('orders');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 text-zinc-700 dark:text-zinc-300"
                      >
                        <ShoppingBag className="w-4 h-4 text-zinc-400" />
                        My Orders & Timeline
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('wishlist');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 text-zinc-700 dark:text-zinc-300"
                      >
                        <Heart className="w-4 h-4 text-zinc-400" />
                        My Wishlist ({wishlistCount})
                      </button>

                      {user && (
                        <button
                          onClick={() => {
                            setActiveView('admin');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Admin Console
                          {isAdmin && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                        </button>
                      )}
                    </div>

                    <div className="border-t border-zinc-100 dark:border-zinc-800 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 text-rose-600 dark:text-rose-400"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Navigation & Categories Mega Strip */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-1">
              {/* Mega Categories Button */}
              <div className="relative">
                <button
                  onClick={() => setIsCategoriesMenuOpen(prev => !prev)}
                  className="flex items-center gap-2 py-2.5 px-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold rounded-t-lg transition-colors"
                >
                  <Menu className="w-4 h-4" />
                  <span>All Categories</span>
                  <ChevronDown className="w-3.5 h-3.5 ml-1" />
                </button>

                {/* Categories Dropdown */}
                {isCategoriesMenuOpen && (
                  <div
                    onMouseLeave={() => setIsCategoriesMenuOpen(false)}
                    className="absolute left-0 top-full w-64 bg-white dark:bg-zinc-900 rounded-b-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 py-2 z-50"
                  >
                    {categories.map(cat => (
                      <div
                        key={cat.id}
                        onClick={() => {
                          navigateToCatalogWithCategory(cat.slug);
                          setIsCategoriesMenuOpen(false);
                        }}
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-orange-50 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:text-[#F85606] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          {getCategoryIcon(cat.slug)}
                          <span>{cat.name}</span>
                        </div>
                        <span className="text-[11px] text-zinc-400">
                          {cat.productCount || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Links */}
              <button
                onClick={() => {
                  navigateToCatalogWithCategory('mobile-phones');
                }}
                className="py-2.5 px-3 hover:text-[#F85606] text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                Mobiles
              </button>
              <button
                onClick={() => {
                  navigateToCatalogWithCategory('laptops-computers');
                }}
                className="py-2.5 px-3 hover:text-[#F85606] text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                Laptops
              </button>
              <button
                onClick={() => {
                  navigateToCatalogWithCategory('electronics-audio');
                }}
                className="py-2.5 px-3 hover:text-[#F85606] text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                Electronics & Audio
              </button>
              <button
                onClick={() => {
                  navigateToCatalogWithCategory('fashion-apparel');
                }}
                className="py-2.5 px-3 hover:text-[#F85606] text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                Fashion
              </button>
              <button
                onClick={() => {
                  navigateToCatalogWithCategory('home-living');
                }}
                className="py-2.5 px-3 hover:text-[#F85606] text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                Home & Living
              </button>
              <button
                onClick={() => {
                  navigateToCatalogWithCategory('beauty-skincare');
                }}
                className="py-2.5 px-3 hover:text-[#F85606] text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                Beauty
              </button>
            </div>

            {/* Flash Sale Pulsing Tab */}
            <button
              onClick={() => {
                setActiveView('catalog');
                useStore().setFilterParams(prev => ({ ...prev, flashSaleOnly: true, category: 'all', search: '' }));
              }}
              className="flex items-center gap-1.5 py-1 px-3.5 bg-red-50 dark:bg-red-950/40 text-[#F85606] font-black rounded-full border border-orange-200 dark:border-orange-900 hover:bg-orange-100 transition-all shadow-xs"
            >
              <Flame className="w-3.5 h-3.5 text-[#F85606] fill-[#F85606]" />
              <span>FLASH DEALS</span>
            </button>
          </div>
        </div>
      </header>

      {/* Notification Drawer Modal */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};
