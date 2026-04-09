from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Roadmap, ProgressTracker, YouTubeVideo, UserVideoProgress, RoadmapStep
from .serializers import RoadmapSerializer
from .generator import generate_roadmap, GOAL_OPTIONS, save_roadmap_to_db
from rest_framework.views import APIView
from django.utils import timezone
from groq import Groq
import os
import requests
import json

class RoadmapViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def create(self, request):
        data = request.data
        skills = data.get('skills', [])
        goals = data.get('goals', {}) or data.get('target_job', 'Software Engineer')
        if isinstance(goals, str):
            goals = {'target_job': goals}
        roadmap_data = generate_roadmap(skills, goals)
        roadmap = save_roadmap_to_db(request.user, roadmap_data)
        
        # Streak Update logic
        from apps.users.models import UserProfile
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        today = timezone.now().date()
        if profile.last_active_date != today:
            if profile.last_active_date == today - timezone.timedelta(days=1):
                profile.current_streak += 1
            else:
                profile.current_streak = 1
            profile.last_active_date = today
            profile.save()

        return Response(roadmap, status=201)

    def retrieve(self, request, pk=None):
        try:
            roadmap = Roadmap.objects.get(pk=pk)
            serializer = RoadmapSerializer(roadmap)
            from apps.analytics.services import IntelligenceService
            
            data = serializer.data
            steps = data.get('steps', [])
            completed_count = 0
            
            for step in steps:
                step_obj = RoadmapStep.objects.get(id=step['id'])
                tracker, _ = ProgressTracker.objects.get_or_create(user=request.user, roadmap_step=step_obj)
                
                # Intelligence Layers
                step['completed'] = tracker.completed
                step['mastery_score'] = IntelligenceService.calculate_mastery_score(request.user, step_obj)
                step['confidence_index'] = tracker.confidence_index
                step['time_optimization'] = IntelligenceService.get_time_optimization(request.user, step_obj)
                step['difficulty'] = step_obj.difficulty
                step['skill_demand'] = step_obj.skill_demand
                
                if tracker.completed: completed_count += 1
            
            data['outcome_projection'] = IntelligenceService.get_career_outcome_projection(request.user, roadmap)
            data['completion_percentage'] = int((completed_count / len(steps) * 100)) if steps else 0
            data['total_duration_weeks'] = sum(s.get('duration_weeks', 0) for s in steps)
            return Response(data)
        except Roadmap.DoesNotExist:
            return Response({"detail": "Not found."}, status=404)

    def list(self, request):
        roadmaps = Roadmap.objects.filter(user_roadmaps__user=request.user).order_by('-created_at')
        serializer = RoadmapSerializer(roadmaps, many=True)
        return Response(serializer.data)

class AIRecommendationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        roadmap_id = request.query_params.get('roadmap_id')
        if not roadmap_id: return Response({"detail": "roadmap_id required"}, status=400)
        
        try:
            roadmap = Roadmap.objects.get(pk=roadmap_id)
            steps = RoadmapStep.objects.filter(roadmap=roadmap)
            completed_steps = ProgressTracker.objects.filter(user=request.user, roadmap_step__roadmap=roadmap, completed=True)
            
            # Simple logic for "Next Skill"
            next_step = steps.exclude(id__in=completed_steps.values_list('roadmap_step_id', flat=True)).first()
            
            if not next_step:
                return Response({"suggestion": "You have completed this roadmap! Try a more advanced role.", "type": "finish"})

            api_key = os.environ.get("GROQ_API_KEY")
            client = Groq(api_key=api_key)
            prompt = f"Based on this roadmap phase: '{next_step.title}' ({next_step.description}), what is the most critical single skill or tool the user should focus on today? Answer in 1 short sentence."
            
            completion = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=50
            )
            
            return Response({
                "suggestion": completion.choices[0].message.content,
                "target_step": next_step.title,
                "type": "skill"
            })
        except Exception as e:
            return Response({"suggestion": "Keep practicing your core fundamentals.", "type": "fallback"})

class VideoSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        title = request.data.get('title')
        video_id = request.data.get('video_id')
        
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key: return Response({"summary": "AI Summaries require a Groq API Key."})

        client = Groq(api_key=api_key)
        prompt = f"Summarize why this learning video tilted '{title}' is important for a career in technology. Provide 3 key bullet points. Keep it professional and concise."
        
        try:
            completion = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=150
            )
            return Response({"summary": completion.choices[0].message.content})
        except Exception as e:
            print(f"Groq Summary Error: {e}")
            return Response({"detail": "AI summarization unavailable. Please watch the video for details."}, status=503)

class UserAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.users.models import UserProfile, Achievement
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        achievements = Achievement.objects.filter(user=request.user)
        
        # Calculate accomplishments
        completed_steps = ProgressTracker.objects.filter(user=request.user, completed=True).count()
        completed_videos = UserVideoProgress.objects.filter(user=request.user, is_completed=True).count()

        # Calculate level: 1 level per 500 points, max 10
        current_level = min(10, (profile.total_learning_points // 500) + 1)
        
        # Reward specific badges if milestones met
        if profile.current_streak >= 7:
            Achievement.objects.get_or_create(user=request.user, title="7 Day Streak", badge_type="consistency_pro")
        if completed_steps >= 5:
            Achievement.objects.get_or_create(user=request.user, title="Phase Master", badge_type="skill_accelerator")
            
        return Response({
            "streak": profile.current_streak,
            "points": profile.total_learning_points,
            "level": current_level,
            "xp_next": (current_level) * 500,
            "completed_steps": completed_steps,
            "completed_videos": completed_videos,
            "badges": [{"title": a.title, "type": a.badge_type} for a in achievements]
        })

# Existing views kept for compatibility
class RoadmapGoalsView(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    def list(self, request): return Response({'goals': GOAL_OPTIONS})

class ProgressTrackerView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        step_id = request.data.get('step_id')
        completed = request.data.get('completed', True)
        try:
            step = RoadmapStep.objects.get(pk=step_id)
            tracker, _ = ProgressTracker.objects.get_or_create(user=request.user, roadmap_step=step)
            tracker.completed = completed
            tracker.completed_at = timezone.now() if completed else None
            tracker.save()
            return Response({'completed': tracker.completed})
        except: return Response({"detail": "Step not found."}, status=404)

class YouTubeSearchView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        query = request.query_params.get('q', '')
        api_key = os.environ.get('YOUTUBE_API_KEY')
        if not api_key or api_key == 'your_youtube_api_key_here':
            # Simplified mock for brevity in this file update
            return Response([{"video_id": "rfscVS0vtbw", "title": f"Intro to {query}", "thumbnail_url": "https://i.ytimg.com/vi/rfscVS0vtbw/hqdefault.jpg", "channel_title": "EduLearn", "duration": "15:00"}])
        url = "https://www.googleapis.com/youtube/v3/search"
        params = {"part": "snippet", "q": f"learning {query}", "maxResults": 6, "type": "video", "key": api_key}
        res = requests.get(url, params=params).json()
        videos = [{"video_id": item['id']['videoId'], "title": item['snippet']['title'], "thumbnail_url": item['snippet']['thumbnails']['high']['url'], "channel_title": item['snippet']['channelTitle'], "duration": "Video"} for item in res.get('items', [])]
        return Response(videos)

class SaveVideoView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        d = request.data
        video, _ = YouTubeVideo.objects.get_or_create(video_id=d.get('video_id'), defaults={'title': d.get('title'), 'thumbnail_url': d.get('thumbnail_url'), 'channel_title': d.get('channel_title')})
        p, _ = UserVideoProgress.objects.get_or_create(user=request.user, video=video)
        p.is_saved = d.get('is_saved', True)
        p.save()
        return Response({"is_saved": p.is_saved})
    def get(self, request):
        saved = UserVideoProgress.objects.filter(user=request.user, is_saved=True)
        return Response([{"video_id": p.video.video_id, "title": p.video.title, "thumbnail_url": p.video.thumbnail_url, "is_completed": p.is_completed} for p in saved])

class VideoProgressView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        vid = request.data.get('video_id')
        v = YouTubeVideo.objects.get(video_id=vid)
        p, _ = UserVideoProgress.objects.get_or_create(user=request.user, video=v)
        is_completed = request.data.get('is_completed', True)
        p.is_completed = is_completed
        if is_completed:
            p.completed_at = timezone.now()
            from apps.users.models import UserProfile
            profile, _ = UserProfile.objects.get_or_create(user=request.user)
            profile.total_learning_points += 50
            profile.save()
        else:
            p.completed_at = None
        p.save()
        return Response({"is_completed": p.is_completed})

class MiniMockView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        step_id = request.query_params.get('step_id')
        step = RoadmapStep.objects.get(id=step_id)
        
        api_key = os.environ.get("GROQ_API_KEY")
        client = Groq(api_key=api_key)
        prompt = f"Generate 5 technical interview questions for the following roadmap phase: '{step.title}' ({step.description}). Skills involved: {', '.join(step.skills_list)}. Return ONLY a JSON list of strings."
        
        try:
            completion = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            data = json.loads(completion.choices[0].message.content)
            questions = data.get('questions', data if isinstance(data, list) else [])
            return Response({"questions": questions})
        except:
            return Response({"questions": ["Explain core concepts of " + step.title, "Practical application of " + step.skills_list[0]]})

    def post(self, request):
        step_id = request.data.get('step_id')
        score = request.data.get('score', 0)
        tracker = ProgressTracker.objects.get(user=request.user, roadmap_step_id=step_id)
        
        results = tracker.mini_mock_results
        results['last_score'] = score
        results['average_score'] = (results.get('average_score', 0) + score) / (2 if 'average_score' in results else 1)
        tracker.mini_mock_results = results
        tracker.save()
        
        from apps.analytics.services import IntelligenceService
        mastery = IntelligenceService.calculate_mastery_score(request.user, tracker.roadmap_step)
        
        return Response({"new_mastery": mastery})

class VideoIntelligenceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        vid_id = request.data.get('video_id')
        v = YouTubeVideo.objects.get(video_id=vid_id)
        p, _ = UserVideoProgress.objects.get_or_create(user=request.user, video=v)
        
        p.watch_percentage = request.data.get('watch_percentage', p.watch_percentage)
        if request.data.get('rewatched'): p.rewatch_count += 1
        p.drop_off_seconds = request.data.get('drop_off', p.drop_off_seconds)
        p.save()
        
        from apps.analytics.services import IntelligenceService
        focus_score = IntelligenceService.get_watch_intelligence(p)
        
        return Response({
            "focus_score": focus_score,
            "ai_insights": p.ai_extraction
        })