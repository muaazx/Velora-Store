import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Tag,
  Star,
  Settings,
  ArrowLeft,
  ExternalLink,
  Menu,
  X,
  Store,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminOrders } from './AdminOrders';
import { AdminCustomers } from './AdminCustomers';
import { AdminCoupons } from './AdminCoupons';
import { AdminReviews } from './AdminReviews';
import { AdminSettings } from './AdminSettings';

export const AdminPortal: React.FC = () => {
  const { adminTab, setAdminTab, setActiveView } = useStore();
  const { user, adminLogout } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const NAV_ITEMS = [
    { key: 'dashboard', label: 'Dashboard & KPIs', icon: LayoutDashboard },
    { key: 'products', label: 'Products & Stock', icon: Package },
    { key: 'categories', label: 'Categories', icon: Layers },
    { key: 'orders', label: 'Orders & Dispatch', icon: ShoppingBag },
    { key: 'customers', label: 'Customer Accounts', icon: Users },
    { key: 'coupons', label: 'Coupons & Vouchers', icon: Tag },
    { key: 'reviews', label: 'Customer Reviews', icon: Star },
    { key: 'settings', label: 'Store Settings', icon: Settings },
  ];

  const renderActiveTabContent = () => {
    switch (adminTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'products':
        return <AdminProducts />;
      case 'categories':
        return <AdminCategories />;
      case 'orders':
        return <AdminOrders />;
      case 'customers':
        return <AdminCustomers />;
      case 'coupons':
        return <AdminCoupons />;
      case 'reviews':
        return <AdminReviews />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex flex-col">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-black text-sm">
              BN
            </div>
            <div>
              <span className="font-black text-sm text-zinc-900 dark:text-white tracking-tight">
                BazaarNova <span className="text-orange-500 font-bold">Admin Console</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded font-semibold">
                v2.4 Production
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('home')}
            className="px-3.5 py-1.5 bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 hover:bg-orange-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-orange-200 dark:border-orange-900"
          >
            <Store className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Customer Store</span>
          </button>

          <button
            onClick={async () => {
              await adminLogout();
              setActiveView('home');
            }}
            className="px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-rose-200 dark:border-rose-900"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin Logout</span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.name}
              className="w-7 h-7 rounded-full object-cover border border-orange-500"
            />
            <div className="hidden md:block text-left text-xs leading-none">
              <p className="font-bold text-zinc-900 dark:text-white">{user?.name || 'Administrator'}</p>
              <span className="text-[10px] text-zinc-400">Master Admin</span>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Body (Sidebar + Content) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:flex w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-4 flex-col justify-between shrink-0">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-3 py-1.5 block">
              Management Modules
            </span>
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = adminTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setAdminTab(item.key as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Full Access Level</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Logged in as verified enterprise store operator.
            </p>
          </div>
        </aside>

        {/* Mobile Drawer */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <div className="relative w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-4 flex flex-col justify-between z-10">
              <div className="space-y-1">
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="font-bold text-xs text-zinc-900 dark:text-white">Admin Navigation</span>
                  <button onClick={() => setIsMobileSidebarOpen(false)}>
                    <X className="w-4 h-4 text-zinc-500" />
                  </button>
                </div>
                {NAV_ITEMS.map(item => {
                  const Icon = item.icon;
                  const isActive = adminTab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        setAdminTab(item.key as any);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-orange-600 text-white shadow-sm'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderActiveTabContent()}
        </main>
      </div>
    </div>
  );
};
