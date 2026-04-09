import axios from 'axios';

const API_URL = 'https://skillmirror-api.onrender.com';

const getAuthHeader = () => {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const analyticsService = {
    getJobTrends: async (role: string) => {
        const response = await axios.get(`${API_URL}/api/analytics/job-trend/`, {
            params: { role },
            headers: getAuthHeader()
        });
        return response.data;
    },

    getSalaryInsights: async (role: string, location?: string) => {
        const response = await axios.get(`${API_URL}/api/analytics/salary-insights/`, {
            params: { role, location },
            headers: getAuthHeader()
        });
        return response.data;
    }
};
