from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from apps.users.permissions import IsPlatformAdmin, IsProjectEvaluator, IsProblemOwner, IsStudentUser, IsResourceOwner
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
        base_qs = Problem.objects.select_related('organization', 'validation').prefetch_related('evidences', 'requirements')
        qs = base_qs

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
            if source_type == 'FREELANCER_SCRAPED' and not qs.filter(source_type='FREELANCER_SCRAPED').exists():
                from apps.problems.services import FreelancerChallengeService
                FreelancerChallengeService.sync_freelancer_challenges(limit=10)
                qs = base_qs
            elif source_type == 'COURSERA_LAB' and not qs.filter(source_type='COURSERA_LAB').exists():
                from apps.problems.services import SkillLabService
                SkillLabService.seed_skill_labs()
                qs = base_qs
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
            people_affected=_safe_int(data.get('people_affected', 10), default=10, min_val=1, max_val=10000000),
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


def _safe_int(value, default: int, min_val: int = 1, max_val: int = 1000) -> int:
    try:
        return max(min_val, min(int(value), max_val))
    except (ValueError, TypeError):
        return default


def _can_manage_problem(user, problem) -> bool:
    if not user or not user.is_authenticated:
        return False
    role = getattr(getattr(user, 'profile', None), 'role', 'student')
    return bool(user.is_staff or role == 'admin' or problem.submitted_by_id == user.id)


class ConfirmRequirementView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, req_id):
        try:
            req = ProjectRequirement.objects.select_related('problem').get(problem_id=pk, requirement_id=req_id)
        except ProjectRequirement.DoesNotExist:
            return Response({'error': 'Requirement not found.'}, status=404)

        if not _can_manage_problem(request.user, req.problem):
            return Response({'detail': 'Forbidden: Only the problem owner or admin can modify requirements.'}, status=403)

        action = request.data.get('action') # 'confirm' or 'reject'
        if action == 'confirm':
            req.status = 'confirmed'
        elif action == 'reject':
            req.status = 'rejected'

        req.save()
        return Response(ProjectRequirementSerializer(req).data)


class CheckLiveUrlView(APIView):
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsProjectEvaluator]

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
    permission_classes = [IsProblemOwner]

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

        if not _can_manage_problem(request.user, problem):
            return Response({'detail': 'Forbidden: Only the problem owner or admin can analyze problems.'}, status=403)

        nlp_res = ProblemNLPService().process_raw_problem(problem)
        return Response({'message': 'Analysis complete', 'nlp': nlp_res, 'problem': ProblemSerializer(problem).data})


class ProblemValidateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            problem = Problem.objects.get(pk=pk)
        except Problem.DoesNotExist:
            return Response({'error': 'Problem not found.'}, status=404)

        if not _can_manage_problem(request.user, problem):
            return Response({'detail': 'Forbidden: Only the problem owner or admin can validate problems.'}, status=403)

        val = ProblemValidationService().validate_problem(problem)
        return Response(ProblemValidationSerializer(val).data)


class ProblemDuplicatesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            problem = Problem.objects.get(pk=pk)
        except Problem.DoesNotExist:
            return Response({'error': 'Problem not found.'}, status=404)

        if not _can_manage_problem(request.user, problem):
            return Response({'detail': 'Forbidden: Only the problem owner or admin can check duplicates.'}, status=403)

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
        projects = (
            Project.objects.filter(user=request.user)
            .select_related('problem', 'user')
            .prefetch_related(
                'tasks',
                'submissions__evaluation',
                'submissions__student',
                'problem__requirements',
                'owner_reviews__owner',
            )
        )
        return Response(ProjectSerializer(projects, many=True).data)


class ProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found.'}, status=404)

        user = request.user
        role = getattr(getattr(user, 'profile', None), 'role', 'student')
        is_owner = (project.user == user)
        is_problem_owner = (project.problem.submitted_by == user or project.problem.contact_email.lower() == user.email.lower())
        is_eval_or_admin = user.is_staff or role in ['admin', 'evaluator']

        if not (is_owner or is_problem_owner or is_eval_or_admin):
            return Response({'error': 'Forbidden: You do not have permission to access this project.'}, status=403)

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
    permission_classes = [IsPlatformAdmin]

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


# ═══════════════════════════════════════════════════════════════════════
# AUTONOMOUS AI ASSESSMENT PORTAL ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════

from apps.problems.ai_assessment_engine import AIAssessmentEngine
from apps.users.models import UserSkill, ActivityLog, UserProfile

class AIEvaluateSubmissionView(APIView):
    """
    POST /api/problems/practice/<pk>/evaluate/
    Evaluates a candidate's practice challenge submission using AIAssessmentEngine.
    Computes dimension scores, criteria status, line-by-line critique, refactored code,
    and automatically awards XP and skill growth points.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            problem = Problem.objects.get(pk=pk)
        except Problem.DoesNotExist:
            return Response({'error': 'Challenge not found.'}, status=404)

        submission_data = {
            'code_snippet': request.data.get('code_snippet', ''),
            'github_url': request.data.get('github_url', ''),
            'published_url': request.data.get('published_url', ''),
            'documentation': request.data.get('documentation', '')
        }

        challenge_data = {
            'title': problem.title,
            'description': problem.description,
            'complexity': problem.complexity,
            'category': problem.category,
            'requirements': [r.description for r in problem.requirements.all()] or [problem.required_solution or problem.description],
            'constraints': problem.constraints or ["Optimize time and space complexity"]
        }

        engine = AIAssessmentEngine()
        evaluation_result = engine.evaluate_submission(challenge_data, submission_data)

        # Record or update Project & Submission Version
        project, _ = Project.objects.get_or_create(
            problem=problem,
            user=request.user,
            defaults={
                'title': problem.title,
                'problem_statement': problem.description,
                'target_users': problem.target_users or 'Developers',
                'status': 'completed' if evaluation_result.get('decision') == 'PASS' else 'in_progress',
                'progress_percentage': evaluation_result.get('overall_score', 80)
            }
        )

        # Version bump
        latest_version = project.submissions.count() + 1
        sub_ver = ProjectSubmissionVersion.objects.create(
            project=project,
            student=request.user,
            version_number=latest_version,
            github_url=submission_data['github_url'] or 'https://github.com/practice-submission',
            published_url=submission_data['published_url'] or 'https://preview.practice-sandbox.internal',
            documentation=submission_data['documentation'] or submission_data['code_snippet'][:500],
            requirement_mapping=evaluation_result.get('criteria_evaluations', [])
        )

        ProjectEvaluationResult.objects.create(
            submission=sub_ver,
            project=project,
            requirement_evaluations=evaluation_result.get('criteria_evaluations', []),
            automated_checks=evaluation_result.get('dimension_scores', {}),
            quality_score=evaluation_result.get('overall_score', 80),
            quality_breakdown=evaluation_result.get('dimension_scores', {}),
            evaluator_decision='ACCEPT' if evaluation_result.get('decision') == 'PASS' else 'REVISION_REQUIRED',
            evaluator_comments=evaluation_result.get('code_critique', '')
        )

        # Award XP and log user activity
        xp_points = evaluation_result.get('xp_awarded', 100)
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        profile.total_learning_points = (profile.total_learning_points or 0) + xp_points
        profile.job_readiness_score = min(100, (profile.job_readiness_score or 50) + 2)
        profile.save()

        ActivityLog.objects.create(
            user=request.user,
            action_type='project',
            description=f"Completed AI Assessment: {problem.title} (Score: {evaluation_result.get('overall_score', 0)}/100, +{xp_points} XP)",
            impact_score=xp_points
        )

        # Increment skills
        for growth in evaluation_result.get('skills_growth', []):
            skill_name = growth.get('skill')
            if skill_name:
                user_skill, _ = UserSkill.objects.get_or_create(
                    user=request.user,
                    name=skill_name,
                    defaults={'category': 'Technical', 'level': 2, 'verified': True}
                )
                user_skill.level = min(5, user_skill.level + 1)
                user_skill.save()

        return Response({
            'evaluation': evaluation_result,
            'project_id': project.id,
            'submission_version': latest_version,
            'user_stats': {
                'total_xp': profile.total_learning_points,
                'readiness_score': profile.job_readiness_score
            }
        })


class AIGenerateGapChallengeView(APIView):
    """
    POST /api/problems/practice/generate-gap-challenge/
    Synthesizes a tailored, real-world practice challenge targeting the user's detected skill gaps.
    Saves and returns the challenge as a persistent Problem record.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        profile, _ = UserProfile.objects.get_or_create(user=user)
        if not profile.consume_credit(1):
            return Response({
                'error': 'You have used all your free credits. Upgrade to Plus or Pro (Demo Mode) to generate more AI challenges.',
                'detail': 'You have used all your free credits. Upgrade to Plus or Pro (Demo Mode) to generate more AI challenges.',
                'code': 'CREDITS_EXHAUSTED',
                'upgrade_required': True,
                'credits_remaining': profile.credits_remaining,
                'subscription_plan': profile.subscription_plan,
            }, status=402)
        target_role = profile.dream_job or "Senior Full-Stack Engineer"
        
        user_skills = list(user.skills.values_list('name', flat=True))
        gap_skills = request.data.get('gap_skills')
        if not gap_skills:
            # Pick from career interests or default
            gap_skills = request.data.get('skills', ['System Architecture', 'API Resilience', 'Distributed Caching'])

        difficulty = request.data.get('difficulty', 'intermediate')

        engine = AIAssessmentEngine()
        challenge_spec = engine.generate_gap_challenge(user_skills, target_role, gap_skills, difficulty)

        # Persist as Problem record
        org, _ = ProblemOrganization.objects.get_or_create(
            name="SkillMirror AI Lab",
            defaults={'org_type': 'startup', 'is_verified': True}
        )

        problem = Problem.objects.create(
            title=challenge_spec.get('title', 'Targeted Skill Gap Challenge'),
            description=f"{challenge_spec.get('scenario', '')}\n\n**Problem Statement:**\n{challenge_spec.get('problem_statement', '')}",
            original_description=challenge_spec.get('problem_statement', ''),
            source_type='AI_GENERATED_PRACTICE',
            current_method=challenge_spec.get('starter_code', ''),
            is_real_world=True,
            problem_owner_name="AI Challenge Engine",
            organization=org,
            organization_name="SkillMirror AI Lab",
            industry=challenge_spec.get('domain', 'Technology'),
            category=challenge_spec.get('category', 'Full-Stack Architecture'),
            complexity=difficulty,
            estimated_effort_weeks=1,
            market_relevance_score=95,
            required_solution=json.dumps(challenge_spec.get('requirements', [])),
            constraints=challenge_spec.get('constraints', []),
            required_skills_list=challenge_spec.get('target_skills', gap_skills),
            status='validated',
            submitted_by=user
        )

        # Create Requirements
        for idx, req_text in enumerate(challenge_spec.get('requirements', []), 1):
            ProjectRequirement.objects.create(
                problem=problem,
                requirement_id=f"REQ-{idx:03d}",
                title=f"Requirement {idx}",
                description=req_text,
                acceptance_criteria=req_text,
                source='AI_INFERRED',
                status='confirmed'
            )

        serialized = ProblemSerializer(problem).data
        serialized['starter_code'] = challenge_spec.get('starter_code', '')
        serialized['test_cases'] = challenge_spec.get('test_cases', [])
        serialized['hints'] = challenge_spec.get('hints', [])
        serialized['xp_reward'] = challenge_spec.get('xp_reward', 150)

        return Response(serialized, status=201)


class AIGenerateSkillLabView(APIView):
    """
    POST /api/problems/practice/generate-skill-lab/
    Scrapes live course inspiration (Coursera / Dev.to) for a topic and synthesizes
    a bite-sized (~15-20 min) Coursera-style Guided Skill Lab assignment.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        from apps.problems.services import SkillLabService
        SkillLabService.seed_skill_labs()
        topic = request.data.get('topic', '')
        category = request.data.get('category', 'Backend Architecture')
        if category in ('all', 'skill_labs', 'gaps', 'freelancer', ''):
            category = 'Backend Architecture'
        difficulty = request.data.get('difficulty', 'beginner')
        if difficulty == 'all':
            difficulty = 'beginner'

        problem = SkillLabService.generate_live_skill_lab(
            topic=topic,
            category=category,
            difficulty=difficulty,
            user=request.user,
        )
        return Response(ProblemSerializer(problem).data, status=201)


class AIGetProgressiveHintView(APIView):
    """
    POST /api/problems/practice/<pk>/hint/
    Body: { "level": 1 | 2 | 3 }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            problem = Problem.objects.get(pk=pk)
        except Problem.DoesNotExist:
            return Response({'error': 'Challenge not found.'}, status=404)

        hint_level = _safe_int(request.data.get('level', 1), default=1, min_val=1, max_val=3)
        challenge_data = {
            'title': problem.title,
            'description': problem.description,
            'category': problem.category
        }

        engine = AIAssessmentEngine()
        hint = engine.generate_progressive_hint(challenge_data, hint_level)
        return Response(hint)


class AIPracticeSubmissionsListView(APIView):
    """
    GET /api/problems/practice/submissions/
    Returns all submitted assessments for the current user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        submissions = ProjectSubmissionVersion.objects.filter(student=request.user).select_related('project', 'evaluation')
        results = []
        for s in submissions:
            eval_record = getattr(s, 'evaluation', None)
            results.append({
                'id': s.id,
                'project_id': s.project.id,
                'challenge_title': s.project.title,
                'version_number': s.version_number,
                'submitted_at': s.created_at,
                'github_url': s.github_url,
                'published_url': s.published_url,
                'quality_score': eval_record.quality_score if eval_record else 0,
                'decision': eval_record.evaluator_decision if eval_record else 'PENDING',
                'comments': eval_record.evaluator_comments if eval_record else '',
                'dimension_scores': eval_record.quality_breakdown if eval_record else {}
            })
        return Response(results)


# ═══════════════════════════════════════════════════════════════════════
# FREELANCER.COM SCRAPED CHALLENGES & EXTERNAL PROJECTS
# ═══════════════════════════════════════════════════════════════════════

class FreelancerSyncChallengesView(APIView):
    """
    POST /api/problems/sync-freelancer/
    Scrapes live jobs from https://www.freelancer.com/jobs/?utm_source=chatgpt.com
    and transforms them into structured Problem challenge records.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        limit = _safe_int(request.data.get('limit', 15), default=15, min_val=1, max_val=50)
        from apps.problems.services import FreelancerChallengeService
        problems = FreelancerChallengeService.sync_freelancer_challenges(limit=limit)
        return Response({
            'message': f'Successfully synchronized {len(problems)} challenges from Freelancer.com',
            'count': len(problems),
            'problems': ProblemSerializer(problems, many=True).data
        })

    def get(self, request):
        problems = Problem.objects.filter(source_type='FREELANCER_SCRAPED')
        if not problems.exists():
            from apps.problems.services import FreelancerChallengeService
            problems = FreelancerChallengeService.sync_freelancer_challenges(limit=12)
        else:
            problems = problems.all()
        return Response({
            'source': 'https://www.freelancer.com/jobs/?utm_source=chatgpt.com',
            'count': len(problems),
            'problems': ProblemSerializer(problems, many=True).data
        })


class ExternalProjectsListView(APIView):
    """
    GET /api/problems/external-projects/
    Live web scrapes external freelance projects from https://www.freelancer.com/jobs/?utm_source=chatgpt.com
    """
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get('search', '')
        limit = _safe_int(request.query_params.get('limit', 25), default=25, min_val=1, max_val=50)
        from apps.jobs.services.freelancer_scraper import FreelancerScraper
        projects = FreelancerScraper.scrape_jobs(query=query, limit=limit)
        return Response({
            'source': 'https://www.freelancer.com/jobs/?utm_source=chatgpt.com',
            'count': len(projects),
            'projects': projects
        })


class ExternalProjectImportView(APIView):
    """
    POST /api/problems/external-projects/import/
    Imports an external Freelancer project into the user's active Project workspaces.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        title = data.get('title')
        description = data.get('description', '')
        url = data.get('url', '')
        budget = data.get('budget_numeric')
        skills = data.get('skills', [])
        category = data.get('category', 'Fullstack MVP')
        complexity = data.get('complexity', 'intermediate')

        if not title:
            return Response({'error': 'Project title is required'}, status=400)

        org, _ = ProblemOrganization.objects.get_or_create(
            name="Freelancer.com Client Network",
            defaults={'org_type': 'company', 'website': 'https://www.freelancer.com', 'is_verified': True}
        )

        problem, _ = Problem.objects.get_or_create(
            title=title,
            defaults={
                'description': description,
                'original_description': f"Source: Freelancer.com\nRequisition URL: {url}\nBudget: {data.get('budget', '')}\n\n{description}",
                'source_type': 'FREELANCER_SCRAPED',
                'is_real_world': True,
                'problem_owner_name': 'Freelancer Client',
                'organization': org,
                'organization_name': 'Freelancer.com',
                'industry': category,
                'category': category,
                'budget': budget,
                'required_skills_list': skills,
                'complexity': complexity,
                'status': 'validated',
                'attachments': [url] if url else []
            }
        )

        existing_project = Project.objects.filter(problem=problem, user=request.user).first()
        if existing_project:
            return Response({
                'message': 'Project workspace already exists for this challenge.',
                'project_id': existing_project.id
            })

        project = ProjectIntelligenceEngine().create_project_from_problem(request.user, problem)
        return Response({
            'message': 'External freelance project imported into your workspace.',
            'project_id': project.id,
            'title': project.title
        }, status=201)

