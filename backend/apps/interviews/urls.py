from django.urls import path
from . import views

urlpatterns = [
    path('history/', views.MockInterviewHistoryView.as_view(), name='interview-history'),
    path('detail/<int:id>/', views.MockInterviewDetailView.as_view(), name='interview-detail'),
    path('start/', views.StartMockInterviewView.as_view(), name='start-interview'),
    path('evaluate/<int:question_id>/', views.EvaluateAnswerView.as_view(), name='evaluate-answer'),
    path('submit-answer/<int:question_id>/', views.EvaluateAnswerView.as_view(), name='submit-answer'),
    path('skip-question/<int:question_id>/', views.SkipQuestionView.as_view(), name='skip-question'),
    path('next-question/<int:interview_id>/', views.NextQuestionView.as_view(), name='next-question'),
    path('generate-question/<int:interview_id>/', views.NextQuestionView.as_view(), name='generate-question'),
    path('interview-result/<int:interview_id>/', views.InterviewResultView.as_view(), name='interview-result'),
    path('finalize/<int:interview_id>/', views.FinalizeInterviewView.as_view(), name='finalize-interview'),
    path('process-audio/<int:question_id>/', views.ProcessAudioAnalysisView.as_view(), name='process-audio'),
    path('live/create/', views.CreateLiveSessionView.as_view(), name='create-live-session'),
    path('live/next-question/<int:interview_id>/', views.LiveQuestionGenerationView.as_view(), name='live-next-question'),
    path('ai-engine/', views.AICareerEngineView.as_view(), name='ai-career-engine'),
]
