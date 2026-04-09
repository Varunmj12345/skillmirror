from django.db import models

class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class SkillProficiency(models.Model):
    skill = models.ForeignKey(Skill, related_name='proficiencies', on_delete=models.CASCADE)
    level = models.CharField(max_length=50)
    user = models.ForeignKey('users.User', related_name='proficiencies', on_delete=models.CASCADE)
    years_of_experience = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} - {self.skill.name} ({self.level})"


class UserSkill(models.Model):
    CATEGORY_CHOICES = [
        ('technical', 'Technical'),
        ('soft', 'Soft Skill'),
        ('tools', 'Tools'),
        ('programming', 'Programming'),
        ('data', 'Data'),
        ('design', 'Design'),
        ('devops', 'DevOps'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey('users.User', related_name='skills_owned', on_delete=models.CASCADE)
    skill = models.ForeignKey(Skill, related_name='user_links', on_delete=models.CASCADE)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    level = models.PositiveIntegerField(default=1, help_text="Skill level 1-5")
    progress_percentage = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'skill')

    def __str__(self):
        return f"{self.user.email} - {self.skill.name} (Level {self.level})"


class RequiredSkill(models.Model):
    IMPORTANCE_CHOICES = [
        (1, 'Low'),
        (2, 'Medium'),
        (3, 'High'),
        (4, 'Critical'),
        (5, 'Mandatory'),
    ]
    
    CATEGORY_CHOICES = [
        ('technical', 'Technical'),
        ('soft', 'Soft Skill'),
        ('tools', 'Tools'),
    ]

    role_name = models.CharField(max_length=255)
    skill_name = models.CharField(max_length=100)
    importance_level = models.PositiveIntegerField(choices=IMPORTANCE_CHOICES, default=3)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='technical')

    def __str__(self):
        return f"{self.role_name} - {self.skill_name} ({self.importance_level})"


class SkillGapReport(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='gap_reports')
    role_name = models.CharField(max_length=255)
    matched_skills = models.JSONField(default=list)
    missing_skills = models.JSONField(default=list)
    readiness_score = models.FloatField(default=0.0)
    technical_score = models.FloatField(default=0.0)
    soft_skill_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.role_name} ({self.readiness_score}%)"


class RoleTemplate(models.Model):
    """Canonical role definition with required skills and weights."""

    SENIORITY_CHOICES = [
        ('junior', 'Junior'),
        ('mid', 'Mid-level'),
        ('senior', 'Senior'),
    ]

    name = models.CharField(max_length=255)
    seniority = models.CharField(max_length=20, choices=SENIORITY_CHOICES, default='junior')
    description = models.TextField(blank=True)
    required_skills = models.JSONField(
        default=dict,
        blank=True,
        help_text="Mapping of skill names to required level/weight, e.g. {'Python': {'weight': 3, 'level': 'intermediate'}}",
    )

    def __str__(self):
        return f"{self.name} ({self.seniority})"


class CareerReadinessSnapshot(models.Model):
    """Snapshot of a user's readiness for a given target role."""

    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='readiness_snapshots')
    target_role = models.ForeignKey(RoleTemplate, on_delete=models.CASCADE, related_name='snapshots')
    readiness_score = models.PositiveIntegerField(help_text="0-100 readiness score")
    skill_gaps = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.target_role.name} ({self.readiness_score}%)"


class ResumeData(models.Model):
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='resume_data')
    resume_file = models.FileField(upload_to='resumes/', null=True, blank=True)
    extracted_skills = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Resume - {self.user.email}"

class ResumeHistory(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='resume_history')
    file_name = models.CharField(max_length=255)
    resume_file = models.FileField(upload_to='resumes/history/')
    ats_score = models.FloatField(default=0.0)
    job_match_score = models.FloatField(default=0.0)
    extracted_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.file_name} ({self.ats_score}%)"

class ResumeBuilderProfile(models.Model):
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='resume_builder')
    personal_details = models.JSONField(default=dict, blank=True)
    summary = models.TextField(blank=True)
    skills = models.JSONField(default=list, blank=True)
    experience = models.JSONField(default=list, blank=True)
    education = models.JSONField(default=list, blank=True)
    projects = models.JSONField(default=list, blank=True)
    certifications = models.JSONField(default=list, blank=True)
    achievements = models.JSONField(default=list, blank=True)
    template_config = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Builder Profile - {self.user.email}"

class CommunityTemplate(models.Model):
    """User-submitted resume template shared with the community."""
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='shared_templates')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, default='Modern')
    # JSON config: accent color, font, layout, section order, etc.
    config = models.JSONField(default=dict)
    # How many users have used this template
    use_count = models.PositiveIntegerField(default=0)
    is_approved = models.BooleanField(default=True)  # auto-approved for now
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-use_count', '-created_at']

    def __str__(self):
        return f"{self.name} by {self.created_by.email}"

class CustomTemplate(models.Model):
    """User-uploaded resume templates (DOCX, HTML, etc.)."""
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='custom_templates')
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='templates/custom/')
    file_type = models.CharField(max_length=10)  # docx, html, pdf, md, json
    mapped_fields = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.user.email})"

class GeneratedResume(models.Model):
    """Resumes generated using either built-in or custom templates."""
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='generated_resumes')
    custom_template = models.ForeignKey(CustomTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    file_name = models.CharField(max_length=255, blank=True)
    file = models.FileField(upload_to='resumes/generated/')
    ats_score = models.FloatField(default=0.0)
    job_match = models.FloatField(default=0.0)
    version_number = models.PositiveIntegerField(default=1)
    # Store snapshot of builder data used for this generation
    data_snapshot = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"v{self.version_number} - {self.user.email} ({self.created_at.date()})"