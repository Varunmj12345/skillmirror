import os
import json
from typing import List, Dict, Any
from groq import Groq
from .models import Roadmap, RoadmapStep, UserRoadmap
from .taxonomy import DOMAIN_TAXONOMY, get_role_taxonomy, get_available_domains

GOAL_OPTIONS = [
    "Structural Engineer",
    "Mechanical Design Engineer",
    "Embedded Systems Engineer",
    "Software Developer",
    "Data Scientist / AI Engineer",
    "Automotive Design Engineer",
    "Chemical Process Engineer",
    "Bioinformatician",
    "Ag-Tech Specialist",
    "Architectural Designer",
    "Financial Analyst",
    "Cybersecurity Analyst",
    "VLSI Design Engineer"
]

def perform_domain_skill_gap_analysis(domain: str, target_role: str, user_skills: List[str], software_tools: List[str]):
    """
    Performs domain-specific skill gap analysis and classifies missing skills into priority tiers.
    """
    taxonomy = get_role_taxonomy(domain, target_role)
    
    known = set([s.strip().lower() for s in (user_skills + software_tools) if s])
    
    def filter_gaps(skill_list):
        gaps = []
        for sk in skill_list:
            if sk.lower() not in known and not any(k in sk.lower() or sk.lower() in k for k in known):
                gaps.append(sk)
        return gaps

    critical_gaps = filter_gaps(taxonomy.get("critical_skills", []))
    high_gaps = filter_gaps(taxonomy.get("high_priority", []))
    medium_gaps = filter_gaps(taxonomy.get("medium_priority", []))
    optional_gaps = filter_gaps(taxonomy.get("optional_skills", []))

    all_required = (
        taxonomy.get("critical_skills", []) +
        taxonomy.get("high_priority", []) +
        taxonomy.get("medium_priority", []) +
        taxonomy.get("optional_skills", [])
    )
    
    # Calculate Job Readiness Score
    total_req = len(all_required)
    total_gaps = len(critical_gaps) + len(high_gaps) + len(medium_gaps) + len(optional_gaps)
    matched = max(0, total_req - total_gaps)
    readiness_score = int((matched / max(1, total_req)) * 100) if total_req > 0 else 50
    # Bonus for existing skills
    if len(user_skills) > 0 and readiness_score < 30:
        readiness_score = min(45, 30 + len(user_skills) * 5)

    return {
        "categorized_gaps": {
            "critical": critical_gaps,
            "high_priority": high_gaps,
            "medium_priority": medium_gaps,
            "optional": optional_gaps
        },
        "all_required_skills": all_required,
        "job_readiness_score": readiness_score,
        "recommended_projects": taxonomy.get("projects", []),
        "recommended_certifications": taxonomy.get("certifications", [])
    }


def generate_ai_roadmap(profile_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generates a domain-aware, level-adaptive career roadmap using Groq AI."""
    domain = profile_data.get("branch_domain", "Computer Science / IT")
    degree = profile_data.get("degree", "B.Tech")
    target_job = profile_data.get("target_role") or profile_data.get("dream_job") or "Software Developer"
    level = profile_data.get("experience_level") or profile_data.get("proficiency_level") or "Beginner"
    user_skills = profile_data.get("user_skills", [])
    software_tools = profile_data.get("software_tools", [])
    
    # Perform gap analysis first
    gap_analysis = perform_domain_skill_gap_analysis(domain, target_job, user_skills, software_tools)

    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key or api_key.startswith('your_'):
        return generate_domain_fallback_roadmap(profile_data, gap_analysis)

    try:
        client = Groq(api_key=api_key)
        
        prompt = f"""
        You are an expert Career Intelligence Engine for ALL engineering and non-engineering domains.
        Create a 5-phase domain-specific career roadmap for a student:
        
        Student Profile:
        - Degree: {degree}
        - Domain / Branch: {domain}
        - Current Level: {level}
        - Target Career Role: {target_job}
        - Existing Skills: {', '.join(user_skills) if user_skills else 'None listed'}
        - Software/Tools Known: {', '.join(software_tools) if software_tools else 'None listed'}
        - Skill Gaps Identified: {json.dumps(gap_analysis['categorized_gaps'])}

        CRITICAL INSTRUCTIONS:
        1. DO NOT assume programming/coding or DSA is required UNLESS the target role is strictly IT/Software.
        2. Use domain-appropriate tools and techniques (e.g. AutoCAD/STAAD.Pro for Civil, SolidWorks/CATIA/GD&T for Mechanical, Embedded C/STM32/Verilog for ECE, Financial Modeling/Power BI for Commerce, NGS/BioPython for Biotech).
        3. Tailor phase depth to student's level '{level}':
           - Beginner: Fundamentals -> Tools -> Mini Project -> Intermediate -> Major Project
           - Intermediate: Advanced Analysis -> Industry Tools -> Real Project -> Internship -> Placement Prep
           - Advanced: Specialization -> Capstone -> Certifications -> Industry Experience -> Placement
           
        JSON Structure MUST BE EXACTLY:
        {{
            "title": "Domain Roadmap for {target_job}",
            "domain": "{domain}",
            "target_goal": "{target_job}",
            "student_level": "{level}",
            "timeline_summary": "Estimated duration: X weeks",
            "required_skills": {json.dumps(gap_analysis['all_required_skills'])},
            "projects_to_build": {json.dumps(gap_analysis['recommended_projects'])},
            "certifications": {json.dumps(gap_analysis['recommended_certifications'])},
            "steps": [
                {{
                    "order": 1,
                    "title": "Phase 1 Title",
                    "description": "Actionable learning objectives",
                    "skills": ["DomainSkill1", "Tool2"],
                    "difficulty": "beginner|intermediate|advanced",
                    "skill_demand": {{"Skill1": "🔥 High", "Tool2": "⚡ Medium"}},
                    "duration_weeks": 3,
                    "estimated_hours": 25,
                    "recommended_resources": [
                        {{"type": "course", "name": "Specific course name", "platform": "Coursera/Udemy/NPTEL", "url": "https://www.udemy.com/courses/search/?q=..."}},
                        {{"type": "book", "name": "Standard Reference Book", "author": "Author Name"}},
                        {{"type": "tutorial", "name": "Video/Guide Title", "url": "https://www.youtube.com/results?search_query=..."}}
                    ]
                }}
            ]
        }}

        Return ONLY valid JSON.
        """

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        content = completion.choices[0].message.content
        data = json.loads(content)
        
        steps = data.get("steps")
        if not steps and "roadmap" in data:
            steps = data["roadmap"].get("steps")
        
        if steps and isinstance(steps, list) and len(steps) > 0:
            data["steps"] = steps
            data["categorized_gaps"] = gap_analysis["categorized_gaps"]
            data["job_readiness_score"] = gap_analysis["job_readiness_score"]
            return data
            
        raise ValueError("No steps in AI response")

    except Exception as e:
        print(f"Groq API Error: {e}")
        return generate_domain_fallback_roadmap(profile_data, gap_analysis)


def generate_domain_fallback_roadmap(profile_data: Dict[str, Any], gap_analysis: Dict[str, Any] = None) -> Dict[str, Any]:
    """Generates a rich, domain-specific fallback roadmap when AI is unconfigured or fails."""
    domain = profile_data.get("branch_domain", "Computer Science / IT")
    target_job = profile_data.get("target_role") or profile_data.get("dream_job") or "Software Developer"
    level = profile_data.get("experience_level") or profile_data.get("proficiency_level") or "Beginner"
    user_skills = profile_data.get("user_skills", [])
    software_tools = profile_data.get("software_tools", [])

    if not gap_analysis:
        gap_analysis = perform_domain_skill_gap_analysis(domain, target_job, user_skills, software_tools)

    taxonomy = get_role_taxonomy(domain, target_job)
    crit = taxonomy.get("critical_skills", ["Core Principles"])
    high = taxonomy.get("high_priority", ["Industry Software Tools"])
    med = taxonomy.get("medium_priority", ["Domain Standards"])
    opt = taxonomy.get("optional_skills", ["Advanced Techniques"])
    projects = taxonomy.get("projects", ["Domain Capstone Implementation"])
    certs = taxonomy.get("certifications", ["Industry Professional Certification"])

    steps = [
        {
            "order": 1,
            "title": f"1. {domain} Foundations & Core Principles",
            "description": f"Master fundamental concepts and basic analytical tools for {target_job}.",
            "skills": crit[:2],
            "difficulty": "beginner",
            "skill_demand": {s: "🔥 High" for s in crit[:2]},
            "duration_weeks": 3,
            "estimated_hours": 30,
            "recommended_resources": [
                {"type": "course", "name": f"Fundamentals of {crit[0] if crit else domain}", "platform": "Coursera/NPTEL", "url": f"https://www.coursera.org/search?query={target_job}"},
                {"type": "book", "name": f"Standard Principles of {domain}", "author": "Industry Standard Author"}
            ]
        },
        {
            "order": 2,
            "title": f"2. Primary Industry Software & Tooling",
            "description": f"Gain hands-on proficiency in key industry tools: {', '.join(high[:2])}.",
            "skills": high[:2] if high else [crit[-1]],
            "difficulty": "intermediate",
            "skill_demand": {s: "🔥 High" for s in high[:2]},
            "duration_weeks": 4,
            "estimated_hours": 40,
            "recommended_resources": [
                {"type": "tutorial", "name": f"Complete {high[0] if high else domain} Masterclass", "platform": "Udemy/YouTube", "url": f"https://www.youtube.com/results?search_query={high[0] if high else domain}+tutorial"}
            ]
        },
        {
            "order": 3,
            "title": "3. Practical Domain Project Execution",
            "description": f"Apply learned tools to execute practical projects: '{projects[0] if projects else 'Domain Project'}'.",
            "skills": crit + high[:1],
            "difficulty": "intermediate",
            "skill_demand": {s: "⚡ Medium" for s in med[:2]},
            "duration_weeks": 5,
            "estimated_hours": 50,
            "recommended_resources": [
                {"type": "project", "name": projects[0] if projects else "Domain Project Specification", "url": "https://www.google.com/search?q=" + target_job + "+projects"}
            ]
        },
        {
            "order": 4,
            "title": "4. Industry Standards, Codes & Certifications",
            "description": f"Study regulatory codes, quality standards, and prepare for {certs[0] if certs else 'Professional Certification'}.",
            "skills": med + opt[:1],
            "difficulty": "advanced",
            "skill_demand": {certs[0] if certs else "Certification": "🔥 High"},
            "duration_weeks": 4,
            "estimated_hours": 35,
            "recommended_resources": [
                {"type": "course", "name": certs[0] if certs else "Professional Certification Prep", "platform": "Industry Guild", "url": f"https://www.google.com/search?q={certs[0] if certs else target_job}+certification"}
            ]
        },
        {
            "order": 5,
            "title": "5. Career Portfolio & Job Placement Readiness",
            "description": f"Assemble a domain portfolio, optimize professional profiles, and prepare for technical interviews for {target_job}.",
            "skills": ["Technical Portfolio", "Domain Interview Prep", "Professional Presentation"],
            "difficulty": "advanced",
            "skill_demand": {"Placement Readiness": "🔥 High"},
            "duration_weeks": 3,
            "estimated_hours": 25,
            "recommended_resources": [
                {"type": "tutorial", "name": f"{target_job} Technical Interview & Portfolio Guide", "url": f"https://www.google.com/search?q={target_job}+interview+questions"}
            ]
        }
    ]

    return {
        "title": f"Universal Domain Roadmap for {target_job}",
        "domain": domain,
        "target_goal": target_job,
        "student_level": level,
        "timeline_summary": "Total estimated duration: 19 weeks (~4.5 months)",
        "job_readiness_score": gap_analysis["job_readiness_score"],
        "categorized_gaps": gap_analysis["categorized_gaps"],
        "required_skills": gap_analysis["all_required_skills"],
        "projects_to_build": projects,
        "certifications": certs,
        "steps": steps
    }


def generate_roadmap(profile_data: Dict[str, Any], goals: Any = None) -> Dict[str, Any]:
    """
    Main entry point for Universal Domain-Aware Roadmap Generation.
    Accepts full student profile dict or standalone skills/goals.
    """
    if isinstance(profile_data, list):
        # Legacy positional invocation: generate_roadmap(user_skills, goals)
        user_skills = profile_data
        target_role = goals.get("target_job", goals) if isinstance(goals, dict) else str(goals or "Software Developer")
        profile_data = {
            "branch_domain": "Computer Science / IT",
            "target_role": target_role,
            "user_skills": user_skills,
            "software_tools": [],
            "experience_level": "Beginner"
        }
    elif isinstance(profile_data, dict):
        if goals:
            target_role = goals.get("target_job", goals) if isinstance(goals, dict) else str(goals)
            profile_data["target_role"] = target_role

    return generate_ai_roadmap(profile_data)


def save_roadmap_to_db(user, data: Dict[str, Any]):
    """Saves generated roadmap data to database."""
    try:
        title = data.get("title") or f"Domain Roadmap for {data.get('target_goal', 'New Career')}"
        target_goal = data.get('target_goal', 'Skill Improvement')
        
        roadmap = Roadmap.objects.create(
            title=title,
            description=f"Universal domain path for {target_goal} ({data.get('domain', 'General')})",
            required_skills=data.get("required_skills", [])
        )
        UserRoadmap.objects.create(user=user, roadmap=roadmap, progress=0.0)
        
        processed_steps = []
        raw_steps = data.get("steps", [])
        
        if not raw_steps:
            fallback = generate_domain_fallback_roadmap({"target_role": target_goal})
            raw_steps = fallback["steps"]

        for idx, s in enumerate(raw_steps):
            if not isinstance(s, dict): continue
            
            step = RoadmapStep.objects.create(
                roadmap=roadmap,
                title=s.get("title", f"Phase {idx+1}"),
                description=s.get("description", "Master the domain skills outlined below."),
                order=s.get("order", idx + 1),
                skills_list=s.get("skills", []),
                difficulty=s.get("difficulty", "intermediate"),
                skill_demand=s.get("skill_demand", {}),
                duration_weeks=s.get("duration_weeks", 3),
                estimated_hours=s.get("estimated_hours", 25),
                recommended_resources=s.get("recommended_resources", [])
            )
            processed_steps.append({
                "id": step.id, 
                "order": step.order, 
                "title": step.title, 
                "description": step.description, 
                "skills": step.skills_list,
                "difficulty": step.difficulty,
                "skill_demand": step.skill_demand,
                "duration_weeks": step.duration_weeks,
                "estimated_hours": step.estimated_hours,
                "recommended_resources": step.recommended_resources
            })
            
        return {
            "id": roadmap.id, 
            "title": roadmap.title, 
            "domain": data.get("domain", "General"),
            "target_goal": target_goal, 
            "student_level": data.get("student_level", "Beginner"),
            "job_readiness_score": data.get("job_readiness_score", 50),
            "categorized_gaps": data.get("categorized_gaps", {}),
            "projects_to_build": data.get("projects_to_build", []),
            "certifications": data.get("certifications", []),
            "timeline_summary": data.get("timeline_summary", ""),
            "total_duration_weeks": sum(s.get('duration_weeks', 0) for s in processed_steps),
            "required_skills": data.get("required_skills", []), 
            "steps": processed_steps
        }
    except Exception as e:
        print(f"DB Save Error: {e}")
        return data