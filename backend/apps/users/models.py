from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone

class UserManager(BaseUserManager):
    use_in_migrations = True
    def _create_user(self, email, password, **extra_fields):
        if not email: raise ValueError('Email required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)
    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self._create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, blank=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    objects = UserManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('problem_owner', 'Problem Owner / Requester'),
        ('evaluator', 'Project Evaluator'),
        ('admin', 'Platform Super Admin'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='student')
    experience_level = models.CharField(max_length=50, blank=True)
    dream_job = models.CharField(max_length=255, blank=True)
    country = models.CharField(max_length=100, blank=True)
    resume = models.FileField(upload_to='resumes/', null=True, blank=True)
    
    # Universal Domain Profiling
    degree = models.CharField(max_length=100, blank=True, default="B.Tech")
    branch_domain = models.CharField(max_length=100, blank=True, default="Computer Science / IT")
    current_year_semester = models.CharField(max_length=50, blank=True, default="3rd Year")
    software_tools = models.JSONField(default=list, blank=True)
    certifications = models.JSONField(default=list, blank=True)
    career_interests = models.JSONField(default=list, blank=True)

    # Career Identity
    current_role = models.CharField(max_length=100, blank=True)
    market_readiness_level = models.CharField(max_length=50, default='Beginner', choices=[
        ('Beginner', 'Beginner'), 
        ('Rising', 'Rising'), 
        ('Competitive', 'Competitive'), 
        ('Expert', 'Expert')
    ])
    job_readiness_score = models.IntegerField(default=0)
    profile_completeness = models.IntegerField(default=0)

    # Production Analytics
    current_streak = models.IntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)
    total_learning_points = models.IntegerField(default=0)
    preferred_theme = models.CharField(max_length=10, default='dark')
    profile_visibility = models.BooleanField(default=True) # True for public/visible
    
    # Security
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_code = models.CharField(max_length=6, blank=True, null=True)
    two_factor_code_expires = models.DateTimeField(blank=True, null=True)

    def calculate_level(self):
        """
        Single Authoritative Level Formula (BUG 3B):
        0–499 XP       = Level 1
        500–1499 XP    = Level 2
        1500–2999 XP   = Level 3
        3000–4999 XP   = Level 4
        5000+ XP       = Level 5
        """
        xp = self.total_learning_points
        if xp < 500:
            return 1
        elif xp < 1500:
            return 2
        elif xp < 3000:
            return 3
        elif xp < 5000:
            return 4
        else:
            return 5

    def get_rank_title(self):
        level = self.calculate_level()
        titles = {
            1: "Beginner Explorer",
            2: "Skill Builder",
            3: "Rising Specialist",
            4: "Competitive Engineer",
            5: "Elite Architect"
        }
        return titles.get(level, "Beginner Explorer")

    def get_next_level_at(self):
        level = self.calculate_level()
        thresholds = {1: 500, 2: 1500, 3: 3000, 4: 5000, 5: 10000}
        return thresholds.get(level, 10000)

    def get_level_progress_percentage(self):
        level = self.calculate_level()
        xp = self.total_learning_points
        bounds = {1: (0, 500), 2: (500, 1500), 3: (1500, 3000), 4: (3000, 5000), 5: (5000, 10000)}
        min_xp, max_xp = bounds[level]
        if xp >= max_xp:
            return 100
        return int(((xp - min_xp) / max(1, max_xp - min_xp)) * 100)

    def calculate_completeness(self):
        score = 0
        if self.dream_job: score += 20

        if self.resume: score += 20
        if self.user.skills.exists(): score += 20
        if self.experience_level: score += 10
        # Check roadmap existence via related name
        if hasattr(self.user, 'user_roadmaps') and self.user.user_roadmaps.exists():
            score += 20
        self.profile_completeness = min(score, 100)
        self.save()

    def __str__(self):
        return f"Profile: {self.user.email}"

class UserSkill(models.Model):
    CATEGORY_CHOICES = [
        ('Frontend', 'Frontend'),
        ('Backend', 'Backend'),
        ('Tools', 'Tools'),
        ('Soft Skills', 'Soft Skills'),
        ('Other', 'Other'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Other')
    level = models.IntegerField(default=1) # 1-5
    verified = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ('user', 'name')

class ActivityLog(models.Model):
    ACTIVITY_TYPES = [
        ('resume', 'Resume Analyzed'),
        ('roadmap', 'Roadmap Updated'),
        ('skill', 'Skill Added'),
        ('interview', 'Interview Practice'),
        ('chat', 'AI Chat'),
        ('login', 'Logged In'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    action_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    description = models.CharField(max_length=255)
    impact_score = models.IntegerField(default=0) # e.g. +5 readiness
    timestamp = models.DateTimeField(auto_now_add=True)

class Assessment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assessments')
    skill_name = models.CharField(max_length=100)
    score = models.IntegerField()
    ai_feedback = models.TextField()
    improvement_plan = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

class Achievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    title = models.CharField(max_length=100)
    description = models.TextField()
    badge_type = models.CharField(max_length=50) # 'rising_talent', 'skill_builder', etc
    earned_at = models.DateTimeField(auto_now_add=True)

class Experience(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='experiences')
    job_title = models.CharField(max_length=100)
    company = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.job_title} at {self.company} ({self.user.email})"


class PasswordResetToken(models.Model):
    """Stores secure one-time password reset tokens with 15-minute expiry."""
    import uuid as _uuid
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reset_tokens')
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def is_valid(self):
        from django.utils import timezone
        return not self.is_used and timezone.now() < self.expires_at

    def __str__(self):
        return f"ResetToken({self.user.email}, expires={self.expires_at}, used={self.is_used})"