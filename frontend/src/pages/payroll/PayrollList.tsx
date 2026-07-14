import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Download, Search } from 'lucide-react';
import api from '../../services/api';

interface PayrollRecord {
  id: number;
  employeeName: string;
  position: string;
  grossSalary: number;
  totalDeductions: number;
  totalTaxes: number;
  netSalary: number;
  status: string;
}

// Removed mock data

export default function PayrollList() {
  const [search, setSearch] = useState('');
  const [payrollData, setPayrollData] = useState<PayrollRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/payrolls');
      setPayrollData(response.data);
    } catch (error) {
      console.error('Failed to fetch payroll records', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = payrollData.filter(emp =>
    emp.employeeName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPayroll = payrollData.reduce((sum, e) => sum + e.netSalary, 0);
  const paidPayroll = payrollData.filter(e => e.status.toLowerCase() === 'paid').reduce((sum, e) => sum + e.netSalary, 0);
  const pendingPayroll = payrollData.filter(e => e.status.toLowerCase() === 'pending').reduce((sum, e) => sum + e.netSalary, 0);
  const processingPayroll = payrollData.filter(e => e.status.toLowerCase() === 'processing').reduce((sum, e) => sum + e.netSalary, 0);

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payroll</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage employee salaries and payments</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-foreground px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-600/20">
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card/50 border border-border rounded-xl p-5 backdrop-blur-xl hover:border-border transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Payroll</p>
              <p className="text-2xl font-bold text-foreground mt-1">${(totalPayroll / 1000).toFixed(1)}K</p>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>
        {[
          { label: 'Paid', value: `$${(paidPayroll / 1000).toFixed(1)}K`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Pending', value: `$${(pendingPayroll / 1000).toFixed(1)}K`, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Processing', value: `$${(processingPayroll / 1000).toFixed(1)}K`, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card/50 border border-border rounded-xl p-5 backdrop-blur-xl hover:border-border transition-all">
            <p className="text-muted-foreground text-sm">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card/50 border border-border rounded-xl backdrop-blur-xl">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees..."
              className="w-full rounded-lg border border-border bg-zinc-950/50 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Position</th>
                <th className="px-6 py-4">Gross Salary</th>
                <th className="px-6 py-4">Taxes</th>
                <th className="px-6 py-4">Deductions</th>
                <th className="px-6 py-4">Net Pay</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
                      <p className="text-muted-foreground mt-2">Loading payroll records...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <DollarSign className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No payroll records found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-secondary/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">{emp.employeeName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{emp.position}</td>
                    <td className="px-6 py-4">${emp.grossSalary.toLocaleString()}</td>
                    <td className="px-6 py-4 text-red-400">-${emp.totalTaxes.toLocaleString()}</td>
                    <td className="px-6 py-4 text-red-400">-${emp.totalDeductions.toLocaleString()}</td>
                    <td className="px-6 py-4 font-semibold text-foreground">${emp.netSalary.toLocaleString()}</td>
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
