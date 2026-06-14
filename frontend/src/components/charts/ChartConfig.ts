import { useTheme } from '../../hooks/useTheme';

export function useChartConfig() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return {
    textColor: isDark ? '#a1a1aa' : '#71717a',
    gridColor: isDark ? '#27272a' : '#e4e4e7',
    tooltip: {
      contentStyle: {
        backgroundColor: isDark ? '#18181b' : '#ffffff',
        border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
        borderRadius: '8px',
        color: isDark ? '#f4f4f5' : '#18181b',
      },
    },
  };
}
