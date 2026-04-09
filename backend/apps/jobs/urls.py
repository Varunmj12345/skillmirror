from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'jobs', views.JobViewSet, basename='job')
router.register(r'market', views.JobDataViewSet, basename='job-data')

urlpatterns = [
    path('fetch-live-jobs/', views.JobDataViewSet.as_view({'get': 'live'}), name='fetch-live-jobs'),
    path('job-match/', views.JobDataViewSet.as_view({'post': 'match_post'}), name='job-match'),
    path('', include(router.urls)),
]