import React, { createContext, useContext, useCallback } from 'react';
import toast, { Toaster, ToastOptions } from 'react-hot-toast';
import { useTheme } from './ThemeContext';

export type NotificationType = 'success' | 'error' | 'info' | 'loading';

interface NotificationContextType {
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  loading: (message: string, options?: ToastOptions) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  const success = useCallback(
    (message: string, options?: ToastOptions) => {
      toast.success(message, {
        style: {
          background: isDark ? '#1f2937' : '#ffffff',
          color: isDark ? '#f3f4f6' : '#111827',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        },
        ...options,
      });
    },
    [isDark]
  );

  const error = useCallback(
    (message: string, options?: ToastOptions) => {
      toast.error(message, {
        style: {
          background: isDark ? '#1f2937' : '#ffffff',
          color: isDark ? '#f3f4f6' : '#111827',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        },
        ...options,
      });
    },
    [isDark]
  );

  const info = useCallback(
    (message: string, options?: ToastOptions) => {
      toast(message, {
        icon: 'ℹ️',
        style: {
          background: isDark ? '#1f2937' : '#ffffff',
          color: isDark ? '#f3f4f6' : '#111827',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        },
        ...options,
      });
    },
    [isDark]
  );

  const loading = useCallback(
    (message: string, options?: ToastOptions) => {
      return toast.loading(message, {
        style: {
          background: isDark ? '#1f2937' : '#ffffff',
          color: isDark ? '#f3f4f6' : '#111827',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        },
        ...options,
      });
    },
    [isDark]
  );

  const value = { success, error, info, loading };

  return (
    <NotificationContext.Provider value={value}>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: isDark ? '#1f2937' : '#ffffff',
            color: isDark ? '#f3f4f6' : '#111827',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          },
        }}
      />
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (context === undefined)
    throw new Error('useNotification must be used within a NotificationProvider');

  return context;
};
