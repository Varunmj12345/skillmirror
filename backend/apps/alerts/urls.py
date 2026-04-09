from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SmartAlertViewSet

router = DefaultRouter()
router.register(r'', SmartAlertViewSet, basename='smartalert')

urlpatterns = [
    path('', include(router.urls)),
]
