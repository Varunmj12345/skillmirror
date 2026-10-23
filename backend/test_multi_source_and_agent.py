"""
Verification script for Multi-Source Job Hiring Scrapers & Official Career Scout Agent.
Run with: python backend/test_multi_source_and_agent.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skillmirror.settings')
import django
django.setup()

from apps.jobs.models import ScoutedJobOpening, AgentScoutTelemetry
from apps.jobs.services.career_scout_agent import OfficialCareerScoutAgent
from apps.jobs.services.agent_reach_service import AgentReachJobService
from apps.users.models import User
from rest_framework.test import APIClient

def test_multi_source_and_agent():
    print("=== [1/4] Testing Official Career Scout Agent Official Sweep ===")
    res_off = OfficialCareerScoutAgent.sweep_official_portals(limit_per_portal=3)
    assert res_off['status'] == 'SUCCESS', f"Expected SUCCESS, got {res_off['status']}"
    assert res_off['portals_scanned'] > 0, "No official portals scanned"
    assert res_off['openings_indexed'] > 0, "No official openings indexed"
    print(f"[OK] Official sweep: {res_off['openings_indexed']} openings indexed from {res_off['portals_scanned']} portals in {res_off['duration_seconds']}s")

    print("\n=== [2/4] Testing Multi-Source Job Boards Sweep (RemoteOK, Remotive, Arbeitnow) ===")
    res_multi = OfficialCareerScoutAgent.sweep_multi_source_boards()
    assert res_multi['status'] == 'SUCCESS', f"Expected SUCCESS, got {res_multi['status']}"
    assert res_multi['multi_source_indexed'] > 0, "No multi-source openings indexed"
    print(f"[OK] Multi-source sweep: {res_multi['multi_source_indexed']} openings indexed")

    print("\n=== [3/4] Testing Agent Telemetry & Aggregated Recommendations ===")
    status = OfficialCareerScoutAgent.get_agent_status()
    assert status['state'] == 'ONLINE', "Agent not ONLINE"
    assert status['monitored_portals_count'] >= 10, "Expected >=10 monitored portals"
    print(f"[OK] Agent status: {status['state']} | Portals Monitored: {status['monitored_portals_count']} | Total Openings: {status['total_openings_indexed']}")

    user = User.objects.first()
    rec = AgentReachJobService.get_role_match_and_recommendations(user, 'Full Stack Developer', source_filter='all')
    jobs = rec.get('recommended_jobs', [])
    assert len(jobs) > 0, "No recommended jobs returned"
    
    breakdown = rec.get('sources_breakdown', {})
    assert breakdown.get('official', 0) > 0, "No official jobs in breakdown"
    assert breakdown.get('all', 0) > 0, "No total count in breakdown"
    print(f"[OK] Aggregated {len(jobs)} openings across sources: {breakdown}")
    
    first_job = jobs[0]
    print(f"Sample Top Job: [{first_job.get('source')}] {first_job.get('title')} at {first_job.get('company')} (Match: {first_job.get('match_score')}%, Official: {first_job.get('is_official')})")

    print("\n=== [4/4] Testing DRF API Endpoints ===")
    client = APIClient()
    if user:
        client.force_authenticate(user=user)

    # Status endpoint
    r_status = client.get('/api/jobs/scout-agent/status/')
    assert r_status.status_code == 200, f"Expected 200, got {r_status.status_code}"
    
    # Suggested openings endpoint
    r_openings = client.get('/api/jobs/suggested-openings/?role=Frontend%20Developer&source=official')
    assert r_openings.status_code == 200, f"Expected 200, got {r_openings.status_code}"
    assert len(r_openings.data.get('recommended_jobs', [])) > 0, "No official jobs from endpoint"
    print(f"[OK] /api/jobs/suggested-openings/ returned {len(r_openings.data['recommended_jobs'])} official openings.")

    print("\n[ALL CHECKS PASSED] Multi-source job scraper & Official Career Scout Agent verified!")

if __name__ == '__main__':
    test_multi_source_and_agent()
