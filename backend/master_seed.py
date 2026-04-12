import django
import os
import random
from datetime import datetime, timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skillmirror.settings')
django.setup()

from apps.users.models import User
from apps.jobs.models import JobData
from apps.skills.models import Skill, UserSkill
from apps.roadmaps.models import Roadmap, RoadmapStep
from apps.analytics.models import MarketTrend, SalaryData, PlatformEvent
from apps.interviews.models import MockInterview
from apps.alerts.models import SmartAlert

def seed_all():
    print("Starting Master Seeding Process on Neon...")

    # 1. Create Default Admin if not exists
    admin_email = 'admin@skillmirror.ai'
    if not User.objects.filter(email=admin_email).exists():
        User.objects.create_superuser(
            email=admin_email,
            password='Admin123!',
            username='system_admin'
        )
        print(f"Created Superuser: {admin_email}")
    else:
        print(f"Superuser {admin_email} already exists.")

    # Get a test user for relations
    user = User.objects.first()
    if not user:
        print("No users found to associate data with. Run migrations/seeds first.")
        return

    # 2. Seed Market Trends (Analytics)
    roles = ['Frontend Developer', 'Backend Developer', 'AI Engineer', 'DevOps Engineer']
    for role in roles:
        for i in range(30):
            date = timezone.now().date() - timedelta(days=i)
            MarketTrend.objects.get_or_create(
                job_role=role,
                date=date,
                defaults={
                    'demand_score': random.randint(50, 100),
                    'avg_salary': random.randint(80000, 150000)
                }
            )
    print("Seeded 120 Market Trend data points.")

    # 3. Seed Salary Data
    for role in roles:
        SalaryData.objects.get_or_create(
            job_role=role,
            location='Remote',
            experience_level='Mid',
            defaults={
                'min_salary': 90000,
                'max_salary': 140000,
                'median_salary': 115000
            }
        )
    print("Seeded Salary Data.")

    # 4. Seed Mock Interviews
    for _ in range(5):
        MockInterview.objects.create(
            user=user,
            role=random.choice(roles),
            total_score=random.randint(65, 95),
            ai_summary="Great performance on technical questions. Work on system design depth.",
            is_completed=True
        )
    print("Seeded 5 Mock Interviews.")

    # 5. Seed Smart Alerts
    alert_titles = [
        "Major Hiring Surge at Google for AI",
        "New Remote Python Roles in Europe",
        "Salary Trend: Frontend React developers up 15%",
        "Skill Required: Next.js 14 mastery is trending"
    ]
    for title in alert_titles:
        SmartAlert.objects.get_or_create(
            user=user,
            message=title,
            alert_type='market',
            defaults={
                'priority': 'high',
                'ai_reasoning': "This alert is based on your current skill set and saved roles."
            }
        )
    print("Seeded 4 Smart Alerts.")

    # 6. Seed Platform Events (for Activity Feed)
    actions = ['skill_mastery', 'interview_completed', 'roadmap_generated', 'profile_updated']
    for _ in range(10):
        PlatformEvent.objects.create(
            actor=user,
            action=random.choice(actions),
            payload={'message': 'Automated system event generated during seeding.'}
        )
    print("Seeded 10 Platform Events.")

    print("\nDatabase Seeding Complete! Neon is ready.")

if __name__ == "__main__":
    seed_all()
