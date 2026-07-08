import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router';
import { 
  Users, FileText, CheckCircle, XCircle,
  Brain, AlertTriangle, Target, UserPlus, Star
} from 'lucide-react';
import KpiCard from '../../../components/common/KpiCard';
import BarChartCard from '../../../components/charts/BarChartCard';
import AreaChartCard from '../../../components/charts/AreaChartCard';
import type { KpiCard as KpiCardType } from '../../../types';
import { useState, useEffect } from 'react';
import { getTeamMembers } from '../../../services/employee.service';
import { useAuthStore } from '../../../store/authStore';

// kpiData moved inside OverviewTab to be dynamic
const teamAttendance = [
  { name: 'Mon', value: 12, value2: 11 },
  { name: 'Tue', value: 11, value2: 10 },
  { name: 'Wed', value: 12, value2: 12 },
  { name: 'Thu', value: 10, value2: 9 },
  { name: 'Fri', value: 11, value2: 10 },
];

const teamPerformance = [
  { name: 'Alice W.', value: 4.8 },
  { name: 'Bob K.', value: 4.5 },
  { name: 'Carol D.', value: 4.2 },
  { name: 'David L.', value: 4.9 },
  { name: 'Eva M.', value: 4.6 },
];

const teamMembers = [
  { name: 'Alice Wang', role: 'Frontend Developer', status: 'Online', tasks: 5, rating: 4.8 },
  { name: 'Bob Kim', role: 'Backend Developer', status: 'On Leave', tasks: 0, rating: 4.5 },
  { name: 'Carol Davis', role: 'UX Designer', status: 'In Meeting', tasks: 2, rating: 4.2 },
  { name: 'David Lee', role: 'DevOps Engineer', status: 'Online', tasks: 8, rating: 4.9 },
];

const pendingApprovals = [
  { id: 1, employee: 'Alice Wang', type: 'Annual Leave', dates: 'Aug 12 - Aug 15', days: 4, status: 'pending' },
  { id: 2, employee: 'David Lee', type: 'Sick Leave', dates: 'Jul 28', days: 1, status: 'pending' },
  { id: 3, employee: 'Eva Martinez', type: 'Personal Leave', dates: 'Aug 02 - Aug 03', days: 2, status: 'pending' },
];



function OverviewTab() {
  const user = useAuthStore(s => s.user);
  const [teamCount, setTeamCount] = useState<number | string>('--');

  useEffect(() => {
    if (user?.id) {
      getTeamMembers(user.id).then(data => {
        setTeamCount(data.length);
      }).catch(() => {
        setTeamCount('--');
      });
    }
  }, [user]);

  const kpiData: KpiCardType[] = [
    { label: 'Team Members', value: String(teamCount), trend: 'neutral', icon: 'Users', color: 'blue-500' },
    { label: 'Team Attendance', value: '--', trend: 'neutral', icon: 'Calendar', color: 'emerald-500' },
    { label: 'Pending Approvals', value: '--', trend: 'neutral', icon: 'FileText', color: 'amber-500' },
    { label: 'Team Performance', value: '--', trend: 'neutral', icon: 'TrendingUp', color: 'purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => (
          <KpiCard key={kpi.label} data={kpi} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChartCard
          title="Team Attendance (This Week)"
          data={teamAttendance}
          areas={[
            { key: 'value', color: '#3b82f6', label: 'Total Present' },
            { key: 'value2', color: '#10b981', label: 'On Time' },
          ]}
        />
        <BarChartCard
          title="Top Performers (Current Quarter)"
          data={teamPerformance}
          bars={[{ key: 'value', color: '#8b5cf6', label: 'Rating' }]}
        />
      </div>
    </div>
  );
}

function TeamTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Team Roster</h3>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-foreground text-sm font-medium hover:bg-blue-500 transition-colors">
          <UserPlus size={16} />
          Assign Tasks
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {teamMembers.map((member, i) => (
          <div key={i} className="p-4 rounded-xl border border-border bg-card/50 backdrop-blur-xl hover:border-border transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center">
                <Users size={20} className="text-foreground" />
              </div>
              <span className={`px-2 py-1 text-xs rounded-full border ${
                member.status === 'Online' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                member.status === 'On Leave' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {member.status}
              </span>
            </div>
            <h4 className="text-base font-semibold text-foreground">{member.name}</h4>
            <p className="text-sm text-muted-foreground mb-4">{member.role}</p>
            <div className="flex justify-between items-center pt-4 border-t border-border/50">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Tasks</p>
                <p className="text-sm text-foreground font-medium">{member.tasks}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Rating</p>
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <p className="text-sm text-foreground font-medium">{member.rating}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeaveTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-foreground mb-6">Pending Leave Requests</h3>
        <div className="space-y-4">
          {pendingApprovals.map((leave) => (
            <div key={leave.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-muted border border-border gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <FileText size={18} className="text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">{leave.employee}</h4>
                  <p className="text-xs text-muted-foreground">{leave.type} • {leave.dates} ({leave.days} days)</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors border border-emerald-500/20">
                  <CheckCircle size={16} /> Approve
                </button>
                <button className="flex items-center gap-1 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors border border-red-500/20">
                  <XCircle size={16} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PerformanceTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
        <h3 className="text-sm font-semibold text-foreground mb-6">Team KPIs (Q3)</h3>
        <div className="space-y-5">
          {[
            { metric: 'Feature Deliveries', value: '85%', target: '90%', color: 'blue' },
            { metric: 'Code Quality (Bugs/PR)', value: '1.2', target: '< 2.0', color: 'emerald' },
            { metric: 'Sprint Velocity', value: '42 pts', target: '40 pts', color: 'purple' },
          ].map((kpi, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-foreground">{kpi.metric}</span>
                <span className="text-foreground font-medium">{kpi.value} <span className="text-muted-foreground text-xs">/ {kpi.target}</span></span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 bg-${kpi.color}-500`} 
                  style={{ width: '85%' }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
        <h3 className="text-sm font-semibold text-foreground mb-6">Quarterly Reviews Actionable</h3>
        <div className="space-y-4">
          {[
            { name: 'Carol Davis', status: 'Needs Review', due: 'In 2 days' },
            { name: 'Bob Kim', status: 'In Progress', due: 'In 5 days' },
          ].map((review, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">{review.name}</p>
                <p className="text-xs text-amber-400 mt-0.5">Due: {review.due}</p>
              </div>
              <button className="px-3 py-1.5 rounded-md bg-secondary text-foreground text-xs hover:bg-secondary transition-colors">
                Start Review
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AIInsightsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle size={24} className="text-red-400" />
            <h3 className="text-lg font-semibold text-red-400">Attrition Prediction</h3>
          </div>
          <p className="text-sm text-foreground mb-4">AI models indicate a <span className="text-red-400 font-bold">High Risk</span> of attrition for <span className="text-foreground font-medium">Carol Davis</span> due to prolonged stagnation in the current role and recent overtime patterns.</p>
          <button className="w-full py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors">View Retention Strategy</button>
        </div>

        <div className="p-6 rounded-xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-4">
            <Target size={24} className="text-amber-400" />
            <h3 className="text-lg font-semibold text-amber-400">Skill Gap Analysis</h3>
          </div>
          <p className="text-sm text-foreground mb-4">The team is lacking proficiency in <span className="text-amber-400 font-medium">Next.js 14 App Router</span>. Recommending targeted upskilling for the frontend sub-team.</p>
          <button className="w-full py-2 rounded-lg bg-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/30 transition-colors">Assign Training Module</button>
        </div>

        <div className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-4">
            <Brain size={24} className="text-emerald-400" />
            <h3 className="text-lg font-semibold text-emerald-400">Workload Balance</h3>
          </div>
          <p className="text-sm text-foreground mb-4">David Lee is currently handling <span className="text-emerald-400 font-medium">35% more tasks</span> than average. Consider redistributing 2 tasks to Bob Kim to balance load.</p>
          <button className="w-full py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-colors">Auto-Redistribute Tasks</button>
        </div>
      </div>
    </div>
  );
}

export default function ManagerDashboard() {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();
  let activeTab = currentPath === 'dashboard' ? 'overview' : currentPath || 'overview';
  
  if (activeTab === 'leave-approvals') activeTab = 'leave';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'team': return <TeamTab />;
      case 'leave': return <LeaveTab />;
      case 'performance': return <PerformanceTab />;
      case 'ai': return <AIInsightsTab />;
      case 'attendance': return <div className="p-6 text-center text-muted-foreground">Attendance tracking coming soon.</div>;
      default: return <OverviewTab />;
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Manager Workspace</h1>
        <p className="text-muted-foreground text-sm mt-1">Oversee team performance, approvals, and AI insights.</p>
      </motion.div>



      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
