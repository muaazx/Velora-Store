import React, { useState, useEffect } from 'react';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Edit,
  X
} from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import { formatCurrency, formatDateTime } from '../../lib/utils';

export const AdminOrders: React.FC = () => {
  const { setSelectedOrderId, setActiveView } = useStore();
  const { success, error } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Tracking modal
  const [trackingModalOrder, setTrackingModalOrder] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const list = await api.getOrders();
      setOrders(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, status);
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, status } : o))
      );
      success('Status Updated', `Order marked as ${status}`);
    } catch (err: any) {
      error('Update failed', err.message);
    }
  };

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingModalOrder) return;
    try {
      await api.updateOrderTracking(trackingModalOrder.id, trackingNumber);
      setOrders(prev =>
        prev.map(o => (o.id === trackingModalOrder.id ? { ...o, trackingNumber } : o))
      );
      setTrackingModalOrder(null);
      success('Airway Tracking Saved', `Tracking number ${trackingNumber} dispatched`);
    } catch (err: any) {
      error('Failed to update tracking', err.message);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (filterStatus !== 'ALL' && o.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.shippingAddress?.fullName?.toLowerCase().includes(q) ||
        o.items.some(i => i.productName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Order Fulfillment & Dispatch
          </h1>
          <p className="text-zinc-500">
            Process incoming orders, assign carrier tracking codes, and update delivery states
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by order #, recipient, or item name..."
            className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs dark:text-white focus:outline-none"
          />
        </div>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold cursor-pointer dark:text-white"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PROCESSING">Processing</option>
          <option value="PACKED">Packed</option>
          <option value="SHIPPED">Shipped</option>
          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Products</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Workflow Status</th>
                <th className="py-3 px-4">Tracking</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
              {filteredOrders.map(o => (
                <tr key={o.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                  <td className="py-3 px-4">
                    <span className="font-bold text-zinc-900 dark:text-white block">
                      #{o.orderNumber}
                    </span>
                    <span className="text-[10px] text-zinc-400">{formatDateTime(o.createdAt)}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-zinc-900 dark:text-white block">
                      {o.shippingAddress?.fullName}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {o.shippingAddress?.city}, {o.shippingAddress?.state}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {o.items.length} item(s)
                    </span>
                    <p className="text-[10px] text-zinc-400 truncate max-w-[140px]">
                      {o.items.map(i => i.productName).join(', ')}
                    </p>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-black text-zinc-900 dark:text-white">
                      {formatCurrency(o.total)}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded font-semibold text-[10px] text-zinc-700 dark:text-zinc-300">
                      {o.paymentMethod}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <select
                      value={o.status}
                      onChange={e => handleStatusChange(o.id, e.target.value as OrderStatus)}
                      className="p-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold cursor-pointer dark:text-white"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="PACKED">Packed</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="REFUNDED">Refunded</option>
                    </select>
                  </td>

                  <td className="py-3 px-4">
                    {o.trackingNumber ? (
                      <span className="font-mono text-[11px] font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                        <Truck className="w-3 h-3" /> {o.trackingNumber}
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setTrackingModalOrder(o);
                          setTrackingNumber(`TRK-${Math.floor(10000000 + Math.random() * 90000000)}`);
                        }}
                        className="text-[11px] text-orange-600 hover:underline font-bold"
                      >
                        + Assign Tracking
                      </button>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedOrderId(o.id);
                        setActiveView('order-detail');
                      }}
                      className="p-1.5 text-zinc-500 hover:text-orange-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Tracking Modal */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setTrackingModalOrder(null)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 z-10 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                Assign Carrier Tracking #{trackingModalOrder.orderNumber}
              </h3>
              <button onClick={() => setTrackingModalOrder(null)}>
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>

            <form onSubmit={handleSaveTracking} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1 text-zinc-900 dark:text-zinc-100">Carrier Tracking / Airway Bill</label>
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={e => setTrackingNumber(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTrackingModalOrder(null)}
                  className="px-4 py-2 text-zinc-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 text-white font-bold rounded-xl"
                >
                  Save & Notify Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
