import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { OrderStatus } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount?: number | null, currencySymbol = '$'): string {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `${currencySymbol}${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function getOrderStatusBadge(status: OrderStatus): { bg: string; text: string; label: string } {
  switch (status) {
    case 'PENDING':
      return { bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-400', label: 'Pending' };
    case 'CONFIRMED':
      return { bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-400', label: 'Confirmed' };
    case 'PROCESSING':
      return { bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800', text: 'text-indigo-700 dark:text-indigo-400', label: 'Processing' };
    case 'PACKED':
      return { bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800', text: 'text-purple-700 dark:text-purple-400', label: 'Packed' };
    case 'SHIPPED':
      return { bg: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800', text: 'text-cyan-700 dark:text-cyan-400', label: 'Shipped' };
    case 'OUT_FOR_DELIVERY':
      return { bg: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800', text: 'text-teal-700 dark:text-teal-400', label: 'Out for Delivery' };
    case 'DELIVERED':
      return { bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-400', label: 'Delivered' };
    case 'CANCELLED':
      return { bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800', text: 'text-rose-700 dark:text-rose-400', label: 'Cancelled' };
    case 'REFUNDED':
      return { bg: 'bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700', text: 'text-gray-700 dark:text-zinc-300', label: 'Refunded' };
    default:
      return { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-700', label: status };
  }
}
