from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.users.permissions import CanAccessEngine
from .models import Job, JobData
from .serializers import JobSerializer, JobDataSerializer
from rest_framework.decorators import action
from rest_framework import status
from apps.skills.models import UserSkill
from .services.agent_reach_service import AgentReachJobService

class JobViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, CanAccessEngine]
    required_engine = 'job_intelligence'

    def list(self, request):
        jobs = Job.objects.all().order_by('-posted_date')[:20]
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        try:
            job = Job.objects.get(pk=pk)
            serializer = JobSerializer(job)
            return Response(serializer.data)
        except Job.DoesNotExist:
            return Response({'error': 'Job not found'}, status=404)

    @action(detail=True, methods=['get'])
    def match(self, request, pk=None):
        """Calculate skill match percentage between request.user and the job's required skills."""
        try:
            job = Job.objects.get(pk=pk)
        except Job.DoesNotExist:
            return Response({'error': 'Job not found'}, status=404)

        required = list(job.required_skills.values_list('id', flat=True))
        if not required:
            return Response({'match': 0, 'message': 'No required skills listed'}, status=200)

        user_skills = set(UserSkill.objects.filter(user=request.user).values_list('skill_id', flat=True))
        matched = len(set(required) & user_skills)
        pct = int((matched / len(required)) * 100)
        return Response({'match': pct, 'matched': matched, 'required': len(required)})


class JobDataViewSet(viewsets.ModelViewSet):
    queryset = JobData.objects.all()
    serializer_class = JobDataSerializer

    @action(detail=False, methods=['get'])
    def live(self, request):
        """Fetch live, real-time job market data for a specific role via Agent-Reach."""
        role = request.query_params.get('role')
        if not role:
            return Response({'error': 'Role parameter is required'}, status=400)
        
        force_refresh = request.query_params.get('refresh') == 'true'
        
        # Real-time intelligence extraction with Agent-Reach
        market_intel = AgentReachJobService.get_or_refresh_market_data(role, force_refresh=force_refresh)
        return Response(market_intel)

    @action(detail=False, methods=['get'])
    def suggested_openings(self, request):
        """
        Aggregates live current job openings from:
        - Official company career portals (Stripe, Figma, Vercel, Cloudflare, GitLab...)
        - Live web scraped Freelancer.com gigs & challenges
        - Global tech boards (RemoteOK, Remotive, Arbeitnow)
        """
        role = request.query_params.get('role')
        source_filter = request.query_params.get('source', 'all')
        if not role and request.user.is_authenticated:
            profile = getattr(request.user, 'profile', None)
            role = getattr(profile, 'dream_job', None) or 'Software Engineer'
        role = role or 'Software Engineer'
        match_data = AgentReachJobService.get_role_match_and_recommendations(request.user, role, source_filter=source_filter)
        return Response(match_data)

    @action(detail=False, methods=['post'])
    def match_post(self, request):
        """Calculate real match score and return verified live job vacancies (POST)."""
        role = request.data.get('role') or request.query_params.get('role') or 'Software Engineer'
        source_filter = request.data.get('source') or request.query_params.get('source', 'all')
        match_data = AgentReachJobService.get_role_match_and_recommendations(request.user, role, source_filter=source_filter)
        return Response(match_data)

    @action(detail=False, methods=['get'])
    def scout_agent_status(self, request):
        """Returns real-time status and telemetry of the Official Career Scout Agent."""
        from .services.career_scout_agent import OfficialCareerScoutAgent
        return Response(OfficialCareerScoutAgent.get_agent_status())

    @action(detail=False, methods=['post'])
    def run_scout_sweep(self, request):
        """Triggers an immediate sweep of official company career portals and tech boards."""
        from .services.career_scout_agent import OfficialCareerScoutAgent
        results = OfficialCareerScoutAgent.run_full_scout_sweep()
        return Response(results)