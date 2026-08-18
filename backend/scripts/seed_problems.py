import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skillmirror.settings')
django.setup()

from apps.problems.models import ProblemOrganization, Problem
from apps.problems.services import ProblemNLPService, ProblemValidationService

def run_seed():
    print("Seeding Real-World Problems...")
    
    org_data = [
        ("Apollo Healthcare Systems", "hospital", "Healthcare", "Mumbai, India"),
        ("GreenGrow AgriTech", "agriculture", "Agriculture", "Punjab, India"),
        ("EduForward Foundation", "ngo", "Education", "Bengaluru, India"),
        ("FinNext Startups", "startup", "FinTech", "Remote"),
    ]

    created_orgs = {}
    for name, o_type, ind, loc in org_data:
        org, _ = ProblemOrganization.objects.get_or_create(
            name=name,
            defaults={'org_type': o_type, 'location': loc, 'is_verified': True}
        )
        created_orgs[name] = org

    problems_data = [
        {
            "title": "Hospital OPD Patient Management & Appointment System",
            "description": "City hospitals experience severe OPD crowd congestion with 3+ hour patient wait times due to paper-based queue management. Need a real-time digital appointment, queue tracking, and doctor schedule system.",
            "org": created_orgs["Apollo Healthcare Systems"],
            "org_name": "Apollo Healthcare Systems",
            "industry": "Healthcare",
            "people_affected": 2500,
            "frequency": "daily",
            "estimated_impact": "critical",
            "current_method": "Physical tokens and paper register books.",
            "required_solution": "Web & Mobile appointment portal with real-time queue position tracking and SMS/WhatsApp notifications.",
            "required_skills_list": ["Python", "Django", "React", "PostgreSQL", "REST API", "Authentication"],
        },
        {
            "title": "Smart Crop Soil Health & Fertilizer Advisor",
            "description": "Smallholder farmers suffer a 30% yield loss due to inappropriate fertilizer usage and lack of soil moisture tracking. Need an accessible web application to calculate precise fertilizer ratios based on soil test parameters.",
            "org": created_orgs["GreenGrow AgriTech"],
            "org_name": "GreenGrow AgriTech",
            "industry": "Agriculture",
            "people_affected": 1200,
            "frequency": "weekly",
            "estimated_impact": "high",
            "current_method": "Manual guesswork and verbal advice from local suppliers.",
            "required_solution": "Soil parameter input portal with automated N-P-K recommendation algorithm and multi-language support.",
            "required_skills_list": ["Python", "Django", "React", "PostgreSQL", "Data Science"],
        },
        {
            "title": "NGO Vernacular Skill Learning Tracker for Rural Youth",
            "description": "Educational NGO unable to monitor offline vocational training progress across 15 rural learning centers. Need an offline-first progress tracker for instructors.",
            "org": created_orgs["EduForward Foundation"],
            "org_name": "EduForward Foundation",
            "industry": "Education",
            "people_affected": 800,
            "frequency": "daily",
            "estimated_impact": "high",
            "current_method": "Weekly physical attendance sheets sent via postal mail.",
            "required_solution": "Lightweight web dashboard for student skill milestones and certificate issuance.",
            "required_skills_list": ["React", "Node.js", "MongoDB", "UI/UX Design"],
        }
    ]

    for p_info in problems_data:
        prob, created = Problem.objects.get_or_create(
            title=p_info["title"],
            defaults={
                "description": p_info["description"],
                "organization": p_info["org"],
                "organization_name": p_info["org_name"],
                "industry": p_info["industry"],
                "people_affected": p_info["people_affected"],
                "frequency": p_info["frequency"],
                "estimated_impact": p_info["estimated_impact"],
                "current_method": p_info["current_method"],
                "required_solution": p_info["required_solution"],
                "required_skills_list": p_info["required_skills_list"],
                "status": "submitted"
            }
        )
        if created:
            ProblemNLPService().process_raw_problem(prob)
            ProblemValidationService().validate_problem(prob)
            print(f"Created & validated problem: {prob.title}")

    print("Seeding Complete!")

if __name__ == '__main__':
    run_seed()
