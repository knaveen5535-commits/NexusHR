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

  const toggleMenu = (name: string) => {
    setExpandedMenus((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const isActive = (href: string) => location.pathname === href;
  const isParentActive = (children: NavItem[] | undefined) =>
    children?.some((child) => child.href && isActive(child.href));

  const sidebarContent = (
    <div className="flex h-full flex-col bg-zinc-950">
      <div className="flex h-16 items-center justify-between px-6 border-b border-zinc-800">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-sm font-bold text-white">N</span>
            </div>
            <span className="text-xl font-bold text-white">Nexus<span className="text-blue-400">HR</span></span>
          </Link>
        )}
        {collapsed && (
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center mx-auto">
            <span className="text-sm font-bold text-white">N</span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {filteredNav.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const active = item.href ? isActive(item.href ?? '') : isParentActive(item.children);
          const expanded = expandedMenus.includes(item.name);

          if (item.children) {
            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? 'bg-blue-600/10 text-blue-400'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
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
                      <div className="ml-4 mt-1 space-y-1 border-l border-zinc-800 pl-3">
                        {item.children.filter((c): c is typeof c & { href: string } => !!c.href).map((child) => {
                          const ChildIcon = iconMap[child.icon] || LayoutDashboard;
                          return (
                            <Link
                              key={child.name}
                              to={child.href}
                              onClick={onClose}
                              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                                isActive(child.href)
                                  ? 'bg-blue-600/10 text-blue-400'
                                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
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
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group ${
                active
                  ? 'bg-blue-600/10 text-blue-400'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <span className="flex-1">{item.name}</span>
              )}
              {!collapsed && item.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  item.badge === 'AI' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-3">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <span className="text-sm font-semibold text-blue-400">{user.username.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.username}</p>
              <p className="text-xs text-zinc-500 capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
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
        animate={{ width: collapsed ? 72 : 288 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col border-r border-zinc-800 bg-zinc-950 overflow-hidden"
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
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-zinc-950 border-r border-zinc-800 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
