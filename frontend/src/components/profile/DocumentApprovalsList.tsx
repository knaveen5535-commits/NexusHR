import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Eye, Check, X, FileText } from 'lucide-react';
import { getPendingDocuments, verifyDocument } from '../../services/employee.service';

export default function DocumentApprovalsList() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getPendingDocuments();
      setRequests(data);
    } catch (error) {
      toast.error('Failed to load document requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleVerify = async (status: 'DOCUMENT_VERIFIED' | 'DOCUMENT_REJECTED') => {
    if (!selectedRequest) return;
    if (status === 'DOCUMENT_REJECTED' && !reason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    try {
      setSubmitting(true);
      await verifyDocument(selectedRequest.id, status, reason);
      toast.success(`Document ${status === 'DOCUMENT_VERIFIED' ? 'approved' : 'rejected'} successfully`);
      setSelectedRequest(null);
      setReason('');
      fetchRequests();
    } catch (error) {
      toast.error('Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading document requests...</div>;

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-xl border border-dashed border-border bg-card/50">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Check className="text-muted-foreground" size={24} />
        </div>
        <h3 className="text-lg font-medium text-foreground">All Caught Up</h3>
        <p className="text-sm text-muted-foreground mt-1">There are no pending document verification requests to review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {requests.map((request) => (
          <div key={request.id} className="flex flex-col p-5 rounded-xl border border-border bg-card/50 backdrop-blur-xl hover:border-blue-500/50 transition-colors cursor-pointer" onClick={() => setSelectedRequest(request)}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {request.employee.firstName[0]}
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{request.employee.firstName} {request.employee.lastName}</h4>
                  <p className="text-xs text-muted-foreground">Uploaded: {new Date(request.uploadDate).toLocaleDateString()}</p>
                </div>
              </div>
              <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full border bg-amber-500/10 text-amber-500 border-amber-500/20">
                PENDING
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm font-medium text-foreground mt-2 bg-muted/50 p-2 rounded-lg border border-border">
              <FileText size={16} className="text-blue-400" />
              <span className="truncate">{request.documentName}</span>
              <span className="text-xs text-muted-foreground ml-auto">{request.documentType}</span>
            </div>
            
            <button className="mt-4 w-full py-2 flex items-center justify-center gap-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
              <Eye size={16} />
              Review Document
            </button>
          </div>
        ))}
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-3xl rounded-xl border border-border shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-bold text-foreground">Review Document</h3>
                <p className="text-sm text-muted-foreground">Uploaded by {selectedRequest.employee.firstName} {selectedRequest.employee.lastName}</p>
              </div>
              <button onClick={() => { setSelectedRequest(null); setReason(''); }} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto grow">
              <div className="rounded-lg border border-border p-4 bg-muted/30 mb-6 flex flex-col items-center justify-center min-h-[200px]">
                <FileText size={48} className="text-blue-400 mb-4" />
                <h4 className="font-bold text-lg">{selectedRequest.documentName}</h4>
                <p className="text-sm text-muted-foreground">{selectedRequest.documentType}</p>
                <a 
                  href={selectedRequest.documentUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <Eye size={16} />
                  View Document
                </a>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Reviewer Comment / Rejection Reason
                </label>
                <textarea 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" 
                  rows={3} 
                  placeholder="Optional for approval, required for rejection..." 
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-border flex justify-end gap-3 shrink-0 bg-muted/20">
              <button 
                onClick={() => handleVerify('DOCUMENT_REJECTED')} 
                disabled={submitting} 
                className="px-4 py-2 rounded-lg border border-red-500/20 text-red-500 font-medium hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                Reject Document
              </button>
              <button 
                onClick={() => handleVerify('DOCUMENT_VERIFIED')} 
                disabled={submitting} 
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                Approve Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
