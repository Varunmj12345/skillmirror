from django.urls import path
from apps.problems.views import (
    ProblemListView, ProblemSubmitView, ProblemDetailView, ProblemAnalyzeView,
    ProblemValidateView, ProblemDuplicatesView, ProblemMatchView, ProjectBuildView,
    ConfirmRequirementView, CheckLiveUrlView, ProjectSubmissionView,
    ProjectEvaluatorDashboardView, ProjectOwnerDashboardView, ProjectStatusCenterView,
    ProjectListView, ProjectDetailView, ProjectTaskUpdateView, ProjectCompleteView,
    AdminProblemDashboardView, OpportunityListView
)

urlpatterns = [
    path('', ProblemListView.as_view(), name='problem_list'),
    path('submit/', ProblemSubmitView.as_view(), name='problem_submit'),
    path('<int:pk>/', ProblemDetailView.as_view(), name='problem_detail'),
    path('<int:pk>/analyze/', ProblemAnalyzeView.as_view(), name='problem_analyze'),
    path('<int:pk>/validate/', ProblemValidateView.as_view(), name='problem_validate'),
    path('<int:pk>/duplicates/', ProblemDuplicatesView.as_view(), name='problem_duplicates'),
    path('<int:pk>/match/', ProblemMatchView.as_view(), name='problem_match'),
    path('<int:pk>/build/', ProjectBuildView.as_view(), name='project_build'),
    path('<int:pk>/confirm-req/<str:req_id>/', ConfirmRequirementView.as_view(), name='confirm_req'),
    
    # Project Endpoints
    path('projects/list/', ProjectListView.as_view(), name='project_list'),
    path('projects/<int:pk>/', ProjectDetailView.as_view(), name='project_detail'),
    path('projects/<int:pk>/tasks/<int:task_id>/', ProjectTaskUpdateView.as_view(), name='project_task_update'),
    path('projects/<int:pk>/submit-version/', ProjectSubmissionView.as_view(), name='project_submit_version'),
    path('projects/<int:pk>/complete/', ProjectCompleteView.as_view(), name='project_complete'),
    path('projects/check-live-url/', CheckLiveUrlView.as_view(), name='check_live_url'),
    path('projects/status-center/', ProjectStatusCenterView.as_view(), name='project_status_center'),
    
    # Dedicated Dashboards
    path('evaluator/dashboard/', ProjectEvaluatorDashboardView.as_view(), name='evaluator_dashboard'),
    path('owner/dashboard/', ProjectOwnerDashboardView.as_view(), name='owner_dashboard'),
    path('admin/dashboard/', AdminProblemDashboardView.as_view(), name='admin_problem_dashboard'),
    path('opportunities/list/', OpportunityListView.as_view(), name='opportunity_list'),
]
