import apiClient from './apiClient';

export const fetchSkillAnalysis = async (skills: string[]) => {
    try {
        const response = await apiClient.post('/api/skills/analyze/', { skills });
        return response;
    } catch (error) {
        console.error('Error fetching skill analysis:', error);
        throw error;
    }
};

export const generateCareerRoadmap = async (userId: string | number) => {
    try {
        const response = await apiClient.get(`/api/roadmaps/generate/${userId}/`);
        return response;
    } catch (error) {
        console.error('Error generating career roadmap:', error);
        throw error;
    }
};

export const getJobIntelligence = async (jobTitle: string) => {
    try {
        const response = await apiClient.get(`/api/jobs/intelligence/`, {
            params: { title: jobTitle }
        });
        return response;
    } catch (error) {
        console.error('Error fetching job intelligence:', error);
        throw error;
    }
};