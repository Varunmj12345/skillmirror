import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1s initial delay

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://skillmirror-api-judc.onrender.com', // Primary production URL
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper for Exponential Backoff with Jitter
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getBackoffDelay = (retryCount: number) => {
  const delay = BASE_DELAY * Math.pow(2, retryCount);
  const jitter = Math.random() * 200; // Add 200ms jitter
  return delay + jitter;
};

// 1. Request Interceptor: Identity Injection
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Resilience & Global Error Triage
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const { config, response } = error;
    
    // Auth Triage: Token Expiry
    if (response?.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('access_token');
        window.location.href = '/login?session_expired=true';
      }
      return Promise.reject(error);
    }

    // Network/Server Triage: Backoff & Retry Logic
    const retryCount = config._retryCount || 0;
    const shouldRetry = (
      retryCount < MAX_RETRIES && 
      (error.code === 'ECONNABORTED' || response?.status >= 500) &&
      config.method === 'get' // Only retry idempotent requests automatically
    );

    if (shouldRetry) {
      config._retryCount = retryCount + 1;
      const delay = getBackoffDelay(retryCount);
      
      console.warn(`[API Client] Retrying request (${config.url}). Attempt ${config._retryCount}/${MAX_RETRIES} after ${Math.round(delay)}ms`);
      
      await sleep(delay);
      return apiClient(config);
    }

    return Promise.reject(error);
  }
);

export default apiClient;