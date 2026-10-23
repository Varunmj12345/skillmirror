import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skillmirror.settings')
django.setup()

from apps.jobs.services.freelancer_scraper import FreelancerScraper
from apps.problems.services import FreelancerChallengeService
from apps.jobs.services.agent_reach_service import AgentReachJobService
from apps.problems.models import Problem, ProjectRequirement

def run_checks():
    print("=== [1/3] Testing Freelancer Live Web Scraper ===")
    jobs = FreelancerScraper.scrape_jobs(limit=5)
    assert len(jobs) > 0, "Scraper should return at least 1 job"
    sample = jobs[0]
    assert "title" in sample and sample["title"], "Job must have a title"
    assert "url" in sample and sample["url"].startswith("https://www.freelancer.com"), f"Job URL invalid: {sample.get('url')}"
    assert "description" in sample, "Job must have a description"
    assert "skills" in sample and isinstance(sample["skills"], list), "Job must have skills list"
    assert "budget" in sample, "Job must have budget text"
    print(f"[OK] Scraped {len(jobs)} jobs successfully. Sample: '{sample['title']}' ({sample['budget']})")

    print("\n=== [2/3] Testing Freelancer Skill Challenges Sync ===")
    challenges = FreelancerChallengeService.sync_freelancer_challenges(limit=3)
    assert len(challenges) > 0, "Should sync at least 1 challenge from Freelancer"
    ch = challenges[0]
    assert ch.source_type == "FREELANCER_SCRAPED", f"Expected FREELANCER_SCRAPED, got {ch.source_type}"
    assert ch.is_real_world is True, "Challenge must be marked real world"
    assert ch.status == "validated", f"Expected validated status, got {ch.status}"
    reqs = ProjectRequirement.objects.filter(problem=ch)
    assert reqs.count() >= 2, f"Expected at least 2 requirements, found {reqs.count()}"
    print(f"[OK] Created/Verified challenge '{ch.title}' with {reqs.count()} requirements and status '{ch.status}'")

    print("\n=== [3/3] Testing Job Openings Suggestions Engine ===")
    intel = AgentReachJobService.get_role_match_and_recommendations(user=None, role="Frontend Developer")
    assert "recommended_jobs" in intel, "Response must include recommended_jobs"
    rec_jobs = intel["recommended_jobs"]
    assert len(rec_jobs) > 0, "Must recommend at least 1 job"
    rec = rec_jobs[0]
    assert "title" in rec and "url" in rec, "Recommended job must have title and URL"
    assert rec["url"].startswith("http"), f"Invalid recommendation URL: {rec['url']}"
    assert "match_score" in rec, "Recommended job must have a match_score"
    print(f"[OK] Successfully generated {len(rec_jobs)} suggested openings. Top: '{rec['title']}' (Score: {rec['match_score']}%)")

    print("\n[ALL CHECKS PASSED] Freelancer Scraper, Skill Challenges, and Job Openings working seamlessly!")

if __name__ == "__main__":
    run_checks()
