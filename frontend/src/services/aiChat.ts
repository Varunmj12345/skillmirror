import apiClient from './apiClient';

export interface CareerChatResponse {
  reply: string;
}

export const sendCareerMessage = async (message: string): Promise<CareerChatResponse> => {
  const res = await apiClient.post('/ai/chat/', { message });
  return res as unknown as CareerChatResponse;
};
