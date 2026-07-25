import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, UserCheck, UserCog, BarChart3, CalendarCheck,
  DollarSign, TrendingUp, Sparkles, ScrollText, Settings, Calendar,
  FileText, UserPlus, FileCheck, User, ChevronDown, LogOut, X, Menu,
  Badge, Building, Shield, Brain,
  type LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useFilteredNav } from '../../hooks/useFilteredNav';
import { getNavForRole } from '../../data/navigation';
import { useTheme } from '../../hooks/useTheme';
import { getAllResignations } from '../../services/resignation.service';
import { leaveService } from '../../services/leave.service';
import { getPendingProfileRequests } from '../../services/employee.service';
import type { NavItem } from '../../types';

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard, Users, UserCheck, UserCog, BarChart3, CalendarCheck,
  DollarSign, TrendingUp, Sparkles, ScrollText, Settings, Calendar,
  FileText, UserPlus, FileCheck, User, ChevronDown, LogOut, X, Menu,
  Badge, Building, Shield, Brain
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [pendingResignationsCount, setPendingResignationsCount] = useState(0);
  const [pendingLeavesCount, setPendingLeavesCount] = useState(0);
  const [pendingProfileRequestsCount, setPendingProfileRequestsCount] = useState(0);
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchCounts = () => {
      if (user?.role === 'ADMIN' || user?.role === 'HR') {
        getAllResignations()
          .then(data => {
            setPendingResignationsCount(data.filter(r => r.status === 'PENDING').length);
          })
          .catch(() => {});
          
        leaveService.getAllRequests()
          .then(data => {
            setPendingLeavesCount(data.filter(r => r.status === 'PENDING').length);
          })
          .catch(() => {});
          
        getPendingProfileRequests()
          .then(data => setPendingProfileRequestsCount(data.length))
          .catch(() => {});
      } else if (user?.role === 'MANAGER') {
        leaveService.getTeamRequests()
          .then(data => {
            setPendingLeavesCount(data.filter(r => r.status === 'PENDING').length);
          })
          .catch(() => {});
          
        getPendingProfileRequests()
          .then(data => setPendingProfileRequestsCount(data.length))
          .catch(() => {});
      }
    };

    fetchCounts();

    window.addEventListener('leave-requests-updated', fetchCounts);
    window.addEventListener('profile-requests-updated', fetchCounts);
    return () => {
      window.removeEventListener('leave-requests-updated', fetchCounts);
      window.removeEventListener('profile-requests-updated', fetchCounts);
    };
  }, [user]);

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
      <div className={`flex h-16 items-center px-6 border-b transition-colors duration-500 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
        <Link to="/" className="flex items-center gap-2 overflow-hidden w-full">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg border border-blue-500/30 shrink-0">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className={`text-xl font-bold whitespace-nowrap overflow-hidden ${isDark ? 'text-white' : 'text-slate-900'}`}
              >
                Nexus<span className="text-blue-500">HR</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-6 space-y-1">
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
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="flex flex-1 items-center justify-between overflow-hidden whitespace-nowrap"
                      >
                        <span className="text-left">{item.name}</span>
                        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                        {item.children.filter((c): c is NavItem & { href: string } => !!c.href).map((child) => {
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
                              <span className="whitespace-nowrap overflow-hidden">{child.name}</span>
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
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex-1 overflow-hidden whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {!collapsed && item.name === 'Resignations' && pendingResignationsCount > 0 ? (
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider shadow-sm shrink-0 ${
                      isDark ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-red-100 text-red-600 border border-red-200'
                    }`}
                  >
                    {pendingResignationsCount} NEW
                  </motion.span>
                ) : !collapsed && item.name === 'Leave Approvals' && pendingLeavesCount > 0 ? (
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider uppercase shadow-sm shrink-0 ${
                      isDark ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'bg-blue-100 text-blue-600 border border-blue-200'
                    }`}
                  >
                    {pendingLeavesCount}
                  </motion.span>
                ) : !collapsed && item.name === 'Profile Approvals' && pendingProfileRequestsCount > 0 ? (
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider uppercase shadow-sm shrink-0 ${
                      isDark ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : 'bg-amber-100 text-amber-600 border border-amber-200'
                    }`}
                  >
                    {pendingProfileRequestsCount}
                  </motion.span>
                ) : !collapsed && item.badge && item.name !== 'Leave Approvals' && item.name !== 'Profile Approvals' ? (
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider uppercase shadow-sm shrink-0 ${
                      item.badge === 'AI' 
                        ? isDark ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : 'bg-purple-100 text-purple-600 border border-purple-200' 
                        : isDark ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'bg-blue-100 text-blue-600 border border-blue-200'
                    }`}
                  >
                    {item.badge}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      <div className={`border-t p-4 transition-colors duration-500 flex flex-col gap-3 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
        <AnimatePresence>
          {!collapsed && user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                isDark ? 'bg-zinc-900/50 border-white/5' : 'bg-slate-50 border-slate-200/60'
              }`}>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 border border-blue-500/30 flex items-center justify-center shadow-md overflow-hidden shrink-0">
                  {(user as any).profilePhotoUrl ? (
                    <img src={(user as any).profilePhotoUrl} alt="DP" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-white">{user.username.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.username}</p>
                  <p className={`text-xs font-semibold capitalize ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>{user.role}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setShowLogoutModal(true)}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition-all ${
            isDark ? 'text-zinc-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
          }`}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
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

      {/* Logout Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className={`relative w-full max-w-sm flex flex-col rounded-3xl shadow-2xl border p-6 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
              <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${isDark ? 'bg-red-500/10' : 'bg-red-100'} mb-4`}>
                <LogOut className={`h-6 w-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <h2 className={`text-xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Sign Out</h2>
              <p className={`text-sm text-center mb-6 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Are you sure you want to sign out of your account?
              </p>
              
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutModal(false)} className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors ${isDark ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}>Cancel</button>
                <button onClick={() => { setShowLogoutModal(false); logout(); }} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all hover:-translate-y-0.5">Sign Out</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
