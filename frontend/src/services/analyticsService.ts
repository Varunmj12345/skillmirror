import apiClient from './apiClient';

export const analyticsService = {
    getJobTrends: async (role: string) => {
        const response = await apiClient.get('/api/analytics/job-trend/', {
            params: { role }
        });
        return response;
    },

    getSalaryInsights: async (role: string, location?: string) => {
        const response = await apiClient.get('/api/analytics/salary-insights/', {
            params: { role, location }
        });
        return response;
    }
};
