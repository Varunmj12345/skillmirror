import os
import json
import logging
import threading
import time
import requests
from datetime import datetime, timedelta
from django.utils import timezone
from apps.jobs.models import ScoutedJobOpening, AgentScoutTelemetry

logger = logging.getLogger(__name__)

# Official Company Career Portals Registry
OFFICIAL_PORTALS = [
    {
        "id": "stripe",
        "name": "Stripe",
        "career_url": "https://stripe.com/jobs",
        "endpoint": "https://boards-api.greenhouse.io/v1/boards/stripe/jobs",
        "ats": "greenhouse"
    },
    {
        "id": "figma",
        "name": "Figma",
        "career_url": "https://www.figma.com/careers",
        "endpoint": "https://boards-api.greenhouse.io/v1/boards/figma/jobs",
        "ats": "greenhouse"
    },
    {
        "id": "vercel",
        "name": "Vercel",
        "career_url": "https://vercel.com/careers",
        "endpoint": "https://job-boards.greenhouse.io/vercel/jobs",
        "ats": "greenhouse"
    },
    {
        "id": "cloudflare",
        "name": "Cloudflare",
        "career_url": "https://www.cloudflare.com/careers",
        "endpoint": "https://boards-api.greenhouse.io/v1/boards/cloudflare/jobs",
        "ats": "greenhouse"
    },
    {
        "id": "gitlab",
        "name": "GitLab",
        "career_url": "https://about.gitlab.com/jobs",
        "endpoint": "https://boards-api.greenhouse.io/v1/boards/gitlab/jobs",
        "ats": "greenhouse"
    },
    {
        "id": "discord",
        "name": "Discord",
        "career_url": "https://discord.com/careers",
        "endpoint": "https://boards-api.greenhouse.io/v1/boards/discord/jobs",
        "ats": "greenhouse"
    },
    {
        "id": "reddit",
        "name": "Reddit",
        "career_url": "https://www.redditinc.com/careers",
        "endpoint": "https://boards-api.greenhouse.io/v1/boards/reddit/jobs",
        "ats": "greenhouse"
    },
    {
        "id": "airbnb",
        "name": "Airbnb",
        "career_url": "https://careers.airbnb.com",
        "endpoint": "https://boards-api.greenhouse.io/v1/boards/airbnb/jobs",
        "ats": "greenhouse"
    },
    {
        "id": "canonical",
        "name": "Canonical (Ubuntu)",
        "career_url": "https://canonical.com/careers",
        "endpoint": "https://boards-api.greenhouse.io/v1/boards/canonical/jobs",
        "ats": "greenhouse"
    },
    {
        "id": "elastic",
        "name": "Elastic",
        "career_url": "https://www.elastic.co/about/careers",
        "endpoint": "https://boards-api.greenhouse.io/v1/boards/elastic/jobs",
        "ats": "greenhouse"
    }
]

TECH_KEYWORDS = [
    "engineer", "developer", "data", "scientist", "software", "architect",
    "frontend", "backend", "full stack", "fullstack", "devops", "cloud",
    "machine learning", "ai", "security", "infra", "sre", "platform",
    "product", "systems", "analyst", "qa", "mobile", "ios", "android"
]

SKILL_PATTERNS = [
    ("Python", ["python", "django", "fastapi", "flask", "pandas", "numpy"]),
    ("TypeScript", ["typescript", "ts"]),
    ("JavaScript", ["javascript", "js", "node.js", "node"]),
    ("React", ["react", "react.js", "next.js", "nextjs"]),
    ("Go", ["golang", "go engineer", "go developer"]),
    ("Rust", ["rust"]),
    ("C++", ["c++"]),
    ("Java", ["java", "spring boot"]),
    ("SQL", ["sql", "postgresql", "postgres", "mysql", "database"]),
    ("Docker", ["docker", "container"]),
    ("Kubernetes", ["kubernetes", "k8s"]),
    ("AWS", ["aws", "amazon web services"]),
    ("GCP", ["gcp", "google cloud"]),
    ("Azure", ["azure"]),
    ("Machine Learning", ["machine learning", "ml", "deep learning", "pytorch", "tensorflow", "llm", "genai"]),
    ("DevOps", ["devops", "ci/cd", "terraform", "ansible"]),
    ("TailwindCSS", ["tailwind", "tailwindcss", "css"]),
    ("GraphQL", ["graphql", "apollo"])
]

def extract_skills_from_text(title: str, dept: str = "", tags: list = None) -> list:
    """Extract standard tech competencies from job metadata."""
    corpus = f"{title} {dept} {' '.join(tags or [])}".lower()
    found = []
    for skill_name, patterns in SKILL_PATTERNS:
        if any(p in corpus for p in patterns):
            found.append(skill_name)

    # Defaults by title category if minimal
    if not found:
        t_low = title.lower()
        if "frontend" in t_low:
            found = ["React", "TypeScript", "JavaScript", "TailwindCSS"]
        elif "backend" in t_low:
            found = ["Python", "SQL", "Go", "Docker", "AWS"]
        elif "data" in t_low or "scientist" in t_low:
            found = ["Python", "SQL", "Machine Learning", "Pandas"]
        elif "devops" in t_low or "sre" in t_low:
            found = ["Kubernetes", "Docker", "AWS", "DevOps", "Terraform"]
        elif "full stack" in t_low or "fullstack" in t_low:
            found = ["React", "TypeScript", "Python", "SQL", "Docker"]
        else:
            found = ["Software Engineering", "Problem Solving", "System Design"]

    return list(dict.fromkeys(found))[:6]


class OfficialCareerScoutAgent:
    """
    Autonomous Job Scout Agent that regularly monitors and sweeps:
    1. Official company career portals (Stripe, Figma, Vercel, Cloudflare, GitLab, etc.)
    2. Multi-source tech hiring websites (RemoteOK, Remotive, Arbeitnow, Freelancer)
    3. Aggregates and normalizes postings for instant candidate matching
    """
    _scheduler_thread = None
    _scheduler_running = False
    _lock = threading.Lock()

    @classmethod
    def sweep_official_portals(cls, limit_per_portal: int = 15) -> dict:
        """
        Scans all registered official company career portals for current open positions.
        """
        start_time = timezone.now()
        headers = {
            'User-Agent': 'SkillMirror-CareerScoutAgent/2.0 (+https://skillmirror.dev)'
        }
        telemetry = AgentScoutTelemetry.objects.create(
            agent_name="OfficialCareerScoutAgent",
            status="RUNNING",
            details={"type": "official_portals_sweep"}
        )

        total_scanned = 0
        total_indexed = 0
        portal_results = {}

        for portal in OFFICIAL_PORTALS:
            p_id = portal["id"]
            p_name = portal["name"]
            p_url = portal["career_url"]
            endpoint = portal["endpoint"]
            portal_indexed = 0

            try:
                resp = requests.get(endpoint, headers=headers, timeout=6)
                if resp.status_code == 200:
                    data = resp.json()
                    raw_jobs = data.get('jobs', []) if isinstance(data, dict) else []
                    total_scanned += 1

                    for j in raw_jobs:
                        title = j.get('title', '').strip()
                        if not title:
                            continue

                        # Filter for tech / engineering roles
                        title_low = title.lower()
                        dept = ""
                        departments = j.get('departments', [])
                        if departments and isinstance(departments, list):
                            dept = departments[0].get('name', '')
                        
                        is_tech = any(kw in title_low for kw in TECH_KEYWORDS) or any(kw in dept.lower() for kw in TECH_KEYWORDS)
                        if not is_tech:
                            continue

                        job_id = j.get('id') or j.get('internal_job_id')
                        ext_id = f"official_{p_id}_{job_id}"
                        app_url = j.get('absolute_url') or p_url

                        # Location handling
                        loc = "Remote / Hybrid"
                        loc_obj = j.get('location')
                        if isinstance(loc_obj, dict) and loc_obj.get('name'):
                            loc = loc_obj.get('name')

                        skills = extract_skills_from_text(title, dept)

                        ScoutedJobOpening.objects.update_or_create(
                            external_id=ext_id,
                            defaults={
                                'title': title,
                                'company': p_name,
                                'location': loc,
                                'url': app_url,
                                'official_portal_url': p_url,
                                'source_name': f"Official Careers ({p_name})",
                                'source_type': 'OFFICIAL',
                                'department': dept or "Engineering",
                                'skills': skills,
                                'salary': "Market Standard / Equity",
                                'is_official': True,
                                'is_active': True,
                                'scouted_at': timezone.now()
                            }
                        )
                        portal_indexed += 1
                        total_indexed += 1
                        if portal_indexed >= limit_per_portal:
                            break

                    portal_results[p_name] = {"status": "SUCCESS", "indexed": portal_indexed}
                else:
                    portal_results[p_name] = {"status": f"HTTP {resp.status_code}", "indexed": 0}
            except Exception as e:
                logger.warning(f"Error scouting official portal {p_name}: {e}")
                portal_results[p_name] = {"status": "ERROR", "error": str(e), "indexed": 0}

        telemetry.completed_at = timezone.now()
        telemetry.portals_scanned = total_scanned
        telemetry.openings_found = total_indexed
        telemetry.status = "SUCCESS"
        telemetry.details = portal_results
        telemetry.save()

        duration = (telemetry.completed_at - start_time).total_seconds()
        logger.info(f"Official Career Scout Agent finished sweep in {duration:.1f}s: {total_indexed} openings indexed across {total_scanned} portals.")

        return {
            "status": "SUCCESS",
            "portals_scanned": total_scanned,
            "openings_indexed": total_indexed,
            "duration_seconds": round(duration, 2),
            "telemetry_id": telemetry.id,
            "portal_results": portal_results
        }

    @classmethod
    def sweep_multi_source_boards(cls) -> dict:
        """
        Scrapes & syncs openings from Remotive, Arbeitnow, and RemoteOK.
        """
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SkillMirror/2.0'}
        indexed_count = 0

        # 1. Remotive API
        try:
            r = requests.get('https://remotive.com/api/remote-jobs?limit=25', headers=headers, timeout=6)
            if r.status_code == 200:
                for item in r.json().get('jobs', []):
                    ext_id = f"remotive_{item.get('id')}"
                    title = item.get('title')
                    if not title:
                        continue
                    ScoutedJobOpening.objects.update_or_create(
                        external_id=ext_id,
                        defaults={
                            'title': title,
                            'company': item.get('company_name', 'Tech Company'),
                            'location': item.get('candidate_required_location') or 'Worldwide Remote',
                            'url': item.get('url'),
                            'official_portal_url': item.get('url'),
                            'source_name': 'Remotive Tech Hub',
                            'source_type': 'REMOTIVE',
                            'department': item.get('category', 'Engineering'),
                            'skills': extract_skills_from_text(title, item.get('category', ''), item.get('tags', [])),
                            'salary': item.get('salary') or 'Competitive',
                            'is_official': False,
                            'is_active': True,
                            'scouted_at': timezone.now()
                        }
                    )
                    indexed_count += 1
        except Exception as e:
            logger.warning(f"Multi-source Remotive sync error: {e}")

        # 2. Arbeitnow API
        try:
            r = requests.get('https://www.arbeitnow.com/api/job-board-api', headers=headers, timeout=6)
            if r.status_code == 200:
                for item in r.json().get('data', [])[:25]:
                    slug = item.get('slug') or item.get('title')
                    ext_id = f"arbeitnow_{abs(hash(slug)) % 10000000}"
                    title = item.get('title')
                    if not title:
                        continue
                    ScoutedJobOpening.objects.update_or_create(
                        external_id=ext_id,
                        defaults={
                            'title': title,
                            'company': item.get('company_name', 'Global Tech Co'),
                            'location': item.get('location') or 'Remote / Global',
                            'url': item.get('url'),
                            'official_portal_url': item.get('url'),
                            'source_name': 'Arbeitnow Global Board',
                            'source_type': 'ARBEITNOW',
                            'department': 'Software & IT',
                            'skills': extract_skills_from_text(title, tags=item.get('tags', [])),
                            'salary': 'Competitive Tech Compensation',
                            'is_official': False,
                            'is_active': True,
                            'scouted_at': timezone.now()
                        }
                    )
                    indexed_count += 1
        except Exception as e:
            logger.warning(f"Multi-source Arbeitnow sync error: {e}")

        # 3. RemoteOK API
        try:
            r = requests.get('https://remoteok.com/api', headers=headers, timeout=6)
            if r.status_code == 200:
                data = r.json()
                items = [j for j in data if isinstance(j, dict) and j.get('position')]
                for item in items[:25]:
                    ext_id = f"remoteok_{item.get('id')}"
                    title = item.get('position')
                    if not title:
                        continue
                    salary_str = ""
                    if item.get('salary_min') and item.get('salary_max'):
                        salary_str = f"${int(item.get('salary_min')):,} - ${int(item.get('salary_max')):,}"
                    elif item.get('salary_min'):
                        salary_str = f"From ${int(item.get('salary_min')):,}"
                    else:
                        salary_str = "Global Remote Salary"

                    ScoutedJobOpening.objects.update_or_create(
                        external_id=ext_id,
                        defaults={
                            'title': title,
                            'company': item.get('company', 'Remote Startup'),
                            'location': item.get('location') or 'Remote Worldwide',
                            'url': item.get('url') or f"https://remoteok.com/remote-jobs/{item.get('id')}",
                            'official_portal_url': item.get('url'),
                            'source_name': 'RemoteOK Live Feed',
                            'source_type': 'REMOTEOK',
                            'department': 'Engineering & Tech',
                            'skills': extract_skills_from_text(title, tags=item.get('tags', [])),
                            'salary': salary_str,
                            'is_official': False,
                            'is_active': True,
                            'scouted_at': timezone.now()
                        }
                    )
                    indexed_count += 1
        except Exception as e:
            logger.warning(f"Multi-source RemoteOK sync error: {e}")

        return {"status": "SUCCESS", "multi_source_indexed": indexed_count}

    @classmethod
    def run_full_scout_sweep(cls) -> dict:
        """Runs both official portals sweep and multi-source boards sweep."""
        res_official = cls.sweep_official_portals()
        res_multi = cls.sweep_multi_source_boards()
        return {
            "official": res_official,
            "multi_source": res_multi,
            "total_indexed": res_official.get("openings_indexed", 0) + res_multi.get("multi_source_indexed", 0)
        }

    @classmethod
    def get_agent_status(cls) -> dict:
        """Returns current operational status and telemetry of the scout agent."""
        latest_telemetry = AgentScoutTelemetry.objects.order_by('-started_at').first()
        total_openings = ScoutedJobOpening.objects.filter(is_active=True).count()
        official_openings = ScoutedJobOpening.objects.filter(is_active=True, is_official=True).count()

        return {
            "agent_name": "Official Career Scout Agent",
            "state": "ONLINE",
            "scheduler_active": cls._scheduler_running,
            "total_openings_indexed": total_openings,
            "official_openings_indexed": official_openings,
            "monitored_portals_count": len(OFFICIAL_PORTALS),
            "monitored_portals": [p["name"] for p in OFFICIAL_PORTALS],
            "last_sweep": {
                "started_at": latest_telemetry.started_at.isoformat() if latest_telemetry else None,
                "completed_at": latest_telemetry.completed_at.isoformat() if (latest_telemetry and latest_telemetry.completed_at) else None,
                "portals_scanned": latest_telemetry.portals_scanned if latest_telemetry else 0,
                "openings_found": latest_telemetry.openings_found if latest_telemetry else 0,
                "status": latest_telemetry.status if latest_telemetry else "STANDBY"
            } if latest_telemetry else None
        }

    @classmethod
    def start_background_scheduler(cls, interval_minutes: int = 60):
        """
        Starts a daemon background thread that regularly checks official career portals.
        """
        with cls._lock:
            if cls._scheduler_running:
                return

            cls._scheduler_running = True

            def _worker():
                logger.info(f"OfficialCareerScoutAgent periodic background worker started (Interval: {interval_minutes}m).")
                while cls._scheduler_running:
                    try:
                        cls.run_full_scout_sweep()
                    except Exception as e:
                        logger.error(f"Error in OfficialCareerScoutAgent scheduled worker: {e}")
                    # Sleep for interval
                    time.sleep(interval_minutes * 60)

            t = threading.Thread(target=_worker, daemon=True, name="CareerScoutAgentThread")
            cls._scheduler_thread = t
            t.start()
