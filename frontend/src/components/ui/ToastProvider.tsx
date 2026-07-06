import { Toaster } from 'sonner';
import { useThemeStore } from '../../hooks/useTheme';

export default function ToastProvider() {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: isDark ? '#18181b' : '#ffffff',
          border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
          color: isDark ? '#f4f4f5' : '#0f172a',
          borderRadius: '0.75rem',
        },
      }}
    />
  );
}
