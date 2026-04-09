from django.db import models

class Roadmap(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    required_skills = models.JSONField(default=list)
    related_job = models.ForeignKey('jobs.Job', null=True, blank=True, on_delete=models.SET_NULL, related_name='roadmaps')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class RoadmapStep(models.Model):
    roadmap = models.ForeignKey(Roadmap, related_name='steps', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    order = models.PositiveIntegerField()
    skills_list = models.JSONField(default=list)
    duration_weeks = models.IntegerField(default=2, help_text="Estimated weeks to complete this phase")
    estimated_hours = models.IntegerField(default=20, help_text="Estimated total hours for this phase")
    difficulty = models.CharField(max_length=20, default='intermediate', choices=[('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced')])
    skill_demand = models.JSONField(default=dict, help_text="Demand level per skill in this step")
    recommended_resources = models.JSONField(default=list, help_text="List of courses, tutorials, books")

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title

class UserRoadmap(models.Model):
    user = models.ForeignKey('users.User', related_name='user_roadmaps', on_delete=models.CASCADE)
    roadmap = models.ForeignKey(Roadmap, related_name='user_roadmaps', on_delete=models.CASCADE)
    progress = models.FloatField(default=0.0)

    def __str__(self):
        return f"{self.user.username}'s roadmap: {self.roadmap.title}"


class ProgressTracker(models.Model):
    """Tracks user progress on roadmap steps."""
    user = models.ForeignKey('users.User', related_name='progress_trackers', on_delete=models.CASCADE)
    roadmap_step = models.ForeignKey(RoadmapStep, related_name='trackers', on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    mastery_score = models.FloatField(default=0.0)
    confidence_index = models.FloatField(default=0.0)
    time_spent_minutes = models.IntegerField(default=0)
    mini_mock_results = models.JSONField(default=dict, blank=True)
    outcome_projection = models.JSONField(default=dict, blank=True)

    class Meta:
        unique_together = ('user', 'roadmap_step')

    def __str__(self):
        return f"{self.user.email} - {self.roadmap_step.title} ({'done' if self.completed else 'pending'})"

class YouTubeVideo(models.Model):
    """Stores YouTube video metadata for learning."""
    video_id = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=255)
    thumbnail_url = models.URLField()
    channel_title = models.CharField(max_length=255)
    duration = models.CharField(max_length=20, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class UserVideoProgress(models.Model):
    """Tracks user progress on YouTube videos."""
    user = models.ForeignKey('users.User', related_name='video_progress', on_delete=models.CASCADE)
    video = models.ForeignKey(YouTubeVideo, related_name='user_progress', on_delete=models.CASCADE)
    is_saved = models.BooleanField(default=False)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Watch Intelligence
    watch_percentage = models.FloatField(default=0.0)
    rewatch_count = models.IntegerField(default=0)
    drop_off_seconds = models.IntegerField(default=0)
    focus_score = models.FloatField(default=0.0)
    
    # AI Knowledge Extraction
    ai_extraction = models.JSONField(default=dict, blank=True) # Key Notes, Concepts, Questions, Tasks
    
    # Skill Linking
    linked_skill = models.CharField(max_length=100, blank=True, null=True)
    impact_level = models.CharField(max_length=20, default='medium', choices=[('high', 'High'), ('medium', 'Medium'), ('low', 'Low')])
    
    last_watched = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'video')

    def __str__(self):
        return f"{self.user.email} - {self.video.title} ({'saved' if self.is_saved else 'watched'})"