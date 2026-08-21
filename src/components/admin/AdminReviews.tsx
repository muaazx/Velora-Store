import React, { useState, useEffect } from 'react';
import { Star, Trash2, CheckCircle2, ShieldCheck, MessageSquare } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Review } from '../../types';
import { formatDateTime } from '../../lib/utils';

export const AdminReviews: React.FC = () => {
  const { success, error } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const list = await api.getReviews();
      setReviews(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this customer review?')) return;
    try {
      await api.deleteReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      success('Review Removed');
    } catch (err: any) {
      error('Delete failed', err.message);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      <div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
          Ratings & Review Moderation
        </h1>
        <p className="text-zinc-500">
          Monitor verified customer feedback, satisfaction scores, and product ratings
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Rating</th>
              <th className="py-3 px-4">Review Content</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
            {reviews.map(r => (
              <tr key={r.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <img
                      src={r.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                      alt={r.user?.name}
                      className="w-8 h-8 rounded-full object-cover border"
                    />
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-white">{r.user?.name || 'Customer'}</p>
                      {r.isVerifiedPurchase && (
                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Verified Buyer
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4">
                  <div className="flex items-center text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                    <span>{r.rating}.0</span>
                  </div>
                </td>

                <td className="py-3 px-4 max-w-sm">
                  <p className="font-semibold text-zinc-900 dark:text-white">{r.title}</p>
                  <p className="text-zinc-500 text-[11px] line-clamp-2 mt-0.5">{r.comment}</p>
                </td>

                <td className="py-3 px-4 text-zinc-400">
                  {formatDateTime(r.createdAt)}
                </td>

                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    title="Delete Review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
