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
