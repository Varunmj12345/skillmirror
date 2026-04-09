from django.urls import path
from . import views

roadmap_create = views.RoadmapViewSet.as_view({'post': 'create'})
roadmap_detail = views.RoadmapViewSet.as_view({'get': 'retrieve'})
roadmap_list = views.RoadmapViewSet.as_view({'get': 'list'})
roadmap_goals = views.RoadmapGoalsView.as_view({'get': 'list'})

urlpatterns = [
    path('', roadmap_list, name='roadmap-list'),
    path('goals/', roadmap_goals, name='roadmap-goals'),
    path('<int:pk>/', roadmap_detail, name='roadmap-detail'),
    path('generate/', roadmap_create, name='generate-roadmap'),
    path('progress/', views.ProgressTrackerView.as_view(), name='progress-tracker'),
    path('youtube/search/', views.YouTubeSearchView.as_view(), name='youtube-search'),
    path('youtube/save/', views.SaveVideoView.as_view(), name='youtube-save'),
    path('youtube/progress/', views.VideoProgressView.as_view(), name='youtube-video-progress'),
    path('youtube/summary/', views.VideoSummaryView.as_view(), name='youtube-video-summary'),
    path('ai/recommend/', views.AIRecommendationView.as_view(), name='ai-recommend-skill'),
    path('analytics/', views.UserAnalyticsView.as_view(), name='user-learning-analytics'),
    path('mini-mock/', views.MiniMockView.as_view(), name='roadmap-mini-mock'),
    path('youtube/intelligence/', views.VideoIntelligenceView.as_view(), name='youtube-video-intelligence'),
]