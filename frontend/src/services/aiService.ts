import apiClient from './apiClient';

export const aiService = {
    predictDemand: async (role: string) => {
        const response = await apiClient.get('/api/ai/predict-demand/', {
            params: { role }
        });
        return response;
    }
};
