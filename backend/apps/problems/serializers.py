from rest_framework import serializers
from apps.problems.models import (
    ProblemOrganization, Problem, ProjectRequirement, ProblemEvidence, ProblemValidation,
    ProblemDuplicate, ProblemMatch, Project, ProjectTask, ProjectSubmissionVersion,
    ProjectEvaluationResult, ProjectOwnerReview, ProjectEvidence, ProblemOpportunity
)

class ProblemOrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProblemOrganization
        fields = '__all__'

class ProjectRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectRequirement
        fields = '__all__'

class ProblemEvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProblemEvidence
        fields = '__all__'

class ProblemValidationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProblemValidation
        fields = '__all__'

class ProblemSerializer(serializers.ModelSerializer):
    organization_detail = ProblemOrganizationSerializer(source='organization', read_only=True)
    evidences = ProblemEvidenceSerializer(many=True, read_only=True)
    validation = ProblemValidationSerializer(read_only=True)
    requirements = ProjectRequirementSerializer(many=True, read_only=True)

    class Meta:
        model = Problem
        fields = '__all__'

class ProblemDuplicateSerializer(serializers.ModelSerializer):
    target_title = serializers.CharField(source='target_problem.title', read_only=True)
    target_org = serializers.CharField(source='target_problem.organization_name', read_only=True)

    class Meta:
        model = ProblemDuplicate
        fields = '__all__'

class ProblemMatchSerializer(serializers.ModelSerializer):
    problem_title = serializers.CharField(source='problem.title', read_only=True)
    problem_category = serializers.CharField(source='problem.category', read_only=True)

    class Meta:
        model = ProblemMatch
        fields = '__all__'

class ProjectTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectTask
        fields = '__all__'

class ProjectEvaluationResultSerializer(serializers.ModelSerializer):
    evaluator_name = serializers.CharField(source='evaluator.email', read_only=True)

    class Meta:
        model = ProjectEvaluationResult
        fields = '__all__'

class ProjectSubmissionVersionSerializer(serializers.ModelSerializer):
    evaluation = ProjectEvaluationResultSerializer(read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)

    class Meta:
        model = ProjectSubmissionVersion
        fields = '__all__'

class ProjectOwnerReviewSerializer(serializers.ModelSerializer):
    owner_email = serializers.CharField(source='owner.email', read_only=True)

    class Meta:
        model = ProjectOwnerReview
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    tasks = ProjectTaskSerializer(many=True, read_only=True)
    problem_title = serializers.CharField(source='problem.title', read_only=True)
    problem_source_type = serializers.CharField(source='problem.source_type', read_only=True)
    is_real_world = serializers.BooleanField(source='problem.is_real_world', read_only=True)
    problem_owner_name = serializers.CharField(source='problem.problem_owner_name', read_only=True)
    organization_name = serializers.CharField(source='problem.organization_name', read_only=True)
    student_email = serializers.CharField(source='user.email', read_only=True)
    submissions = ProjectSubmissionVersionSerializer(many=True, read_only=True)
    requirements = ProjectRequirementSerializer(source='problem.requirements', many=True, read_only=True)
    owner_reviews = ProjectOwnerReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = '__all__'

class ProjectEvidenceSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source='project.title', read_only=True)

    class Meta:
        model = ProjectEvidence
        fields = '__all__'

class ProblemOpportunitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProblemOpportunity
        fields = '__all__'
