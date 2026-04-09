import axios from 'axios';

const API_URL = 'https://skillmirror-api.onrender.com';

const getAuthHeader = () => {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const jobService = {
    fetchLiveJobs: async (role: string) => {
        const response = await axios.get(`${API_URL}/api/jobs/fetch-live-jobs/`, {
            params: { role },
            headers: getAuthHeader()
        });
        return response.data;
    },

    getJobMatch: async (role: string) => {
        const response = await axios.post(`${API_URL}/api/jobs/job-match/`, { role }, {
            headers: getAuthHeader()
        });
        return response.data;
    }
};
