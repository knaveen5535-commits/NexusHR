import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, UserCheck, UserCog, BarChart3, CalendarCheck,
  DollarSign, TrendingUp, Sparkles, ScrollText, Settings, Calendar,
  FileText, UserPlus, FileCheck, User, ChevronDown, LogOut, X, Menu,
  type LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useFilteredNav } from '../../hooks/useFilteredNav';
import { getNavForRole } from '../../data/navigation';
import { useTheme } from '../../hooks/useTheme';
import type { NavItem } from '../../types';

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard, Users, UserCheck, UserCog, BarChart3, CalendarCheck,
  DollarSign, TrendingUp, Sparkles, ScrollText, Settings, Calendar,
  FileText, UserPlus, FileCheck, User, ChevronDown, LogOut, X, Menu,
};

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ mobileOpen, onClose, collapsed }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navItems = getNavForRole(user?.role);
  const filteredNav = useFilteredNav(navItems, user?.role ?? null);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const { isDark } = useTheme();

  const toggleMenu = (name: string) => {
    setExpandedMenus((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const isActive = (href: string) => location.pathname === href;
  const isParentActive = (children: NavItem[] | undefined) =>
    children?.some((child) => child.href && isActive(child.href));

  const sidebarContent = (
    <div className={`flex h-full flex-col transition-colors duration-500 ${isDark ? 'bg-zinc-950' : 'bg-white'}`}>
      <div className={`flex h-16 items-center justify-between px-6 border-b transition-colors duration-500 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg border border-blue-500/30">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Nexus<span className="text-blue-500">HR</span></span>
          </Link>
        )}
        {collapsed && (
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg border border-blue-500/30 mx-auto">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
        {filteredNav.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const active = item.href ? isActive(item.href ?? '') : isParentActive(item.children);
          const expanded = expandedMenus.includes(item.name);

          if (item.children) {
            return (
              <div key={item.name} className="mb-1">
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${
                    active
                      ? isDark ? 'bg-blue-600/10 text-blue-400 shadow-sm' : 'bg-blue-50 text-blue-600 shadow-sm'
                      : isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.name}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
                <AnimatePresence>
                  {!collapsed && expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className={`ml-5 mt-1 space-y-1 border-l pl-3 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
                        {item.children.filter((c): c is typeof c & { href: string } => !!c.href).map((child) => {
                          const ChildIcon = iconMap[child.icon] || LayoutDashboard;
                          return (
                            <Link
                              key={child.name}
                              to={child.href}
                              onClick={onClose}
                              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                                isActive(child.href)
                                  ? isDark ? 'bg-blue-600/10 text-blue-400' : 'bg-blue-50 text-blue-600'
                                  : isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              <ChildIcon className="h-4 w-4 shrink-0" />
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          if (!item.href) return null;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all group ${
                active
                  ? isDark ? 'bg-blue-600/10 text-blue-400 shadow-sm' : 'bg-blue-50 text-blue-600 shadow-sm'
                  : isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <span className="flex-1">{item.name}</span>
              )}
              {!collapsed && item.badge && (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider uppercase shadow-sm ${
                  item.badge === 'AI' 
                    ? isDark ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : 'bg-purple-100 text-purple-600 border border-purple-200' 
                    : isDark ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'bg-blue-100 text-blue-600 border border-blue-200'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={`border-t p-4 transition-colors duration-500 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
        {!collapsed && user && (
          <div className={`flex items-center gap-3 p-3 rounded-xl mb-3 border transition-colors ${
            isDark ? 'bg-zinc-900/50 border-white/5' : 'bg-slate-50 border-slate-200/60'
          }`}>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 border border-blue-500/30 flex items-center justify-center shadow-md">
              <span className="text-sm font-bold text-white">{user.username.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.username}</p>
              <p className={`text-xs font-semibold capitalize ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition-all ${
            isDark ? 'text-zinc-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
          }`}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 288 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={`hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col border-r overflow-hidden transition-colors duration-500 ${
          isDark ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-white'
        }`}
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`fixed inset-y-0 left-0 z-50 w-72 border-r lg:hidden transition-colors duration-500 ${
                isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200'
              }`}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
