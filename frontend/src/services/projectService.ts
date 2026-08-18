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

export interface Project {
  id: number;
  problem: number;
  problem_title: string;
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
  status: string;
  progress_percentage: number;
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

  completeProject: async (id: number | string, data: { github_url?: string; deployment_url?: string }) => {
    return apiClient.post(`/api/problems/projects/${id}/complete/`, data);
  }
};
