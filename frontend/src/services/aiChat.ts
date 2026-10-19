import apiClient from './apiClient';

export interface CareerChatResponse {
  reply: string;
  latency_ms?: number;
  model?: string;
  provider?: string;
}

export const sendCareerMessage = async (message: string): Promise<CareerChatResponse> => {
  const res = await apiClient.post('/ai/chat/', { message });
  return res as unknown as CareerChatResponse;
};
