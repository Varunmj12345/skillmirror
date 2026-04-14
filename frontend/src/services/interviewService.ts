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

export interface EvaluationMetrics {
    clarity: number;
    technical_accuracy: number;
    confidence: number;
    depth: number;
    keyword_match: number;
    filler_words: string[];
    feedback: string;
}

export interface BehavioralAnalysis {
    communication: 'Good' | 'Average' | 'Poor';
    confidence_level: 'High' | 'Medium' | 'Low';
    issues_detected: string[];
}

export interface MarketIntelligence {
    salary_projection: string;
    top_companies: string[];
    market_demand: 'High' | 'Medium' | 'Low';
    growth_forecast: string;
}

export interface SkillGapAnalysis {
    missing_skills: string[];
    improvement_suggestions: string[];
}

export interface AIEngineResponse {
    stage: 'question' | 'evaluation' | 'final_report';
    question?: string;
    type?: string;
    expected_concepts?: string[];
    evaluation?: EvaluationMetrics;
    behavioral_analysis?: BehavioralAnalysis;
    market_intelligence?: MarketIntelligence;
    skill_gap_analysis?: SkillGapAnalysis;
    next_question?: {
        question: string;
        type: string;
    };
    overall_score?: number;
    career_simulation?: {
        growth_path: string;
        salary_projection: string;
        key_decisions: string[];
        risks: string[];
    };
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

    finalizeInterview: async (interviewId: number, aiReport?: any) => {
        return apiClient.post(`/api/interviews/finalize/${interviewId}/`, { ai_report: aiReport });
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
     */
    callAIEngine: async (payload: {
        role: string;
        level: string;
        skills: string[];
        history: { question: string; answer: string }[];
        answer: string;
        index: number;
        total: number;
    }): Promise<AIEngineResponse> => {
        return apiClient.post('/api/interviews/ai-engine/', payload);
    }
};
