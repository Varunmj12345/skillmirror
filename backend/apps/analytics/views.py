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
        
        # 8 Skill Radar Dimensions (FIX 4D)
        radar_dimensions = [
            ("DSA", 90),
            ("Frontend", 85),
            ("Backend", 90),
            ("System Design", 80),
            ("Cloud", 75),
            ("Communication", 85),
            ("Problem Solving", 95),
            ("AI/ML", 70)
        ]
        user_skill_dict = {s['skill__name'].lower(): s['level'] for s in skills}
        user_skill_names_text = " ".join(user_skill_dict.keys()).lower()

        heatmap_skills = []
        for name, demand in radar_dimensions:
            match_val = 0
            if name.lower() in user_skill_dict:
                match_val = min(100, user_skill_dict[name.lower()] * 20)
            elif any(w in user_skill_names_text for w in name.lower().split()):
                match_val = 60
            heatmap_skills.append({
                'name': name,
                'demand': demand,
                'match': match_val
            })

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
                'level': profile.calculate_level(),
                'total_xp': profile.total_learning_points,
                'progress': profile.get_level_progress_percentage(),
                'next_level_at': profile.get_next_level_at(),
                'rank_title': profile.get_rank_title()
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
        
        if (not trends.exists() or trends.count() < 6) and role:
            from apps.jobs.services.agent_reach_service import AgentReachJobService
            AgentReachJobService.get_or_refresh_market_data(role)
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
            from apps.jobs.services.agent_reach_service import AgentReachJobService
            AgentReachJobService.get_or_refresh_market_data(role)
            salaries = self.get_queryset()

        serializer = self.get_serializer(salaries, many=True)
        return Response(serializer.data)

class ActionPlanView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        role = request.data.get('role', 'Developer')
        gaps = request.data.get('gaps', [])
        prompt = f"Generate a smart learning action plan for a {role} to bridge these skill gaps: {', '.join(gaps)}. Provide a 7-day breakdown, daily commitment (hours), 3 specific projects (Beginner, Intermediate, Advanced), and 2 industry certificates. Return ONLY a JSON object."
        try:
            from apps.ai.llm_client import chat_completion
            completion = chat_completion(
                messages=[
                    {"role": "system", "content": "You are a learning plan engine. Always return valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            raw = completion.content.strip()
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            plan_data = json.loads(raw)
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


# ═════════════════════════════════════════════════════════════════════════════
#  AI BOT PERFORMANCE ANALYTICS ENGINE API ENDPOINTS
# ═════════════════════════════════════════════════════════════════════════════

class BotPerformanceOverviewView(APIView):
    """
    Returns comprehensive analytics, metrics, model performance,
    task distribution, and health scores for the AI Bot Performance Engine.
    """
    permission_classes = []

    def get(self, request):
        from .bot_analytics import BotPerformanceAnalyticsEngine
        from apps.ai.llm_client import get_active_provider_and_key, DEFAULT_GROQ_PRIMARY_MODEL, DEFAULT_GROQ_FAST_MODEL

        try:
            days = int(request.query_params.get('days', 7))
        except (ValueError, TypeError):
            days = 7

        interaction_type = request.query_params.get('type')

        summary = BotPerformanceAnalyticsEngine.get_performance_summary(days=days, interaction_type=interaction_type)
        model_breakdown = BotPerformanceAnalyticsEngine.get_model_breakdown(days=days)
        interaction_breakdown = BotPerformanceAnalyticsEngine.get_interaction_type_breakdown(days=days)
        timeline = BotPerformanceAnalyticsEngine.get_timeline_trends(days=days)

        provider, key = get_active_provider_and_key()

        return Response({
            "summary": summary,
            "models": model_breakdown,
            "task_distribution": interaction_breakdown,
            "timeline": timeline,
            "engine_status": {
                "active_provider": provider,
                "primary_model": DEFAULT_GROQ_PRIMARY_MODEL,
                "fast_model": DEFAULT_GROQ_FAST_MODEL,
                "api_key_configured": bool(key),
                "key_preview": f"{key[:8]}...{key[-4:]}" if key and len(key) > 12 else "Not configured",
                "timestamp": timezone.now().isoformat()
            }
        })


class BotPerformanceLogsView(APIView):
    """
    Returns paginated/filtered telemetry logs for interaction audits.
    """
    permission_classes = []

    def get(self, request):
        from .bot_analytics import BotPerformanceAnalyticsEngine

        try:
            limit = int(request.query_params.get('limit', 50))
        except (ValueError, TypeError):
            limit = 50

        type_filter = request.query_params.get('type')
        status_filter = request.query_params.get('status')

        logs = BotPerformanceAnalyticsEngine.get_recent_logs(
            limit=limit,
            interaction_type=type_filter,
            status=status_filter
        )
        return Response({"count": len(logs), "logs": logs})


class BotFeedbackView(APIView):
    """
    Records end-user feedback and satisfaction ratings for bot responses.
    """
    permission_classes = []

    def post(self, request):
        from .models import BotPerformanceLog

        log_id = request.data.get('log_id')
        rating = request.data.get('rating') # 1 (up) or -1 (down)
        feedback = request.data.get('feedback', '')

        if not log_id:
            return Response({"error": "log_id is required"}, status=400)

        try:
            log = BotPerformanceLog.objects.get(id=log_id)
            if rating is not None:
                log.user_rating = int(rating)
            if feedback:
                log.user_feedback = feedback
            log.save(update_fields=['user_rating', 'user_feedback'])
            return Response({"status": "recorded", "id": str(log.id)})
        except BotPerformanceLog.DoesNotExist:
            return Response({"error": "Telemetry log not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class BotDiagnosticView(APIView):
    """
    Triggers an instant real-time diagnostic probe to test provider latency,
    token generation speed, and model availability.
    """
    permission_classes = []

    def post(self, request):
        from .bot_analytics import BotPerformanceAnalyticsEngine
        result = BotPerformanceAnalyticsEngine.run_live_diagnostic()
        return Response(result)