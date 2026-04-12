from django.contrib import admin
from .models import (
    Skill, UserSkill, RequiredSkill, SkillGapReport, 
    RoleTemplate, CareerReadinessSnapshot, ResumeData, 
    ResumeHistory, ResumeBuilderProfile, CommunityTemplate,
    GeneratedResume
)

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)

@admin.register(UserSkill)
class UserSkillAdmin(admin.ModelAdmin):
    list_display = ('user', 'skill', 'category', 'level', 'progress_percentage')
    list_filter = ('category', 'level')
    search_fields = ('user__email', 'skill__name')

@admin.register(RequiredSkill)
class RequiredSkillAdmin(admin.ModelAdmin):
    list_display = ('role_name', 'skill_name', 'importance_level', 'category')
    list_filter = ('importance_level', 'category')
    search_fields = ('role_name', 'skill_name')

@admin.register(SkillGapReport)
class SkillGapReportAdmin(admin.ModelAdmin):
    list_display = ('user', 'role_name', 'readiness_score', 'created_at')
    list_filter = ('readiness_score', 'created_at')
    search_fields = ('user__email', 'role_name')

@admin.register(RoleTemplate)
class RoleTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'seniority')
    list_filter = ('seniority',)
    search_fields = ('name',)

@admin.register(CareerReadinessSnapshot)
class CareerReadinessSnapshotAdmin(admin.ModelAdmin):
    list_display = ('user', 'target_role', 'readiness_score', 'created_at')
    list_filter = ('readiness_score', 'created_at')

@admin.register(ResumeData)
class ResumeDataAdmin(admin.ModelAdmin):
    list_display = ('user', 'updated_at')
    search_fields = ('user__email',)

@admin.register(ResumeHistory)
class ResumeHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'file_name', 'ats_score', 'created_at')
    list_filter = ('ats_score', 'created_at')

@admin.register(CommunityTemplate)
class CommunityTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'category', 'use_count', 'is_approved')
    list_filter = ('category', 'is_approved')
    search_fields = ('name', 'created_by__email')
@admin.register(ResumeBuilderProfile)
class ResumeBuilderProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'updated_at')
    search_fields = ('user__email', 'summary')

@admin.register(GeneratedResume)
class GeneratedResumeAdmin(admin.ModelAdmin):
    list_display = ('user', 'file_name', 'version_number', 'ats_score', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'file_name')
