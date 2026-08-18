import apiClient from './apiClient';

export interface Problem {
  id: number;
  title: string;
  description: string;
  organization_name: string;
  industry: string;
  location: string;
  current_method: string;
  people_affected: number;
  frequency: string;
  estimated_impact: string;
  required_solution: string;
  budget: number | null;
  required_skills_list: string[];
  status: string;
  category: string;
  target_users: string;
  root_problem: string;
  symptoms: string[];
  complexity: string;
  estimated_effort_weeks: number;
  urgency: string;
  market_relevance_score: number;
  missing_capability?: string;
  validation?: any;
  evidences?: any[];
  user_match?: any;
  created_at: string;
}

export const problemService = {
  getProblems: async (params?: any) => {
    return apiClient.get('/api/problems/', { params });
  },

  getProblemById: async (id: number | string) => {
    return apiClient.get(`/api/problems/${id}/`);
  },

  submitProblem: async (data: any) => {
    return apiClient.post('/api/problems/submit/', data);
  },

  analyzeProblem: async (id: number | string) => {
    return apiClient.post(`/api/problems/${id}/analyze/`);
  },

  validateProblem: async (id: number | string) => {
    return apiClient.post(`/api/problems/${id}/validate/`);
  },

  getDuplicates: async (id: number | string) => {
    return apiClient.get(`/api/problems/${id}/duplicates/`);
  },

  getStudentMatch: async (id: number | string) => {
    return apiClient.post(`/api/problems/${id}/match/`);
  },

  buildProject: async (id: number | string) => {
    return apiClient.post(`/api/problems/${id}/build/`);
  },

  getAdminDashboard: async () => {
    return apiClient.get('/api/problems/admin/dashboard/');
  },

  takeAdminAction: async (problemId: number, action: string) => {
    return apiClient.post('/api/problems/admin/dashboard/', { problem_id: problemId, action });
  },

  getOpportunities: async () => {
    return apiClient.get('/api/problems/opportunities/list/');
  }
};
