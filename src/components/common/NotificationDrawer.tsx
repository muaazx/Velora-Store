import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, Check, Tag, Package, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { NotificationItem } from '../../types';
import { formatDateTime } from '../../lib/utils';

interface NotificationDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen = false, onClose = () => {} }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, setActiveView, setSelectedOrderId } = useStore();

  if (!isOpen) return null;

  const handleNotificationClick = (notif: NotificationItem) => {
    markNotificationAsRead(notif.id);
    if (notif.linkUrl) {
      if (notif.linkUrl.startsWith('/orders/')) {
        const orderId = notif.linkUrl.replace('/orders/', '');
        setSelectedOrderId(orderId);
        setActiveView('order-detail');
      } else if (notif.linkUrl.includes('flashSale')) {
        setActiveView('catalog');
      }
      onClose();
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'ORDER':
        return <Package className="w-4 h-4 text-sky-500" />;
      case 'DISCOUNT':
        return <Tag className="w-4 h-4 text-emerald-500" />;
      case 'PROMOTIONAL':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        />

        {/* Slide-over panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-sm bg-white dark:bg-zinc-900 h-full shadow-2xl border-l border-zinc-200 dark:border-zinc-800 flex flex-col z-10"
        >
          {/* Header */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Notifications</h3>
              <span className="px-1.5 py-0.5 text-xs bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400 font-semibold rounded-full">
                {notifications.filter(n => !n.isRead).length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {notifications.some(n => !n.isRead) && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-xs text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-zinc-400">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 transition-colors cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/60 ${
                    !n.isRead ? 'bg-orange-50/40 dark:bg-orange-950/10' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 block">
                        {formatDateTime(n.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
