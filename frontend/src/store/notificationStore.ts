import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
  id: number;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 1, type: 'success', title: 'Leave Approved', message: 'John Doe\'s leave request has been approved.', time: '2 min ago', read: false },
  { id: 2, type: 'info', title: 'New Employee Onboarded', message: 'Sarah Smith has completed onboarding.', time: '15 min ago', read: false },
  { id: 3, type: 'warning', title: 'Payroll Pending', message: 'Payroll for June needs your approval.', time: '1 hour ago', read: false },
  { id: 4, type: 'success', title: 'Report Generated', message: 'Monthly analytics report is ready.', time: '3 hours ago', read: false },
  { id: 5, type: 'info', title: 'Department Update', message: 'Engineering department structure has been updated.', time: '5 hours ago', read: false },
  { id: 6, type: 'warning', title: 'Leave Balance Low', message: 'Your annual leave balance is below 5 days.', time: '1 day ago', read: false },
];

interface NotificationState {
  notifications: Notification[];
  markAllAsRead: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: INITIAL_NOTIFICATIONS,
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      })),
      unreadCount: () => get().notifications.filter(n => !n.read).length,
    }),
    {
      name: 'notification-storage',
    }
  )
);
