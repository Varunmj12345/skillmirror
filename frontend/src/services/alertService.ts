import apiClient from './apiClient';

export interface SmartAlert {
    id: number;
    alert_type: 'skill_gap' | 'roadmap' | 'interview' | 'readiness' | 'market' | 'predictive_risk' | 'opportunity' | 'behavioral' | 'regression' | 'achievement';
    category: 'info' | 'warning' | 'critical' | 'achievement';
    priority: 'low' | 'medium' | 'high';
    message: string;
    action_link: string;

    // Predictive fields
    impact_score: number;
    confidence_score: number;
    predicted_risk_level?: string;
    behavioral_flag?: string;
    improvement_projection: number;
    ai_reasoning?: string;
    data_reference_snapshot?: any;

    secondary_action_link?: string;
    secondary_action_text?: string;

    is_read: boolean;
    is_dismissed: boolean;
    created_at: string;
}

export interface WeeklySummary {
    roadmap_completion_rate: number;
    interview_avg: number;
    weakest_skill: string;
    strongest_skill: string;
    readiness_delta: string;
    next_best_action: string;
}

export const alertService = {
    getAlerts: async () => {
        return apiClient.get('/api/alerts/');
    },
    markAsRead: async (id: number) => {
        return apiClient.post(`/api/alerts/${id}/mark_read/`);
    },
    markAllRead: async () => {
        return apiClient.post('/api/alerts/mark_all_read/');
    },
    dismiss: async (id: number) => {
        return apiClient.post(`/api/alerts/${id}/dismiss/`);
    },
    snooze: async (id: number) => {
        return apiClient.post(`/api/alerts/${id}/snooze/`);
    },
    getWeeklySummary: async () => {
        return apiClient.get('/api/alerts/summary/');
    }
};
