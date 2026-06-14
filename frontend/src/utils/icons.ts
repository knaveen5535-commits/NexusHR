import {
  LayoutDashboard, Users, UserCheck, UserCog, BarChart3, CalendarCheck,
  DollarSign, TrendingUp, Sparkles, ScrollText, Settings, Calendar,
  FileText, UserPlus, FileCheck, User, Activity, Clock, Award, Star,
  Building, type LucideIcon,
} from 'lucide-react';

const iconRegistry: Record<string, LucideIcon> = {
  LayoutDashboard, Users, UserCheck, UserCog, BarChart3, CalendarCheck,
  DollarSign, TrendingUp, Sparkles, ScrollText, Settings, Calendar,
  FileText, UserPlus, FileCheck, User, Activity, Clock, Award, Star, Building,
};

export function resolveIcon(name: string): LucideIcon {
  return iconRegistry[name] || LayoutDashboard;
}
