from rest_framework import viewsets
from rest_framework.response import Response
from .models import Job
from .serializers import JobSerializer
from rest_framework.decorators import action
from rest_framework import status
from apps.skills.models import UserSkill

class JobViewSet(viewsets.ViewSet):
    def list(self, request):
        jobs = Job.objects.all()
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

from .models import JobData
from .serializers import JobDataSerializer

class JobDataViewSet(viewsets.ModelViewSet):
    queryset = JobData.objects.all()
    serializer_class = JobDataSerializer

    @action(detail=False, methods=['get'])
    def live(self, request):
        """Fetch live job market data for a specific role."""
        role = request.query_params.get('role')
        if not role:
            return Response({'error': 'Role parameter is required'}, status=400)
        
        # Mocking live data for dashboard
        data, created = JobData.objects.get_or_create(role_name=role)
        
        # Populate with dummy data if empty or created
        if created or data.total_open_jobs == 0:
            import random
            data.total_open_jobs = random.randint(500, 5000)
            data.avg_salary_min = random.randint(60000, 90000)
            data.avg_salary_max = data.avg_salary_min + random.randint(20000, 50000)
            data.remote_ratio = round(random.uniform(10, 60), 2)
            data.onsite_ratio = 100 - data.remote_ratio
            data.top_companies = ["TCS", "Infosys", "Wipro", "HCL Tech", "Flipkart", "Zomato"]
            data.save()

        serializer = self.get_serializer(data)
        # return extra fields for growth rate which might not be in model yet, or just rely on serializer
        response_data = serializer.data
        response_data['growth_rate'] = 12.5 # Mock growth rate
        return Response(response_data)

    @action(detail=False, methods=['post'])
    def match_post(self, request):
        """Calculate match score for a user against a role (POST)."""
        # User wants POST /api/jobs/job-match/
        role = request.data.get('role') or request.query_params.get('role')
        if not role:
             return Response({'error': 'Role is required'}, status=400)

        user = request.user
        
        # Placeholder logic
        score = 78.5 
        missing = ['Kubernetes', 'GraphQL'] 
        matched = ['React', 'TypeScript', 'Node.js']
        suggested = ['AWS', 'System Design']

        return Response({
            'match_score': score,
            'matched_skills': matched,
            'missing_skills': missing,
            'suggested_skills': suggested,
            'recommended_jobs': [
                {'title': f'Senior {role}', 'company': 'Tech Corp India', 'location': 'Bengaluru, India', 'url': 'https://www.linkedin.com/jobs/view/senior-developer-tech-corp'},
                {'title': f'{role} Lead', 'company': 'Innovate Pvt Ltd', 'location': 'Hyderabad, India', 'job_apply_link': 'https://careers.innovate.in/jobs/lead-dev'},
                {'title': f'Junior {role}', 'company': 'StartUp India', 'location': 'Pune, India', 'redirect_url': None},
            ]
        })