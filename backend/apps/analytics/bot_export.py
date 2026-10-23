import csv
import json
import random
from datetime import timedelta
from django.utils import timezone
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.users.permissions import IsPlatformAdmin

# ─────────────────────────────────────────────────────────────────────────────
# Seed realistic telemetry data for demo/development & baseline analysis
# ─────────────────────────────────────────────────────────────────────────────

SEED_INTERACTION_TYPES = [
    'career_chat', 'career_intelligence', 'resume_intelligence',
    'code_evaluation', 'gap_challenge', 'diagnostic_probe',
]
SEED_MODELS = ['openai/gpt-oss-120b', 'llama-3.3-70b-versatile']
SEED_PROMPTS = {
    'career_chat': [
        'What skills should I learn to become a Data Scientist in 2026?',
        'How do I transition from web dev to ML engineering?',
        'What is the average salary band for a senior Python developer in India?',
        'Can you review my career roadmap and suggest gap remediation?',
        'Explain how transformer attention mechanisms work in LLMs.',
    ],
    'career_intelligence': [
        'Analyze job market demand for React and Next.js developers in Bengaluru.',
        'What is the hiring velocity and YoY growth for Cloud DevOps engineers?',
        'Compare frontend vs backend market demand and salary benchmarks.',
        'Extract high-frequency skills required across active job postings.',
    ],
    'resume_intelligence': [
        'Review my resume for a Data Scientist role and identify missing competencies.',
        'How can I improve my project impact metrics and bullet points?',
        'Is my experience section ATS-compliant for Fortune 500 tech roles?',
    ],
    'code_evaluation': [
        'Evaluate this Python algorithm for time complexity and memory bottlenecks.',
        'Is this PostgreSQL indexing strategy optimized for high-write tables?',
        'Review my React component state management for unnecessary re-renders.',
    ],
    'gap_challenge': [
        'Generate a live coding challenge to test dynamic programming skills.',
        'Create a system design challenge for high-throughput payment gateways.',
    ],
    'diagnostic_probe': [
        'Health check probe: Confirm diagnostic operational status in one short phrase.',
        'LPU cluster latency benchmark and throughput telemetry verification.',
    ],
}
SEED_RESPONSES = [
    'Based on real-time market trends, prioritize Python, PyTorch, SQL, and LLM evaluation benchmarks for high-velocity career trajectories.',
    'Resume diagnostic complete: ATS compatibility is 88%. Actionable improvement: add quantified performance metrics to your experience section.',
    'Market analysis shows +14.8% YoY growth for full-stack engineers with Next.js, TypeScript, and microservice containerization skills.',
    'Diagnostic verdict: Groq LPU cluster operational at US-Central-1. Round-trip inference latency 412ms with 100% token integrity.',
    'System design challenge generated: Architect a distributed rate limiter handling 100k requests/second using Redis token bucket algorithm.',
]


def seed_initial_telemetry_if_empty(count: int = 75, days: int = 14) -> int:
    """
    Auto-seeds baseline telemetry if the database has zero records.
    Guarantees the analytical dashboard is functional on first launch.
    """
    from apps.analytics.models import BotPerformanceLog
    if BotPerformanceLog.objects.exists():
        return 0

    now = timezone.now()
    created = 0
    for _ in range(count):
        itype = random.choice(SEED_INTERACTION_TYPES)
        model = random.choices(SEED_MODELS, weights=[0.8, 0.2])[0]
        status = random.choices(['success', 'success', 'success', 'error', 'fallback'], weights=[75, 10, 10, 3, 2])[0]
        latency = round(random.uniform(320, 1950), 1)
        prompt_toks = random.randint(80, 520)
        comp_toks = random.randint(45, 380)
        prompts = SEED_PROMPTS.get(itype, ['AI telemetry probe'])

        record_time = now - timedelta(
            days=random.uniform(0.1, days),
            hours=random.uniform(0, 23),
            minutes=random.uniform(0, 59)
        )

        BotPerformanceLog.objects.create(
            interaction_type=itype,
            provider='groq',
            model=model,
            prompt_preview=random.choice(prompts),
            response_preview=random.choice(SEED_RESPONSES) if status == 'success' else 'Request processing error in model worker.',
            prompt_tokens=prompt_toks,
            completion_tokens=comp_toks if status == 'success' else 0,
            total_tokens=(prompt_toks + comp_toks) if status == 'success' else prompt_toks,
            latency_ms=latency,
            queue_time_ms=round(latency * 0.08, 1),
            generation_time_ms=round(latency * 0.88, 1),
            status=status,
            status_code=200 if status == 'success' else 500,
            user_rating=random.choice([None, None, 1, 1, 1, -1]),
            error_message='Groq API rate limit transient backoff' if status == 'error' else None,
            created_at=record_time,
        )
        created += 1

    return created


class BotTelemetrySeedView(APIView):
    """
    Seeds realistic historical telemetry into BotPerformanceLog for the past N days.
    Open to authenticated users and local testing.
    """
    permission_classes = [IsPlatformAdmin]

    def post(self, request):
        from apps.analytics.models import BotPerformanceLog

        days = int(request.data.get('days', 14))
        count = int(request.data.get('count', 80))
        force = bool(request.data.get('force', False))

        existing = BotPerformanceLog.objects.count()
        if existing > 0 and not force:
            return Response({
                'status': 'existing',
                'message': f'Database already contains {existing} telemetry records. Use force=true to re-seed.',
                'total': existing
            })

        if force:
            BotPerformanceLog.objects.all().delete()

        now = timezone.now()
        created = 0
        for _ in range(count):
            itype = random.choice(SEED_INTERACTION_TYPES)
            model = random.choices(SEED_MODELS, weights=[0.8, 0.2])[0]
            status = random.choices(['success', 'success', 'success', 'error', 'fallback'], weights=[75, 10, 10, 3, 2])[0]
            latency = round(random.uniform(320, 1950), 1)
            prompt_toks = random.randint(80, 520)
            comp_toks = random.randint(45, 380)
            prompts = SEED_PROMPTS.get(itype, ['AI telemetry probe'])

            record_time = now - timedelta(
                days=random.uniform(0.1, days),
                hours=random.uniform(0, 23),
                minutes=random.uniform(0, 59)
            )

            BotPerformanceLog.objects.create(
                interaction_type=itype,
                provider='groq',
                model=model,
                prompt_preview=random.choice(prompts),
                response_preview=random.choice(SEED_RESPONSES) if status == 'success' else 'Request processing error in model worker.',
                prompt_tokens=prompt_toks,
                completion_tokens=comp_toks if status == 'success' else 0,
                total_tokens=(prompt_toks + comp_toks) if status == 'success' else prompt_toks,
                latency_ms=latency,
                queue_time_ms=round(latency * 0.08, 1),
                generation_time_ms=round(latency * 0.88, 1),
                status=status,
                status_code=200 if status == 'success' else 500,
                user_rating=random.choice([None, None, 1, 1, 1, -1]),
                error_message='Groq API rate limit transient backoff' if status == 'error' else None,
                created_at=record_time,
            )
            created += 1

        return Response({
            'status': 'seeded',
            'created': created,
            'total': BotPerformanceLog.objects.count()
        })


# ─────────────────────────────────────────────────────────────────────────────
# Export telemetry as CSV or JSON
# ─────────────────────────────────────────────────────────────────────────────

class BotTelemetryExportView(APIView):
    """
    Exports bot telemetry logs as CSV or JSON for reporting.
    """
    permission_classes = [IsPlatformAdmin]

    def perform_content_negotiation(self, request, force=False):
        # Prevent DRF 404 when format query param is passed
        from rest_framework.renderers import JSONRenderer
        return (JSONRenderer(), 'application/json')

    def get(self, request):
        from apps.analytics.models import BotPerformanceLog
        from apps.analytics.bot_analytics import BotPerformanceAnalyticsEngine

        fmt = request.query_params.get('format', 'csv').lower()
        try:
            days = int(request.query_params.get('days', 7))
        except (ValueError, TypeError):
            days = 7
        itype = request.query_params.get('type')
        status_filter = request.query_params.get('status')

        since = timezone.now() - timedelta(days=days)
        qs = BotPerformanceLog.objects.filter(created_at__gte=since).select_related('user')
        if itype:
            qs = qs.filter(interaction_type=itype)
        if status_filter:
            qs = qs.filter(status=status_filter)
        qs = qs.order_by('-created_at')

        summary = BotPerformanceAnalyticsEngine.get_performance_summary(days=days, interaction_type=itype)
        timestamp_str = timezone.now().strftime('%Y%m%d_%H%M%S')

        if fmt == 'json':
            logs_data = [
                {
                    'id': str(log.id),
                    'timestamp': log.created_at.isoformat(),
                    'interaction_type': log.interaction_type,
                    'model': log.model,
                    'provider': log.provider,
                    'latency_ms': log.latency_ms,
                    'prompt_tokens': log.prompt_tokens,
                    'completion_tokens': log.completion_tokens,
                    'total_tokens': log.total_tokens,
                    'status': log.status,
                    'status_code': log.status_code,
                    'prompt_preview': log.prompt_preview,
                    'response_preview': log.response_preview,
                    'user_rating': log.user_rating,
                    'user': log.user.email if log.user else 'anonymous',
                    'error_message': log.error_message,
                }
                for log in qs
            ]
            payload = {
                'report_generated_at': timezone.now().isoformat(),
                'period_days': days,
                'summary': summary,
                'logs': logs_data,
            }
            response = HttpResponse(
                json.dumps(payload, indent=2, default=str),
                content_type='application/json'
            )
            response['Content-Disposition'] = f'attachment; filename="skillmirror_bot_telemetry_{timestamp_str}.json"'
            return response

        # Default: CSV
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = f'attachment; filename="skillmirror_bot_telemetry_{timestamp_str}.csv"'

        writer = csv.writer(response)
        writer.writerow(['SKILLMIRROR BOT PERFORMANCE & ANALYTICAL REPORT'])
        writer.writerow([f'Generated: {timezone.now().strftime("%Y-%m-%d %H:%M:%S UTC")}'])
        writer.writerow([f'Analysis Period: Last {days} days'])
        writer.writerow([f'Total Requests: {summary.get("total_requests", 0)}'])
        writer.writerow([f'Successful Requests: {summary.get("successful_requests", 0)}'])
        writer.writerow([f'Failed Requests: {summary.get("failed_requests", 0)}'])
        writer.writerow([f'Success Rate: {summary.get("success_rate", 100)}%'])
        writer.writerow([f'Average Latency: {summary.get("avg_latency_ms", 0)} ms'])
        writer.writerow([f'P95 Latency: {summary.get("p95_latency_ms", 0)} ms'])
        writer.writerow([f'Health Score: {summary.get("health_score", 100)}%'])
        writer.writerow([f'Total Tokens Consumed: {summary.get("total_tokens_consumed", 0)}'])
        writer.writerow([])
        writer.writerow([
            'ID', 'Timestamp', 'Interaction Type', 'Model', 'Provider',
            'Latency (ms)', 'Prompt Tokens', 'Completion Tokens', 'Total Tokens',
            'Status', 'User', 'Prompt Preview', 'Response Preview', 'User Rating'
        ])
        for log in qs:
            writer.writerow([
                str(log.id),
                log.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                log.interaction_type,
                log.model,
                log.provider,
                log.latency_ms,
                log.prompt_tokens,
                log.completion_tokens,
                log.total_tokens,
                log.status,
                log.user.email if log.user else 'anonymous',
                (log.prompt_preview or '')[:180].replace('\n', ' '),
                (log.response_preview or '')[:180].replace('\n', ' '),
                log.user_rating if log.user_rating is not None else '',
            ])

        return response
