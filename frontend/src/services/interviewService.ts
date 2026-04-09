import apiClient from './apiClient';

export interface InterviewSetup {
    role: string;
    experience_level: 'Entry' | 'Mid' | 'Senior';
    interview_type: 'Technical' | 'Behavioral' | 'Mixed';
    difficulty: 'Easy' | 'Moderate' | 'Hard';
    interview_mode: 'standard' | 'rapid_fire' | 'deep_dive' | 'hr_simulation' | 'technical_panel';
    question_count: number;
    instant_feedback: boolean;
    job_description?: string;
}

export const interviewService = {
    getHistory: async () => {
        return apiClient.get('/api/interviews/history/');
    },

    getDetail: async (id: number) => {
        return apiClient.get(`/api/interviews/detail/${id}/`);
    },

    startInterview: async (setup: InterviewSetup) => {
        return apiClient.post('/api/interviews/start/', setup);
    },

    submitAnswer: async (questionId: number, answer: string) => {
        return apiClient.post(`/api/interviews/submit-answer/${questionId}/`, { answer });
    },

    evaluateAnswer: async (questionId: number, answer: string) => {
        return apiClient.post(`/api/interviews/submit-answer/${questionId}/`, { answer });
    },

    skipQuestion: async (questionId: number) => {
        return apiClient.post(`/api/interviews/skip-question/${questionId}/`, {});
    },

    getNextQuestion: async (interviewId: number) => {
        return apiClient.get(`/api/interviews/next-question/${interviewId}/`);
    },

    getInterviewResult: async (interviewId: number) => {
        return apiClient.get(`/api/interviews/interview-result/${interviewId}/`);
    },

    finalizeInterview: async (interviewId: number) => {
        return apiClient.post(`/api/interviews/finalize/${interviewId}/`);
    },

    processAudio: async (questionId: number, audioBlob: Blob) => {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'answer.webm');
        return apiClient.post(`/api/interviews/process-audio/${questionId}/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    createLiveSession: async (candidateEmail: string, role: string) => {
        return apiClient.post('/api/interviews/live/create/', { candidate_email: candidateEmail, role });
    },

    getLiveNextQuestion: async (interviewId: number, lastAnswer: string, context?: string) => {
        return apiClient.post(`/api/interviews/live/next-question/${interviewId}/`, { last_answer: lastAnswer, context });
    },

    /**
     * AI Career Intelligence Engine — unified 7-stage endpoint.
     * stage = "question"    → answer is empty
     * stage = "evaluation"  → answer provided, index < total
     * stage = "final_report"→ answer provided, index >= total
     */
    callAIEngine: async (payload: {
        role: string;
        level: string;
        skills: string[];
        history: { question: string; answer: string }[];
        answer: string;
        index: number;
        total: number;
    }) => {
        return apiClient.post('/api/interviews/ai-engine/', payload);
    }
};
