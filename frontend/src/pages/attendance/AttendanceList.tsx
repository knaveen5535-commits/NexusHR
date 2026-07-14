import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Filter, ChevronLeft, ChevronRight, Search, Users } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
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
};

const statusIcons: Record<string, typeof CheckCircle> = {
  present: CheckCircle,
  absent: XCircle,
  late: AlertCircle,
};

export default function AttendanceList() {
  const user = useAuthStore(s => s.user);
  const [currentMonth] = useState('June 2026');
  const [filter, setFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      const endpoint = user?.role?.toUpperCase() === 'MANAGER' ? '/attendance/team' : '/attendance';
      const response = await api.get(endpoint);
      setAttendanceData(response.data);
    } catch (error) {
      console.error('Failed to fetch attendance records', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAttendance = attendanceData.filter(a => {
    const dept = a.department || 'Unknown';
    const matchesStatus = filter === 'all' || a.status === filter;
    const matchesSearch = a.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'all' || dept === departmentFilter;
    return matchesStatus && matchesSearch && matchesDept;
  });

  const uniqueDepartments = Array.from(new Set(attendanceData.map(a => a.department || 'Unknown')));

  const presentCount = attendanceData.filter(a => a.status === 'present').length;
  const absentCount = attendanceData.filter(a => a.status === 'absent').length;
  const lateCount = attendanceData.filter(a => a.status === 'late').length;

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
          { label: 'Present', count: presentCount.toString(), icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Absent', count: absentCount.toString(), icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Late', count: lateCount.toString(), icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
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
              {['all', 'present', 'absent', 'late'].map((f) => (
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
                  {uniqueDepartments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Date Paginator */}
        <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-muted/20">
          <span className="text-sm font-medium text-foreground">Daily Logs</span>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-foreground min-w-[80px] text-center">Today</span>
            <button className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground transition-colors">
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
                  return (
                    <tr key={record.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{record.employeeName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{record.department || 'Unknown'} • {record.designation || 'Employee'}</p>
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
