import { useRef, useState, useEffect, Fragment } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthStore } from '../../../store/authStore';
import { exportDashboardPdf } from '../../../utils/exportPdf';
import { getEmployees, getTeamMembers } from '../../../services/employee.service';
import type { Employee } from '../../../services/employee.service';
import BarChartCard from '../../../components/charts/BarChartCard';
import AreaChartCard from '../../../components/charts/AreaChartCard';
import PieChartCard from '../../../components/charts/PieChartCard';
import {
  FileText, Download, TrendingUp, Users, DollarSign, CalendarCheck, Brain,
  UserPlus, UserMinus, BadgeCheck, Clock, BookOpen, Target, AlertTriangle, Activity
} from 'lucide-react';
import api from '../../../services/api';

const REPORT_TYPES = [
  { id: 'emp', name: 'Employee Report', desc: 'Headcount, diversity, and turnover metrics.', icon: Users, color: 'text-blue-500', glow: 'shadow-blue-500/20', bg: 'bg-blue-500/10' },
  { id: 'pay', name: 'Payroll Report', desc: 'Salary distributions, tax deductions, and bonuses.', icon: DollarSign, color: 'text-amber-500', glow: 'shadow-amber-500/20', bg: 'bg-amber-500/10' },
  { id: 'att', name: 'Attendance Report', desc: 'Absenteeism, overtime, and leave balances.', icon: CalendarCheck, color: 'text-emerald-500', glow: 'shadow-emerald-500/20', bg: 'bg-emerald-500/10' },
  { id: 'perf', name: 'Performance Report', desc: 'Review scores, goal completion, and feedback.', icon: TrendingUp, color: 'text-rose-500', glow: 'shadow-rose-500/20', bg: 'bg-rose-500/10' },
  { id: 'ai', name: 'AI Insights Report', desc: 'Predictive analytics for attrition and engagement.', icon: Brain, color: 'text-purple-500', glow: 'shadow-purple-500/20', bg: 'bg-purple-500/10' },
];

const REPORT_DATA: Record<string, {
  kpis: { label: string; value: string; icon: any; color: string; bg: string }[];
  chart: any;
  tableHeaders: string[];
  tableRows: any[];
}> = {
  emp: {
    kpis: [
      { label: 'Total Employees', value: '1,247', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
      { label: 'Active Employees', value: '1,180', icon: BadgeCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      { label: 'New Hires (MTD)', value: '43', icon: UserPlus, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
      { label: 'Turnover Rate', value: '2.1%', icon: UserMinus, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    ],
    chart: { type: 'bar', title: 'Employees by Department', data: [
      { name: 'Engineering', value: 420 }, { name: 'Sales', value: 280 },
      { name: 'HR', value: 45 }, { name: 'Finance', value: 60 },
      { name: 'Operations', value: 190 }, { name: 'Marketing', value: 120 },
      { name: 'Legal', value: 32 }, { name: 'Design', value: 100 },
    ]},
    tableHeaders: ['Department', 'Total', 'Active', 'New Hires', 'Turnover'],
    tableRows: [
      ['Engineering', '420', '402', '15', '1.8%'],
      ['Sales', '280', '265', '10', '2.5%'],
      ['HR', '45', '43', '2', '1.2%'],
      ['Finance', '60', '58', '3', '1.5%'],
      ['Operations', '190', '180', '8', '2.8%'],
      ['Marketing', '120', '114', '4', '2.0%'],
      ['Legal', '32', '31', '1', '1.0%'],
      ['Design', '100', '87', '0', '3.5%'],
    ],
  },
  pay: {
    kpis: [
      { label: 'Total Payroll', value: '$4.2M', icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-500/10' },
      { label: 'Avg Salary', value: '$72K', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      { label: 'Tax Deductions', value: '$840K', icon: FileText, color: 'text-red-500', bg: 'bg-red-500/10' },
      { label: 'Bonuses (Q2)', value: '$210K', icon: BadgeCheck, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    ],
    chart: { type: 'area', title: 'Monthly Payroll Trend', data: [
      { name: 'Jan', value: 3.8 }, { name: 'Feb', value: 3.9 }, { name: 'Mar', value: 4.0 },
      { name: 'Apr', value: 4.1 }, { name: 'May', value: 4.1 }, { name: 'Jun', value: 4.2 },
    ]},
    tableHeaders: ['Department', 'Total Payroll', 'Avg Salary', 'Bonuses', '# Employees'],
    tableRows: [
      ['Engineering', '$1.8M', '$95K', '$85K', '420'],
      ['Sales', '$980K', '$68K', '$55K', '280'],
      ['Operations', '$570K', '$52K', '$28K', '190'],
      ['Marketing', '$360K', '$60K', '$22K', '120'],
      ['Finance', '$210K', '$75K', '$12K', '60'],
      ['HR', '$150K', '$55K', '$5K', '45'],
      ['Legal', '$130K', '$78K', '$3K', '32'],
      ['Design', '$280K', '$56K', '$0K', '100'],
    ],
  },
  att: {
    kpis: [
      { label: 'Avg Attendance', value: '94.7%', icon: CalendarCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      { label: 'On Leave', value: '52', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
      { label: 'Late Today', value: '18', icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
      { label: 'Absent', value: '7', icon: UserMinus, color: 'text-red-500', bg: 'bg-red-500/10' },
    ],
    chart: { type: 'pie', title: 'Attendance Distribution', data: [
      { name: 'Present', value: 1180, color: '#22c55e' },
      { name: 'On Leave', value: 52, color: '#f59e0b' },
      { name: 'Late', value: 18, color: '#f97316' },
      { name: 'Absent', value: 7, color: '#ef4444' },
    ]},
    tableHeaders: ['Department', 'Present', 'On Leave', 'Late', 'Absent', 'Rate'],
    tableRows: [
      ['Engineering', '398', '16', '4', '2', '94.8%'],
      ['Sales', '264', '11', '4', '1', '94.3%'],
      ['Operations', '179', '8', '3', '0', '94.2%'],
      ['Marketing', '113', '5', '2', '0', '94.2%'],
      ['Finance', '57', '2', '1', '0', '95.0%'],
      ['HR', '42', '2', '1', '0', '93.3%'],
      ['Legal', '30', '1', '1', '0', '93.8%'],
      ['Design', '97', '5', '2', '4', '97.0%'],
    ],
  },
  perf: {
    kpis: [
      { label: 'Avg Score', value: '87/100', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      { label: 'Completed Reviews', value: '94%', icon: BadgeCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
      { label: 'Top Performers', value: '124', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
      { label: 'Needs Improvement', value: '38', icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ],
    chart: { type: 'bar', title: 'Performance Score Distribution', data: [
      { name: '90-100', value: 124 }, { name: '80-89', value: 312 },
      { name: '70-79', value: 220 }, { name: '60-69', value: 86 },
      { name: 'Below 60', value: 38 },
    ]},
    tableHeaders: ['Department', 'Avg Score', 'Completed', 'Top Performers', 'Needs Improvement'],
    tableRows: [
      ['Engineering', '89', '96%', '52', '10'],
      ['Sales', '86', '93%', '28', '9'],
      ['Operations', '84', '92%', '18', '8'],
      ['Marketing', '88', '95%', '14', '4'],
      ['Finance', '91', '98%', '8', '1'],
      ['HR', '85', '92%', '3', '3'],
      ['Legal', '90', '97%', '4', '1'],
      ['Design', '83', '90%', '7', '2'],
    ],
  },
  ai: {
    kpis: [
      { label: 'Attrition Risk', value: '4.2%', icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
      { label: 'Engagement Score', value: '82/100', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      { label: 'Predicted Hires', value: '156', icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-500/10' },
      { label: 'Skill Gap', value: '23%', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    ],
    chart: { type: 'area', title: 'Attrition Risk Trend', data: [
      { name: 'Jan', value: 5.1 }, { name: 'Feb', value: 4.8 }, { name: 'Mar', value: 4.6 },
      { name: 'Apr', value: 4.5 }, { name: 'May', value: 4.3 }, { name: 'Jun', value: 4.2 },
    ]},
    tableHeaders: ['Department', 'Attrition Risk', 'Engagement', 'Predicted Hires', 'Skill Gap'],
    tableRows: [
      ['Engineering', '3.8%', '85', '42', '28%'],
      ['Sales', '4.5%', '80', '35', '20%'],
      ['Operations', '5.2%', '78', '28', '25%'],
      ['Marketing', '3.5%', '84', '18', '18%'],
      ['Finance', '2.8%', '88', '10', '15%'],
      ['HR', '4.0%', '82', '8', '22%'],
      ['Legal', '2.5%', '86', '5', '12%'],
      ['Design', '6.5%', '75', '7', '30%'],
    ],
  },
};

export default function Reports() {
  const { isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isManager = user?.role === 'MANAGER';
  
  const reportContentRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [employeesData, setEmployeesData] = useState<Employee[]>([]);
  const [payrollsData, setPayrollsData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const toggleRow = (i: number) => {
    setExpandedRows(prev => ({ ...prev, [i]: !prev[i] }));
  };

  const pathParts = location.pathname.split('/');
  const subPath = pathParts[pathParts.length - 1];

  const pathMap: Record<string, string> = {
    employees: 'emp',
    payroll: 'pay',
    attendance: 'att',
    performance: 'perf',
    ai: 'ai'
  };

  const filteredReportId = pathMap[subPath];
  const isSingleReportMode = !!filteredReportId;
  
  useEffect(() => {
    if (filteredReportId === 'emp') {
      setIsLoadingData(true);
      const fetchFn = isManager ? getTeamMembers : getEmployees;
      fetchFn().then(data => setEmployeesData(data))
        .catch(err => console.error('Failed to fetch employees', err))
        .finally(() => setIsLoadingData(false));
    } else if (filteredReportId === 'pay' && !isManager) {
      setIsLoadingData(true);
      api.get('/payrolls').then(res => setPayrollsData(res.data))
        .catch(err => console.error('Failed to fetch payrolls', err))
        .finally(() => setIsLoadingData(false));
    } else if (filteredReportId === 'att') {
      setIsLoadingData(true);
      const endpoint = isManager ? '/attendance/team' : '/attendance';
      api.get(endpoint).then(res => setAttendanceData(res.data))
        .catch(err => console.error('Failed to fetch attendance', err))
        .finally(() => setIsLoadingData(false));
    }
  }, [filteredReportId, isManager]);

  const filteredReportTypes = REPORT_TYPES.filter(r => {
    if (isManager && r.id === 'pay') return false;
    return true;
  });

  const activeReport = filteredReportTypes.find(r => r.id === filteredReportId);
  let reportData = activeReport ? REPORT_DATA[activeReport.id] : null;

  if (activeReport?.id === 'emp' && employeesData.length > 0) {
    const total = employeesData.length;
    const active = employeesData.filter(e => e.status?.toLowerCase() === 'active').length;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newHires = employeesData.filter(e => {
      if (!e.joiningDate) return false;
      const date = new Date(e.joiningDate);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;

    const leftThisMonthCount = employeesData.filter(e => {
      if (!e.leaveDate) return false;
      const date = new Date(e.leaveDate);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;
    
    const globalTurnover = total > 0 ? ((leftThisMonthCount / total) * 100).toFixed(1) + '%' : '0%';
    
    const deptMap: Record<string, { total: number, active: number, newHires: number, leftThisMonth: number, employees: Employee[] }> = {};
    employeesData.forEach(e => {
      const dept = e.departmentName || 'Unknown';
      if (!deptMap[dept]) deptMap[dept] = { total: 0, active: 0, newHires: 0, leftThisMonth: 0, employees: [] };
      deptMap[dept].total++;
      if (e.status?.toLowerCase() === 'active') deptMap[dept].active++;
      
      if (e.joiningDate) {
        const date = new Date(e.joiningDate);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
          deptMap[dept].newHires++;
        }
      }
      
      if (e.leaveDate) {
        const date = new Date(e.leaveDate);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
          deptMap[dept].leftThisMonth++;
        }
      }
      
      deptMap[dept].employees.push(e);
    });

    const tableRows = Object.keys(deptMap).map(dept => {
      const dTotal = deptMap[dept].total;
      const dLeft = deptMap[dept].leftThisMonth;
      const dTurnover = dTotal > 0 ? ((dLeft / dTotal) * 100).toFixed(1) + '%' : '0%';
      
      const subRows = deptMap[dept].employees.map(e => {
        return [
          (e.firstName || '') + ' ' + (e.lastName || ''),
          e.designation || 'Unknown Role',
          e.status || 'Unknown',
          e.joiningDate ? new Date(e.joiningDate).toLocaleDateString() : 'N/A',
          e.leaveDate ? new Date(e.leaveDate).toLocaleDateString() : '-'
        ];
      });

      return {
        cells: [
          dept,
          String(dTotal),
          String(deptMap[dept].active),
          String(deptMap[dept].newHires),
          dTurnover
        ],
        subRows
      };
    });
    
    const chartData = Object.keys(deptMap).map(dept => ({
      name: dept,
      value: deptMap[dept].total
    }));

    reportData = {
      kpis: [
        { label: 'Total Employees', value: String(total), icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Active Employees', value: String(active), icon: BadgeCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'New Hires (MTD)', value: String(newHires), icon: UserPlus, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
        { label: 'Turnover Rate (MTD)', value: globalTurnover, icon: UserMinus, color: 'text-rose-500', bg: 'bg-rose-500/10' },
      ],
      chart: { type: 'bar', title: 'Employees by Department', data: chartData },
      tableHeaders: ['Department', 'Total', 'Active', 'New Hires', 'Turnover Rate'],
      tableRows: tableRows
    };
  }

  if (activeReport?.id === 'pay' && payrollsData.length > 0) {
    const total = payrollsData.reduce((sum, p) => sum + (p.netSalary || 0), 0);
    const avg = total / payrollsData.length;
    const taxes = payrollsData.reduce((sum, p) => sum + (p.totalTaxes || 0), 0);
    
    const positionMap: Record<string, { totalPayroll: number, bonuses: number, count: number, employees: any[] }> = {};
    payrollsData.forEach(p => {
      const pos = p.position || 'Unknown';
      if (!positionMap[pos]) positionMap[pos] = { totalPayroll: 0, bonuses: 0, count: 0, employees: [] };
      positionMap[pos].totalPayroll += p.netSalary || 0;
      positionMap[pos].count++;
      positionMap[pos].employees.push(p);
    });

    const tableRows = Object.keys(positionMap).map(pos => {
      const pTotal = positionMap[pos].totalPayroll;
      const pAvg = pTotal / positionMap[pos].count;
      
      const subRows = positionMap[pos].employees.map(e => {
        return [
          e.employeeName || 'Unknown',
          '$' + ((e.netSalary || 0) / 1000).toFixed(1) + 'K',
          '$' + ((e.grossSalary || 0) / 1000).toFixed(1) + 'K',
          '$0.0K',
          e.status || 'Unknown'
        ];
      });

      return {
        cells: [
          pos,
          '$' + (pTotal / 1000).toFixed(1) + 'K',
          '$' + (pAvg / 1000).toFixed(1) + 'K',
          '$' + (positionMap[pos].bonuses / 1000).toFixed(1) + 'K',
          String(positionMap[pos].count)
        ],
        subRows
      };
    });

    reportData = {
      ...reportData!,
      kpis: [
        { label: 'Total Payroll', value: '$' + (total / 1000).toFixed(1) + 'K', icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Avg Salary', value: '$' + (avg / 1000).toFixed(1) + 'K', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Tax Deductions', value: '$' + (taxes / 1000).toFixed(1) + 'K', icon: FileText, color: 'text-red-500', bg: 'bg-red-500/10' },
        { label: 'Bonuses (MTD)', value: '$0K', icon: BadgeCheck, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
      ],
      tableHeaders: ['Role / Position', 'Total Payroll', 'Avg Salary', 'Bonuses', '# Employees'],
      tableRows: tableRows
    };
  }

  if (activeReport?.id === 'att' && attendanceData.length > 0) {
    const present = attendanceData.filter(a => a.status === 'present').length;
    const absent = attendanceData.filter(a => a.status === 'absent').length;
    const late = attendanceData.filter(a => a.status === 'late').length;
    const total = attendanceData.length;
    const avgAttendance = total > 0 ? (((present + late) / total) * 100).toFixed(1) + '%' : '0%';
    
    const deptMap: Record<string, { present: number, absent: number, late: number, count: number, employees: Record<string, any> }> = {};
    attendanceData.forEach(a => {
      const dept = a.department || 'Unknown';
      if (!deptMap[dept]) deptMap[dept] = { present: 0, absent: 0, late: 0, count: 0, employees: {} };
      deptMap[dept].count++;
      if (a.status === 'present') deptMap[dept].present++;
      if (a.status === 'absent') deptMap[dept].absent++;
      if (a.status === 'late') deptMap[dept].late++;

      const empName = a.employeeName;
      if (!deptMap[dept].employees[empName]) {
        deptMap[dept].employees[empName] = { present: 0, absent: 0, late: 0, count: 0 };
      }
      deptMap[dept].employees[empName].count++;
      if (a.status === 'present') deptMap[dept].employees[empName].present++;
      if (a.status === 'absent') deptMap[dept].employees[empName].absent++;
      if (a.status === 'late') deptMap[dept].employees[empName].late++;
    });

    const tableRows = Object.keys(deptMap).map(dept => {
      const dTotal = deptMap[dept].count;
      const rate = dTotal > 0 ? (((deptMap[dept].present + deptMap[dept].late) / dTotal) * 100).toFixed(1) + '%' : '0%';
      
      const subRows = Object.keys(deptMap[dept].employees).map(emp => {
        const eData = deptMap[dept].employees[emp];
        const eRate = eData.count > 0 ? (((eData.present + eData.late) / eData.count) * 100).toFixed(1) + '%' : '0%';
        return [
          emp,
          String(eData.present),
          '0',
          String(eData.late),
          String(eData.absent),
          eRate
        ];
      });

      return {
        cells: [
          dept,
          String(deptMap[dept].present),
          '0', 
          String(deptMap[dept].late),
          String(deptMap[dept].absent),
          rate
        ],
        subRows
      };
    });

    reportData = {
      ...reportData!,
      kpis: [
        { label: 'Avg Attendance', value: avgAttendance, icon: CalendarCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'On Leave', value: '0', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Late', value: String(late), icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { label: 'Absent', value: String(absent), icon: UserMinus, color: 'text-red-500', bg: 'bg-red-500/10' },
      ],
      tableHeaders: ['Department', 'Present', 'On Leave', 'Late', 'Absent', 'Attendance Rate'],
      tableRows: tableRows
    };
  }

  const reversePathMap: Record<string, string> = {
    emp: 'employees',
    pay: 'payroll',
    att: 'attendance',
    perf: 'performance',
    ai: 'ai'
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: import('framer-motion').Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };
  const handleExportPDF = async () => {
    if (!reportContentRef.current || exporting || !activeReport) return;
    setExporting(true);
    try {
      await exportDashboardPdf(reportContentRef.current, `${activeReport.id}-report`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={`min-h-full w-full p-4 sm:p-6 lg:p-8 transition-colors duration-500 overflow-hidden relative ${isDark ? 'bg-[#0a0a0f] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Premium Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full mix-blend-screen filter blur-[120px] opacity-40"
          style={{ background: isDark ? 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(0,0,0,0) 70%)' : 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(255,255,255,0) 70%)' }}
          animate={{ x: [0, 30, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full mix-blend-screen filter blur-[120px] opacity-30"
          style={{ background: isDark ? 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(0,0,0,0) 70%)' : 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(255,255,255,0) 70%)' }}
          animate={{ x: [0, -40, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto space-y-8">
        
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="space-y-2">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2 ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'}`}>
              <FileText className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Analytics</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
              {isSingleReportMode && activeReport ? activeReport.name : 'Enterprise Reports'}
            </h1>
            <p className={`text-base sm:text-lg max-w-2xl font-medium ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              {isSingleReportMode && activeReport ? activeReport.desc : 'Generate, schedule, and export comprehensive operational insights across your organization.'}
            </p>
          </div>
        </motion.div>

        {/* Reports Grid */}
        {!isSingleReportMode && (
          <div className="pt-4">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"
            >
              {filteredReportTypes.map((r) => {
                const Icon = r.icon;
                return (
                  <motion.div
                    key={r.id}
                    variants={itemVariants}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className={`group relative overflow-hidden flex flex-col p-6 rounded-3xl border transition-all duration-300 ${
                      isDark 
                        ? 'bg-[#111116]/80 border-white/5 shadow-xl shadow-black/20 hover:border-white/10 hover:shadow-2xl hover:bg-[#16161e]' 
                        : 'bg-white border-slate-200/60 shadow-lg shadow-slate-200/40 hover:border-slate-300 hover:shadow-xl'
                    }`}
                  >
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-transparent ${isDark ? 'to-white/[0.02]' : 'to-slate-900/[0.02]'}`} />
                    
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3 duration-300 ${r.bg} ${r.glow} relative z-10`}>
                      <Icon className={`h-7 w-7 ${r.color}`} />
                    </div>
                    
                    <h3 className={`text-xl font-extrabold mb-3 relative z-10 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {r.name}
                    </h3>
                    <p className={`text-sm font-medium mb-8 flex-1 relative z-10 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                      {r.desc}
                    </p>
                    
                    <button 
                      onClick={() => navigate(reversePathMap[r.id])}
                      className={`relative z-10 w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 border mt-auto overflow-hidden group/btn ${
                        isDark 
                          ? 'bg-zinc-800/50 border-white/5 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-white/10' 
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <FileText className="h-4 w-4 transition-transform group-hover/btn:-translate-y-0.5" /> 
                      View Report
                    </button>

                    <div className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${r.bg}`} />
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        )}

        {/* Detailed Report View directly on page */}
        <AnimatePresence mode="wait">
          {isSingleReportMode && activeReport && reportData && (
            <motion.div
              key="report-view"
              ref={reportContentRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`relative w-full my-8 flex flex-col rounded-[2rem] shadow-2xl overflow-hidden ${
                isDark ? 'bg-[#111116] border border-white/10 shadow-black/50' : 'bg-white border border-slate-200 shadow-slate-300/50'
              }`}
            >
              {/* Header Gradient */}
              <div className={`absolute top-0 left-0 w-full h-32 opacity-20 pointer-events-none ${isDark ? 'bg-gradient-to-b from-emerald-500/30 to-transparent' : 'bg-gradient-to-b from-emerald-500/20 to-transparent'}`} />

                <div className="relative overflow-y-auto max-h-[70vh] p-6 sm:p-8 space-y-8">
                  {isLoadingData ? (
                    <div className="flex justify-center p-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                    </div>
                  ) : (
                    <>
                      {/* Filters Section */}
                  <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl border ${isDark ? 'bg-zinc-900/50 border-white/5' : 'bg-slate-50/50 border-slate-200'}`}>
                    <div className="space-y-2">
                      <label className={`block text-xs font-black uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>Date Range</label>
                      <select className={`w-full rounded-xl border px-4 py-2.5 text-sm font-semibold outline-none transition-colors ${
                        isDark ? 'bg-zinc-800/50 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}>
                        <option>Last 30 Days</option>
                        <option>This Quarter</option>
                        <option>Year to Date</option>
                        <option>Custom Range</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className={`block text-xs font-black uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>Department</label>
                      <select className={`w-full rounded-xl border px-4 py-2.5 text-sm font-semibold outline-none transition-colors ${
                        isDark ? 'bg-zinc-800/50 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}>
                        <option>All Departments</option>
                        <option>Engineering</option>
                        <option>Sales</option>
                        <option>HR</option>
                        <option>Finance</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className={`block text-xs font-black uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>Export Format</label>
                      <div className="flex gap-3 h-full items-center">
                        <label className={`flex items-center justify-center gap-2 flex-1 p-2.5 cursor-pointer rounded-xl border transition-all ${
                          isDark ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-emerald-500 bg-emerald-50'
                        }`}>
                          <input type="radio" name="format" defaultChecked className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                          <span className={`text-xs font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>PDF</span>
                        </label>
                        <label className={`flex items-center justify-center gap-2 flex-1 p-2.5 cursor-pointer rounded-xl border transition-all ${
                          isDark ? 'border-white/10 hover:bg-zinc-800/50' : 'border-slate-200 hover:bg-slate-50'
                        }`}>
                          <input type="radio" name="format" className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                          <span className={`text-xs font-bold ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>Excel</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {reportData.kpis.map((kpi, i) => {
                      const Icon = kpi.icon;
                      return (
                        <div key={i} className={`flex items-center gap-3 p-4 rounded-2xl border ${
                          isDark ? 'bg-zinc-900/50 border-white/5' : 'bg-white border-slate-200'
                        }`}>
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.bg}`}>
                            <Icon className={`h-5 w-5 ${kpi.color}`} />
                          </div>
                          <div>
                            <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                              {kpi.label}
                            </p>
                            <p className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {kpi.value}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Chart */}
                  <div>
                    {reportData.chart.type === 'bar' && (
                      <BarChartCard
                        title={reportData.chart.title}
                        data={reportData.chart.data}
                        bars={[{ key: 'value', color: '#22c55e', label: 'Value' }]}
                        isDark={isDark}
                      />
                    )}
                    {reportData.chart.type === 'area' && (
                      <AreaChartCard
                        title={reportData.chart.title}
                        data={reportData.chart.data}
                        areas={[{ key: 'value', color: '#22c55e', label: 'Value' }]}
                        isDark={isDark}
                      />
                    )}
                    {reportData.chart.type === 'pie' && (
                      <PieChartCard
                        title={reportData.chart.title}
                        data={reportData.chart.data}
                        isDark={isDark}
                      />
                    )}
                  </div>

                  {/* Data Table */}
                  <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                    <div className={`px-6 py-4 border-b ${isDark ? 'border-white/5 bg-zinc-900/50' : 'border-slate-100 bg-slate-50/50'}`}>
                      <h3 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {activeReport.name} — Detailed Breakdown
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className={`${isDark ? 'border-b border-white/5' : 'border-b border-slate-100'}`}>
                            {reportData.tableHeaders.map((header, i) => (
                              <th key={i} className={`px-6 py-3.5 text-left text-xs font-black uppercase tracking-wider ${
                                isDark ? 'text-zinc-500' : 'text-slate-500'
                              }`}>
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                          {reportData.tableRows.map((rowItem, i) => {
                            const isExpandable = !Array.isArray(rowItem);
                            const row = isExpandable ? rowItem.cells : rowItem;
                            const subRows = isExpandable ? rowItem.subRows : [];
                            const isExpanded = expandedRows[i];

                            return (
                              <Fragment key={i}>
                                <tr onClick={() => isExpandable && toggleRow(i)} className={`transition-colors ${isExpandable ? 'cursor-pointer' : ''} ${
                                  isDark ? 'hover:bg-zinc-900/50' : 'hover:bg-slate-50'
                                }`}>
                                  {row.map((cell: string, j: number) => (
                                    <td key={j} className={`px-6 py-3.5 text-sm font-semibold ${
                                      j === 0 ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-zinc-300' : 'text-slate-600')
                                    }`}>
                                      {j === 0 && isExpandable && (
                                        <span className="mr-3 inline-block w-4 text-center text-emerald-500 font-black">
                                          {isExpanded ? '▼' : '▶'}
                                        </span>
                                      )}
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                                {isExpanded && subRows.map((subRow: string[], subI: number) => (
                                  <tr key={`sub-${i}-${subI}`} className={`${isDark ? 'bg-zinc-900/20' : 'bg-slate-50/50'}`}>
                                    {subRow.map((cell, j) => (
                                      <td key={j} className={`px-6 py-2.5 text-sm font-medium ${
                                        j === 0 ? (isDark ? 'text-zinc-400 pl-12' : 'text-slate-500 pl-12') : (isDark ? 'text-zinc-500' : 'text-slate-400')
                                      }`}>
                                        {j === 0 && <span className="mr-2 text-emerald-500/50">↳</span>}
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className={`relative p-6 sm:p-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4 ${isDark ? 'border-white/5 bg-zinc-900/30' : 'border-slate-100 bg-slate-50/50'}`}>
                  <div className={`flex items-center gap-2 text-xs font-medium ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                    <CalendarCheck className="h-4 w-4" />
                    Data as of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => navigate('..', { relative: 'path' })} className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
                      isDark ? 'text-zinc-400 hover:bg-zinc-800 hover:text-white' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}>
                      Back to Reports
                    </button>
                    <button
                      onClick={handleExportPDF}
                      disabled={exporting}
                      className={`group relative overflow-hidden px-8 py-3 rounded-2xl text-sm font-bold text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDark ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-emerald-600 shadow-emerald-600/30'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-white/20 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                      <span className="relative z-10 flex items-center gap-2">
                        <Download className={`h-4 w-4 transition-transform group-hover:-translate-y-0.5 ${exporting ? 'animate-bounce' : ''}`} />
                        {exporting ? 'Exporting...' : 'Download PDF'}
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
