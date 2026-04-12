from django.contrib import admin
from .models import Job, JobApplication, JobData, UserJobMatch

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'location', 'employment_type', 'posted_date')
    list_filter = ('employment_type', 'location', 'posted_date')
    search_fields = ('title', 'company', 'description')
    filter_horizontal = ('required_skills',)

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ('job', 'user', 'status', 'applied_date')
    list_filter = ('status', 'applied_date')
    search_fields = ('job__title', 'user__email')

@admin.register(JobData)
class JobDataAdmin(admin.ModelAdmin):
    list_display = ('role_name', 'total_open_jobs', 'remote_ratio', 'last_updated')
    search_fields = ('role_name',)

@admin.register(UserJobMatch)
class UserJobMatchAdmin(admin.ModelAdmin):
    list_display = ('user', 'job_data', 'match_score', 'created_at')
    list_filter = ('match_score', 'created_at')
    search_fields = ('user__email', 'job_data__role_name')
