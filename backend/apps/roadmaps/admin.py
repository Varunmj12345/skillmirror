from django.contrib import admin
from .models import Roadmap, RoadmapStep, UserRoadmap, ProgressTracker, YouTubeVideo, UserVideoProgress

class RoadmapStepInline(admin.TabularInline):
    model = RoadmapStep
    extra = 1

@admin.register(Roadmap)
class RoadmapAdmin(admin.ModelAdmin):
    list_display = ('title', 'related_job', 'created_at')
    search_fields = ('title', 'description')
    inlines = [RoadmapStepInline]

@admin.register(UserRoadmap)
class UserRoadmapAdmin(admin.ModelAdmin):
    list_display = ('user', 'roadmap', 'progress')
    list_filter = ('progress',)
    search_fields = ('user__email', 'roadmap__title')

@admin.register(ProgressTracker)
class ProgressTrackerAdmin(admin.ModelAdmin):
    list_display = ('user', 'roadmap_step', 'completed', 'mastery_score', 'completed_at')
    list_filter = ('completed',)
    search_fields = ('user__email', 'roadmap_step__title')

@admin.register(YouTubeVideo)
class YouTubeVideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'channel_title', 'video_id', 'created_at')
    search_fields = ('title', 'channel_title', 'video_id')

@admin.register(UserVideoProgress)
class UserVideoProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'video', 'is_completed', 'watch_percentage', 'focus_score')
    list_filter = ('is_completed', 'is_saved')
    search_fields = ('user__email', 'video__title')
