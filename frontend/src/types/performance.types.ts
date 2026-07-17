export interface PerformanceConfiguration {
  id?: number;
  attendanceWeight: number;
  selfWeight: number;
  peerWeight: number;
  managerWeight: number;
  reviewWindowStartDay: number;
  reviewWindowEndDay: number;
  minimumAttendanceRequired: number;
  performanceEnabled: boolean;
}

export interface PerformanceRecord {
  id: number;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    departmentName?: string;
    role?: string;
    managerName?: string;
  };
  performanceYear: number;
  performanceMonth: number;
  
  attendanceScore: number;
  selfReviewScore: number;
  peerReviewScore: number;
  managerReviewScore: number;
  
  attendanceWeight: number;
  selfWeight: number;
  peerWeight: number;
  managerWeight: number;
  
  finalScore: number;
  grade: string;
  remarks: string;
  
  generatedBy: string;
  generatedAt: string;
  
  published: boolean;
  locked: boolean;
  
  managerReviewSubmitted: boolean;
  peerReviewSubmitted: boolean;
  selfReviewSubmitted: boolean;
  attendanceAvailable: boolean;
}

export interface PerformanceGenerateRequest {
  year: number;
  month: number;
}

export interface PerformanceReport {
  totalEmployees: number;
  generatedCount: number;
  outstandingCount: number;
  excellentCount: number;
  veryGoodCount: number;
  goodCount: number;
  averageCount: number;
  needsImprovementCount: number;
  averageOverallScore: number;
  
  topPerformers: PerformanceRecord[];
  lowestPerformers: PerformanceRecord[];
}
