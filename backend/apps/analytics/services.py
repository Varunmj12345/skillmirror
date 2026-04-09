from django.utils import timezone
from datetime import timedelta
from apps.roadmaps.models import ProgressTracker, UserVideoProgress, RoadmapStep
from apps.users.models import UserProfile, ActivityLog

class IntelligenceService:
    @staticmethod
    def calculate_mastery_score(user, roadmap_step):
        """
        Logic: Quiz Performance (60%) + Video Completion (30%) + Practice (10%)
        """
        tracker = ProgressTracker.objects.filter(user=user, roadmap_step=roadmap_step).first()
        if not tracker:
            return 0.0
            
        # Get videos linked to this step's skills
        step_skills = roadmap_step.skills_list
        videos = UserVideoProgress.objects.filter(user=user, linked_skill__in=step_skills)
        
        video_weight = 0.0
        if videos.exists():
            completed_videos = videos.filter(is_completed=True).count()
            video_weight = (completed_videos / videos.count()) * 30
            
        # Mock quiz/practice since we'll implement mini-mocks later
        quiz_weight = tracker.mini_mock_results.get('average_score', 0) * 0.6
        practice_weight = 10 if tracker.completed else 0
        
        mastery = quiz_weight + video_weight + practice_weight
        tracker.mastery_score = min(100, mastery)
        tracker.save()
        return tracker.mastery_score

    @staticmethod
    def get_time_optimization(user, roadmap_step):
        """
        Calculates if user is ahead or behind schedule.
        """
        tracker = ProgressTracker.objects.filter(user=user, roadmap_step=roadmap_step).first()
        if not tracker:
            return {"status": "not_started", "adjustment": "Start now to stay on track."}
            
        estimated_hours = roadmap_step.estimated_hours
        actual_minutes = tracker.time_spent_minutes
        
        # If phase is completed, compare totals
        if tracker.completed:
            if actual_minutes < (estimated_hours * 60 * 0.8):
                return {"status": "ahead", "hours_saved": round((estimated_hours * 60 - actual_minutes) / 60, 1)}
            return {"status": "on_track", "hours": round(actual_minutes / 60, 1)}
            
        return {"status": "in_progress", "estimated_remaining": estimated_hours}

    @staticmethod
    def get_career_outcome_projection(user, roadmap):
        """
        Predicts job match and salary range after roadmap completion.
        """
        profile = UserProfile.objects.get(user=user)
        base_match = profile.job_readiness_score
        
        # Project outcome based on roadmap quality
        projected_match = min(98, base_match + 25) # simplified logic
        projected_salary = "₹12L - ₹18L" if projected_match > 80 else "₹6L - ₹10L"
        
        return {
            "expected_match": projected_match,
            "salary_range": projected_salary,
            "readiness_probability": f"{projected_match}%"
        }

    @staticmethod
    def get_watch_intelligence(video_progress):
        """
        Analyzes rewatch frequency and focus score.
        """
        # Focus score = (watch% / (rewatch_count + 1)) * 100
        # High rewatch with low watch% = user struggling
        # High watch% with 0 rewatch = high focus
        
        base_score = video_progress.watch_percentage
        penalty = video_progress.rewatch_count * 5
        focus_score = max(0, min(100, base_score - penalty))
        
        video_progress.focus_score = focus_score
        video_progress.save()
        return focus_score
