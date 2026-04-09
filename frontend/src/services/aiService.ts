import axios from 'axios';

const API_URL = 'https://skillmirror-api.onrender.com';

const getAuthHeader = () => {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const aiService = {
    predictDemand: async (role: string) => {
        const response = await axios.get(`${API_URL}/api/ai/predict-demand/`, {
            params: { role },
            headers: getAuthHeader()
        });
        return response.data;
    }
};
