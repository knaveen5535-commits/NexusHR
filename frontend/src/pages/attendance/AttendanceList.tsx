import { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const mockAttendance = [
  { id: 1, employee: 'John Doe', date: '2026-06-12', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'present' },
  { id: 2, employee: 'Jane Smith', date: '2026-06-12', checkIn: '09:15 AM', checkOut: '05:45 PM', status: 'present' },
  { id: 3, employee: 'Mike Johnson', date: '2026-06-12', checkIn: '--', checkOut: '--', status: 'absent' },
  { id: 4, employee: 'Sarah Williams', date: '2026-06-12', checkIn: '08:50 AM', checkOut: '06:10 PM', status: 'present' },
  { id: 5, employee: 'Alex Brown', date: '2026-06-12', checkIn: '10:30 AM', checkOut: '--', status: 'late' },
];

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
  const [currentMonth] = useState('June 2026');
  const [filter, setFilter] = useState('all');

  const filteredAttendance = filter === 'all'
    ? mockAttendance
    : mockAttendance.filter(a => a.status === filter);

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Attendance</h1>
          <p className="text-zinc-400 text-sm mt-1">Track employee attendance and time logs</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2">
            <Calendar className="h-4 w-4 text-zinc-400" />
            <span className="text-sm text-white font-medium">{currentMonth}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Present', count: '3', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Absent', count: '1', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Late', count: '1', icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 backdrop-blur-xl hover:border-zinc-700 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.count}</p>
              </div>
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-xl">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-zinc-400" />
            <span className="text-sm text-zinc-400">Filter:</span>
            {['all', 'present', 'absent', 'late'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-zinc-300">Today</span>
            <button className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-800/50 text-xs uppercase text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Check In</th>
                <th className="px-6 py-4">Check Out</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Clock className="h-8 w-8 text-zinc-600" />
                      <p className="text-zinc-500">No attendance records found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((record) => {
                  const StatusIcon = statusIcons[record.status];
                  return (
                    <tr key={record.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{record.employee}</td>
                      <td className="px-6 py-4">{record.date}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-zinc-500" />
                          {record.checkIn}
                        </span>
                      </td>
                      <td className="px-6 py-4">{record.checkOut}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset capitalize ${statusStyles[record.status]}`}>
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
