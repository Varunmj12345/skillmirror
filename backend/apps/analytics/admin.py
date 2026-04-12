from django.contrib import admin
from .models import MarketTrend, SalaryData, SkillProgress, CareerInsight, LearningPlan, UserMilestone, PlatformEvent

@admin.register(MarketTrend)
class MarketTrendAdmin(admin.ModelAdmin):
    list_display = ('job_role', 'date', 'demand_score', 'avg_salary')
    list_filter = ('job_role', 'date')
    search_fields = ('job_role',)

@admin.register(SalaryData)
class SalaryDataAdmin(admin.ModelAdmin):
    list_display = ('job_role', 'location', 'experience_level', 'median_salary', 'currency')
    list_filter = ('job_role', 'experience_level', 'location')
    search_fields = ('job_role', 'location')

@admin.register(PlatformEvent)
class PlatformEventAdmin(admin.ModelAdmin):
    list_display = ('action', 'actor', 'processed', 'timestamp')
    list_filter = ('action', 'processed')
    search_fields = ('actor__email', 'action')
    readonly_fields = ('event_id', 'timestamp')

@admin.register(SkillProgress)
class SkillProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'skill_name', 'current_level', 'target_level', 'gap_severity')
    list_filter = ('gap_severity',)

@admin.register(LearningPlan)
class LearningPlanAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'daily_commitment', 'created_at')
    search_fields = ('user__email', 'title')

@admin.register(UserMilestone)
class UserMilestoneAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'description', 'achieved_at')
    list_filter = ('type',)
