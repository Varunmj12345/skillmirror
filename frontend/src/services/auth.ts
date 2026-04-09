import apiClient from './apiClient';

export const registerUser = async (userData: { username: string; email: string; password: string }) => {
    return apiClient.post('/users/register/', userData);
};

export const loginUser = async (credentials: { email: string; password: string }) => {
    // Note: apiClient interceptor returns response.data
    const data: any = await apiClient.post('/users/login/', credentials);
    const { access, user: userData } = data;
    if (typeof window !== 'undefined' && access) {
        localStorage.setItem('access_token', access);
        // Also set apiClient default header for immediate follow-up requests if needed, 
        // though the interceptor already pulls from localStorage.
    }
    const name = userData?.username || userData?.email || credentials.email;
    return { ...userData, email: userData?.email || credentials.email, name };
};

export const logoutUser = async () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
    }
};

export const forgotPassword = async (email: string) => {
    return apiClient.post('/users/forgot-password/', { email });
};

export const resetPassword = async (data: any) => {
    return apiClient.post('/users/reset-password/', data);
};

export const verifyTwoFactor = async (data: { email: string; code: string }) => {
    const res: any = await apiClient.post('/users/verify-2fa/', data);
    const { access, user: userData } = res;
    if (typeof window !== 'undefined' && access) {
        localStorage.setItem('access_token', access);
    }
    return userData;
};

export const getUserProfile = async (token?: string) => {
    // token is optional because apiClient interceptor will use localStorage if available
    return apiClient.get('/users/profile/');
};

export const getCurrentUser = async () => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    try {
        const profile: any = await getUserProfile();
        return { ...profile, name: profile.username || profile.email };
    } catch (err: any) {
        if (err?.response?.status === 401) {
            localStorage.removeItem('access_token');
        }
        return null;
    }
};