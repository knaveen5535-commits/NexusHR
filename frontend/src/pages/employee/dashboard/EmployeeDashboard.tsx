import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router';
import { toast } from 'sonner';
import { 
  Clock,
  Mail, Phone, MapPin,
  FileText, Edit2, Download, Eye, User
} from 'lucide-react';
import KpiCard from '../../../components/common/KpiCard';
import AreaChartCard from '../../../components/charts/AreaChartCard';
import BarChartCard from '../../../components/charts/BarChartCard';
import type { KpiCard as KpiCardType, Employee } from '../../../types';
import { submitResignation, getMyResignations } from '../../../services/resignation.service';
import type { Resignation } from '../../../services/resignation.service';
import api from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';
import { leaveService } from '../../../services/leave.service';
import type { LeaveRequest, LeaveBalance, LeaveRequestSubmit } from '../../../types/leave';
import FeedbackDashboard from '../../performance/feedback/FeedbackDashboard';
import { feedbackService } from '../../../services/feedback.service';

function OverviewTab() {
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<number>(0);
  const [performanceRating, setPerformanceRating] = useState<string>('--');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    if (user?.id) {
      setIsLoading(true);
      Promise.allSettled([
        api.get(`/attendance/employee/${user.id}`).then(res => setAttendanceHistory(res.data)),
        leaveService.getMyBalances(new Date().getFullYear()).then(res => {
          setLeaveBalances(res);
          const totalRemaining = res.reduce((acc, curr) => acc + curr.remainingDays, 0);
          setLeaveBalance(totalRemaining);
        }),
        feedbackService.getMyFeedbacks().then(res => {
          if (res.length > 0) {
            const sum = res.reduce((acc, curr) => acc + (curr.overallRating || 0), 0);
            const avg = sum / res.length;
            setPerformanceRating(avg.toFixed(1));
          }
        })
      ]).finally(() => {
        setIsLoading(false);
      });
    }
  }, [user]);

  const today = new Date();
  
  // Calculate total working days in the current month up to today (Mon-Fri)
  let workingDays = 0;
  for (let d = new Date(today.getFullYear(), today.getMonth(), 1); d <= today; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) workingDays++; // Exclude Sunday (0) and Saturday (6)
  }
  
  // Count present days THIS month
  let presentDays = 0;
  attendanceHistory.forEach(r => {
    const d = new Date(r.attendanceDate);
    if (d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
      if (r.status === 'present' || r.status === 'late') presentDays++;
    }
  });
  
  const attendancePercentage = workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0;
  const attendanceDisplay = workingDays > 0 ? `${attendancePercentage}%` : '--';
  
  // Absents is workingDays - presentDays. But if today is before 9 AM, we don't count today as absent yet.
  let adjustedWorkingDays = workingDays;
  if (today.getHours() < 9 && today.getDay() !== 0 && today.getDay() !== 6) {
    adjustedWorkingDays--;
  }
  const absentDays = Math.max(0, adjustedWorkingDays - presentDays);
  
  let currentStreak = 0;
  for (let i = attendanceHistory.length - 1; i >= 0; i--) {
    if (attendanceHistory[i].status === 'present' || attendanceHistory[i].status === 'late') {
      currentStreak++;
    } else if (attendanceHistory[i].status === 'absent') {
      break;
    }
  }

  // Chart data processing
  const recentWeeks = [
    { name: 'Week 1', value: 0, value2: 0 },
    { name: 'Week 2', value: 0, value2: 0 },
    { name: 'Week 3', value: 0, value2: 0 },
    { name: 'Week 4', value: 0, value2: 0 },
  ];
  
  if (attendanceHistory.length > 0) {
    // Process last 28 days into 4 weeks
    const today = new Date();
    today.setHours(0,0,0,0);
    attendanceHistory.forEach(r => {
      const d = new Date(r.attendanceDate);
      const diffTime = Math.abs(today.getTime() - d.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let weekIndex = -1;
      if (diffDays <= 7) weekIndex = 3;
      else if (diffDays <= 14) weekIndex = 2;
      else if (diffDays <= 21) weekIndex = 1;
      else if (diffDays <= 28) weekIndex = 0;

      if (weekIndex !== -1) {
        if (r.status === 'present' || r.status === 'late') recentWeeks[weekIndex].value += 1;
        if (r.status === 'absent') recentWeeks[weekIndex].value2 += 1;
      }
    });
  }

  const leaveChartData = leaveBalances.map(b => ({
    name: b.leaveType.name,
    value: b.remainingDays,
    value2: b.usedDays
  }));

  const kpiData: KpiCardType[] = [
    { label: 'My Attendance', value: isLoading ? '...' : attendanceDisplay, change: isLoading ? 'Loading data...' : (workingDays > 0 ? `${absentDays} days absent` : 'No data available'), trend: attendancePercentage > 80 ? 'up' : 'down', icon: 'Calendar', color: 'blue-500' },
    { label: 'Leave Balance', value: isLoading ? '...' : `${leaveBalance} Days`, change: isLoading ? 'Loading data...' : 'Total available', trend: 'neutral', icon: 'FileText', color: 'emerald-500' },
    { label: 'Current Streak', value: isLoading ? '...' : `${currentStreak} Days`, change: isLoading ? 'Loading data...' : (currentStreak > 0 ? 'Consecutive present' : 'No active streak'), trend: currentStreak > 3 ? 'up' : 'neutral', icon: 'Activity', color: 'amber-500' },
    { label: 'Performance', value: isLoading ? '...' : (performanceRating !== '--' ? `${performanceRating} / 5` : '--'), change: isLoading ? 'Loading data...' : (performanceRating !== '--' ? 'Average rating' : 'No data available'), trend: 'neutral', icon: 'Star', color: 'purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => (
          <KpiCard key={kpi.label} data={kpi} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl">
              <span className="text-sm font-medium text-muted-foreground">Loading chart data...</span>
            </div>
          )}
          {attendanceHistory.length === 0 && !isLoading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/50 backdrop-blur-sm rounded-xl border border-dashed border-border flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground">Monthly Attendance Overview</span>
              <span className="text-xs font-bold px-3 py-1 bg-muted text-muted-foreground rounded-full border border-border">No attendance records found</span>
            </div>
          ) : null}
          <div className={attendanceHistory.length === 0 && !isLoading ? "opacity-30 pointer-events-none" : ""}>
            <AreaChartCard
              title="Recent Attendance (Last 4 Weeks)"
              data={recentWeeks}
              areas={[
                { key: 'value', color: '#10b981', label: 'Days Present' },
                { key: 'value2', color: '#ef4444', label: 'Days Absent' },
              ]}
            />
          </div>
        </div>
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl">
              <span className="text-sm font-medium text-muted-foreground">Loading chart data...</span>
            </div>
          )}
          {leaveBalances.length === 0 && !isLoading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/50 backdrop-blur-sm rounded-xl border border-dashed border-border flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground">Leave Balance Overview</span>
              <span className="text-xs font-bold px-3 py-1 bg-muted text-muted-foreground rounded-full border border-border">No leave balances found</span>
            </div>
          ) : null}
          <div className={leaveBalances.length === 0 && !isLoading ? "opacity-30 pointer-events-none" : ""}>
            <BarChartCard
              title="Leave Balance Overview"
              data={leaveChartData.length > 0 ? leaveChartData : [{ name: 'No Data', value: 0 }]}
              bars={[
                { key: 'value', color: '#10b981', label: 'Remaining' },
                { key: 'value2', color: '#3b82f6', label: 'Used' }
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileTab() {
  const [profile, setProfile] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    phone: '',
    address: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    profilePhotoUrl: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: ''
  });
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docForm, setDocForm] = useState({ type: '', name: '', url: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/employees/me');
      setProfile(res.data);
      setEditForm({
        phone: res.data.phone || '',
        address: res.data.address || '',
        emergencyContactName: res.data.emergencyContactName || '',
        emergencyContactNumber: res.data.emergencyContactNumber || '',
        profilePhotoUrl: res.data.profilePhotoUrl || '',
        dateOfBirth: res.data.dateOfBirth || '',
        gender: res.data.gender || '',
        bloodGroup: res.data.bloodGroup || ''
      });
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      setSubmitting(true);
      await api.put('/employees/me', editForm);
      toast.success('Profile update submitted for manager approval');
      setEditModalOpen(false);
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!docForm.type || !docForm.name || !docForm.url) {
      toast.error('Please fill all document fields');
      return;
    }
    if (!profile) return;
    try {
      setUploadingDoc(true);
      await api.post(`/employees/${profile.id}/documents`, {
        documentType: docForm.type,
        documentName: docForm.name,
        documentUrl: docForm.url
      });
      toast.success('Document uploaded and pending verification');
      setDocForm({ type: '', name: '', url: '' });
      fetchProfile();
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    try {
      await api.delete(`/employees/documents/${docId}`);
      toast.success('Document deleted successfully');
      fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete document');
    }
  };

  const calculateExperience = (joiningDate?: string) => {
    if (!joiningDate) return 'Not Available';
    const start = new Date(joiningDate);
    const now = new Date();
    const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    if (months < 1) return 'Less than a month';
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${remainingMonths} Month${remainingMonths > 1 ? 's' : ''}`;
    if (remainingMonths === 0) return `${years} Year${years > 1 ? 's' : ''}`;
    return `${years} Year${years > 1 ? 's' : ''} ${remainingMonths} Month${remainingMonths > 1 ? 's' : ''}`;
  };

  const calculateCompletion = () => {
    if (!profile) return 0;
    const fields = [
      profile.firstName,
      profile.email,
      profile.phone,
      profile.address,
      profile.emergencyContactName,
      profile.emergencyContactNumber,
      profile.dateOfBirth,
      profile.gender
    ];
    const filledFields = fields.filter(f => f && f.trim() !== '');
    return Math.round((filledFields.length / fields.length) * 100);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        <div className="lg:col-span-1 space-y-6">
          <div className="h-64 rounded-xl bg-muted/50 border border-border"></div>
          <div className="h-48 rounded-xl bg-muted/50 border border-border"></div>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 rounded-xl bg-muted/50 border border-border"></div>
          <div className="h-48 rounded-xl bg-muted/50 border border-border"></div>
        </div>
      </div>
    );
  }

  if (!profile) return <div className="text-center py-10">Failed to load profile.</div>;

  const completion = calculateCompletion();

  return (
    <div className="space-y-6 relative">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl text-center relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <button onClick={() => setEditModalOpen(true)} className="p-2 rounded-lg bg-secondary/80 text-foreground hover:bg-secondary transition-colors border border-border">
                <Edit2 size={16} />
              </button>
            </div>
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-500/20 overflow-hidden">
              {profile.profilePhotoUrl ? (
                <img src={profile.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white">{profile.firstName?.[0] || 'U'}</span>
              )}
            </div>
            <h2 className="text-xl font-bold text-foreground">{profile.firstName || 'Not Available'} {profile.lastName || ''}</h2>
            <p className="text-sm text-muted-foreground">{profile.employeeCode || 'Not Available'}</p>
            
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <span className="px-2 py-1 text-xs rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">{profile.departmentName || 'Not Available'}</span>
              <span className="px-2 py-1 text-xs rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 capitalize">{profile.role || 'Not Available'}</span>
              <span className={`px-2 py-1 text-xs rounded-md border ${profile.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                {profile.status || 'Not Available'}
              </span>
            </div>

            {profile.profileVerificationStatus && (
              <div className="mt-4 flex justify-center">
                <span className={`px-2 py-1 text-[10px] font-bold rounded-full border ${
                  profile.profileVerificationStatus === 'PROFILE_VERIFIED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  profile.profileVerificationStatus === 'PENDING_MANAGER_APPROVAL' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {profile.profileVerificationStatus === 'PROFILE_VERIFIED' ? '✓ Profile Verified' :
                   profile.profileVerificationStatus === 'PENDING_MANAGER_APPROVAL' ? '⌛ Pending Approval' :
                   '✕ Update Rejected'}
                </span>
              </div>
            )}
            {profile.profileVerificationStatus === 'PROFILE_REJECTED' && profile.profileRejectionReason && (
              <p className="mt-2 text-xs text-red-400 text-center">Reason: {profile.profileRejectionReason}</p>
            )}

            <div className="mt-6 pt-6 border-t border-border/50 text-left">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-muted-foreground">Profile Completion</span>
                <span className="text-xs font-bold text-foreground">{completion}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${completion}%` }} />
              </div>
              {completion < 100 && (
                <p className="text-[10px] text-amber-500 mt-2">Complete your profile to unlock all features.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-foreground mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-foreground">
                <Mail size={16} className="text-muted-foreground shrink-0" />
                <span className="truncate">{profile.email || 'Not Available'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-foreground">
                <Phone size={16} className="text-muted-foreground shrink-0" />
                <span>{profile.phone || 'Not Available'}</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-foreground">
                <MapPin size={16} className="text-muted-foreground shrink-0 mt-0.5" />
                <span className="leading-tight">{profile.address || 'Not Available'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-foreground mb-4">Personal Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <p className="text-xs text-muted-foreground">Employee Code</p>
                <p className="text-sm text-foreground font-medium">{profile.employeeCode || 'Not Available'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date of Birth</p>
                <p className="text-sm text-foreground font-medium">{profile.dateOfBirth || 'Not Available'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Gender</p>
                <p className="text-sm text-foreground font-medium">{profile.gender || 'Not Available'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Blood Group</p>
                <p className="text-sm text-foreground font-medium">{profile.bloodGroup || 'Not Available'}</p>
              </div>
              <div className="sm:col-span-2 pt-2 mt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Emergency Contact</p>
                <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-border/50">
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{profile.emergencyContactName || 'Not Available'}</p>
                      <p className="text-xs text-muted-foreground">Contact Person</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{profile.emergencyContactNumber || 'Not Available'}</p>
                    <p className="text-xs text-muted-foreground">Phone</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-foreground mb-4">Organization Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6">
              <div>
                <p className="text-xs text-muted-foreground">Department</p>
                <p className="text-sm text-foreground font-medium">{profile.departmentName || 'Not Available'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Designation</p>
                <p className="text-sm text-foreground font-medium">{profile.designation || 'Not Available'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Employment Type</p>
                <p className="text-sm text-foreground font-medium">{profile.employmentType || 'Full-Time'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Joining Date</p>
                <p className="text-sm text-foreground font-medium">{profile.joiningDate || 'Not Available'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Experience</p>
                <p className="text-sm text-foreground font-medium">{calculateExperience(profile.joiningDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reporting Manager</p>
                <p className="text-sm text-foreground font-medium">{profile.managerName || 'Not Assigned'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-foreground mb-4">Documents</h3>
            
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input type="text" placeholder="Type (e.g. Resume)" value={docForm.type} onChange={e => setDocForm({...docForm, type: e.target.value})} className="rounded-lg border px-3 py-1.5 text-xs bg-background border-border text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <input type="text" placeholder="Document Name" value={docForm.name} onChange={e => setDocForm({...docForm, name: e.target.value})} className="rounded-lg border px-3 py-1.5 text-xs bg-background border-border text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <input type="url" placeholder="URL Link" value={docForm.url} onChange={e => setDocForm({...docForm, url: e.target.value})} className="rounded-lg border px-3 py-1.5 text-xs bg-background border-border text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <button onClick={handleUploadDocument} disabled={uploadingDoc} className="py-1.5 px-3 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow shadow-blue-600/20 transition-colors disabled:opacity-50">Upload</button>
            </div>

            {profile.documents && profile.documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.documents.map((doc, idx) => (
                  <div key={idx} className="flex flex-col p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <FileText size={20} className="text-blue-400 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground line-clamp-1">{doc.documentName}</p>
                          <p className="text-xs text-muted-foreground">{doc.documentType} • {new Date(doc.uploadDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                          <Eye size={14} />
                        </a>
                        {doc.status !== 'DOCUMENT_VERIFIED' && (
                          <button onClick={() => handleDeleteDocument(doc.id)} className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    {doc.status && (
                      <div className="mt-1 flex items-center justify-between">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          doc.status === 'DOCUMENT_VERIFIED' ? 'bg-emerald-500/10 text-emerald-400' :
                          doc.status === 'PENDING_HR_ADMIN_APPROVAL' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {doc.status.replace(/_/g, ' ')}
                        </span>
                        {doc.status === 'DOCUMENT_REJECTED' && doc.rejectionReason && (
                           <span className="text-[10px] text-red-400 italic max-w-[120px] truncate" title={doc.rejectionReason}>{doc.rejectionReason}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg bg-muted/10">
                No documents uploaded.
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {editModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !submitting && setEditModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md flex flex-col rounded-3xl shadow-2xl border bg-card border-border p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <h2 className="text-xl font-bold text-foreground mb-1">Edit Profile</h2>
              <p className="text-xs text-muted-foreground mb-4">Update your personal contact information.</p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Phone Number</label>
                    <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="w-full rounded-xl border px-4 py-2 text-sm bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+1 (555) 000-0000" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Date of Birth</label>
                    <input type="date" value={editForm.dateOfBirth} onChange={(e) => setEditForm({...editForm, dateOfBirth: e.target.value})} className="w-full rounded-xl border px-4 py-2 text-sm bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Gender</label>
                    <select value={editForm.gender} onChange={(e) => setEditForm({...editForm, gender: e.target.value})} className="w-full rounded-xl border px-4 py-2 text-sm bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Blood Group</label>
                    <select value={editForm.bloodGroup} onChange={(e) => setEditForm({...editForm, bloodGroup: e.target.value})} className="w-full rounded-xl border px-4 py-2 text-sm bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Address</label>
                  <textarea rows={2} value={editForm.address} onChange={(e) => setEditForm({...editForm, address: e.target.value})} className="w-full rounded-xl border px-4 py-2 text-sm bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your full address" />
                </div>
                
                <div className="pt-2 border-t border-border/50">
                  <h4 className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">Emergency Contact</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Name</label>
                      <input type="text" value={editForm.emergencyContactName} onChange={(e) => setEditForm({...editForm, emergencyContactName: e.target.value})} className="w-full rounded-xl border px-4 py-2 text-sm bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contact Person Name" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Phone</label>
                      <input type="tel" value={editForm.emergencyContactNumber} onChange={(e) => setEditForm({...editForm, emergencyContactNumber: e.target.value})} className="w-full rounded-xl border px-4 py-2 text-sm bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contact Phone Number" />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50">
                  <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Profile Photo URL</label>
                  <input type="url" value={editForm.profilePhotoUrl} onChange={(e) => setEditForm({...editForm, profilePhotoUrl: e.target.value})} className="w-full rounded-xl border px-4 py-2 text-sm bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://example.com/photo.jpg" />
                </div>

                <div className="flex gap-3 pt-4 mt-2">
                  <button onClick={() => setEditModalOpen(false)} disabled={submitting} className="flex-1 py-2 rounded-xl text-sm font-bold border border-border text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50">Cancel</button>
                  <button onClick={handleUpdateProfile} disabled={submitting} className="flex-1 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-colors disabled:opacity-50">
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AttendanceTab() {
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const user = useAuthStore(s => s.user);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    try {
      setFetchingHistory(true);
      const empId = user?.id || 1;
      const res = await api.get(`/attendance/employee/${empId}`);
      
      const actualRecords = res.data;
      
      // Sort history descending by date
      actualRecords.sort((a: any, b: any) => b.attendanceDate.localeCompare(a.attendanceDate));
      setAttendanceHistory(actualRecords);
    } catch (err) {
      console.error('Failed to fetch attendance history', err);
    } finally {
      setFetchingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      await api.post('/attendance/check-in', {
        employeeId: user?.id || 1, // fallback for demo
        checkInTime: new Date().toISOString(),
        source: 'WEB'
      });
      toast.success('Successfully checked in!');
      fetchHistory();
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      await api.post('/attendance/check-out', {
        employeeId: user?.id || 1, // fallback for demo
        checkOutTime: new Date().toISOString(),
        remarks: 'Standard checkout'
      });
      toast.success('Successfully checked out!');
      fetchHistory();
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  // Check if current time is within allowed window (05:00 AM - 03:00 PM)
  const isWithinTimeWindow = currentTime.getHours() >= 5 && currentTime.getHours() < 15;

  // Find today's record in local time
  const year = currentTime.getFullYear();
  const month = String(currentTime.getMonth() + 1).padStart(2, '0');
  const day = String(currentTime.getDate()).padStart(2, '0');
  const localTodayStr = `${year}-${month}-${day}`;
  
  const todayRecord = attendanceHistory.find(r => r.attendanceDate === localTodayStr);
  const hasCheckedInToday = todayRecord && todayRecord.checkInTime !== '--';
  const hasCheckedOutToday = todayRecord && todayRecord.checkOutTime !== '--';

  const isCheckInAllowed = isWithinTimeWindow && !hasCheckedInToday;
  const isCheckOutAllowed = hasCheckedInToday && !hasCheckedOutToday;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl text-center">
          <div className="w-32 h-32 rounded-full border-4 border-blue-500/20 mx-auto mb-6 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors" />
            <Clock size={24} className="text-blue-400 mb-2 z-10" />
            <span className="text-2xl font-bold text-foreground z-10">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
          </div>
          <div className="flex gap-4">
            <button onClick={handleCheckIn} disabled={loading || !isCheckInAllowed} className="flex-1 py-2.5 rounded-lg bg-emerald-500 text-foreground text-sm font-medium hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
              {hasCheckedInToday ? 'Checked In' : 'Check In'}
            </button>
            <button onClick={handleCheckOut} disabled={loading || !isCheckOutAllowed} className="flex-1 py-2.5 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary transition-colors border border-border disabled:opacity-50 disabled:cursor-not-allowed">
              {hasCheckedOutToday ? 'Checked Out' : 'Check Out'}
            </button>
          </div>
          {!isWithinTimeWindow && !hasCheckedInToday && <p className="text-xs text-amber-500 mt-2 font-medium">Check-in is only available between 05:00 AM and 03:00 PM</p>}
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Attendance History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted-foreground border-b border-border">
                <tr>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Check In</th>
                  <th className="pb-3 font-medium">Check Out</th>
                  <th className="pb-3 font-medium">Total Hours</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {fetchingHistory ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
                        <p className="text-muted-foreground text-sm mt-2">Loading attendance records...</p>
                      </div>
                    </td>
                  </tr>
                ) : attendanceHistory.length > 0 ? attendanceHistory.map((row, i) => (
                  <tr key={i} className="hover:bg-muted transition-colors">
                    <td className="py-3">{row.attendanceDate}</td>
                    <td className="py-3">{row.checkInTime}</td>
                    <td className="py-3">{row.checkOutTime}</td>
                    <td className="py-3">{row.totalHours}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${
                        row.status === 'present' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        row.status === 'late' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      } capitalize`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-muted-foreground">
                      No attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaveTab() {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState<LeaveRequestSubmit>({
    leaveTypeId: 0,
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const getMinDate = () => {
    const now = new Date();
    if (now.getHours() >= 18) {
      now.setDate(now.getDate() + 1);
    }
    return now.toISOString().split('T')[0];
  };
  const minDate = getMinDate();
  const hasPendingRequest = requests.some(r => r.status === 'PENDING');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [b, r] = await Promise.all([
        leaveService.getMyBalances(),
        leaveService.getMyRequests()
      ]);
      setBalances(b);
      setRequests(r);
      if (b.length > 0 && leaveForm.leaveTypeId === 0) {
        setLeaveForm(prev => ({ ...prev, leaveTypeId: b[0].leaveType.id }));
      }
    } catch (err: any) {
      toast.error('Failed to load leave data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApply = async () => {
    try {
      if (!leaveForm.leaveTypeId || !leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
        toast.error('Please fill all required fields');
        return;
      }
      setIsSubmitting(true);
      if (editingId) {
        await leaveService.editLeaveRequest(editingId, leaveForm);
        toast.success('Leave request updated');
      } else {
        await leaveService.submitLeaveRequest(leaveForm);
        toast.success('Leave request submitted');
      }
      setApplyModalOpen(false);
      setEditingId(null);
      setLeaveForm({ leaveTypeId: balances[0]?.leaveType.id || 0, startDate: '', endDate: '', reason: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      await leaveService.cancelLeaveRequest(id);
      toast.success('Leave request cancelled');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to cancel request');
    }
  };

  const openEdit = (req: LeaveRequest) => {
    setEditingId(req.id);
    setLeaveForm({
      leaveTypeId: req.leaveType.id,
      startDate: req.startDate,
      endDate: req.endDate,
      reason: req.reason
    });
    setApplyModalOpen(true);
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading leave data...</div>;
  }

  return (
    <div className="space-y-6 relative">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-foreground mb-4">Leave Balances</h3>
            <div className="space-y-4">
              {balances.map((balance) => {
                const total = balance.totalDays;
                const used = balance.usedDays;
                const pending = balance.pendingDays;
                const percent = total > 0 ? ((used + pending) / total) * 100 : 0;
                
                return (
                  <div key={balance.id}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-foreground">{balance.leaveType.name}</span>
                      <span className="text-foreground font-medium">{balance.remainingDays} / {total} remaining</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${percent > 80 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${Math.min(percent, 100)}%` }} 
                      />
                    </div>
                    {pending > 0 && (
                      <p className="text-xs text-muted-foreground mt-1 text-right">{pending} pending approval</p>
                    )}
                  </div>
                );
              })}
            </div>
            <button 
              onClick={() => {
                if (hasPendingRequest) return;
                setEditingId(null);
                setLeaveForm({ leaveTypeId: balances[0]?.leaveType.id || 0, startDate: '', endDate: '', reason: '' });
                setApplyModalOpen(true);
              }}
              disabled={hasPendingRequest}
              className={`w-full mt-6 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg ${
                hasPendingRequest 
                  ? 'bg-secondary text-muted-foreground cursor-not-allowed shadow-none' 
                  : 'bg-blue-600 text-foreground hover:bg-blue-500 shadow-blue-500/20'
              }`}
            >
              {hasPendingRequest ? 'Pending Request Exists' : 'Apply Leave'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-foreground mb-4">Leave History</h3>
          <div className="space-y-3">
            {requests.length > 0 ? requests.map(req => (
              <div key={req.id} className="p-4 rounded-lg bg-muted/50 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">{req.leaveType.name}</span>
                    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full border ${
                      req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      req.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      req.status === 'CANCELLED' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                      'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {req.startDate} to {req.endDate} ({req.numberOfDays} {req.numberOfDays === 1 ? 'day' : 'days'})
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{req.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  {req.status === 'PENDING' && (
                    <>
                      <button onClick={() => openEdit(req)} className="px-3 py-1.5 text-xs font-medium rounded-md bg-secondary text-foreground hover:bg-muted border border-border transition-colors">Edit</button>
                      <button onClick={() => handleCancel(req.id)} className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-colors">Cancel</button>
                    </>
                  )}
                  {req.approvalHistories && req.approvalHistories.length > 0 && (
                    <div className="text-xs text-muted-foreground text-right ml-4">
                      {req.approvalHistories.map((h, i) => (
                        <div key={i} className="max-w-[200px] mb-1 last:mb-0">
                          <div className="truncate font-medium">{h.action} by {h.actionByUserName}</div>
                          {h.comments && (
                            <div className="italic text-[10px] text-muted-foreground/80 break-words line-clamp-2">"{h.comments}"</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="py-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
                No leave history found.
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {applyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setApplyModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md flex flex-col rounded-3xl shadow-2xl border bg-card border-border p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">{editingId ? 'Edit Leave Request' : 'Apply for Leave'}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Leave Type</label>
                  <select 
                    value={leaveForm.leaveTypeId} 
                    onChange={e => setLeaveForm({...leaveForm, leaveTypeId: Number(e.target.value)})}
                    className="w-full rounded-xl border px-4 py-2 text-sm bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {balances.map(b => (
                      <option key={b.leaveType.id} value={b.leaveType.id}>{b.leaveType.name} ({b.remainingDays} days left)</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Start Date</label>
                    <input type="date" value={leaveForm.startDate} onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})} min={minDate} className="w-full rounded-xl border px-4 py-2 text-sm bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 dark:[color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-muted-foreground">End Date</label>
                    <input type="date" value={leaveForm.endDate} onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})} min={leaveForm.startDate || minDate} className="w-full rounded-xl border px-4 py-2 text-sm bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 dark:[color-scheme:dark]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Reason</label>
                  <textarea rows={3} value={leaveForm.reason} onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})} className="w-full rounded-xl border px-4 py-2 text-sm bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Please provide your reason..." />
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setApplyModalOpen(false)} className="flex-1 py-2 rounded-xl text-sm font-bold border border-border text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
                  <button onClick={handleApply} disabled={isSubmitting} className="flex-1 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-colors">
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PerformanceTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-foreground">Current Goals</h3>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md border border-border">0 Active</span>
          </div>
          <div className="py-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
            No goals set.
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
          <FeedbackDashboard />
        </div>
      </div>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
      <h3 className="text-sm font-semibold text-foreground mb-4">Recent Notifications</h3>
      <div className="py-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
        No new notifications.
      </div>
    </div>
  );
}

function PayrollTab() {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    if (user?.id) {
      api.get(`/payrolls/employee/${user.id}`)
        .then(res => setPayrolls(res.data))
        .catch(err => console.error("Failed to fetch payrolls", err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading payslips...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-foreground mb-4">My Payslips</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted-foreground border-b border-border">
              <tr>
                <th className="pb-3 font-medium">Month/Year</th>
                <th className="pb-3 font-medium">Payslip #</th>
                <th className="pb-3 font-medium text-right">Basic Salary</th>
                <th className="pb-3 font-medium text-right">Deductions & Tax</th>
                <th className="pb-3 font-medium text-right">Net Salary</th>
                <th className="pb-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {payrolls.length > 0 ? payrolls.map((row) => (
                <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                  <td className="py-3 font-medium">
                    {new Date(row.payrollYear, row.payrollMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </td>
                  <td className="py-3 text-muted-foreground">{row.payslipNumber}</td>
                  <td className="py-3 text-right">${row.grossSalary?.toLocaleString()}</td>
                  <td className="py-3 text-right text-red-400">
                    -${((row.totalDeductions || 0) + (row.totalTaxes || 0)).toLocaleString()}
                  </td>
                  <td className="py-3 text-right font-bold text-emerald-400">
                    ${row.netSalary?.toLocaleString()}
                  </td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${
                      row.status === 'processed' || row.status === 'paid' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    } capitalize`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No payslips found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function EmployeeDashboard() {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();
  const activeTab = currentPath === 'dashboard' ? 'overview' : currentPath || 'overview';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'profile': return <ProfileTab />;
      case 'attendance': return <AttendanceTab />;
      case 'leave': return <LeaveTab />;
      case 'performance': return <PerformanceTab />;
      case 'payroll': return <PayrollTab />;
      case 'notifications': return <NotificationsTab />;
      default: return <OverviewTab />;
    }
  };

  const [resignModalOpen, setResignModalOpen] = useState(false);
  const [resignForm, setResignForm] = useState({ reason: '', expectedLeaveDate: '' });
  const [myResignation, setMyResignation] = useState<Resignation | null>(null);

  useEffect(() => {
    getMyResignations().then(data => {
      // Find the most recent or pending resignation
      if (data && data.length > 0) {
        const pendingOrApproved = data.find(r => r.status === 'PENDING' || r.status === 'APPROVED');
        setMyResignation(pendingOrApproved || data[0]);
      }
    }).catch(console.error);
  }, []);

  const handleResignSubmit = async () => {
    try {
      if (!resignForm.reason || !resignForm.expectedLeaveDate) {
        toast.error('Reason and expected leave date are required');
        return;
      }

      const selectedDate = new Date(resignForm.expectedLeaveDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate <= today) {
        toast.error('Expected leave date must be in the future');
        return;
      }

      const res = await submitResignation(resignForm);
      setMyResignation(res);
      setResignModalOpen(false);
      toast.success('Resignation request submitted successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit resignation');
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 relative">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Space</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your profile, attendance, and benefits.</p>
        </div>
        <div className="flex gap-2 items-center">
          {myResignation && (myResignation.status === 'PENDING' || myResignation.status === 'APPROVED') ? (
            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${myResignation.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
              Resignation {myResignation.status}
            </span>
          ) : (
            <button onClick={() => setResignModalOpen(true)} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-colors border border-red-500/20">
              Submit Resignation
            </button>
          )}
          <button className="px-3 py-1.5 rounded-lg bg-secondary text-foreground text-xs font-medium hover:bg-secondary transition-colors border border-border">
            Export Data
          </button>
        </div>
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

      <AnimatePresence>
        {resignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setResignModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md flex flex-col rounded-3xl shadow-2xl border bg-card border-border p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Submit Resignation</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Reason for Resignation</label>
                  <textarea rows={4} value={resignForm.reason} onChange={(e) => setResignForm({...resignForm, reason: e.target.value})} className="w-full rounded-xl border px-4 py-2 text-sm bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Please provide your reason..." />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-muted-foreground">Expected Last Working Day</label>
                  <input type="date" value={resignForm.expectedLeaveDate} onChange={(e) => setResignForm({...resignForm, expectedLeaveDate: e.target.value})} min={new Date().toISOString().split('T')[0]} className="w-full rounded-xl border px-4 py-2 text-sm bg-background border-border text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 dark:[color-scheme:dark]" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setResignModalOpen(false)} className="flex-1 py-2 rounded-xl text-sm font-bold border border-border text-muted-foreground hover:bg-muted">Cancel</button>
                  <button onClick={handleResignSubmit} className="flex-1 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20">Submit</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
