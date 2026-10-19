import apiClient from './apiClient';

export interface PerformanceSummary {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  fallback_requests: number;
  success_rate: number;
  avg_latency_ms: number;
  p95_latency_ms: number;
  min_latency_ms: number;
  max_latency_ms: number;
  total_tokens_consumed: number;
  prompt_tokens: number;
  completion_tokens: number;
  avg_tokens_per_request: number;
  health_score: number;
  satisfaction_rate: number;
  active_provider: string;
  active_model: string;
  days_analyzed: number;
}

export interface ModelMetric {
  model: string;
  requests: number;
  avg_latency_ms: number;
  total_tokens: number;
  success_rate: number;
}

export interface TaskMetric {
  type: string;
  label: string;
  requests: number;
  avg_latency_ms: number;
  total_tokens: number;
  success_rate: number;
}

export interface TimelinePoint {
  date: string;
  requests: number;
  avg_latency_ms: number;
  tokens: number;
  errors: number;
}

export interface EngineStatus {
  active_provider: string;
  primary_model: string;
  fast_model: string;
  api_key_configured: boolean;
  key_preview: string;
  timestamp: string;
}

export interface BotOverviewResponse {
  summary: PerformanceSummary;
  models: ModelMetric[];
  task_distribution: TaskMetric[];
  timeline: TimelinePoint[];
  engine_status: EngineStatus;
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  interaction_type: string;
  model: string;
  provider: string;
  latency_ms: number;
  tokens: number;
  status: 'success' | 'error' | 'fallback';
  prompt_preview: string;
  response_preview: string;
  user_rating: number | null;
  user_email: string;
  error_message: string | null;
}

export interface BotLogsResponse {
  count: number;
  logs: TelemetryLog[];
}

export interface DiagnosticResult {
  status: 'healthy' | 'degraded';
  provider: string;
  model: string;
  latency_ms: number;
  response?: string;
  error?: string;
  timestamp: string;
  verified: boolean;
}

export const fetchBotPerformanceOverview = async (days: number = 7, type?: string): Promise<BotOverviewResponse> => {
  const params: Record<string, any> = { days };
  if (type) params.type = type;
  const res = await apiClient.get('/analytics/bot-performance/', { params });
  return res as unknown as BotOverviewResponse;
};

export const fetchBotPerformanceLogs = async (limit: number = 50, type?: string, status?: string): Promise<BotLogsResponse> => {
  const params: Record<string, any> = { limit };
  if (type) params.type = type;
  if (status) params.status = status;
  const res = await apiClient.get('/analytics/bot-performance/logs/', { params });
  return res as unknown as BotLogsResponse;
};

export const submitBotFeedback = async (logId: string, rating: number, feedback?: string): Promise<{ status: string }> => {
  const res = await apiClient.post('/analytics/bot-performance/feedback/', {
    log_id: logId,
    rating,
    feedback,
  });
  return res as unknown as { status: string };
};

export const runBotLiveDiagnostic = async (): Promise<DiagnosticResult> => {
  const res = await apiClient.post('/analytics/bot-performance/diagnostic/');
  return res as unknown as DiagnosticResult;
};
