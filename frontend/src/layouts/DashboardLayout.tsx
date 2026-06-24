import { useState } from 'react';
import { Outlet } from 'react-router';
import Sidebar from '../components/common/Sidebar';
import { Menu, Moon, Sun, Bell } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import { motion } from 'framer-motion';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuthStore();
  const { isDark, toggle } = useTheme();

  return (
    <div className={`flex h-screen w-full overflow-hidden transition-colors duration-500 ${isDark ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Sidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <header className={`sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b px-4 sm:px-6 transition-colors duration-500 backdrop-blur-xl ${
          isDark ? 'border-zinc-800 bg-zinc-950/80' : 'border-slate-200 bg-white/80'
        }`}>
          <button
            type="button"
            className={`lg:hidden -ml-2 p-2 rounded-md transition-colors ${
              isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <button
            type="button"
            className={`hidden lg:flex -ml-2 p-2 rounded-md transition-colors ${
              isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            onClick={() => setCollapsed(!collapsed)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex flex-1 justify-end items-center gap-4">
            
            {/* Animated Theme Toggle matching Login Page */}
            <button
              onClick={toggle}
              className={`relative flex h-8 w-16 items-center rounded-full p-1 transition-colors duration-500 ease-in-out border ${
                isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-300 border-slate-200'
              }`}
              aria-label="Toggle theme"
            >
              <motion.div
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md"
                animate={{
                  x: isDark ? 32 : 0,
                  rotate: isDark ? 360 : 0,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                {isDark ? (
                  <Moon className="h-3 w-3 text-zinc-800" />
                ) : (
                  <Sun className="h-3 w-3 text-amber-500" />
                )}
              </motion.div>
            </button>

            <button className={`relative p-2 rounded-lg transition-colors ${
              isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}>
              <Bell className="h-5 w-5" />
              <span className={`absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ${isDark ? 'ring-zinc-950' : 'ring-white'}`} />
            </button>

            <div className={`flex items-center gap-3 pl-4 border-l transition-colors ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 border border-blue-500/30 flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold text-white shadow-sm">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.username || 'User'}</p>
                <p className={`text-xs font-semibold capitalize ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>{user?.role || 'User'}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
