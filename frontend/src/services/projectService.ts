import apiClient from './apiClient';

export interface ProjectTask {
  id: number;
  title: string;
  description: string;
  scope_phase: 'mvp' | 'v2' | 'future';
  mapped_skill_name: string;
  student_skill_level: string;
  learning_resources: string[];
  is_completed: boolean;
  order: number;
}

export interface ProjectSubmissionVersion {
  id: number;
  version_number: number;
  github_url: string;
  published_url: string;
  documentation: string;
  requirement_mapping: any[];
  demo_video_url?: string;
  screenshots?: string[];
  deployment_status: string;
  deployment_check_details?: any;
  evaluation?: any;
  created_at: string;
}

export interface Project {
  id: number;
  problem: number;
  problem_title: string;
  problem_source_type?: string;
  is_real_world?: boolean;
  problem_owner_name?: string;
  organization_name?: string;
  student_email?: string;
  title: string;
  problem_statement: string;
  target_users: string;
  functional_requirements: string[];
  non_functional_requirements: string[];
  mvp_scope: any;
  v2_scope: any;
  future_scope: any;
  architecture_recommendation: string;
  tech_stack: string[];
  database_design: any;
  api_requirements: string[];
  tasks: ProjectTask[];
  submissions?: ProjectSubmissionVersion[];
  requirements?: any[];
  owner_reviews?: any[];
  status: string;
  progress_percentage: number;
  match_score?: number;
  match_breakdown?: any;
  created_at: string;
}

export const projectService = {
  getUserProjects: async () => {
    return apiClient.get('/api/problems/projects/list/');
  },

  getProjectById: async (id: number | string) => {
    return apiClient.get(`/api/problems/projects/${id}/`);
  },

  updateTaskStatus: async (projectId: number | string, taskId: number | string, isCompleted: boolean) => {
    return apiClient.put(`/api/problems/projects/${projectId}/tasks/${taskId}/`, { is_completed: isCompleted });
  },

  checkLiveUrl: async (url: string) => {
    return apiClient.post('/api/problems/projects/check-live-url/', { url });
  },

  submitProjectVersion: async (projectId: number | string, data: {
    github_url: string;
    published_url: string;
    documentation: string;
    requirement_mapping: any[];
    demo_video_url?: string;
    screenshots?: string[];
  }) => {
    return apiClient.post(`/api/problems/projects/${projectId}/submit-version/`, data);
  },

  completeProject: async (id: number | string, data: { github_url?: string; deployment_url?: string }) => {
    return apiClient.post(`/api/problems/projects/${id}/complete/`, data);
  },

  getEvaluatorDashboard: async () => {
    return apiClient.get('/api/problems/evaluator/dashboard/');
  },

  takeEvaluatorAction: async (data: { project_id: number; decision: string; comments?: string }) => {
    return apiClient.post('/api/problems/evaluator/dashboard/', data);
  },

  getOwnerDashboard: async () => {
    return apiClient.get('/api/problems/owner/dashboard/');
  },

  takeOwnerAction: async (data: { project_id: number; decision: string; comments?: string }) => {
    return apiClient.post('/api/problems/owner/dashboard/', data);
  },

  getStatusCenter: async () => {
    return apiClient.get('/api/problems/projects/status-center/');
  }
};
