import api from './api';

export enum FeedbackType {
  SELF_REVIEW = 'SELF_REVIEW',
  PEER_FEEDBACK = 'PEER_FEEDBACK',
  MANAGER_REVIEW = 'MANAGER_REVIEW'
}

export enum FeedbackStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  LOCKED = 'LOCKED'
}

export enum ManagerRecommendation {
  OUTSTANDING = 'OUTSTANDING',
  EXCEEDS_EXPECTATIONS = 'EXCEEDS_EXPECTATIONS',
  MEETS_EXPECTATIONS = 'MEETS_EXPECTATIONS',
  NEEDS_IMPROVEMENT = 'NEEDS_IMPROVEMENT'
}

export interface SelfReviewRequest {
  reviewYear: number;
  reviewMonth: number;
  overallRating: number;
  achievements?: string;
  challenges?: string;
  skillsLearned?: string;
  additionalComments?: string;
  status: FeedbackStatus;
}

export interface PeerFeedbackRequest {
  revieweeId: number;
  reviewYear: number;
  reviewMonth: number;
  communicationRating: number;
  teamworkRating: number;
  knowledgeSharingRating: number;
  overallRating: number;
  comments?: string;
  status: FeedbackStatus;
}

export interface ManagerReviewRequest {
  revieweeId: number;
  reviewYear: number;
  reviewMonth: number;
  technicalSkillsRating: number;
  communicationRating: number;
  productivityRating: number;
  workQualityRating: number;
  teamworkRating: number;
  overallRating: number;
  comments?: string;
  recommendation?: ManagerRecommendation;
  strengths?: string[];
  needsImprovement?: string[];
  status: FeedbackStatus;
}

export interface FeedbackResponse {
  id: number;
  reviewer: any; // EmployeeBasicResponse
  reviewee: any; // EmployeeBasicResponse
  reviewYear: number;
  reviewMonth: number;
  overallRating: number;
  type: FeedbackType;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
  
  // Self Review
  achievements?: string;
  challenges?: string;
  skillsLearned?: string;
  additionalComments?: string;

  // Shared
  communicationRating?: number;
  teamworkRating?: number;
  comments?: string;

  // Peer Feedback
  knowledgeSharingRating?: number;

  // Manager Review
  technicalSkillsRating?: number;
  productivityRating?: number;
  workQualityRating?: number;
  recommendation?: ManagerRecommendation;
  strengths?: string[];
  needsImprovement?: string[];
}

export const feedbackService = {
  submitSelfReview: async (data: SelfReviewRequest): Promise<FeedbackResponse> => {
    const response = await api.post('/feedback/self', data);
    return response.data;
  },

  submitPeerFeedback: async (data: PeerFeedbackRequest): Promise<FeedbackResponse> => {
    const response = await api.post('/feedback/peer', data);
    return response.data;
  },

  submitManagerReview: async (data: ManagerReviewRequest): Promise<FeedbackResponse> => {
    const response = await api.post('/feedback/manager', data);
    return response.data;
  },

  getMyFeedbacks: async (): Promise<FeedbackResponse[]> => {
    const response = await api.get('/feedback/me');
    return response.data;
  },

  getTeamFeedbacks: async (): Promise<FeedbackResponse[]> => {
    const response = await api.get('/feedback/team');
    return response.data;
  },

  getAllFeedbacks: async (): Promise<FeedbackResponse[]> => {
    const response = await api.get('/feedback/all');
    return response.data;
  }
};
