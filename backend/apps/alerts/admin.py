from django.contrib import admin
from .models import SmartAlert

@admin.register(SmartAlert)
class SmartAlertAdmin(admin.ModelAdmin):
    list_display = ('user', 'alert_type', 'category', 'priority', 'is_read', 'created_at')
    list_filter = ('alert_type', 'category', 'priority', 'is_read')
    search_fields = ('user__email', 'message')
