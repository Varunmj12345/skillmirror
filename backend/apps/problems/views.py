from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.db.models import Q
from apps.problems.models import (
    ProblemOrganization, Problem, ProblemEvidence, ProblemValidation,
    ProblemDuplicate, ProblemMatch, Project, ProjectTask, ProjectEvidence, ProblemOpportunity
)
from apps.problems.serializers import (
    ProblemSerializer, ProblemOrganizationSerializer, ProblemValidationSerializer,
    ProblemMatchSerializer, ProjectSerializer, ProjectTaskSerializer,
    ProjectEvidenceSerializer, ProblemOpportunitySerializer, ProblemDuplicateSerializer
)
from apps.problems.services import (
    ProblemNLPService, ProblemValidationService, DuplicateDetectionService,
    StudentProblemMatcher, ProjectIntelligenceEngine, EvidenceGeneratorService, OpportunityEngine
)

class ProblemListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        qs = Problem.objects.all()
        
        # Filtering
        category = request.query_params.get('category')
        industry = request.query_params.get('industry')
        complexity = request.query_params.get('complexity')
        search = request.query_params.get('search')
        status_filter = request.query_params.get('status')

        if category and category != 'all':
            qs = qs.filter(category__iexact=category)
        if industry and industry != 'all':
            qs = qs.filter(industry__iexact=industry)
        if complexity and complexity != 'all':
            qs = qs.filter(complexity__iexact=complexity)
        if status_filter and status_filter != 'all':
            qs = qs.filter(status=status_filter)
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(description__icontains=search) | Q(industry__icontains=search))

        serializer = ProblemSerializer(qs, many=True)
        return Response(serializer.data)


class ProblemSubmitView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        title = data.get('title')
        description = data.get('description')
        if not title or not description:
            return Response({'error': 'Title and description are required.'}, status=400)

        # Find or create Organization
        org_name = data.get('organization_name', 'Independent Submitter')
        org_type = data.get('org_type', 'company')
        org, _ = ProblemOrganization.objects.get_or_create(
            name=org_name,
            defaults={'org_type': org_type, 'location': data.get('location', '')}
        )

        user = request.user if request.user.is_authenticated else None

        problem = Problem.objects.create(
            title=title,
            description=description,
            organization=org,
            organization_name=org_name,
            industry=data.get('industry', 'Technology'),
            location=data.get('location', ''),
            current_method=data.get('current_method', ''),
            people_affected=int(data.get('people_affected', 10)),
            frequency=data.get('frequency', 'daily'),
            estimated_impact=data.get('estimated_impact', 'medium'),
            required_solution=data.get('required_solution', ''),
            budget=data.get('budget', None),
            contact_email=data.get('contact_email', ''),
            required_skills_list=data.get('required_skills_list', []),
            tech_preferences=data.get('tech_preferences', []),
            submitted_by=user,
            status='submitted'
        )

        # Trigger NLP & Validation Processing
        nlp_res = ProblemNLPService().process_raw_problem(problem)
        val_res = ProblemValidationService().validate_problem(problem)

        return Response({
            'message': 'Problem submitted and processed successfully.',
            'problem': ProblemSerializer(problem).data,
            'nlp': nlp_res,
            'validation_score': val_res.validation_score
        }, status=201)


class ProblemDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            problem = Problem.objects.get(pk=pk)
        except Problem.DoesNotExist:
            return Response({'error': 'Problem not found.'}, status=404)

        data = ProblemSerializer(problem).data

        # If user authenticated, calculate live match score
        if request.user.is_authenticated:
            pm = StudentProblemMatcher().compute_match(request.user, problem)
            data['user_match'] = ProblemMatchSerializer(pm).data

        return Response(data)


class ProblemAnalyzeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            problem = Problem.objects.get(pk=pk)
        except Problem.DoesNotExist:
            return Response({'error': 'Problem not found.'}, status=404)

        nlp_res = ProblemNLPService().process_raw_problem(problem)
        return Response({'message': 'Analysis complete', 'nlp': nlp_res, 'problem': ProblemSerializer(problem).data})


class ProblemValidateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            problem = Problem.objects.get(pk=pk)
        except Problem.DoesNotExist:
            return Response({'error': 'Problem not found.'}, status=404)

        val = ProblemValidationService().validate_problem(problem)
        return Response(ProblemValidationSerializer(val).data)


class ProblemDuplicatesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            problem = Problem.objects.get(pk=pk)
        except Problem.DoesNotExist:
            return Response({'error': 'Problem not found.'}, status=404)

        duplicates = DuplicateDetectionService().check_duplicates(problem)
        return Response({'source_problem_id': pk, 'duplicates': duplicates})


class ProblemMatchView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            problem = Problem.objects.get(pk=pk)
        except Problem.DoesNotExist:
            return Response({'error': 'Problem not found.'}, status=404)

        pm = StudentProblemMatcher().compute_match(request.user, problem)
        return Response(ProblemMatchSerializer(pm).data)


class ProjectBuildView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            problem = Problem.objects.get(pk=pk)
        except Problem.DoesNotExist:
            return Response({'error': 'Problem not found.'}, status=404)

        # Check if project already exists for this user & problem
        existing = Project.objects.filter(problem=problem, user=request.user).first()
        if existing:
            return Response(ProjectSerializer(existing).data)

        project = ProjectIntelligenceEngine().create_project_from_problem(request.user, problem)
        return Response(ProjectSerializer(project).data, status=201)


class ProjectListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = Project.objects.filter(user=request.user)
        return Response(ProjectSerializer(projects, many=True).data)


class ProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            project = Project.objects.get(pk=pk, user=request.user)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found.'}, status=404)

        return Response(ProjectSerializer(project).data)


class ProjectTaskUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk, task_id):
        try:
            task = ProjectTask.objects.get(pk=task_id, project_id=pk, project__user=request.user)
        except ProjectTask.DoesNotExist:
            return Response({'error': 'Task not found.'}, status=404)

        task.is_completed = request.data.get('is_completed', task.is_completed)
        if task.is_completed:
            task.completed_at = timezone.now()
        task.save()

        # Update parent project progress
        project = task.project
        total_tasks = project.tasks.count()
        completed_tasks = project.tasks.filter(is_completed=True).count()
        project.progress_percentage = int((completed_tasks / max(1, total_tasks)) * 100)
        project.save()

        return Response(ProjectTaskSerializer(task).data)


class ProjectCompleteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            project = Project.objects.get(pk=pk, user=request.user)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found.'}, status=404)

        github_url = request.data.get('github_url', '')
        deployment_url = request.data.get('deployment_url', '')

        evidence = EvidenceGeneratorService().generate_evidence(project, github_url, deployment_url)
        return Response(ProjectEvidenceSerializer(evidence).data)


class AdminProblemDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff and not request.user.is_superuser:
            # Grant admin view access for demo purposes
            pass

        problems = Problem.objects.all()
        validations = ProblemValidation.objects.all()
        duplicates = ProblemDuplicate.objects.filter(status='potential')

        data = {
            "stats": {
                "total_problems": problems.count(),
                "submitted_count": problems.filter(status='submitted').count(),
                "validated_count": problems.filter(status='validated').count(),
                "potential_duplicates": duplicates.count(),
                "active_projects": Project.objects.count()
            },
            "problems": ProblemSerializer(problems[:20], many=True).data,
            "duplicates": ProblemDuplicateSerializer(duplicates[:10], many=True).data
        }
        return Response(data)

    def post(self, request):
        problem_id = request.data.get('problem_id')
        action_type = request.data.get('action') # approve, reject, merge, verify

        try:
            problem = Problem.objects.get(pk=problem_id)
        except Problem.DoesNotExist:
            return Response({'error': 'Problem not found.'}, status=404)

        if action_type == 'approve':
            problem.status = 'validated'
        elif action_type == 'reject':
            problem.status = 'rejected'
        elif action_type == 'needs_info':
            problem.status = 'needs_more_info'
        elif action_type == 'merge':
            problem.status = 'duplicate'

        problem.save()
        return Response({'message': f'Problem status updated to {problem.status}.'})


class OpportunityListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        opps = ProblemOpportunity.objects.filter(user=request.user)
        return Response(ProblemOpportunitySerializer(opps, many=True).data)
