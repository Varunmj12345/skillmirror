from django.urls import path
from . import views

ai_list = views.AIModelViewSet.as_view({'get': 'list', 'post': 'create'})
ai_detail = views.AIModelViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})

urlpatterns = [
    path('models/', ai_list, name='ai-model-list'),
    path('models/<int:pk>/', ai_detail, name='ai-model-detail'),
    path('generate-roadmap/', views.GenerateRoadmapView.as_view(), name='ai-generate-roadmap'),
    path('chat/', views.CareerChatView.as_view(), name='ai-career-chat'),
    path('predict-demand/', views.PredictDemandView.as_view(), name='ai-predict-demand'),
    path('career-intelligence/report/', views.CareerIntelligenceReportView.as_view(), name='ai-career-intelligence-report'),
]
