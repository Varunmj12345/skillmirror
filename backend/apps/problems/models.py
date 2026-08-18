from django.db import models
from django.conf import settings
from django.utils import timezone

class ProblemOrganization(models.Model):
    ORG_TYPES = [
        ('company', 'Company'),
        ('startup', 'Startup'),
        ('hospital', 'Hospital / Healthcare'),
        ('ngo', 'NGO / Non-Profit'),
        ('college', 'College / Educational Institution'),
        ('agriculture', 'Farmers / Agriculture Organization'),
        ('local_business', 'Local Business'),
        ('govt', 'Government / Public Organization'),
        ('student', 'Student Group'),
        ('individual', 'Individual User'),
        ('mentor', 'Mentor / Researcher'),
    ]

    name = models.CharField(max_length=255)
    org_type = models.CharField(max_length=50, choices=ORG_TYPES, default='company')
    location = models.CharField(max_length=255, blank=True)
    contact_email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.get_org_type_display()})"


class Problem(models.Model):
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('under_analysis', 'Under Analysis'),
        ('needs_more_info', 'Needs More Information'),
        ('potential', 'Potential Problem'),
        ('validated', 'Validated'),
        ('rejected', 'Rejected'),
        ('duplicate', 'Duplicate'),
    ]

    IMPACT_CHOICES = [
        ('low', 'Low Impact'),
        ('medium', 'Medium Impact'),
        ('high', 'High Impact'),
        ('critical', 'Critical Impact'),
    ]

    COMPLEXITY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ]

    # Raw Submission Fields
    title = models.CharField(max_length=255)
    description = models.TextField()
    organization = models.ForeignKey(ProblemOrganization, on_delete=models.SET_NULL, null=True, blank=True, related_name='problems')
    organization_name = models.CharField(max_length=255, blank=True)
    industry = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=255, blank=True)
    current_method = models.TextField(blank=True, help_text="Current method or solution used")
    people_affected = models.IntegerField(default=1, help_text="Estimated count of people affected")
    frequency = models.CharField(max_length=50, default='daily', help_text="e.g. daily, weekly, continuous")
    estimated_impact = models.CharField(max_length=20, choices=IMPACT_CHOICES, default='medium')
    required_solution = models.TextField(blank=True)
    budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    deadline = models.DateField(null=True, blank=True)
    contact_email = models.EmailField(blank=True)
    required_skills_list = models.JSONField(default=list, blank=True)
    tech_preferences = models.JSONField(default=list, blank=True)
    attachments = models.JSONField(default=list, blank=True)

    # Processed Intelligence Fields
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='submitted')
    category = models.CharField(max_length=100, default='General Tech')
    target_users = models.CharField(max_length=255, blank=True)
    root_problem = models.TextField(blank=True)
    symptoms = models.JSONField(default=list, blank=True)
    existing_solution_gap = models.TextField(blank=True)
    missing_capability = models.TextField(blank=True)
    complexity = models.CharField(max_length=20, choices=COMPLEXITY_CHOICES, default='intermediate')
    estimated_effort_weeks = models.IntegerField(default=4)
    urgency = models.CharField(max_length=20, choices=IMPACT_CHOICES, default='medium')
    market_relevance_score = models.IntegerField(default=75) # 0-100

    submitted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='submitted_problems')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} [{self.status}]"


class ProblemEvidence(models.Model):
    SOURCE_TYPES = [
        ('ai_assessed', 'AI-Assessed Evidence'),
        ('human_verified', 'Human-Verified Evidence'),
        ('organization_verified', 'Organization-Verified Evidence'),
    ]

    VERIFICATION_STATUS = [
        ('pending', 'Pending Verification'),
        ('verified', 'Verified'),
        ('unverified', 'Unverified'),
        ('insufficient', 'Insufficient Evidence'),
    ]

    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='evidences')
    source_type = models.CharField(max_length=30, choices=SOURCE_TYPES, default='ai_assessed')
    evidence_type = models.CharField(max_length=50, default='market_data') # dataset, user_interview, metrics, etc.
    title = models.CharField(max_length=255)
    description = models.TextField()
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUS, default='pending')
    proof_url = models.URLField(blank=True)
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.get_source_type_display()})"


class ProblemValidation(models.Model):
    problem = models.OneToOneField(Problem, on_delete=models.CASCADE, related_name='validation')
    validation_score = models.IntegerField(default=0, help_text="Overall score 0-100")
    
    # Validation Factor Breakdown
    evidence_score = models.IntegerField(default=0)
    user_impact_score = models.IntegerField(default=0)
    frequency_score = models.IntegerField(default=0)
    urgency_score = models.IntegerField(default=0)
    existing_gap_score = models.IntegerField(default=0)
    org_verification_score = models.IntegerField(default=0)
    market_relevance_score = models.IntegerField(default=0)
    reproducibility_score = models.IntegerField(default=0)

    reviewer_notes = models.TextField(blank=True)
    ai_analysis_notes = models.TextField(blank=True)
    validated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Validation for {self.problem.title}: {self.validation_score}%"


class ProblemDuplicate(models.Model):
    source_problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='duplicate_sources')
    target_problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='duplicate_targets')
    similarity_score = models.FloatField(default=0.0, help_text="0-100 similarity score")
    status = models.CharField(max_length=20, choices=[('potential', 'Potential'), ('merged', 'Merged'), ('dismissed', 'Dismissed')], default='potential')
    detected_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Duplicate: {self.source_problem.title} <-> {self.target_problem.title} ({self.similarity_score}%)"


class ProblemMatch(models.Model):
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='student_matches')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='problem_matches')
    match_score = models.FloatField(default=0.0, help_text="0-100 Match %")
    matched_skills = models.JSONField(default=list)
    missing_skills = models.JSONField(default=list)
    learning_gap_analysis = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('problem', 'user')

    def __str__(self):
        return f"{self.user.email} - {self.problem.title} ({self.match_score}%)"


class Project(models.Model):
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='projects')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='problem_projects')
    title = models.CharField(max_length=255)
    problem_statement = models.TextField()
    target_users = models.CharField(max_length=255, blank=True)

    # Scoped Requirements
    functional_requirements = models.JSONField(default=list)
    non_functional_requirements = models.JSONField(default=list)
    
    # Phased Scoping
    mvp_scope = models.JSONField(default=dict, help_text="Core MVP features & scope")
    v2_scope = models.JSONField(default=dict, help_text="Version 2 features")
    future_scope = models.JSONField(default=dict, help_text="Future expansion scope")

    # Architecture Blueprint
    architecture_recommendation = models.TextField(blank=True)
    tech_stack = models.JSONField(default=list)
    database_design = models.JSONField(default=dict, blank=True)
    api_requirements = models.JSONField(default=list, blank=True)
    frontend_modules = models.JSONField(default=list, blank=True)
    backend_modules = models.JSONField(default=list, blank=True)
    ai_ml_requirements = models.JSONField(default=list, blank=True)
    security_requirements = models.JSONField(default=list, blank=True)
    milestones = models.JSONField(default=list, blank=True)
    testing_requirements = models.JSONField(default=list, blank=True)
    deployment_requirements = models.JSONField(default=list, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    progress_percentage = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Project: {self.title} ({self.user.email})"


class ProjectTask(models.Model):
    PHASE_CHOICES = [
        ('mvp', 'MVP Phase'),
        ('v2', 'Version 2'),
        ('future', 'Future Expansion'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    scope_phase = models.CharField(max_length=20, choices=PHASE_CHOICES, default='mvp')
    mapped_skill_name = models.CharField(max_length=100, blank=True)
    student_skill_level = models.CharField(max_length=50, default='beginner')
    learning_resources = models.JSONField(default=list, blank=True)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.project.title} - Task: {self.title}"


class ProjectEvidence(models.Model):
    VERIFICATION_STATUS_CHOICES = [
        ('self_reported', 'Self-Reported'),
        ('ai_assessed', 'AI-Assessed'),
        ('organization_verified', 'Organization-Verified'),
    ]

    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name='evidence')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='project_evidences')
    problem_solved_summary = models.TextField()
    student_contribution = models.TextField()
    technologies_used = models.JSONField(default=list)
    features_developed = models.JSONField(default=list)
    github_url = models.URLField(blank=True)
    deployment_url = models.URLField(blank=True)
    testing_passed = models.BooleanField(default=True)
    performance_metrics = models.JSONField(default=dict, blank=True)
    user_feedback = models.TextField(blank=True)
    problem_impact_rating = models.IntegerField(default=85) # 0-100
    
    # Formal Evidence Statement
    evidence_statement = models.TextField(help_text="e.g. Student demonstrated Django REST API development...")
    verification_status = models.CharField(
        max_length=30,
        choices=VERIFICATION_STATUS_CHOICES,
        default='self_reported'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Evidence for {self.project.title} ({self.user.email})"


class ProblemOpportunity(models.Model):
    OPPORTUNITY_TYPES = [
        ('internship', 'Internship'),
        ('job', 'Full-time Job'),
        ('freelance', 'Freelance Project'),
        ('startup', 'Startup Incubation'),
        ('research', 'Research Grant'),
        ('college_project', 'Academic Project'),
        ('hackathon', 'Hackathon Challenge'),
        ('company_collaboration', 'Company Collaboration'),
    ]

    project_evidence = models.ForeignKey(ProjectEvidence, on_delete=models.SET_NULL, null=True, blank=True, related_name='opportunities')
    problem = models.ForeignKey(Problem, on_delete=models.SET_NULL, null=True, blank=True, related_name='opportunities')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='matched_opportunities')
    opportunity_type = models.CharField(max_length=30, choices=OPPORTUNITY_TYPES, default='internship')
    title = models.CharField(max_length=255)
    organization = models.CharField(max_length=255)
    description = models.TextField()
    match_reason = models.TextField()
    application_link = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} at {self.organization} ({self.user.email})"
