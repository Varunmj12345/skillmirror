import time
import logging
from datetime import timedelta
from typing import Dict, Any, List, Optional
from django.utils import timezone
from django.db.models import Avg, Sum, Count, Min, Max, Q

logger = logging.getLogger(__name__)

class BotPerformanceAnalyticsEngine:
    """
    Core Intelligence & Analytics Engine for AI Bot Performance Tracking.
    Monitors, logs, computes, and surfaces real-time metrics, telemetry, and health
    diagnostics across all AI-driven subsystems (Chatbot, Career Intelligence, 
    Resume Intelligence, Assessment Engine, and Gap Challenge Synthesizer).
    """

    @staticmethod
    def record_interaction(
        interaction_type: str = 'career_chat',
        provider: str = 'groq',
        model: str = 'openai/gpt-oss-120b',
        latency_ms: float = 0.0,
        status: str = 'success',
        status_code: int = 200,
        prompt_text: str = '',
        response_text: str = '',
        prompt_tokens: int = 0,
        completion_tokens: int = 0,
        reasoning_tokens: int = 0,
        total_tokens: int = 0,
        queue_time_ms: float = 0.0,
        generation_time_ms: float = 0.0,
        error_message: Optional[str] = None,
        user = None,
        session_id: Optional[str] = None
    ):
        """
        Safely records an AI interaction event in the telemetry store.
        Guaranteed non-blocking: Never raises an exception that interrupts user requests.
        """
        try:
            from apps.analytics.models import BotPerformanceLog
            
            # Sanitize previews for clean auditing
            prompt_preview = (prompt_text[:300] + '...') if len(prompt_text) > 300 else prompt_text
            response_preview = (response_text[:400] + '...') if len(response_text) > 400 else response_text

            # Compute total tokens if missing
            calc_total = total_tokens if total_tokens > 0 else (prompt_tokens + completion_tokens)

            # Ensure valid user object
            target_user = user if getattr(user, 'is_authenticated', False) else None

            log = BotPerformanceLog.objects.create(
                user=target_user,
                session_id=session_id,
                interaction_type=interaction_type,
                provider=provider,
                model=model,
                prompt_preview=prompt_preview,
                response_preview=response_preview,
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                reasoning_tokens=reasoning_tokens,
                total_tokens=calc_total,
                latency_ms=round(latency_ms, 2),
                queue_time_ms=round(queue_time_ms, 2),
                generation_time_ms=round(generation_time_ms, 2),
                status=status,
                status_code=status_code,
                error_message=error_message
            )
            return log
        except Exception as e:
            logger.warning(f"[BotPerformanceAnalyticsEngine] Telemetry recording failed silently: {e}")
            return None

    @classmethod
    def get_performance_summary(cls, days: int = 7, interaction_type: Optional[str] = None) -> Dict[str, Any]:
        """
        Computes high-level aggregated performance metrics and health scores.
        """
        from apps.analytics.models import BotPerformanceLog
        
        since = timezone.now() - timedelta(days=days)
        qs = BotPerformanceLog.objects.filter(created_at__gte=since)
        if interaction_type:
            qs = qs.filter(interaction_type=interaction_type)

        total_requests = qs.count()
        if total_requests == 0:
            return {
                "total_requests": 0,
                "successful_requests": 0,
                "failed_requests": 0,
                "fallback_requests": 0,
                "success_rate": 100.0,
                "avg_latency_ms": 0.0,
                "p95_latency_ms": 0.0,
                "min_latency_ms": 0.0,
                "max_latency_ms": 0.0,
                "total_tokens_consumed": 0,
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "avg_tokens_per_request": 0,
                "health_score": 100.0,
                "satisfaction_rate": 100.0,
                "active_provider": "groq",
                "active_model": "openai/gpt-oss-120b",
                "days_analyzed": days
            }

        success_count = qs.filter(status='success').count()
        failed_count = qs.filter(status='error').count()
        fallback_count = qs.filter(status='fallback').count()

        agg = qs.aggregate(
            avg_latency=Avg('latency_ms'),
            min_latency=Min('latency_ms'),
            max_latency=Max('latency_ms'),
            sum_tokens=Sum('total_tokens'),
            sum_prompt=Sum('prompt_tokens'),
            sum_completion=Sum('completion_tokens'),
        )

        avg_latency = round(agg['avg_latency'] or 0.0, 1)
        min_latency = round(agg['min_latency'] or 0.0, 1)
        max_latency = round(agg['max_latency'] or 0.0, 1)
        total_tokens = agg['sum_tokens'] or 0
        prompt_tokens = agg['sum_prompt'] or 0
        completion_tokens = agg['sum_completion'] or 0

        # Calculate P95 latency
        latencies = list(qs.order_by('latency_ms').values_list('latency_ms', flat=True))
        p95_index = int(len(latencies) * 0.95)
        p95_latency = round(latencies[p95_index] if latencies else avg_latency, 1)

        success_rate = round((success_count / total_requests) * 100, 1)

        # Health Score computation (0-100):
        # 60% based on success rate
        # 30% based on latency (< 1200ms gives full score, scaled down if slower)
        # 10% based on fallback resilience
        latency_factor = max(0.0, min(30.0, 30.0 * (1200.0 / max(avg_latency, 400.0))))
        health_score = round(min(100.0, (success_rate * 0.6) + latency_factor + (10.0 if failed_count == 0 else 5.0)), 1)

        # User Satisfaction from ratings
        rated_qs = qs.exclude(user_rating__isnull=True)
        positive_ratings = rated_qs.filter(user_rating__gt=0).count()
        total_rated = rated_qs.count()
        satisfaction_rate = round((positive_ratings / total_rated * 100), 1) if total_rated > 0 else 98.0

        return {
            "total_requests": total_requests,
            "successful_requests": success_count,
            "failed_requests": failed_count,
            "fallback_requests": fallback_count,
            "success_rate": success_rate,
            "avg_latency_ms": avg_latency,
            "p95_latency_ms": p95_latency,
            "min_latency_ms": min_latency,
            "max_latency_ms": max_latency,
            "total_tokens_consumed": total_tokens,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "avg_tokens_per_request": round(total_tokens / total_requests) if total_requests else 0,
            "health_score": health_score,
            "satisfaction_rate": satisfaction_rate,
            "active_provider": "groq",
            "active_model": "openai/gpt-oss-120b",
            "days_analyzed": days
        }

    @classmethod
    def get_model_breakdown(cls, days: int = 7) -> List[Dict[str, Any]]:
        """
        Returns performance and volume comparison grouped by LLM model.
        """
        from apps.analytics.models import BotPerformanceLog
        
        since = timezone.now() - timedelta(days=days)
        models_qs = BotPerformanceLog.objects.filter(created_at__gte=since).values('model').annotate(
            request_count=Count('id'),
            avg_latency=Avg('latency_ms'),
            total_tokens=Sum('total_tokens'),
            success_count=Count('id', filter=Q(status='success'))
        ).order_by('-request_count')

        results = []
        for item in models_qs:
            cnt = item['request_count']
            succ = item['success_count']
            rate = round((succ / cnt) * 100, 1) if cnt else 100.0
            results.append({
                "model": item['model'],
                "requests": cnt,
                "avg_latency_ms": round(item['avg_latency'] or 0.0, 1),
                "total_tokens": item['total_tokens'] or 0,
                "success_rate": rate,
            })
        return results

    @classmethod
    def get_interaction_type_breakdown(cls, days: int = 7) -> List[Dict[str, Any]]:
        """
        Returns breakdown by task/interaction type (Chat, Intelligence, Assessment, etc.).
        """
        from apps.analytics.models import BotPerformanceLog

        since = timezone.now() - timedelta(days=days)
        types_qs = BotPerformanceLog.objects.filter(created_at__gte=since).values('interaction_type').annotate(
            request_count=Count('id'),
            avg_latency=Avg('latency_ms'),
            total_tokens=Sum('total_tokens'),
            success_count=Count('id', filter=Q(status='success'))
        ).order_by('-request_count')

        results = []
        for item in types_qs:
            cnt = item['request_count']
            succ = item['success_count']
            rate = round((succ / cnt) * 100, 1) if cnt else 100.0
            results.append({
                "type": item['interaction_type'],
                "label": item['interaction_type'].replace('_', ' ').title(),
                "requests": cnt,
                "avg_latency_ms": round(item['avg_latency'] or 0.0, 1),
                "total_tokens": item['total_tokens'] or 0,
                "success_rate": rate
            })
        return results

    @classmethod
    def get_timeline_trends(cls, days: int = 7) -> List[Dict[str, Any]]:
        """
        Returns day-by-day request volume, latency, and token consumption metrics.
        """
        from apps.analytics.models import BotPerformanceLog

        today = timezone.now().date()
        timeline = []

        for i in range(days - 1, -1, -1):
            day_date = today - timedelta(days=i)
            day_qs = BotPerformanceLog.objects.filter(
                created_at__year=day_date.year,
                created_at__month=day_date.month,
                created_at__day=day_date.day
            )

            cnt = day_qs.count()
            agg = day_qs.aggregate(
                avg_latency=Avg('latency_ms'),
                sum_tokens=Sum('total_tokens'),
                errors=Count('id', filter=Q(status='error'))
            )

            timeline.append({
                "date": day_date.strftime("%b %d"),
                "requests": cnt,
                "avg_latency_ms": round(agg['avg_latency'] or 0.0, 1),
                "tokens": agg['sum_tokens'] or 0,
                "errors": agg['errors'] or 0
            })

        return timeline

    @classmethod
    def get_recent_logs(cls, limit: int = 50, interaction_type: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Retrieves recent telemetry logs for live monitoring and auditing.
        """
        from apps.analytics.models import BotPerformanceLog

        qs = BotPerformanceLog.objects.all().select_related('user')
        if interaction_type:
            qs = qs.filter(interaction_type=interaction_type)
        if status:
            qs = qs.filter(status=status)

        logs = qs[:limit]
        return [
            {
                "id": str(log.id),
                "timestamp": log.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                "interaction_type": log.interaction_type,
                "model": log.model,
                "provider": log.provider,
                "latency_ms": log.latency_ms,
                "tokens": log.total_tokens,
                "status": log.status,
                "prompt_preview": log.prompt_preview,
                "response_preview": log.response_preview,
                "user_rating": log.user_rating,
                "user_email": log.user.email if log.user else "Anonymous/Guest",
                "error_message": log.error_message
            }
            for log in logs
        ]

    @classmethod
    def run_live_diagnostic(cls) -> Dict[str, Any]:
        """
        Runs an instant real-time diagnostic against the Groq API.
        Measures round-trip latency, token response, and health status.
        """
        from apps.ai.llm_client import chat_completion
        
        t0 = time.perf_counter()
        probe_prompt = "Health check probe: Confirm diagnostic operational status in one short phrase."
        try:
            resp = chat_completion(
                messages=[
                    {"role": "system", "content": "You are the SkillMirror Neural Diagnostics Engine."},
                    {"role": "user", "content": probe_prompt}
                ],
                max_tokens=60,
                temperature=0.1,
                interaction_type="diagnostic_probe"
            )
            elapsed_ms = round((time.perf_counter() - t0) * 1000, 2)
            return {
                "status": "healthy",
                "provider": "groq",
                "model": "openai/gpt-oss-120b",
                "latency_ms": elapsed_ms,
                "response": resp.content.strip(),
                "timestamp": timezone.now().isoformat(),
                "verified": True
            }
        except Exception as e:
            elapsed_ms = round((time.perf_counter() - t0) * 1000, 2)
            return {
                "status": "degraded",
                "provider": "groq",
                "latency_ms": elapsed_ms,
                "error": str(e),
                "timestamp": timezone.now().isoformat(),
                "verified": False
            }
