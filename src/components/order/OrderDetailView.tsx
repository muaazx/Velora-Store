import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  Printer,
  XCircle,
  ShieldCheck,
  Building,
  Check
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { Order, OrderTimelineEvent } from '../../types';
import { formatCurrency, formatDateTime } from '../../lib/utils';

export const OrderDetailView: React.FC = () => {
  const { selectedOrderId, setActiveView, navigateToProduct } = useStore();
  const { success, error } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!selectedOrderId) return;
      setIsLoading(true);
      try {
        const data = await api.getOrderById(selectedOrderId);
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [selectedOrderId]);

  if (!order && !isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Package className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
        <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200">Order Not Found</h2>
        <button
          onClick={() => setActiveView('orders')}
          className="mt-4 px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-lg"
        >
          Return to Orders
        </button>
      </div>
    );
  }

  const handleCancelOrder = async () => {
    if (!order) return;
    try {
      const updated = await api.cancelOrder(order.id, cancelReason || 'Customer requested cancellation');
      setOrder(updated);
      setIsCancelModalOpen(false);
      success('Order Cancelled', 'Your order was cancelled successfully and refunded.');
    } catch (err: any) {
      error('Could not cancel order', err.message);
    }
  };

  // 7 standard milestone stages
  const STAGES = [
    { title: 'Order Placed', desc: 'Order confirmed and authorized' },
    { title: 'Confirmed', desc: 'Verified by merchant' },
    { title: 'Processing', desc: 'Item allocated at fulfilment center' },
    { title: 'Packed', desc: 'Quality inspected and parcel sealed' },
    { title: 'Shipped', desc: 'Handed over to carrier courier' },
    { title: 'Out for Delivery', desc: 'Courier out for doorstep dropoff' },
    { title: 'Delivered', desc: 'Package signed and received' },
  ];

  const getStageIndex = (status: string) => {
    switch (status) {
      case 'PENDING': return 0;
      case 'CONFIRMED': return 1;
      case 'PROCESSING': return 2;
      case 'PACKED': return 3;
      case 'SHIPPED': return 4;
      case 'OUT_FOR_DELIVERY': return 5;
      case 'DELIVERED': return 6;
      default: return 0;
    }
  };

  const currentStageIndex = order ? getStageIndex(order.status) : 0;
  const isCancelled = order?.status === 'CANCELLED' || order?.status === 'REFUNDED';
  const canCancel = order && ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('orders')}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Order #{order?.orderNumber}
            </h1>
            <p className="text-xs text-zinc-500">
              Placed on {order && formatDateTime(order.createdAt)} • {order?.items.length} item(s)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canCancel && (
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="px-3 py-2 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-bold transition-colors"
            >
              Cancel Order
            </button>
          )}

          <button
            onClick={() => setIsInvoiceModalOpen(true)}
            className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-zinc-800 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Receipt / Invoice
          </button>
        </div>
      </div>

      {/* Interactive Delivery Tracker Timeline Card */}
      {order && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 space-y-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Live Shipment Progress
              </span>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                {isCancelled ? 'Order Cancelled' : `Status: ${order.status.replace(/_/g, ' ')}`}
              </h2>
            </div>
            {order.trackingNumber && (
              <div className="text-xs text-right">
                <span className="text-zinc-400 block text-[11px]">Carrier Airway Bill #</span>
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                  {order.trackingNumber}
                </span>
              </div>
            )}
          </div>

          {/* Stepper Dots Bar */}
          {!isCancelled ? (
            <div className="relative py-4">
              {/* Progress Line */}
              <div className="hidden md:block absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full z-0">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full transition-all duration-700"
                  style={{
                    width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%`,
                  }}
                />
              </div>

              {/* Stage Points */}
              <div className="grid grid-cols-2 md:grid-cols-7 gap-4 relative z-10">
                {STAGES.map((stage, idx) => {
                  const isDone = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div key={stage.title} className="flex flex-col md:items-center text-left md:text-center space-y-1.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                          isCurrent
                            ? 'bg-orange-500 text-white ring-4 ring-orange-500/20 scale-110'
                            : isDone
                            ? 'bg-emerald-500 text-white'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-300 dark:border-zinc-700'
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${isDone ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`}>
                          {stage.title}
                        </p>
                        <p className="text-[10px] text-zinc-400 hidden md:block">
                          {stage.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <div>
                <p className="font-bold">This order was cancelled and payment reversed.</p>
                <p className="text-[11px]">Refunds typically reflect in 2-4 business days.</p>
              </div>
            </div>
          )}

          {/* Timeline Events Log */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Detailed Activity Log
              </h3>
              <div className="space-y-2">
                {order.timeline.map(t => (
                  <div key={t.id} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {t.status.replace(/_/g, ' ')} - <span className="font-normal text-zinc-600 dark:text-zinc-400">{t.message}</span>
                      </p>
                      <p className="text-[10px] text-zinc-400">{formatDateTime(t.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Details & Summary Grid */}
      {order && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs">
          {/* Items Table (8 cols) */}
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 space-y-4 shadow-xs">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider pb-3 border-b border-zinc-100 dark:border-zinc-800">
              Purchased Products ({order.items.length})
            </h3>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {order.items.map(item => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div
                    onClick={() => navigateToProduct(item.productId)}
                    className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                  >
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-14 h-14 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate hover:text-orange-600 transition-colors">
                        {item.productName}
                      </p>
                      {item.variant && (
                        <span className="text-[10px] text-zinc-400 block">
                          Variant: {item.variant}
                        </span>
                      )}
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {formatCurrency(item.price)} x {item.quantity}
                      </p>
                    </div>
                  </div>

                  <span className="font-black text-zinc-900 dark:text-white text-sm">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Payment Summary (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Delivery Destination */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 space-y-3 shadow-xs">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                Shipping Destination
              </h3>
              <div className="text-zinc-600 dark:text-zinc-400 space-y-1">
                <p className="font-bold text-zinc-900 dark:text-white">{(order.shippingAddress || order.address)?.fullName}</p>
                <p>{(order.shippingAddress || order.address)?.street}</p>
                <p>{(order.shippingAddress || order.address)?.city}, {(order.shippingAddress || order.address)?.state} {(order.shippingAddress || order.address)?.postalCode}</p>
                <p>{(order.shippingAddress || order.address)?.country}</p>
                <p className="text-zinc-400 pt-1">Contact: {(order.shippingAddress || order.address)?.phone}</p>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 space-y-3 shadow-xs">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-500" />
                Payment Breakdown
              </h3>
              <div className="space-y-2 text-zinc-600 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>Payment Gateway</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Voucher Promo ({order.couponCode})</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span>{order.shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : formatCurrency(order.shippingFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-zinc-200 dark:border-zinc-700 text-sm font-black text-zinc-900 dark:text-white">
                  <span>Total Paid</span>
                  <span className="text-base text-orange-600">{formatCurrency(order.total ?? order.totalAmount ?? 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCancelModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 z-10 space-y-4 text-xs">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              Cancel Order #{order?.orderNumber}
            </h3>
            <p className="text-zinc-500">
              Are you sure you want to cancel this order? An automatic full refund will be processed immediately.
            </p>
            <div>
              <label className="block font-semibold mb-1">Reason for cancellation (Optional)</label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="e.g. Changed mind, ordered duplicate, delivery time too long..."
                className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 text-zinc-500 font-semibold"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-sm"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {isInvoiceModalOpen && order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsInvoiceModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-8 z-10 space-y-6 text-xs overflow-y-auto max-h-[90vh]">
            {/* Invoice Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-zinc-900 dark:text-white">
                  Bazaar<span className="text-orange-500">Nova</span> Invoice
                </h2>
                <p className="text-zinc-400 text-[11px]">Official Tax Receipt & Packing Slip</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-zinc-900 dark:text-white">Invoice #: INV-{order.orderNumber}</p>
                <p className="text-zinc-400 text-[11px]">{formatDateTime(order.createdAt)}</p>
              </div>
            </div>

            {/* Bill To & Ship To */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-bold text-zinc-400 uppercase text-[10px]">Billed To:</p>
                <p className="font-bold text-zinc-900 dark:text-white">{order.shippingAddress.fullName}</p>
                <p className="text-zinc-500">{order.shippingAddress.street}</p>
                <p className="text-zinc-500">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-zinc-400 uppercase text-[10px]">Payment Summary:</p>
                <p className="font-bold text-zinc-900 dark:text-white">Gateway: {order.paymentMethod}</p>
                <p className="text-emerald-600 font-semibold">Payment Status: PAID</p>
              </div>
            </div>

            {/* Table */}
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left font-bold text-zinc-500">
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {order.items.map(item => (
                  <tr key={item.id}>
                    <td className="py-2 font-medium">{item.productName}</td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right">{formatCurrency(item.price)}</td>
                    <td className="py-2 text-right font-bold">{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="w-64 space-y-1.5 text-right">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-500">
                  <span>Shipping:</span>
                  <span>{formatCurrency(order.shippingFee)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Tax:</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-zinc-900 dark:text-white pt-2 border-t">
                  <span>Total Paid:</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setIsInvoiceModalOpen(false)}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold"
              >
                Print Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
