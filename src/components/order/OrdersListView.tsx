import React, { useState, useEffect } from 'react';
import { Package, Search, ChevronRight, Truck, Clock, CheckCircle2, XCircle, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { api } from '../../lib/api';
import { Order, OrderStatus } from '../../types';
import { formatCurrency, formatDateTime } from '../../lib/utils';

export const OrdersListView: React.FC = () => {
  const { user } = useAuth();
  const { setActiveView, setSelectedOrderId, navigateToProduct } = useStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [activeStatusTab, setActiveStatusTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const userId = user?.id || 'user-cust-1';

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const list = await api.getOrders(userId);
        setOrders(list);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [userId]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full text-[11px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Delivered
          </span>
        );
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return (
          <span className="px-2.5 py-1 bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 rounded-full text-[11px] font-bold flex items-center gap-1">
            <Truck className="w-3 h-3" /> In Transit
          </span>
        );
      case 'PROCESSING':
      case 'PACKED':
      case 'CONFIRMED':
        return (
          <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-full text-[11px] font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" /> Processing
          </span>
        );
      case 'CANCELLED':
      case 'REFUNDED':
        return (
          <span className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-full text-[11px] font-bold flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full text-[11px] font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeStatusTab !== 'ALL') {
      if (activeStatusTab === 'IN_TRANSIT' && order.status !== 'SHIPPED' && order.status !== 'OUT_FOR_DELIVERY') return false;
      if (activeStatusTab === 'PROCESSING' && !['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED'].includes(order.status)) return false;
      if (activeStatusTab === 'DELIVERED' && order.status !== 'DELIVERED') return false;
      if (activeStatusTab === 'CANCELLED' && !['CANCELLED', 'REFUNDED'].includes(order.status)) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = order.orderNumber.toLowerCase().includes(q);
      const matchProduct = order.items.some(i => i.productName.toLowerCase().includes(q));
      return matchNumber || matchProduct;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            My Orders & Tracking
          </h1>
          <p className="text-xs text-zinc-500">
            View real-time dispatch progress, delivery histories, and invoices
          </p>
        </div>

        {/* Search bar */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by Order # or item name..."
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 dark:text-white shadow-xs"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl overflow-x-auto text-xs font-bold">
        {[
          { key: 'ALL', label: 'All Orders' },
          { key: 'PROCESSING', label: 'Processing' },
          { key: 'IN_TRANSIT', label: 'In Transit' },
          { key: 'DELIVERED', label: 'Delivered' },
          { key: 'CANCELLED', label: 'Cancelled' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveStatusTab(tab.key)}
            className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeStatusTab === tab.key
                ? 'bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-zinc-400">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center space-y-3">
          <Package className="w-12 h-12 text-zinc-300 mx-auto" />
          <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-200">No Orders Found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {searchQuery ? 'No orders match your search keyword.' : 'You have not placed any orders yet.'}
          </p>
          <button
            onClick={() => setActiveView('catalog')}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 space-y-4 shadow-xs hover:border-orange-300 dark:hover:border-orange-500 transition-all text-xs"
            >
              {/* Top Order Meta */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-zinc-900 dark:text-white">
                      Order #{order.orderNumber}
                    </span>
                    <p className="text-[11px] text-zinc-400">Placed on {formatDateTime(order.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                  <span className="font-black text-sm text-zinc-900 dark:text-white">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>

              {/* Items in order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {order.items.map(item => (
                  <div
                    key={item.id}
                    onClick={() => navigateToProduct(item.productId)}
                    className="flex items-center gap-3 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-orange-50/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-12 h-12 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate text-[11px]">
                        {item.productName}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        Qty: {item.quantity} • {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
                  <Truck className="w-3.5 h-3.5 text-orange-500" />
                  <span>
                    {order.trackingNumber ? `Carrier Tracking: ${order.trackingNumber}` : 'Tracking generated upon dispatch'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedOrderId(order.id);
                      setActiveView('order-detail');
                    }}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <span>Track & Manage Order</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
