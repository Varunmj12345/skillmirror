from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

skill_analyze = views.SkillViewSet.as_view({'post': 'analyze'})
skill_list = views.SkillViewSet.as_view({'get': 'list'})

router = DefaultRouter()
router.register(r'resume/history', views.ResumeHistoryViewSet, basename='resume-history')
router.register(r'resume/builder', views.ResumeBuilderViewSet, basename='resume-builder')
router.register(r'resume/community-templates', views.CommunityTemplateViewSet, basename='community-templates')
router.register(r'resume/custom-templates', views.CustomTemplateViewSet, basename='custom-templates')
router.register(r'resume/generated', views.GeneratedResumeViewSet, basename='resume-generated')


urlpatterns = [
    path('analyze/', skill_analyze, name='skill-analysis'),
    path('proficiency/', skill_list, name='skill-proficiency'),
    path('trends/', skill_list, name='skill-trends'),
    path('all/', skill_list, name='skill-all'),
    path('analyze-skill-gap/', views.AnalyzeSkillGapView.as_view(), name='analyze-skill-gap'),
    path('recommend-learning/', views.RecommendLearningView.as_view(), name='recommend-learning'),
    path('resume/upload/', views.ResumeUploadView.as_view(), name='resume-upload'),
    path('resume/status/', views.CheckResumeStatusView.as_view(), name='resume-status'),
    path('resume/ai-improve/', views.ResumeAIImproveView.as_view(), name='resume-ai-improve'),
    path('resume/ats-insight/', views.ATSInsightView.as_view(), name='resume-ats-insight'),
    path('resume/export/', views.ResumeExportView.as_view(), name='resume-export'),
    path('resume/extract-profile/', views.ResumeExtractProfileView.as_view(), name='resume-extract-profile'),
    path('extract/', views.ExtractSkillsView.as_view(), name='extract-skills'),
    path('', include(router.urls)),
]
