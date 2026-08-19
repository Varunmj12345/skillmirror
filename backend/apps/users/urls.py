from django.urls import path
from .views import (
    RegisterView, ForgotPasswordView, LoginView, AdminLoginView,
    CareerDashboardView, SkillManagementView, ProfileView,
    Verify2FAView, ResetPasswordView,
    ExportDataView, DeleteAccountView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='user-register'),
    path('login/', LoginView.as_view(), name='token_obtain_pair'),
    path('admin-login/', AdminLoginView.as_view(), name='admin-login'),
    path('dashboard/', CareerDashboardView.as_view(), name='career-dashboard'),
    path('skills/', SkillManagementView.as_view(), name='skill-management'),
    path('skills/<int:pk>/', SkillManagementView.as_view(), name='skill-delete'),
    path('profile/', ProfileView.as_view(), name='user-profile'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('verify-2fa/', Verify2FAView.as_view(), name='verify-2fa'),
    path('export-data/', ExportDataView.as_view(), name='export-data'),
    path('delete-account/', DeleteAccountView.as_view(), name='delete-account'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]