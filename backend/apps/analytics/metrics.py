from django.db import models
from django.utils import timezone

class UserActivity(models.Model):
    user_id = models.IntegerField()
    activity_type = models.CharField(max_length=255)
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Activity {self.activity_type} for User {self.user_id} at {self.timestamp}"

class SkillUsage(models.Model):
    user_id = models.IntegerField()
    skill_name = models.CharField(max_length=255)
    usage_count = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.skill_name} used {self.usage_count} times by User {self.user_id}"

class JobApplication(models.Model):
    user_id = models.IntegerField()
    job_id = models.IntegerField()
    application_date = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=50, choices=[('applied', 'Applied'), ('interview', 'Interview'), ('rejected', 'Rejected'), ('accepted', 'Accepted')])

    def __str__(self):
        return f"Application for Job {self.job_id} by User {self.user_id} - Status: {self.status}"


def calculate_metrics():
    """Return a lightweight summary of analytics metrics for local/dev use."""
    # In a real deployment this would aggregate DB tables. Return a safe default here.
    return {
        'user_activity_count': UserActivity.objects.count() if hasattr(UserActivity, 'objects') else 0,
        'skill_usage_count': SkillUsage.objects.count() if hasattr(SkillUsage, 'objects') else 0,
        'job_applications_count': JobApplication.objects.count() if hasattr(JobApplication, 'objects') else 0,
    }