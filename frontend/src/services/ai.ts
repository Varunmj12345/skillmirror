import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export const fetchSkillAnalysis = async (skills: string[]) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/skills/analyze/`, { skills });
        return response.data;
    } catch (error) {
        console.error('Error fetching skill analysis:', error);
        throw error;
    }
};

export const generateCareerRoadmap = async (userId: string | number) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/roadmaps/generate/${userId}/`);
        return response.data;
    } catch (error) {
        console.error('Error generating career roadmap:', error);
        throw error;
    }
};

export const getJobIntelligence = async (jobTitle: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/jobs/intelligence/?title=${jobTitle}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching job intelligence:', error);
        throw error;
    }
};