from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.utils import timezone
from datetime import timedelta
from .metrics import calculate_metrics
from .models import MarketTrend, SalaryData, SkillProgress, CareerInsight, LearningPlan, UserMilestone
from .serializers import MarketTrendSerializer, SalaryDataSerializer
from groq import Groq
import os
import json

class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        metrics = calculate_metrics()
        return Response(metrics)

    def retrieve(self, request, pk=None):
        pass

    def create(self, request):
        pass

    def update(self, request, pk=None):
        pass

    def destroy(self, request, pk=None):
        pass


class DashboardView(APIView):
    """User dashboard data: profile completion, weekly progress, career recommendations."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.users.models import UserProfile
        from apps.skills.models import UserSkill
        from apps.roadmaps.models import UserRoadmap, ProgressTracker, UserVideoProgress

        user = request.user
        try:
            profile = UserProfile.objects.get(user=user)
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=user)

        profile_fields = ['experience_level', 'dream_job', 'country', 'resume']
        filled = sum(1 for f in profile_fields if getattr(profile, f, None))
        profile_completion = min(100, int((filled / len(profile_fields)) * 100))
        if profile.experience_level and profile.dream_job:
            profile_completion = min(100, profile_completion + 40)

        today = timezone.now().date()
        days_list = [today - timedelta(days=i) for i in range(6, -1, -1)]
        
        # We'll use actual day names for the current week
        weekly_data = []
        for d in days_list:
            day_name = d.strftime('%a')
            
            # Count roadmap step completions
            roadmap_count = ProgressTracker.objects.filter(
                user=user, 
                completed=True, 
                completed_at__date=d
            ).count()
            
            # Count video completions
            video_count = UserVideoProgress.objects.filter(
                user=user, 
                is_completed=True, 
                completed_at__date=d
            ).count()
            
            weekly_data.append({
                'day': day_name,
                'completed': roadmap_count + video_count
            })

        # Resume & Skill Gap Synchronization
        from apps.skills.models import ResumeData, SkillGapReport
        resume_data = ResumeData.objects.filter(user=user).first()
        latest_report = SkillGapReport.objects.filter(user=user).first()
        
        has_resume = bool(resume_data and resume_data.resume_file)
        
        # Determine dynamic "Next Career Moves" from real skill gaps
        next_moves = []
        if latest_report and latest_report.missing_skills:
            for skill_info in latest_report.missing_skills[:3]:
                skill_name = skill_info.get('name', 'Unknown Skill')
                next_moves.append({
                    'text': f"Bridge gap: Learn {skill_name} for {latest_report.role_name}",
                    'icon': 'fa-circle-arrow-up',
                    'color': 'indigo'
                })
        else:
            # Fallback/Default moves if no analysis yet
            next_moves = [
                { 'text': 'Upload and analyze your latest CV', 'icon': 'fa-file-upload', 'color': 'indigo' },
                { 'text': 'Complete your target role preferences', 'icon': 'fa-user-pen', 'color': 'violet' },
                { 'text': 'Take a mock interview session', 'icon': 'fa-microphone', 'color': 'emerald' }
            ]

        skills = list(UserSkill.objects.filter(user=user).select_related('skill').values('id', 'skill__name', 'level', 'progress_percentage'))
        
        # Market Recommendations
        recommendations = []
        target_job = profile.dream_job or (latest_report.role_name if latest_report else 'Software Developer')
        if 'data' in target_job.lower() or 'scientist' in target_job.lower():
            recommendations = ['Python', 'Machine Learning', 'SQL', 'Data Visualization']
        elif 'web' in target_job.lower() or 'frontend' in target_job.lower():
            recommendations = ['JavaScript', 'React', 'HTML/CSS', 'Node.js']
        else:
            recommendations = ['Problem Solving', 'Communication', 'Technical Writing']

        # Achievements & Badges
        from apps.users.models import Achievement, ActivityLog
        badges = list(Achievement.objects.filter(user=user).values('title', 'badge_type', 'earned_at'))
        
        # XP & Level System Logic
        total_xp = profile.total_learning_points
        current_level = (total_xp // 1000) + 1
        xp_in_current_level = total_xp % 1000
        next_level_xp = 1000
        level_progress = int((xp_in_current_level / next_level_xp) * 100)
        
        # Intelligence Layers
        readiness = int(profile.job_readiness_score) if profile.job_readiness_score > 0 else (int(latest_report.readiness_score) if latest_report else 0)
        
        career_risk_index = max(0, 100 - readiness - (profile.current_streak * 2))
        if not has_resume: career_risk_index = min(100, career_risk_index + 30)
        
        # Growth Forecast (mocked prediction based on current trend)
        forecast_base = readiness
        growth_forecast = [
            {'day': (timezone.now() + timedelta(days=i*5)).strftime('%b %d'), 'score': min(100, forecast_base + (i * 2) + (profile.current_streak // 2))}
            for i in range(7)
        ]
        
        # Learning Consistency
        recent_activity_days = ActivityLog.objects.filter(user=user, timestamp__gte=timezone.now() - timedelta(days=30)).values('timestamp__date').distinct().count()
        consistency_score = min(100, int((recent_activity_days / 20) * 100) + (profile.current_streak * 5))
        
        # Competitive Benchmarking (User vs Market)
        market_avg = 65
        benchmarking = {
            'user_score': readiness,
            'market_avg': market_avg,
            'percentile': min(99, int((readiness / 100) * 99) if readiness > market_avg else int((readiness / market_avg) * 50))
        }
        
        # Skill Demand Heatmap
        heatmap_skills = []
        if latest_report and latest_report.missing_skills:
             heatmap_skills = [{'name': s['name'], 'demand': 70 + (i * 5) % 30, 'match': s['user_level'] * 20} for i, s in enumerate(latest_report.missing_skills[:5])]
        else:
             heatmap_skills = [{'name': s, 'demand': 80 - i*10, 'match': 0} for i, s in enumerate(recommendations[:5])]

        # Weekly AI Strategy Suggestion
        ai_strategy = "Double down on projects involving AI integration. Your technical accuracy in interviews is high, but architectural depth can be improved."
        if career_risk_index > 50:
            ai_strategy = "Urgent: Update your resume with recent project metrics to decrease market invisibility risk."
        elif consistency_score < 40:
            ai_strategy = "Strategic focus: Establish a 15-minute daily learning habit to stabilize your growth trajectory."

        # Existing Module Summaries
        from apps.interviews.models import MockInterview
        from apps.alerts.models import SmartAlert
        
        last_interview = MockInterview.objects.filter(user=user, is_completed=True).first()
        alert_count = SmartAlert.objects.filter(user=user, is_read=False).count()
        resume_score = min(100, 60 + (len(resume_data.extracted_skills) * 2)) if has_resume and resume_data and resume_data.extracted_skills else 0

        return Response({
            'profile_completion': profile.profile_completeness,
            'job_readiness_score': readiness,
            'dream_job': target_job,
            'weekly_progress': weekly_data,
            'skills': skills,
            'career_recommendations': recommendations,
            'next_career_moves': next_moves,
            'has_resume': has_resume,
            'username': user.username or user.email,
            'email': user.email,
            
            # New Intelligence Layers
            'career_risk_index': career_risk_index,
            'growth_forecast': growth_forecast,
            'learning_consistency': consistency_score,
            'benchmarking': benchmarking,
            'xp_system': {
                'level': current_level,
                'total_xp': total_xp,
                'progress': level_progress,
                'next_level_at': (current_level) * 1000
            },
            'skill_heatmap': heatmap_skills,
            'ai_strategy': ai_strategy,
            'badges': badges,
            
            # Module Summaries
            'summaries': {
                'resume': {'score': resume_score},
                'roadmap': {'progress': profile.profile_completeness}, # Simplified for dashboard
                'interview': {'last_score': last_interview.total_score if last_interview else None},
                'job_intelligence': {'top_match': readiness},
                'alerts': {'count': alert_count}
            }
        })

class MarketTrendViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MarketTrend.objects.all()
    serializer_class = MarketTrendSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        role = self.request.query_params.get('role')
        if role:
            return self.queryset.filter(job_role__icontains=role)
        return self.queryset

    @action(detail=False, methods=['get'])
    def list_by_role(self, request):
        role = request.query_params.get('role')
        trends = self.get_queryset()
        
        if not trends.exists() and role:
             trends_list = []
             base_demand = 100
             base_salary = 80000
             for i in range(6):
                 date = timezone.now() - timedelta(days=30 * (5-i))
                 demand = base_demand + (i * 20) + (timezone.now().microsecond % 20)
                 salary = base_salary + (i * 500)
                 trends_list.append(MarketTrend(job_role=role, date=date, demand_score=demand, avg_salary=salary))
             MarketTrend.objects.bulk_create(trends_list)
             trends = self.get_queryset()

        serializer = self.get_serializer(trends, many=True)
        return Response(serializer.data)

class SalaryDataViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SalaryData.objects.all()
    serializer_class = SalaryDataSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        role = self.request.query_params.get('role')
        location = self.request.query_params.get('location')
        queryset = self.queryset
        if role:
            queryset = queryset.filter(job_role__icontains=role)
        if location:
            queryset = queryset.filter(location__icontains=location)
        return queryset

    @action(detail=False, methods=['get'])
    def list_by_role(self, request):
         role = request.query_params.get('role')
         salaries = self.get_queryset()
         
         if not salaries.exists() and role:
             SalaryData.objects.create(
                 job_role=role, 
                 location='India', 
                 min_salary=400000, 
                 max_salary=1500000, 
                 median_salary=800000,
                 experience_level='Mid'
             )
             salaries = self.get_queryset()

         serializer = self.get_serializer(salaries, many=True)
         return Response(serializer.data)

class ActionPlanView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        role = request.data.get('role', 'Developer')
        gaps = request.data.get('gaps', [])
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key: return Response({"detail": "Missing API Key"}, status=400)
        client = Groq(api_key=api_key)
        prompt = f"Generate a smart learning action plan for a {role} to bridge these skill gaps: {', '.join(gaps)}. Provide a 7-day breakdown, daily commitment (hours), 3 specific projects (Beginner, Intermediate, Advanced), and 2 industry certificates. Return ONLY a JSON object."
        try:
            completion = client.chat.completions.create(model="llama-3.1-8b-instant", messages=[{"role": "user", "content": prompt}], response_format={"type": "json_object"})
            plan_data = json.loads(completion.choices[0].message.content)
            LearningPlan.objects.create(user=request.user, title=f"Action Plan for {role}", weekly_breakdown=plan_data.get('weekly_breakdown', []), daily_commitment=plan_data.get('daily_commitment', 2), projects=plan_data.get('projects', []), certifications=plan_data.get('certifications', []))
            return Response(plan_data)
        except Exception as e: return Response({"detail": str(e)}, status=500)

class CareerInsightView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        role = request.query_params.get('role', 'Software Engineer')
        insight, _ = CareerInsight.objects.get_or_create(user=request.user, role=role, defaults={"confidence_score": 87, "market_demand": "High", "hiring_trend": 15.5, "salary_impact": {"React": 18, "Next.js": 12}, "automation_risk": 12.0, "job_stability": "High"})
        return Response({"confidence_score": insight.confidence_score, "market_demand": insight.market_demand, "hiring_trend": insight.hiring_trend, "salary_impact": insight.salary_impact, "automation_risk": insight.automation_risk, "job_stability": insight.job_stability})

class SkillProgressUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        skill_name = request.data.get('skill'); level = request.data.get('level', 1)
        progress, _ = SkillProgress.objects.get_or_create(user=request.user, skill_name=skill_name)
        progress.current_level = level; progress.save()
        return Response({"status": "updated"})

class PredictCompletionView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({"predicted_date": (timezone.now() + timedelta(days=45)).strftime('%Y-%m-%d'), "confidence": 82})