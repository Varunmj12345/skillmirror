import apiClient from './apiClient';

export interface ScoutAgentStatus {
    agent_name: string;
    state: string;
    scheduler_active: boolean;
    total_openings_indexed: number;
    official_openings_indexed: number;
    monitored_portals_count: number;
    monitored_portals: string[];
    last_sweep: {
        started_at: string | null;
        completed_at: string | null;
        portals_scanned: number;
        openings_found: number;
        status: string;
    } | null;
}

export const jobService = {
    fetchLiveJobs: async (role: string, refresh: boolean = false) => {
        const response = await apiClient.get('/api/jobs/fetch-live-jobs/', {
            params: { role, refresh: refresh ? 'true' : undefined }
        });
        return response as any;
    },

    getSuggestedOpenings: async (role?: string, source?: string) => {
        const response = await apiClient.get('/api/jobs/suggested-openings/', {
            params: { role, source: source && source !== 'all' ? source : undefined }
        });
        return response as any;
    },

    getJobMatch: async (role: string, source?: string) => {
        const response = await apiClient.post('/api/jobs/job-match/', { 
            role, 
            source: source && source !== 'all' ? source : undefined 
        });
        return response as any;
    },

    getScoutAgentStatus: async (): Promise<ScoutAgentStatus> => {
        const response = await apiClient.get('/api/jobs/scout-agent/status/');
        return response as any;
    },

    runScoutSweep: async () => {
        const response = await apiClient.post('/api/jobs/scout-agent/run/');
        return response as any;
    }
};
