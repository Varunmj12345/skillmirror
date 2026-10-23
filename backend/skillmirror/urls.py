from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static
from django.utils import timezone
from django.db import connection

def api_root(request):
    return JsonResponse({
        'service': 'SkillMirror Backend API (Django REST Framework)',
        'status': 'online',
        'frontend_app': 'https://skillmirror-puce.vercel.app',
        'docs': 'Visit https://skillmirror-puce.vercel.app to access the SkillMirror web application',
        'endpoints': ['/users/', '/roadmaps/', '/skills/', '/jobs/', '/ai/', '/analytics/', '/admin/', '/health/'],
    })

def health_check(request):
    return JsonResponse({
        'status': 'healthy', 
        'timestamp': str(timezone.now()),
        'version': '1.1.3-refined',
        'engine': 'NeuralIntelligenceEngine-v2'
    })

def deep_health_check(request):
    """Tests DB, AI config, and recent bot telemetry health."""
    checks = {}
    overall = 'healthy'

    # 1. Database
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
        checks['database'] = {'status': 'ok'}
    except Exception:
        checks['database'] = {'status': 'error', 'detail': 'Database connectivity check failed'}
        overall = 'degraded'

    # 2. AI provider config
    try:
        from apps.ai.llm_client import get_active_provider_and_key
        provider, key = get_active_provider_and_key()
        checks['ai_provider'] = {
            'status': 'ok' if key else 'unconfigured',
            'provider': provider or 'none',
            'key_present': bool(key),
        }
        if not key:
            overall = 'degraded'
    except Exception:
        checks['ai_provider'] = {'status': 'error', 'detail': 'AI provider check failed'}
        overall = 'degraded'

    # 3. Recent AI telemetry (last 24h success rate from DB, no live probe)
    try:
        from apps.analytics.models import BotPerformanceLog
        from datetime import timedelta
        since = timezone.now() - timedelta(hours=24)
        total = BotPerformanceLog.objects.filter(created_at__gte=since).count()
        errors = BotPerformanceLog.objects.filter(created_at__gte=since, status='error').count()
        if total == 0:
            checks['ai_telemetry'] = {'status': 'no_data', 'detail': 'No AI calls in last 24h'}
        else:
            rate = round(((total - errors) / total) * 100, 1)
            checks['ai_telemetry'] = {'status': 'ok' if rate > 80 else 'degraded', 'success_rate': rate, 'total_calls': total, 'errors': errors}
            if rate <= 80:
                overall = 'degraded'
    except Exception:
        checks['ai_telemetry'] = {'status': 'error', 'detail': 'Telemetry check failed'}

    status_code = 200 if overall == 'healthy' else 503
    return JsonResponse({
        'status': overall,
        'timestamp': timezone.now().isoformat(),
        'version': '1.1.3-refined',
        'checks': checks,
    }, status=status_code)

urlpatterns = [
    path('', api_root),
    path('health/', health_check),
    path('health/deep/', deep_health_check),
    path('admin/', admin.site.urls),
    path('users/', include('apps.users.urls')),
    path('api/users/', include('apps.users.urls')), # Added for consistency
    path('jobs/', include('apps.jobs.urls')),
    path('api/jobs/', include('apps.jobs.urls')), # Added for new dashboard
    path('skills/', include('apps.skills.urls')),
    path('api/skills/', include('apps.skills.urls')), # Added for consistency
    path('roadmaps/', include('apps.roadmaps.urls')),
    path('ai/', include('apps.ai.urls')),
    path('api/ai/', include('apps.ai.urls')), # Added for new dashboard
    path('analytics/', include('apps.analytics.urls')),
    path('api/analytics/', include('apps.analytics.urls')), # Added for new dashboard
    path('api/interviews/', include('apps.interviews.urls')),
    path('api/alerts/', include('apps.alerts.urls')),
    path('problems/', include('apps.problems.urls')),
    path('api/problems/', include('apps.problems.urls')),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)