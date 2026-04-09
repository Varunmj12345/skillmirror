import apiClient from './apiClient';

export const fetchGoals = async () => {
  return apiClient.get('/roadmaps/goals/');
};

export const fetchSkills = async () => {
  return apiClient.get('/skills/proficiency/');
};

export const generateRoadmap = async (goal: string, skills: string[] = []) => {
  return apiClient.post('/roadmaps/generate/', {
    target_job: goal,
    skills,
    goals: { target_job: goal },
  });
};

export const fetchRoadmapDetail = async (id: number) => {
  return apiClient.get(`/roadmaps/${id}/`);
};

export const updateProgress = async (stepId: number, completed: boolean) => {
  return apiClient.post('/roadmaps/progress/', { step_id: stepId, completed });
};

// YouTube Search System
export const searchVideos = async (query: string) => {
  return apiClient.get(`/roadmaps/youtube/search/?q=${encodeURIComponent(query)}`);
};

export const saveVideo = async (video: any, isSaved: boolean) => {
  return apiClient.post('/roadmaps/youtube/save/', { ...video, is_saved: isSaved });
};

export const getSavedVideos = async () => {
  return apiClient.get('/roadmaps/youtube/save/');
};

export const updateVideoProgress = async (videoId: string, isCompleted: boolean) => {
  return apiClient.post('/roadmaps/youtube/progress/', { video_id: videoId, is_completed: isCompleted });
};

export const getVideoSummary = async (videoId: string, title: string) => {
  return apiClient.post('/roadmaps/youtube/summary/', { video_id: videoId, title });
};

// Analytics & AI Recommendations
export const fetchUserAnalytics = async () => {
  return apiClient.get('/roadmaps/analytics/');
};

export const fetchAISuggestion = async (roadmapId: number) => {
  return apiClient.get(`/roadmaps/ai/recommend/?roadmap_id=${roadmapId}`);
};
