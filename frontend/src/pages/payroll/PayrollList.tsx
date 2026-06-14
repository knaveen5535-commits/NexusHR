import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Download, Search } from 'lucide-react';

const mockPayroll = [
  { id: 1, employee: 'John Doe', position: 'Software Engineer', salary: 95000, bonus: 5000, deductions: 3200, netPay: 96800, status: 'paid' },
  { id: 2, employee: 'Jane Smith', position: 'Product Manager', salary: 110000, bonus: 8000, deductions: 4100, netPay: 113900, status: 'paid' },
  { id: 3, employee: 'Mike Johnson', position: 'Designer', salary: 75000, bonus: 3000, deductions: 2800, netPay: 75200, status: 'pending' },
  { id: 4, employee: 'Sarah Williams', position: 'Data Analyst', salary: 82000, bonus: 4000, deductions: 3100, netPay: 82900, status: 'paid' },
  { id: 5, employee: 'Alex Brown', position: 'DevOps Engineer', salary: 105000, bonus: 7000, deductions: 3900, netPay: 108100, status: 'processing' },
];

export default function PayrollList() {
  const [search, setSearch] = useState('');

  const filtered = mockPayroll.filter(emp =>
    emp.employee.toLowerCase().includes(search.toLowerCase())
  );

  const totalPayroll = mockPayroll.reduce((sum, e) => sum + e.netPay, 0);
  const prevPayroll = 450000;
  const change = ((totalPayroll - prevPayroll) / prevPayroll * 100).toFixed(1);

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Payroll</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage employee salaries and payments</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-600/20">
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 backdrop-blur-xl hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Total Payroll</p>
              <p className="text-2xl font-bold text-white mt-1">${(totalPayroll / 1000).toFixed(1)}K</p>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <div className={`flex items-center gap-1 mt-3 text-xs ${Number(change) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {Number(change) >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{change}% vs last month</span>
          </div>
        </div>
        {[
          { label: 'Paid', value: '$377.7K', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Pending', value: '$75.2K', color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Processing', value: '$108.1K', color: 'text-blue-400', bg: 'bg-blue-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 backdrop-blur-xl hover:border-zinc-700 transition-all">
            <p className="text-zinc-400 text-sm">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl backdrop-blur-xl">
        <div className="p-4 border-b border-zinc-800">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950/50 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-800/50 text-xs uppercase text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Position</th>
                <th className="px-6 py-4">Salary</th>
                <th className="px-6 py-4">Bonus</th>
                <th className="px-6 py-4">Deductions</th>
                <th className="px-6 py-4">Net Pay</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <DollarSign className="h-8 w-8 text-zinc-600" />
                      <p className="text-zinc-500">No payroll records found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">{emp.employee}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{emp.position}</td>
                    <td className="px-6 py-4">${emp.salary.toLocaleString()}</td>
                    <td className="px-6 py-4 text-emerald-400">+${emp.bonus.toLocaleString()}</td>
                    <td className="px-6 py-4 text-red-400">-${emp.deductions.toLocaleString()}</td>
                    <td className="px-6 py-4 font-semibold text-white">${emp.netPay.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                        emp.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20' :
                        emp.status === 'pending' ? 'bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20' :
                        'bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-500/20'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
