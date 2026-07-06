import { useState } from 'react';
import { Star, TrendingUp, Target, Award } from 'lucide-react';

const mockEmployees = [
  { id: 1, name: 'John Doe', role: 'Software Engineer', rating: 4.5, projects: 12, tasks: 48, completed: 45, streak: 15 },
  { id: 2, name: 'Jane Smith', role: 'Product Manager', rating: 4.8, projects: 8, tasks: 36, completed: 35, streak: 22 },
  { id: 3, name: 'Mike Johnson', role: 'Designer', rating: 4.2, projects: 15, tasks: 52, completed: 48, streak: 8 },
  { id: 4, name: 'Sarah Williams', role: 'Data Analyst', rating: 4.6, projects: 10, tasks: 40, completed: 38, streak: 18 },
  { id: 5, name: 'Alex Brown', role: 'DevOps Engineer', rating: 4.4, projects: 14, tasks: 44, completed: 40, streak: 12 },
];

export default function PerformanceList() {
  const [sortBy, setSortBy] = useState('rating');

  const sorted = [...mockEmployees].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'streak') return b.streak - a.streak;
    if (sortBy === 'completion') return (b.completed / b.tasks) - (a.completed / a.tasks);
    return 0;
  });

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Performance</h1>
          <p className="text-muted-foreground text-sm mt-1">Track employee performance and metrics</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-foreground px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-600/20">
          <Award className="h-4 w-4" />
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Avg Rating', value: '4.5', icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Total Projects', value: '59', icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Completion Rate', value: '93%', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Top Performer', value: 'Jane S.', icon: Award, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card/50 border border-border rounded-xl p-5 backdrop-blur-xl hover:border-border transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card/50 border border-border rounded-xl backdrop-blur-xl">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          {['rating', 'streak', 'completion'].map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                sortBy === s
                  ? 'bg-blue-600 text-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {s === 'completion' ? 'Completion Rate' : s}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {sorted.map((emp) => {
            const completion = Math.round((emp.completed / emp.tasks) * 100);
            return (
              <div key={emp.id} className="bg-muted border border-border rounded-xl p-5 hover:border-border transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-foreground font-semibold group-hover:text-blue-400 transition-colors">{emp.name}</h3>
                    <p className="text-muted-foreground text-sm">{emp.role}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-semibold text-amber-400">{emp.rating}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-muted-foreground text-xs">Projects</p>
                    <p className="text-foreground font-semibold text-lg">{emp.projects}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Tasks Done</p>
                    <p className="text-foreground font-semibold text-lg">{emp.completed}/{emp.tasks}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Day Streak</p>
                    <p className="text-foreground font-semibold text-lg">{emp.streak}</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Completion</span>
                    <span className="text-foreground">{completion}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
