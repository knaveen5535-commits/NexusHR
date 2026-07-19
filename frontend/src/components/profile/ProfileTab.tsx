import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Mail, Phone, MapPin, User,
  FileText, Edit2, Eye, Trash2,
  Check, X
} from 'lucide-react';
import { getMyLatestProfileRequest } from '../../services/employee.service';
import type { Employee, ProfileUpdateRequest } from '../../types';
import api from '../../services/api';

export default function ProfileTab() {
  const [profile, setProfile] = useState<Employee | null>(null);
  const [latestRequest, setLatestRequest] = useState<ProfileUpdateRequest | null>(null);
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
      
      const req = await getMyLatestProfileRequest();
      setLatestRequest(req);
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
      const payload: any = { ...editForm };
      if (!payload.dateOfBirth) payload.dateOfBirth = null;
      
      await api.put('/employees/me', payload);
      if (profile?.role === 'MANAGER' || profile?.role === 'HR') {
          toast.success('Profile update submitted for admin approval');
      } else {
          toast.success('Profile update submitted for manager approval');
      }
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
  const isPending = latestRequest?.status.includes('PENDING');

  return (
    <div className="space-y-6 relative">
      {latestRequest && isPending && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-4">
          <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500">
            <Eye size={20} />
          </div>
          <div>
            <h4 className="text-amber-500 font-medium">Profile changes are pending approval</h4>
            <p className="text-sm text-amber-500/80 mt-1">
              Submitted on {new Date(latestRequest.createdAt).toLocaleDateString()}. Current status: {latestRequest.status.replace(/_/g, ' ')}.
              The changes below will be applied once approved.
            </p>
          </div>
        </div>
      )}

      {latestRequest && latestRequest.status === 'PROFILE_REJECTED' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-4">
          <div className="p-2 bg-red-500/20 rounded-lg text-red-500">
            <X size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-red-500 font-medium">Profile changes were rejected</h4>
            <p className="text-sm text-red-500/80 mt-1">
              Submitted on {new Date(latestRequest.createdAt).toLocaleDateString()}.
            </p>
            {(latestRequest.rejectionReason || latestRequest.reviewerComment) && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                <span className="font-semibold block mb-1">Reviewer Comment:</span>
                {latestRequest.reviewerComment || latestRequest.rejectionReason}
              </div>
            )}
          </div>
        </div>
      )}

      {latestRequest && latestRequest.status === 'PROFILE_VERIFIED' && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-4">
          <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-500">
            <Check size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-emerald-500 font-medium">Profile changes were approved</h4>
            <p className="text-sm text-emerald-500/80 mt-1">
              Approved on {latestRequest.reviewedAt ? new Date(latestRequest.reviewedAt).toLocaleDateString() : 'recently'}.
            </p>
            {latestRequest.reviewerComment && (
              <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-400">
                <span className="font-semibold block mb-1">Reviewer Comment:</span>
                {latestRequest.reviewerComment}
              </div>
            )}
          </div>
        </div>
      )}

      {latestRequest && isPending && (
        <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-foreground mb-4">Pending Changes Review</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="p-3 text-left font-medium rounded-l-lg">Field</th>
                  <th className="p-3 text-left font-medium">Current Value</th>
                  <th className="p-3 text-left font-medium rounded-r-lg">Requested Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {profile.phone !== latestRequest.requestedPhone && (
                  <tr>
                    <td className="p-3 font-medium text-foreground">Phone</td>
                    <td className="p-3 text-muted-foreground">{profile.phone || 'N/A'}</td>
                    <td className="p-3 text-blue-400">{latestRequest.requestedPhone || 'N/A'}</td>
                  </tr>
                )}
                {profile.address !== latestRequest.requestedAddress && (
                  <tr>
                    <td className="p-3 font-medium text-foreground">Address</td>
                    <td className="p-3 text-muted-foreground">{profile.address || 'N/A'}</td>
                    <td className="p-3 text-blue-400">{latestRequest.requestedAddress || 'N/A'}</td>
                  </tr>
                )}
                {profile.dateOfBirth !== latestRequest.requestedDateOfBirth && (
                  <tr>
                    <td className="p-3 font-medium text-foreground">Date of Birth</td>
                    <td className="p-3 text-muted-foreground">{profile.dateOfBirth || 'N/A'}</td>
                    <td className="p-3 text-blue-400">{latestRequest.requestedDateOfBirth || 'N/A'}</td>
                  </tr>
                )}
                {profile.gender !== latestRequest.requestedGender && (
                  <tr>
                    <td className="p-3 font-medium text-foreground">Gender</td>
                    <td className="p-3 text-muted-foreground">{profile.gender || 'N/A'}</td>
                    <td className="p-3 text-blue-400">{latestRequest.requestedGender || 'N/A'}</td>
                  </tr>
                )}
                {profile.bloodGroup !== latestRequest.requestedBloodGroup && (
                  <tr>
                    <td className="p-3 font-medium text-foreground">Blood Group</td>
                    <td className="p-3 text-muted-foreground">{profile.bloodGroup || 'N/A'}</td>
                    <td className="p-3 text-blue-400">{latestRequest.requestedBloodGroup || 'N/A'}</td>
                  </tr>
                )}
                {profile.emergencyContactName !== latestRequest.requestedEmergencyContactName && (
                  <tr>
                    <td className="p-3 font-medium text-foreground">Emergency Contact Name</td>
                    <td className="p-3 text-muted-foreground">{profile.emergencyContactName || 'N/A'}</td>
                    <td className="p-3 text-blue-400">{latestRequest.requestedEmergencyContactName || 'N/A'}</td>
                  </tr>
                )}
                {profile.emergencyContactNumber !== latestRequest.requestedEmergencyContactNumber && (
                  <tr>
                    <td className="p-3 font-medium text-foreground">Emergency Contact Phone</td>
                    <td className="p-3 text-muted-foreground">{profile.emergencyContactNumber || 'N/A'}</td>
                    <td className="p-3 text-blue-400">{latestRequest.requestedEmergencyContactNumber || 'N/A'}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl text-center relative overflow-hidden">
            <div className="absolute top-4 right-4">
              {!isPending && (
                <button onClick={() => setEditModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 text-sm font-medium">
                  <Edit2 size={14} />
                  Edit Profile
                </button>
              )}
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
                  (profile.profileVerificationStatus === 'PENDING_MANAGER_APPROVAL' || profile.profileVerificationStatus === 'PENDING_ADMIN_APPROVAL') ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {profile.profileVerificationStatus === 'PROFILE_VERIFIED' ? '✓ Profile Verified' :
                   (profile.profileVerificationStatus === 'PENDING_MANAGER_APPROVAL' || profile.profileVerificationStatus === 'PENDING_ADMIN_APPROVAL') ? '⌛ Pending Approval' :
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
                          (doc.status === 'PENDING_HR_ADMIN_APPROVAL') ? 'bg-amber-500/10 text-amber-400' :
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
