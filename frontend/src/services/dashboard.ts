import apiClient from './apiClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://skillmirror-api.onrender.com';

export const fetchDashboard = async () => {
  return apiClient.get('/analytics/dashboard/');
};

export const uploadResume = async (file: File) => {
  const formData = new FormData();
  formData.append('resume', file);
  return apiClient.post('/api/skills/resume/upload/', formData);
};

export const deleteResume = async () => {
  return apiClient.delete('/users/resume/');
};
