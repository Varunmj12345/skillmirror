from django.db import models

class Job(models.Model):
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    description = models.TextField()
    posted_date = models.DateTimeField(auto_now_add=True)
    employment_type = models.CharField(max_length=50, choices=[
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
        ('temporary', 'Temporary'),
    ])
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    required_skills = models.ManyToManyField('skills.Skill', related_name='jobs', blank=True)

    def __str__(self):
        return f"{self.title} at {self.company}"

class JobApplication(models.Model):
    job = models.ForeignKey(Job, related_name='applications', on_delete=models.CASCADE)
    user = models.ForeignKey('users.User', related_name='applications', on_delete=models.CASCADE)
    applied_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=[
        ('applied', 'Applied'),
        ('interview', 'Interview'),
        ('offer', 'Offer'),
        ('rejected', 'Rejected'),
    ])

    def __str__(self):
        return f"Application for {self.job.title} by User {self.user_id}"

class JobData(models.Model):
    """
    Stores aggregated/live job market data for a specific role.
    """
    role_name = models.CharField(max_length=255, unique=True)
    total_open_jobs = models.PositiveIntegerField(default=0)
    top_companies = models.JSONField(default=list, help_text="List of top hiring companies")
    avg_salary_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    avg_salary_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    remote_ratio = models.DecimalField(max_digits=5, decimal_places=2, help_text="Percentage of remote jobs (0.00 to 100.00)", default=0.00)
    onsite_ratio = models.DecimalField(max_digits=5, decimal_places=2, help_text="Percentage of onsite jobs (0.00 to 100.00)", default=0.00)
    location_heatmap = models.JSONField(default=dict, help_text="Mapping of location to job count")
    top_required_skills = models.JSONField(default=list, help_text="List of top required skills with counts")
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Job Data for {self.role_name}"

class UserJobMatch(models.Model):
    """
    Stores match score between a user and a specific job role.
    """
    user = models.ForeignKey('users.User', related_name='job_matches', on_delete=models.CASCADE)
    job_data = models.ForeignKey(JobData, related_name='user_matches', on_delete=models.CASCADE)
    match_score = models.DecimalField(max_digits=5, decimal_places=2, help_text="Match percentage (0-100)")
    missing_skills = models.JSONField(default=list, help_text="List of skills user is missing for this role")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'job_data')

    def __str__(self):
        return f"{self.user.username} - {self.job_data.role_name} ({self.match_score}%)"