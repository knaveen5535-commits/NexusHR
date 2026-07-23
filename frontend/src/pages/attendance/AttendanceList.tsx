import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Filter, ChevronLeft, ChevronRight, Search, Users } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { getEmployees, getTeamMembers } from '../../services/employee.service';
import type { Employee } from '../../services/employee.service';
interface AttendanceRecord {
  id: number;
  employeeName: string;
  department: string;
  designation: string;
  attendanceDate: string;
  checkInTime: string;
  checkOutTime: string;
  status: string;
}

const statusStyles: Record<string, string> = {
  present: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  absent: 'bg-red-500/10 text-red-400 ring-red-500/20',
  late: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
  pending: 'bg-slate-500/10 text-slate-400 ring-slate-500/20',
};

const statusIcons: Record<string, typeof CheckCircle> = {
  present: CheckCircle,
  absent: XCircle,
  late: AlertCircle,
  pending: Clock,
};

export default function AttendanceList() {
  const user = useAuthStore(s => s.user);
  const [currentMonth] = useState(() => {
    return new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  });
  const [filter, setFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    fetchBaseData();
  }, []);

  const fetchBaseData = async () => {
    setIsLoading(true);
    try {
      const isManager = user?.role?.toUpperCase() === 'MANAGER';
      const [attRes, empRes] = await Promise.all([
        api.get(isManager ? '/attendance/team' : '/attendance'),
        isManager ? getTeamMembers() : getEmployees()
      ]);
      
      const attendance = attRes.data;
      const emps = empRes.filter(e => e.status === 'ACTIVE');
      
      setAttendanceData(attendance);
      setEmployees(emps);
      
      const depts = Array.from(new Set(emps.map(e => e.departmentName).filter(Boolean)));
      if (depts.length > 0) {
        setDepartments(depts as string[]);
      } else {
        setDepartments(Array.from(new Set(attendance.map((a: any) => a.department || 'Unknown'))));
      }
    } catch (error) {
      console.error('Failed to fetch attendance records', error);
    } finally {
      setIsLoading(false);
    }
  };

  const year = selectedDate.getFullYear();
  const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
  const day = String(selectedDate.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  const currentMonthPrefix = `${year}-${month}`;

  const dailyRecords: AttendanceRecord[] = employees.map(emp => {
    const name = `${emp.firstName} ${emp.lastName}`;
    const existingRecord = attendanceData.find(a => a.employeeName === name && a.attendanceDate === dateStr);
    
    if (existingRecord) return existingRecord;
    
    let defaultStatus = 'absent';
    const now = new Date();
    const selDate = new Date(selectedDate);
    
    // If selected date is today and it is before 9:00 AM, or if the selected date is in the future
    if (
      (selDate.getFullYear() === now.getFullYear() && 
       selDate.getMonth() === now.getMonth() && 
       selDate.getDate() === now.getDate() && 
       now.getHours() < 9) || 
      (selDate > now)
    ) {
      defaultStatus = 'pending';
    }

    return {
      id: -emp.id,
      employeeName: name,
      department: emp.departmentName || 'Unknown',
      designation: emp.designation || 'Employee',
      attendanceDate: dateStr,
      checkInTime: '--',
      checkOutTime: '--',
      status: defaultStatus
    };
  });

  const filteredAttendance = dailyRecords.filter(a => {
    const dept = a.department || 'Unknown';
    const status = a.status || '';
    const name = a.employeeName || '';
    
    const matchesStatus = filter === 'all' || status.toLowerCase() === filter.toLowerCase();
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'all' || dept.toLowerCase() === departmentFilter.toLowerCase();
    
    return matchesStatus && matchesSearch && matchesDept;
  });

  const presentCount = dailyRecords.filter(a => (a.status || '').toLowerCase() === 'present').length;
  const absentCount = dailyRecords.filter(a => (a.status || '').toLowerCase() === 'absent').length;
  const lateCount = dailyRecords.filter(a => (a.status || '').toLowerCase() === 'late').length;
  
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };
  
  const isToday = (d: Date) => {
    const td = new Date();
    return d.getDate() === td.getDate() && d.getMonth() === td.getMonth() && d.getFullYear() === td.getFullYear();
  };
  
  const dateDisplay = isToday(selectedDate) ? 'Today' : `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  const employeeStats: Record<string, { present: number, total: number }> = {};
  attendanceData.forEach(a => {
    if (a.attendanceDate && a.attendanceDate.startsWith(currentMonthPrefix)) {
      const empName = a.employeeName;
      if (!employeeStats[empName]) {
        employeeStats[empName] = { present: 0, total: 0 };
      }
      employeeStats[empName].total += 1;
      const status = (a.status || '').toLowerCase();
      if (status === 'present' || status === 'late') {
        employeeStats[empName].present += 1;
      }
    }
  });

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground text-sm mt-1">Track employee attendance and time logs</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card/50 border border-border rounded-lg px-3 py-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground font-medium">{currentMonth}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Today's Present", count: presentCount.toString(), icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: "Today's Absent", count: absentCount.toString(), icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: "Today's Late", count: lateCount.toString(), icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card/50 border border-border rounded-xl p-5 backdrop-blur-xl hover:border-border transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stat.count}</p>
              </div>
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card/50 border border-border rounded-xl overflow-hidden backdrop-blur-xl">
        {/* Advanced Filters Bar */}
        <div className="p-4 border-b border-border flex flex-col gap-4">
          <div className="flex justify-between items-center w-full">
            {/* Status Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              {['all', 'present', 'absent', 'late', 'pending'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                    filter === f
                      ? 'bg-blue-600 text-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            
            {/* Toggle Advanced Filters */}
            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                showAdvancedFilters 
                  ? 'bg-blue-600/10 text-blue-400 border-blue-500/20' 
                  : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>

          {/* Expandable Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border mt-2">
              {/* Search Box */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-border bg-zinc-950/50 pl-10 pr-4 py-2 text-sm text-foreground placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              {/* Department Filter */}
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full rounded-lg border border-border bg-zinc-950/50 pl-10 pr-8 py-2 text-sm text-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors appearance-none"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Date Paginator */}
        <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-muted/20">
          <span className="text-sm font-medium text-foreground">Daily Attendance Logs</span>
          <div className="flex items-center gap-2">
            <button onClick={handlePrevDay} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setSelectedDate(new Date())} className="text-sm text-foreground min-w-[80px] text-center hover:text-blue-400 transition-colors">
              {dateDisplay}
            </button>
            <button onClick={handleNextDay} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Check In</th>
                <th className="px-6 py-4">Check Out</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
                      <p className="text-muted-foreground mt-2">Loading attendance records...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Clock className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No attendance records found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((record) => {
                  const StatusIcon = statusIcons[record.status] || CheckCircle;
                  const stats = employeeStats[record.employeeName];
                  const percentage = stats && stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
                  return (
                    <tr key={record.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-medium text-foreground">{record.employeeName}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{record.department || 'Unknown'} • {record.designation || 'Employee'}</p>
                          </div>
                          {stats && (
                            <div className="flex flex-col items-end shrink-0">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${percentage >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : percentage >= 50 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {percentage}%
                              </span>
                              <span className="text-[10px] text-muted-foreground mt-0.5">This Month</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">{record.attendanceDate}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {record.checkInTime}
                        </span>
                      </td>
                      <td className="px-6 py-4">{record.checkOutTime}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset capitalize ${statusStyles[record.status] || statusStyles['present']}`}>
                          <StatusIcon className="h-3 w-3" />
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
