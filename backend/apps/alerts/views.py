from django.db import models
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import SmartAlert
from .serializers import SmartAlertSerializer
from .logic import generate_alerts_for_user, generate_weekly_summary

class SmartAlertViewSet(viewsets.ModelViewSet):
    serializer_class = SmartAlertSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Refresh alerts on fetch for active coaching feel
        generate_alerts_for_user(self.request.user)
        
        return SmartAlert.objects.filter(
            user=self.request.user, 
            is_dismissed=False
        ).filter(
            models.Q(snoozed_until__isnull=True) | models.Q(snoozed_until__lte=timezone.now())
        )

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        alert = self.get_object()
        alert.is_read = True
        alert.save()
        return Response({'status': 'alert marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        SmartAlert.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'all alerts marked as read'})

    @action(detail=True, methods=['post'])
    def dismiss(self, request, pk=None):
        alert = self.get_object()
        alert.is_dismissed = True
        alert.save()
        return Response({'status': 'alert dismissed'})

    @action(detail=True, methods=['post'])
    def snooze(self, request, pk=None):
        alert = self.get_object()
        # Default snooze for 24 hours
        alert.snoozed_until = timezone.now() + timezone.timedelta(days=1)
        alert.save()
        return Response({'status': 'alert snoozed for 24 hours'})

    @action(detail=False, methods=['get'])
    def summary(self, request):
        summary_data = generate_weekly_summary(request.user)
        summary_data['network_status'] = 'linked'
        summary_data['last_sync'] = timezone.now().isoformat()
        return Response(summary_data)
