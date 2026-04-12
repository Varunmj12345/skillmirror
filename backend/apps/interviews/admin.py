from django.contrib import admin
from .models import MockInterview, MockInterviewQuestion, LiveInterviewSession

class MockInterviewQuestionInline(admin.TabularInline):
    model = MockInterviewQuestion
    extra = 0

@admin.register(MockInterview)
class MockInterviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'total_score', 'is_completed', 'created_at')
    list_filter = ('role', 'is_completed', 'created_at')
    search_fields = ('user__email', 'role')
    inlines = [MockInterviewQuestionInline]

@admin.register(LiveInterviewSession)
class LiveInterviewSessionAdmin(admin.ModelAdmin):
    list_display = ('room_id', 'hiring_manager', 'candidate_email', 'is_active', 'scheduled_at')
    list_filter = ('is_active',)
    search_fields = ('room_id', 'candidate_email', 'hiring_manager__email')
