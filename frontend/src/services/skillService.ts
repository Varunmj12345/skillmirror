import apiClient from './apiClient';

export const skillService = {
    checkResumeStatus: async () => {
        return apiClient.get('/api/skills/resume/status/');
    },

    uploadResume: async (file: File) => {
        const formData = new FormData();
        formData.append('resume', file);
        return apiClient.post('/api/skills/resume/upload/', formData);
    },

    analyzeSkillGap: async (role: string, jobDescription?: string, experienceLevel?: string, industry?: string, manualSkills?: any[]) => {
        return apiClient.post('/api/skills/analyze-skill-gap/', {
            role,
            job_description: jobDescription,
            experience_level: experienceLevel,
            industry,
            manual_skills: manualSkills
        });
    },

    recommendLearning: async (role: string, missingSkills: any[]) => {
        return apiClient.post('/api/skills/recommend-learning/', {
            role,
            missing_skills: missingSkills
        });
    },

    extractSkills: async (text: string) => {
        return apiClient.post('/api/skills/extract/', { text });
    },

    generateActionPlan: async (role: string, gaps: string[]) => {
        return apiClient.post('/api/analytics/generate-action-plan/', { role, gaps });
    },

    getCareerInsight: async (role: string) => {
        return apiClient.get('/api/analytics/ai-career-insight/', { params: { role } });
    },

    updateSkillProgress: async (skill: string, level: number) => {
        return apiClient.post('/api/analytics/update-skill-progress/', { skill, level });
    },

    predictCompletion: async () => {
        return apiClient.get('/api/analytics/predict-completion/');
    },

    extractProfile: async () => {
        return apiClient.get('/api/skills/resume/extract-profile/');
    },

    getBuilderProfile: async () => {
        return apiClient.get('/api/skills/resume/builder/current/');
    },

    saveBuilderProfile: async (data: any) => {
        return apiClient.put('/api/skills/resume/builder/current/', data);
    },

    getCustomTemplates: async () => {
        return apiClient.get('/api/skills/resume/custom-templates/');
    },

    uploadCustomTemplate: async (name: string, file: File) => {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('file', file);
        return apiClient.post('/api/skills/resume/custom-templates/', formData);
    },

    detectPlaceholders: async (id: number) => {
        return apiClient.post(`/api/skills/resume/custom-templates/${id}/detect_placeholders/`);
    },

    saveTemplateMapping: async (id: number, mapping: any) => {
        return apiClient.patch(`/api/skills/resume/custom-templates/${id}/`, { mapped_fields: mapping });
    },

    fillCustomTemplate: async (id: number, data: any, mapping?: any) => {
        return apiClient.post(`/api/skills/resume/custom-templates/${id}/fill_template/`, { data, mapping });
    },

    getGeneratedResumes: async () => {
        return apiClient.get('/api/skills/resume/generated/');
    }
};


