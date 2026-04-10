import apiClient from './apiClient';

export const jobService = {
    fetchLiveJobs: async (role: string) => {
        const response = await apiClient.get('/api/jobs/fetch-live-jobs/', {
            params: { role }
        });
        return response;
    },

    getJobMatch: async (role: string) => {
        const response = await apiClient.post('/api/jobs/job-match/', { role });
        return response;
    }
};
