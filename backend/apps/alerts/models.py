from django.db import models
from django.conf import settings

class SmartAlert(models.Model):
    ALERT_TYPES = [
        ('skill_gap', 'Skill Gap'),
        ('roadmap', 'Roadmap Progress'),
        ('interview', 'Interview Performance'),
        ('readiness', 'Job Readiness'),
        ('market', 'Market Trend'),
        ('predictive_risk', 'Predictive Risk'),
        ('opportunity', 'Growth Opportunity'),
        ('behavioral', 'Behavioral Insight'),
        ('regression', 'Performance Regression'),
        ('achievement', 'Achievement Milestone'),
    ]

    CATEGORIES = [
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('critical', 'Critical'),
        ('achievement', 'Achievement'),
    ]

    PRIORITIES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='smart_alerts')
    alert_type = models.CharField(max_length=50, choices=ALERT_TYPES)
    category = models.CharField(max_length=20, choices=CATEGORIES, default='info')
    priority = models.CharField(max_length=10, choices=PRIORITIES, default='medium')
    message = models.TextField()
    action_link = models.CharField(max_length=255, blank=True)
    
    # AI Predictive Engine Fields
    impact_score = models.IntegerField(default=0, help_text="0-100 impact on career readiness")
    confidence_score = models.IntegerField(default=0, help_text="AI confidence in this insight")
    predicted_risk_level = models.CharField(max_length=20, blank=True, null=True) # Low, Medium, High
    behavioral_flag = models.CharField(max_length=50, blank=True, null=True) # e.g. 'High Performer', 'Stagnant'
    improvement_projection = models.IntegerField(default=0, help_text="Projected score increase if actioned")
    ai_reasoning = models.TextField(blank=True, null=True)
    data_reference_snapshot = models.JSONField(default=dict, blank=True)
    
    # Actions
    secondary_action_link = models.CharField(max_length=255, blank=True)
    secondary_action_text = models.CharField(max_length=100, blank=True)

    is_read = models.BooleanField(default=False)
    is_dismissed = models.BooleanField(default=False)
    snoozed_until = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.alert_type} - {self.priority}"
