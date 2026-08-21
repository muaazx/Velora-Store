import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Truck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { api } from '../../lib/api';
import { useStore } from '../../context/StoreContext';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { OrderStatus } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { setAdminTab, setSelectedOrderId, setActiveView } = useStore();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const data = await api.getAdminDashboardStats();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading || !stats) {
    return <div className="p-8 text-center text-xs text-zinc-400">Loading metrics...</div>;
  }

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, status);
      const data = await api.getAdminDashboardStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Top Welcome & Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Store Performance Overview
          </h1>
          <p className="text-zinc-500">
            Real-time telemetry on revenue, customer orders, and warehouse inventory
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold rounded-lg border border-emerald-200 dark:border-emerald-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Marketplace Active
          </span>
        </div>
      </div>

      {/* KPI Cards (4 grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-zinc-400 uppercase tracking-wider text-[11px]">Total Revenue</span>
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-zinc-900 dark:text-white">
              {formatCurrency(stats.totalRevenue)}
            </span>
            <span className="text-emerald-600 font-bold flex items-center text-[11px]">
              <ArrowUpRight className="w-3 h-3" /> +18.4%
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">All-time settled customer orders</p>
        </div>

        {/* Total Orders */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-zinc-400 uppercase tracking-wider text-[11px]">Total Orders</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-zinc-900 dark:text-white">
              {stats.totalOrders}
            </span>
            <span className="text-emerald-600 font-bold flex items-center text-[11px]">
              <ArrowUpRight className="w-3 h-3" /> +12% this week
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">Average Order Value: {formatCurrency(stats.averageOrderValue)}</p>
        </div>

        {/* Total Customers */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-zinc-400 uppercase tracking-wider text-[11px]">Active Buyers</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-zinc-900 dark:text-white">
              {stats.totalCustomers}
            </span>
            <span className="text-emerald-600 font-bold flex items-center text-[11px]">
              <ArrowUpRight className="w-3 h-3" /> 99.2% retention
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">Registered consumer profiles</p>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-zinc-400 uppercase tracking-wider text-[11px]">Catalog Stock</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-zinc-900 dark:text-white">
              {stats.totalProducts} items
            </span>
            {(stats.lowStockProducts?.length || 0) > 0 && (
              <span className="text-amber-600 font-bold flex items-center gap-1 text-[11px]">
                <AlertTriangle className="w-3 h-3" /> {stats.lowStockProducts.length} low stock
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-400">Published live products</p>
        </div>
      </div>

      {/* Two Columns: Recent Orders + Low Stock / Top Selling */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders Triage (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h2 className="font-bold text-sm text-zinc-900 dark:text-white">Recent Customer Orders</h2>
              <p className="text-zinc-400 text-[11px]">Instant dispatch actions</p>
            </div>
            <button
              onClick={() => setAdminTab('orders')}
              className="text-xs text-orange-600 dark:text-orange-400 font-bold hover:underline"
            >
              View All Orders
            </button>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {(stats.recentOrders || []).map((order: any) => (
              <div key={order.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 dark:text-white">#{order.orderNumber}</span>
                    <span className="text-zinc-400">• {(order.items || []).length} items</span>
                  </div>
                  <p className="text-zinc-500 text-[11px]">
                    Customer: {order.shippingAddress?.fullName || order.address?.fullName || order.user?.name || 'Customer'} • {formatDateTime(order.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-black text-zinc-900 dark:text-white">
                    {formatCurrency(order.totalAmount ?? order.total ?? 0)}
                  </span>
                  {/* Quick status stepper dropdown */}
                  <select
                    value={order.status}
                    onChange={e => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                    className="p-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-[11px] font-semibold cursor-pointer"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="PACKED">Packed</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="OUT_FOR_DELIVERY">Out for Deliv.</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock & Best Sellers Leaderboard (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Low Stock Alerts */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Inventory Restock Alerts
              </h2>
              <button
                onClick={() => setAdminTab('products')}
                className="text-xs text-orange-600 font-bold hover:underline"
              >
                Inventory
              </button>
            </div>

            {(!stats.lowStockProducts || stats.lowStockProducts.length === 0) ? (
              <p className="text-zinc-400 py-3 text-center">All inventory levels healthy.</p>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {stats.lowStockProducts.map((p: any) => (
                  <div key={p.id} className="py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={p.thumbnail} alt={p.name} className="w-8 h-8 rounded object-cover" />
                      <span className="font-medium truncate max-w-[140px] text-zinc-800 dark:text-zinc-200">
                        {p.name}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 font-black rounded text-[11px]">
                      Only {p.quantity} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="p-5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 space-y-3">
            <h3 className="font-bold text-sm text-indigo-950 dark:text-indigo-200">Admin Fast Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAdminTab('products')}
                className="p-2.5 bg-white dark:bg-zinc-800 rounded-xl font-bold text-zinc-800 dark:text-zinc-200 shadow-xs hover:bg-zinc-50 flex items-center justify-center gap-1.5"
              >
                <Package className="w-3.5 h-3.5 text-orange-500" />
                Add Product
              </button>
              <button
                onClick={() => setAdminTab('coupons')}
                className="p-2.5 bg-white dark:bg-zinc-800 rounded-xl font-bold text-zinc-800 dark:text-zinc-200 shadow-xs hover:bg-zinc-50 flex items-center justify-center gap-1.5"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                New Voucher
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
