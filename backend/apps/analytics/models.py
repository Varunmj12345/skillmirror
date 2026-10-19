import uuid
from django.db import models

class MarketTrend(models.Model):
    """
    Historical data for job market trends (demand and salary).
    """
    job_role = models.CharField(max_length=255)
    date = models.DateField()
    demand_score = models.PositiveIntegerField(help_text="Number of job postings or demand index")
    avg_salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    class Meta:
        ordering = ['date']
        unique_together = ('job_role', 'date')

    def __str__(self):
        return f"{self.job_role} - {self.date}"

class SalaryData(models.Model):
    """
    Detailed salary statistics by role, location, and experience level.
    """
    job_role = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True, null=True)
    experience_level = models.CharField(max_length=50, blank=True, null=True) # e.g., Entry, Mid, Senior
    min_salary = models.DecimalField(max_digits=12, decimal_places=2)
    max_salary = models.DecimalField(max_digits=12, decimal_places=2)
    median_salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=10, default='USD')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.job_role} in {self.location} ({self.experience_level})"

class SkillProgress(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='skill_progress')
    skill_name = models.CharField(max_length=100)
    current_level = models.IntegerField(default=1) # 1-10
    target_level = models.IntegerField(default=10)
    gap_severity = models.CharField(max_length=20, default='minor') # critical, moderate, minor
    estimated_hours_left = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'skill_name')

class CareerInsight(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='career_insights')
    role = models.CharField(max_length=255)
    confidence_score = models.IntegerField(default=0)
    market_demand = models.CharField(max_length=20, default='Medium')
    hiring_trend = models.FloatField(default=0.0)
    salary_impact = models.JSONField(default=dict)
    automation_risk = models.FloatField(default=0.0)
    job_stability = models.CharField(max_length=50, default='Stable')
    created_at = models.DateTimeField(auto_now_add=True)

class LearningPlan(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='learning_plans')
    title = models.CharField(max_length=255)
    weekly_breakdown = models.JSONField(default=list)
    daily_commitment = models.IntegerField(default=2) # hours
    projects = models.JSONField(default=list)
    certifications = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

class UserMilestone(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='milestones')
    type = models.CharField(max_length=50) # e.g. 'readiness_improvement', 'skill_mastery'
    description = models.CharField(max_length=255)
    is_notified = models.BooleanField(default=False)
    achieved_at = models.DateTimeField(auto_now_add=True)

class PlatformEvent(models.Model):
    """
    Enterprise Event Store for high-scale analytical distribution.
    Acts as the bridge to Kafka/Redis Streams.
    """
    event_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    actor = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='platform_events')
    action = models.CharField(max_length=100) # e.g. "skill_mastery", "interview_completed"
    payload = models.JSONField(default=dict)
    processed = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['action', 'timestamp']),
            models.Index(fields=['event_id']),
        ]

    def __str__(self):
        return f"Event: {self.action} by {self.actor.email} at {self.timestamp}"


class BotPerformanceLog(models.Model):
    """
    Enterprise Telemetry & Performance Audit Store for AI Bot Interactions.
    Tracks latency, token throughput, model reliability, error rates, and user sentiment.
    """
    STATUS_CHOICES = (
        ('success', 'Success'),
        ('error', 'Error'),
        ('fallback', 'Fallback'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        'users.User', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='bot_performance_logs'
    )
    session_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    interaction_type = models.CharField(
        max_length=60, 
        default='career_chat', 
        db_index=True,
        help_text="Type of AI task: career_chat, career_intelligence, resume_intelligence, gap_challenge, code_eval, etc."
    )
    provider = models.CharField(max_length=50, default='groq', db_index=True)
    model = models.CharField(max_length=100, default='openai/gpt-oss-120b', db_index=True)
    prompt_preview = models.TextField(blank=True, null=True)
    response_preview = models.TextField(blank=True, null=True)
    prompt_tokens = models.PositiveIntegerField(default=0)
    completion_tokens = models.PositiveIntegerField(default=0)
    reasoning_tokens = models.PositiveIntegerField(default=0)
    total_tokens = models.PositiveIntegerField(default=0)
    latency_ms = models.FloatField(default=0.0, help_text="Total execution latency in milliseconds")
    queue_time_ms = models.FloatField(default=0.0, help_text="Time queued at provider in ms")
    generation_time_ms = models.FloatField(default=0.0, help_text="Model inference/generation time in ms")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='success', db_index=True)
    status_code = models.IntegerField(default=200)
    error_message = models.TextField(blank=True, null=True)
    user_rating = models.IntegerField(null=True, blank=True, help_text="1 for positive/thumbs-up, -1 for negative")
    user_feedback = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['interaction_type', 'created_at']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['model', 'created_at']),
        ]

    def __str__(self):
        return f"[{self.interaction_type}] {self.model} ({self.status}) - {self.latency_ms:.1f}ms at {self.created_at.strftime('%Y-%m-%d %H:%M')}"
