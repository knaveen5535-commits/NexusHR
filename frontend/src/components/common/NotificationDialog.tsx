import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { Bell, X, CheckCircle, Clock, AlertCircle, Info } from 'lucide-react';

import { useNotificationStore } from '../../store/notificationStore';

const typeConfig = {
  success: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  warning: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
};

interface NotificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDialog({ isOpen, onClose }: NotificationDialogProps) {
  const { isDark } = useTheme();
  const { notifications, markAllAsRead, unreadCount } = useNotificationStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className={`relative w-full max-w-lg max-h-[80vh] flex flex-col rounded-3xl shadow-2xl border overflow-hidden ${
              isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <Bell className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Notifications</h2>
                {unreadCount() > 0 && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-500'}`}>
                    {unreadCount()} new
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.map((notification) => {
                const config = typeConfig[notification.type as keyof typeof typeConfig];
                const Icon = config.icon;
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 rounded-2xl transition-colors ${
                      isDark ? 'hover:bg-zinc-900' : 'hover:bg-slate-50'
                    } ${notification.read ? (isDark ? 'opacity-60 bg-transparent' : 'opacity-70 bg-transparent') : (isDark ? 'bg-zinc-900/50' : 'bg-slate-50/50')}`}
                  >
                    <div className={`p-2 rounded-xl ${config.bg}`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {notification.title}
                      </p>
                      <p className={`text-sm mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <Clock className={`h-3 w-3 ${isDark ? 'text-zinc-600' : 'text-slate-400'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
                          {notification.time}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={`p-4 border-t flex gap-3 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
              <button
                onClick={markAllAsRead}
                disabled={unreadCount() === 0}
                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Mark All as Read
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
