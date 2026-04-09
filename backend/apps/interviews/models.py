from django.db import models
from django.conf import settings

class MockInterview(models.Model):
    INTERVIEW_TYPES = [
        ('technical', 'Technical'),
        ('behavioral', 'Behavioral'),
        ('mixed', 'Mixed'),
    ]
    DIFFICULTY_LEVELS = [
        ('easy', 'Easy'),
        ('moderate', 'Moderate'),
        ('hard', 'Hard'),
    ]
    EXPERIENCE_LEVELS = [
        ('entry', 'Entry'),
        ('mid', 'Mid'),
        ('senior', 'Senior'),
    ]

    INTERVIEW_MODES = [
        ('standard', 'Standard'),
        ('rapid_fire', 'Rapid Fire'),
        ('deep_dive', 'Deep Dive'),
        ('hr_simulation', 'HR Simulation'),
        ('technical_panel', 'Technical Panel'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mock_interviews')
    role = models.CharField(max_length=255)
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_LEVELS, default='entry')
    interview_type = models.CharField(max_length=20, choices=INTERVIEW_TYPES, default='mixed')
    interview_mode = models.CharField(max_length=20, choices=INTERVIEW_MODES, default='standard')
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_LEVELS, default='moderate')
    question_count = models.IntegerField(default=5)
    instant_feedback = models.BooleanField(default=False)
    
    total_score = models.FloatField(default=0.0)
    technical_accuracy = models.FloatField(default=0.0)
    communication_score = models.FloatField(default=0.0)
    depth_of_knowledge = models.FloatField(default=0.0)
    clarity_score = models.FloatField(default=0.0)
    
    # Advanced metrics
    technical_readiness = models.FloatField(default=0.0)
    communication_readiness = models.FloatField(default=0.0)
    confidence_level = models.CharField(max_length=50, blank=True, null=True)
    performance_trend = models.TextField(blank=True, null=True)
    
    ai_summary = models.TextField(blank=True, null=True)
    strengths = models.JSONField(default=list)
    weaknesses = models.JSONField(default=list)
    improvement_areas = models.JSONField(default=list)
    
    # Live System Additions
    is_live = models.BooleanField(default=False)
    video_url = models.URLField(blank=True, null=True)
    audio_url = models.URLField(blank=True, null=True)
    
    # Behavior Analytics
    eye_contact_score = models.FloatField(default=0.0)
    sentiment_score = models.FloatField(default=0.0)
    nervousness_score = models.FloatField(default=0.0)
    filler_words_count = models.IntegerField(default=0)
    speaking_pace = models.FloatField(default=0.0) # wpm
    
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.role} ({self.created_at.date()})"

class MockInterviewQuestion(models.Model):
    interview = models.ForeignKey(MockInterview, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    user_answer = models.TextField(blank=True, null=True)
    audio_answer_url = models.FileField(upload_to='interviews/audio/', blank=True, null=True)
    
    # AI Evaluation fields
    score = models.FloatField(default=0.0)
    feedback = models.TextField(blank=True, null=True)
    strengths = models.TextField(blank=True, null=True)
    weaknesses = models.TextField(blank=True, null=True)
    improved_answer = models.TextField(blank=True, null=True)
    sample_answer = models.TextField(blank=True, null=True)
    reviewer_intent = models.TextField(blank=True, null=True)
    missed_concepts = models.JSONField(default=list)
    
    # Behavior metrics per question
    behavioral_feedback = models.TextField(blank=True, null=True)
    confidence_score = models.FloatField(default=0.0)
    clarity_score = models.FloatField(default=0.0)
    filler_words = models.JSONField(default=list)
    avg_pitch = models.FloatField(default=0.0)
    
    # Specific metrics
    technical_accuracy = models.FloatField(default=0.0)
    communication_rating = models.FloatField(default=0.0)
    depth_score = models.FloatField(default=0.0)
    relevance_score = models.FloatField(default=0.0)
    structure_score = models.FloatField(default=0.0)
    completeness_score = models.FloatField(default=0.0)
    
    category = models.CharField(max_length=100, default='General')
    difficulty_badge = models.CharField(max_length=50, default='Moderate')
    
    is_follow_up = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    is_answered = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Q{self.order + 1} for Interview {self.interview.id}"

class LiveInterviewSession(models.Model):
    """Support for Company Mode (Multi-participant sessions)"""
    room_id = models.CharField(max_length=100, unique=True)
    hiring_manager = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='managed_sessions')
    candidate_email = models.EmailField()
    mock_interview = models.OneToOneField(MockInterview, on_delete=models.SET_NULL, null=True, blank=True)
    
    is_active = models.BooleanField(default=True)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Room {self.room_id} - {self.candidate_email}"

