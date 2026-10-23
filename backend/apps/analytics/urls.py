from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .bot_export import BotTelemetryExportView, BotTelemetrySeedView

router = DefaultRouter()
router.register(r'trends', views.MarketTrendViewSet, basename='market-trend')
router.register(r'salary', views.SalaryDataViewSet, basename='salary-data')

urlpatterns = [
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
    path('job-trend/', views.MarketTrendViewSet.as_view({'get': 'list_by_role'}), name='job-trend'),
    path('market-trend/', views.MarketTrendViewSet.as_view({'get': 'list_by_role'}), name='market-trend-alias'),
    path('salary-insights/', views.SalaryDataViewSet.as_view({'get': 'list_by_role'}), name='salary-insights'),
    path('generate-action-plan/', views.ActionPlanView.as_view(), name='generate-action-plan'),
    path('update-skill-progress/', views.SkillProgressUpdateView.as_view(), name='update-skill-progress'),
    path('predict-completion/', views.PredictCompletionView.as_view(), name='predict-completion'),
    path('ai-career-insight/', views.CareerInsightView.as_view(), name='ai-career-insight'),
    
    # â”€â”€ AI Bot Performance & Analytical Engine â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    path('bot-performance/', views.BotPerformanceOverviewView.as_view(), name='bot-performance-overview'),
    path('bot-performance/logs/', views.BotPerformanceLogsView.as_view(), name='bot-performance-logs'),
    path('bot-performance/feedback/', views.BotFeedbackView.as_view(), name='bot-performance-feedback'),
    path('bot-performance/diagnostic/', views.BotDiagnosticView.as_view(), name='bot-performance-diagnostic'),
    path('bot-performance/export/', BotTelemetryExportView.as_view(), name='bot-performance-export'),
    path('bot-performance/seed/', BotTelemetrySeedView.as_view(), name='bot-performance-seed'),
    
    path('', include(router.urls)),
]

