import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Clock, ChevronRight } from 'lucide-react';
import api from '../../../services/api';
import { getPendingProfileRequests } from '../../../services/employee.service';
import type { Employee, ProfileUpdateRequest } from '../../../types';
import { calculateProfileCompletion } from '../../../utils/profileUtils';

export default function EmployeeOnboardingTab() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ProfileUpdateRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [empRes, reqRes] = await Promise.all([
          api.get('/employees'),
          getPendingProfileRequests().catch(() => [])
        ]);
        
        // Filter only employees in ONBOARDING state
        const onboardingEmployees = empRes.data.filter((e: Employee) => e.status === 'ONBOARDING');
        setEmployees(onboardingEmployees);
        setPendingRequests(reqRes);
      } catch (err) {
        console.error('Failed to fetch onboarding data', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="p-12 text-center text-muted-foreground animate-pulse">Loading onboarding data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-foreground mb-2">Employee Onboarding Tracker</h3>
        <p className="text-sm text-muted-foreground mb-6">Monitor the onboarding progress of new hires. This dashboard tracks profile completion and verification status.</p>
        
        {employees.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground border border-dashed border-border rounded-lg bg-muted/10">
            No employees currently in the onboarding phase.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground border-b border-border">
                <tr>
                  <th className="p-4 font-medium whitespace-nowrap">Employee</th>
                  <th className="p-4 font-medium whitespace-nowrap">Department / Role</th>
                  <th className="p-4 font-medium whitespace-nowrap">Progress</th>
                  <th className="p-4 font-medium whitespace-nowrap text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employees.map(emp => {
                  const completion = calculateProfileCompletion(emp);
                  const hasPendingRequest = pendingRequests.some(r => r.employee.id === emp.id);
                  const currentPhase = hasPendingRequest ? 'Profile Verification' : 'Profile Completion';
                  
                  return (
                    <tr key={emp.id} className="hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-foreground whitespace-nowrap">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-muted-foreground">{emp.employeeCode || 'No ID'}</p>
                        <p className="text-xs text-muted-foreground mt-1">Joined: {emp.joiningDate || 'N/A'}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-foreground font-medium whitespace-nowrap">{emp.departmentName || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">{emp.designation || 'N/A'}</p>
                      </td>
                      <td className="p-4 w-full max-w-xl">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-medium text-foreground">Phase: {currentPhase}</span>
                            <span className="font-bold text-blue-500">{completion}% Profile</span>
                          </div>
                          
                          {/* 4-Step Progress Indicator */}
                          <div className="flex items-center justify-between gap-1 w-full mt-2">
                            {/* Step 1: Employee Created */}
                            <div className="flex items-center gap-1.5 flex-1 min-w-0 opacity-50">
                              <CheckCircle2 className="text-emerald-500 shrink-0" size={16} />
                              <span className="text-[10px] font-medium truncate line-through hidden sm:block">Created</span>
                            </div>
                            
                            <ChevronRight className="text-muted-foreground/30 shrink-0" size={14} />
                            
                            {/* Step 2: Profile Completion */}
                            <div className={`flex items-center gap-1.5 flex-1 min-w-0 ${hasPendingRequest ? 'opacity-50' : 'opacity-100'}`}>
                              {hasPendingRequest ? (
                                <CheckCircle2 className="text-emerald-500 shrink-0" size={16} />
                              ) : (
                                <Circle className="text-blue-500 shrink-0" size={16} />
                              )}
                              <span className={`text-[10px] font-medium truncate hidden sm:block ${hasPendingRequest ? 'line-through' : 'text-blue-500'}`}>
                                Profile
                              </span>
                            </div>
                            
                            <ChevronRight className="text-muted-foreground/30 shrink-0" size={14} />
                            
                            {/* Step 3: Profile Verification */}
                            <div className={`flex items-center gap-1.5 flex-1 min-w-0 ${hasPendingRequest ? 'opacity-100' : 'opacity-40'}`}>
                              {hasPendingRequest ? (
                                <Clock className="text-amber-500 shrink-0" size={16} />
                              ) : (
                                <Circle className="text-muted-foreground shrink-0" size={16} />
                              )}
                              <span className={`text-[10px] font-medium truncate hidden sm:block ${hasPendingRequest ? 'text-amber-500' : ''}`}>
                                Verify
                              </span>
                            </div>
                            
                            <ChevronRight className="text-muted-foreground/30 shrink-0" size={14} />
                            
                            {/* Step 4: Active Employee */}
                            <div className="flex items-center gap-1.5 flex-1 min-w-0 opacity-40">
                              <Circle className="text-muted-foreground shrink-0" size={16} />
                              <span className="text-[10px] font-medium truncate hidden sm:block">Active</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full border bg-amber-500/10 text-amber-500 border-amber-500/20 whitespace-nowrap">
                          {emp.status}
                        </span>
                        {hasPendingRequest && (
                           <div className="mt-2 text-[10px] text-amber-500 whitespace-nowrap">Pending Approval</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
