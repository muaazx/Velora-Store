import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, CheckCircle2, XCircle, X } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Coupon } from '../../types';
import { formatCurrency, formatDateTime } from '../../lib/utils';

export const AdminCoupons: React.FC = () => {
  const { success, error } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(50);
  const [maxDiscount, setMaxDiscount] = useState<number>(100);
  const [usageLimit, setUsageLimit] = useState<number>(500);
  const [expiresAt, setExpiresAt] = useState('2026-12-31');

  const fetchCoupons = async () => {
    try {
      const list = await api.getCoupons();
      setCoupons(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCoupon({
        code: code.toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount),
        maxDiscount: Number(maxDiscount),
        usageLimit: Number(usageLimit),
        expiresAt: new Date(expiresAt).toISOString(),
        isActive: true,
      });
      setIsModalOpen(false);
      setCode('');
      success('Voucher Created', `Code ${code.toUpperCase()} is now live`);
      await fetchCoupons();
    } catch (err: any) {
      error('Failed to create coupon', err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this coupon code?')) return;
    try {
      await api.deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
      success('Coupon Deleted');
    } catch (err: any) {
      error('Delete failed', err.message);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Promotional Vouchers & Coupons
          </h1>
          <p className="text-zinc-500">
            Create discount campaign codes, seasonal sales, and flash coupon promotions
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create New Voucher
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map(c => (
          <div
            key={c.id}
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 font-bold">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono font-black text-sm text-zinc-900 dark:text-white uppercase tracking-wider">
                    {c.code}
                  </span>
                  <span className="text-[10px] text-zinc-400 block">
                    {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `${formatCurrency(c.discountValue)} OFF`}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(c.id)}
                className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-1 text-zinc-600 dark:text-zinc-400 text-[11px]">
              <div className="flex justify-between">
                <span>Min. Spend:</span>
                <span className="font-bold text-zinc-900 dark:text-white">{formatCurrency(c.minOrderAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Redemptions:</span>
                <span className="font-bold text-zinc-900 dark:text-white">{c.usedCount} used</span>
              </div>
              <div className="flex justify-between">
                <span>Expires:</span>
                <span className="font-bold text-zinc-900 dark:text-white">{formatDateTime(c.expiresAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 z-10 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">Create Promo Voucher</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1 text-zinc-900 dark:text-zinc-100">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH25"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white uppercase font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-zinc-900 dark:text-zinc-100">Type</label>
                  <select
                    value={discountType}
                    onChange={e => setDiscountType(e.target.value as any)}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-zinc-900 dark:text-zinc-100">Value</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={discountValue}
                    onChange={e => setDiscountValue(Number(e.target.value))}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-zinc-900 dark:text-zinc-100">Min Spend ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderAmount}
                    onChange={e => setMinOrderAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-zinc-900 dark:text-zinc-100">Expiration Date</label>
                  <input
                    type="date"
                    required
                    value={expiresAt}
                    onChange={e => setExpiresAt(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-zinc-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 text-white font-bold rounded-xl"
                >
                  Launch Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
