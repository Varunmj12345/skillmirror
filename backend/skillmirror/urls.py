from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

def api_root(request):
    return JsonResponse({
        'message': 'SkillMirror API',
        'docs': 'Visit http://localhost:3000 for the app',
        'endpoints': ['/users/', '/roadmaps/', '/skills/', '/analytics/', '/admin/'],
    })

urlpatterns = [
    path('', api_root),
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
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)