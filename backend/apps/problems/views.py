from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.db.models import Q
from django.utils import timezone
from apps.problems.models import (
    ProblemOrganization, Problem, ProjectRequirement, ProblemEvidence, ProblemValidation,
    ProblemDuplicate, ProblemMatch, Project, ProjectTask, ProjectSubmissionVersion,
    ProjectEvaluationResult, ProjectOwnerReview, ProjectEvidence, ProblemOpportunity
)
from apps.problems.serializers import (
    ProblemSerializer, ProblemOrganizationSerializer, ProblemValidationSerializer,
    ProblemMatchSerializer, ProjectSerializer, ProjectTaskSerializer,
    ProjectRequirementSerializer, ProjectSubmissionVersionSerializer,
    ProjectEvaluationResultSerializer, ProjectOwnerReviewSerializer,
    ProjectEvidenceSerializer, ProblemOpportunitySerializer, ProblemDuplicateSerializer
)
from apps.problems.services import (
    ProblemNLPService, ProblemValidationService, DuplicateDetectionService,
    StudentProblemMatcher, ProjectIntelligenceEngine, LiveUrlVerificationService,
    ProjectEvaluationEngine, EvidenceGeneratorService, OpportunityEngine
)

class ProblemListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        qs = Problem.objects.all()
        
        category = request.query_params.get('category')
        industry = request.query_params.get('industry')
        complexity = request.query_params.get('complexity')
        source_type = request.query_params.get('source_type')
        is_real_world = request.query_params.get('is_real_world')
        search = request.query_params.get('search')
        status_filter = request.query_params.get('status')

        if category and category != 'all':
            qs = qs.filter(category__iexact=category)
        if industry and industry != 'all':
            qs = qs.filter(industry__iexact=industry)
        if complexity and complexity != 'all':
            qs = qs.filter(complexity__iexact=complexity)
        if source_type and source_type != 'all':
            qs = qs.filter(source_type=source_type)
        if is_real_world is not None and is_real_world != 'all':
            bool_val = is_real_world.lower() == 'true'
            qs = qs.filter(is_real_world=bool_val)
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

        source_type = data.get('source_type', 'COMPANY')
        is_real = source_type != 'AI_GENERATED_PRACTICE'

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
            original_description=description,
            source_type=source_type,
            is_real_world=is_real,
            problem_owner_name=data.get('problem_owner_name', org_name),
            organization=org,
            organization_name=org_name,
            industry=data.get('industry', 'Technology'),
            location=data.get('location', ''),
            current_method=data.get('current_method', ''),
            people_affected=int(data.get('people_affected', 10)),
            frequency=data.get('frequency', 'daily'),
            estimated_impact=data.get('estimated_impact', 'medium'),
            required_solution=data.get('required_solution', ''),
            expected_outcome=data.get('expected_outcome', ''),
            constraints=data.get('constraints', []),
            budget=data.get('budget', None),
            contact_email=data.get('contact_email', ''),
            required_skills_list=data.get('required_skills_list', []),
            tech_preferences=data.get('tech_preferences', []),
            submitted_by=user,
            status='submitted'
        )

        # Trigger Intelligence & Validation Engines
        nlp_res = ProblemNLPService().process_raw_problem(problem)
        val_res = ProblemValidationService().validate_problem(problem)

        return Response({
            'message': 'Problem submitted and processed into structured requirement specification.',
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

        if request.user.is_authenticated:
            pm = StudentProblemMatcher().compute_match(request.user, problem)
            data['user_match'] = ProblemMatchSerializer(pm).data

        return Response(data)


class ConfirmRequirementView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, req_id):
        try:
            req = ProjectRequirement.objects.get(problem_id=pk, requirement_id=req_id)
        except ProjectRequirement.DoesNotExist:
            return Response({'error': 'Requirement not found.'}, status=404)

        action = request.data.get('action') # 'confirm' or 'reject'
        if action == 'confirm':
            req.status = 'confirmed'
        elif action == 'reject':
            req.status = 'rejected'

        req.save()
        return Response(ProjectRequirementSerializer(req).data)


class CheckLiveUrlView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        url = request.data.get('url', '')
        result = LiveUrlVerificationService().check_live_url(url)
        return Response(result)


class ProjectSubmissionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            project = Project.objects.get(pk=pk, user=request.user)
        except Project.DoesNotExist:
            return Response({'error': 'Project workspace not found.'}, status=404)

        github_url = request.data.get('github_url', '')
        published_url = request.data.get('published_url', '')
        documentation = request.data.get('documentation', '')
        requirement_mapping = request.data.get('requirement_mapping', [])
        demo_video_url = request.data.get('demo_video_url', '')
        screenshots = request.data.get('screenshots', [])

        if not github_url or not published_url:
            return Response({'error': 'Both GitHub Repository URL and Live Published URL are required deliverables.'}, status=400)

        # Determine next version number
        latest_ver = project.submissions.first()
        ver_num = (latest_ver.version_number + 1) if latest_ver else 1

        submission = ProjectSubmissionVersion.objects.create(
            project=project,
            student=request.user,
            version_number=ver_num,
            github_url=github_url,
            published_url=published_url,
            documentation=documentation,
            requirement_mapping=requirement_mapping,
            demo_video_url=demo_video_url,
            screenshots=screenshots,
            deployment_status='checking'
        )

        project.status = 'under_evaluation'
        project.save()

        # Run Automated Evaluation Engine
        eval_result = ProjectEvaluationEngine().evaluate_submission(submission)

        return Response({
            'message': f'Submission Version #{ver_num} recorded and evaluated.',
            'submission': ProjectSubmissionVersionSerializer(submission).data,
            'evaluation': ProjectEvaluationResultSerializer(eval_result).data
        }, status=201)


class ProjectEvaluatorDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Allow evaluators or admin staff
        projects = Project.objects.filter(status__in=['submitted', 'under_evaluation', 'resubmitted', 'revision_required'])
        if request.query_params.get('all') == 'true':
            projects = Project.objects.all()

        serialized = ProjectSerializer(projects, many=True).data
        return Response({
            "evaluator": request.user.email,
            "total_pending_evaluation": projects.count(),
            "projects": serialized
        })

    def post(self, request):
        project_id = request.data.get('project_id')
        decision = request.data.get('decision') # ACCEPT, REVISION_REQUIRED, REJECT, REQUEST_MORE_INFO
        comments = request.data.get('comments', '')

        try:
            project = Project.objects.get(pk=project_id)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found.'}, status=404)

        submission = project.submissions.first()
        if not submission:
            return Response({'error': 'No submission found for this project.'}, status=400)

        eval_res = getattr(submission, 'evaluation', None)
        if not eval_res:
            eval_res = ProjectEvaluationResult.objects.create(
                submission=submission,
                project=project,
                evaluator=request.user
            )

        eval_res.evaluator = request.user
        eval_res.evaluator_decision = decision
        eval_res.evaluator_comments = comments
        eval_res.save()

        if decision == 'ACCEPT':
            project.status = 'owner_review' if project.problem.is_real_world else 'completed'
        elif decision == 'REVISION_REQUIRED':
            project.status = 'revision_required'
        elif decision == 'REJECT':
            project.status = 'rejected'

        project.save()
        return Response({
            'message': f'Evaluator decision recorded: {decision}',
            'project': ProjectSerializer(project).data
        })


class ProjectOwnerDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Problem Owner isolated view: ONLY projects connected to problems submitted by this user/contact_email
        user_email = request.user.email
        owned_problems = Problem.objects.filter(Q(submitted_by=request.user) | Q(contact_email__iexact=user_email))

        projects = Project.objects.filter(problem__in=owned_problems)

        return Response({
            "owner": request.user.email,
            "my_requirements_count": owned_problems.count(),
            "my_projects_count": projects.count(),
            "requirements": ProblemSerializer(owned_problems, many=True).data,
            "projects": ProjectSerializer(projects, many=True).data
        })

    def post(self, request):
        project_id = request.data.get('project_id')
        decision = request.data.get('decision') # ACCEPT, REQUEST_CHANGES, REJECT
        comments = request.data.get('comments', '')

        if decision in ['REQUEST_CHANGES', 'REJECT'] and not comments.strip():
            return Response({'error': 'Comments are mandatory when requesting changes or rejecting a project.'}, status=400)

        try:
            project = Project.objects.get(pk=project_id)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found.'}, status=404)

        user_email = request.user.email
        if project.problem.submitted_by != request.user and project.problem.contact_email.lower() != user_email.lower():
            if not request.user.is_staff:
                return Response({'error': 'Unauthorized. You can only act on projects for your own submitted requirements.'}, status=403)

        submission = project.submissions.first()
        review = ProjectOwnerReview.objects.create(
            project=project,
            submission=submission,
            owner=request.user,
            decision=decision,
            comments=comments
        )

        if decision == 'ACCEPT':
            project.status = 'accepted'
            project.save()
            EvidenceGeneratorService().generate_evidence(project, submission.github_url if submission else "", submission.published_url if submission else "")
        elif decision == 'REQUEST_CHANGES':
            project.status = 'revision_required'
            project.save()
        elif decision == 'REJECT':
            project.status = 'rejected'
            project.save()

        return Response({
            'message': f'Owner decision recorded: {decision}',
            'owner_review': ProjectOwnerReviewSerializer(review).data,
            'project': ProjectSerializer(project).data
        })


class ProjectStatusCenterView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = Project.objects.all()
        
        # Lifecycle Counts
        status_counts = {
            'available': Problem.objects.filter(status='validated').count(),
            'selected': projects.filter(status='selected').count(),
            'in_progress': projects.filter(status='in_progress').count(),
            'submitted': projects.filter(status='submitted').count(),
            'under_evaluation': projects.filter(status='under_evaluation').count(),
            'revision_required': projects.filter(status='revision_required').count(),
            'resubmitted': projects.filter(status='resubmitted').count(),
            'owner_review': projects.filter(status='owner_review').count(),
            'accepted': projects.filter(status='accepted').count(),
            'completed': projects.filter(status='completed').count(),
            'rejected': projects.filter(status='rejected').count(),
        }

        return Response({
            "status_counts": status_counts,
            "recent_projects": ProjectSerializer(projects[:30], many=True).data
        })


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
        action_type = request.data.get('action')

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
