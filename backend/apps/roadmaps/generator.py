import os
import json
import re
from typing import List, Dict, Any
from groq import Groq
from .models import Roadmap, RoadmapStep, UserRoadmap

GOAL_OPTIONS = [
    "Data Scientist",
    "Web Developer",
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "DevOps Engineer",
    "Machine Learning Engineer",
    "Python Developer",
    "Java Developer",
    "React Developer",
    "Cloud Architect",
    "Cybersecurity Analyst",
]

def generate_ai_roadmap(user_skills: List[str], target_job: str) -> Dict[str, Any]:
    """Generate a truly personalized career roadmap using Groq AI."""
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key or api_key.startswith('your_'):
        return generate_career_roadmap_fallback(user_skills, target_job)

    try:
        client = Groq(api_key=api_key)
        
        prompt = f"""
        Create a highly personalized 5-step career roadmap for a user who wants to become a '{target_job}'.
        Current User Skills: {', '.join(user_skills) if user_skills else 'Beginner / No skills listed'}.
        
        IMPORTANT: Analyze the target role '{target_job}' and user's current skill level to provide REALISTIC, ROLE-SPECIFIC timelines:
        
        - For BEGINNER roles (Junior Developer, Entry-level): 2-4 weeks per phase, 15-30 hours
        - For INTERMEDIATE roles (Full Stack, Backend Developer): 3-6 weeks per phase, 25-50 hours  
        - For ADVANCED roles (Data Scientist, ML Engineer, DevOps): 4-8 weeks per phase, 40-80 hours
        - For SPECIALIZED roles (AI Specialist, Security Expert): 6-12 weeks per phase, 60-120 hours
        
        If user already has relevant skills, REDUCE the timeline proportionally.
        
        The roadmap MUST be a valid JSON object with EXACTLY this structure:
        {{
            "title": "Personalized roadmap title for {target_job}",
            "target_goal": "{target_job}",
            "timeline_summary": "Total estimated time: X weeks (Y months)",
            "required_skills": ["Skill1", "Skill2", "Skill3"],
            "steps": [
                {{
                    "order": 1,
                    "title": "Phase-specific title",
                    "description": "Detailed action-oriented description",
                    "skills": ["Specific skills for this phase"],
                    "difficulty": "beginner|intermediate|advanced",
                    "skill_demand": {{"SkillName": "🔥 High|⚡ Medium|📉 Low"}},
                    "duration_weeks": <CALCULATE based on role complexity and phase content>,
                    "estimated_hours": <CALCULATE based on learning depth required>,
                    "recommended_resources": [
                        {{"type": "course", "name": "Specific course name", "platform": "Coursera/Udemy/edX", "url": "https://www.udemy.com/courses/search/?q=..."}},
                        {{"type": "book", "name": "Relevant book", "author": "Author name"}},
                        {{"type": "tutorial", "name": "Tutorial name", "url": "https://www.google.com/search?q=..."}}
                    ]
                }}
            ]
        }}
        
        CRITICAL REQUIREMENTS:
        1. VARY duration_weeks and estimated_hours for EACH phase based on:
           - Complexity of skills being taught
           - Depth of knowledge required
           - Whether it's foundational vs advanced content
           - User's existing skill overlap
        
        2. Make resources HIGHLY SPECIFIC to:
           - The exact skills in that phase
           - The target role '{target_job}'
           - Popular, well-reviewed courses (Coursera, Udemy, edX, Pluralsight)
           - Industry-standard books and tutorials
        
        3. Include real course names, authors, and platforms. IMPORTANT: For 'url', generate a SEARCH URL (e.g., https://www.udemy.com/courses/search/?q=Course+Name) rather than a direct link, to ensure the link works.
        
        4. Ensure total timeline makes sense for the role (e.g., Data Scientist: 20-30 weeks total, Junior Dev: 10-15 weeks total)
        
        Return ONLY valid JSON with NO additional text.
        """

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        content = completion.choices[0].message.content
        data = json.loads(content)
        
        # Robustly find the steps array even if nested
        steps = data.get("steps")
        if not steps and "roadmap" in data: steps = data["roadmap"].get("steps")
        
        if steps and isinstance(steps, list) and len(steps) > 0:
            data["steps"] = steps
            return data
            
        raise ValueError("No steps found in AI response")

    except Exception as e:
        print(f"Groq API Error: {e}")
        return generate_career_roadmap_fallback(user_skills, target_job)

def generate_career_roadmap_fallback(user_skills: List[str], target_job: str) -> Dict[str, Any]:
    """Fallback static roadmap generation if AI fails."""
    if "Java" in target_job:
        required_skills = ["Java", "Spring Boot", "Hibernate", "SQL", "Microservices"]
        steps = [
            {"order": 1, "title": "Java Fundamentals", "description": "Master Java syntax, OOP principles, and collections.", "skills": ["Java", "OOP"], "duration_weeks": 4, "estimated_hours": 40, "recommended_resources": [{"type": "course", "name": "Java Programming Masterclass", "platform": "Udemy", "url": "https://www.udemy.com/courses/search/?q=Java+Programming+Masterclass"}, {"type": "book", "name": "Effective Java", "author": "Joshua Bloch"}]},
            {"order": 2, "title": "Advanced Java & Data Structures", "description": "Learn multithreading, streams, and common data structures.", "skills": ["Java", "DSA"], "duration_weeks": 4, "estimated_hours": 50, "recommended_resources": [{"type": "course", "name": "Data Structures in Java", "platform": "Coursera", "url": "https://www.coursera.org/search?query=Data%20Structures%20Java"}]},
            {"order": 3, "title": "Spring Boot Framework", "description": "Build REST APIs and web applications using Spring Boot.", "skills": ["Spring Boot", "REST API"], "duration_weeks": 5, "estimated_hours": 60, "recommended_resources": [{"type": "course", "name": "Spring Boot 3, Spring 6 & Hibernate", "platform": "Udemy", "url": "https://www.udemy.com/courses/search/?q=Spring+Boot"}]},
            {"order": 4, "title": "Database Integration", "description": "Connect applications to databases using Hibernate and JPA.", "skills": ["Hibernate", "SQL"], "duration_weeks": 3, "estimated_hours": 30, "recommended_resources": [{"type": "course", "name": "Spring Data JPA Course", "platform": "Udemy", "url": "https://www.udemy.com/courses/search/?q=Spring+Data+JPA"}]},
            {"order": 5, "title": "Microservices & Cloud", "description": "Deploy Java microservices to the cloud (AWS/Docker).", "skills": ["Microservices", "Docker"], "duration_weeks": 4, "estimated_hours": 40, "recommended_resources": [{"type": "course", "name": "Microservices with Spring Boot", "platform": "Udemy", "url": "https://www.udemy.com/courses/search/?q=Microservices+Spring+Boot"}]},
        ]
    elif "Python" in target_job or "Data Scientist" in target_job or "Machine Learning" in target_job or "AI" in target_job:
        # Combined Python/DS path but tailored if just 'Python Developer'
        if "Data" not in target_job and "Machine" not in target_job and "AI" not in target_job:
             # Pure Python Developer Path
            required_skills = ["Python", "Django", "Flask", "SQL", "REST APIs"]
            steps = [
                {"order": 1, "title": "Python Core Mastery", "description": "Deep dive into Python syntax, decorators, generators.", "skills": ["Python"], "duration_weeks": 3, "estimated_hours": 30, "recommended_resources": [{"type": "course", "name": "Complete Python Bootcamp", "platform": "Udemy", "url": "https://www.udemy.com/courses/search/?q=Complete+Python+Bootcamp"}]},
                {"order": 2, "title": "Web Frameworks (Django/Flask)", "description": "Build robust web applications.", "skills": ["Django", "Flask"], "duration_weeks": 5, "estimated_hours": 60, "recommended_resources": [{"type": "course", "name": "Python Django - The Practical Guide", "platform": "Udemy", "url": "https://www.udemy.com/courses/search/?q=Python+Django"}]},
                {"order": 3, "title": "Database & ORM", "description": "SQLAlchmey, Django ORM, and complex queries.", "skills": ["SQL", "ORM"], "duration_weeks": 3, "estimated_hours": 35, "recommended_resources": [{"type": "tutorial", "name": "Real Python Tutorials", "url": "https://realpython.com/"}]},
                {"order": 4, "title": "API Development", "description": "RESTful services and API design with FASTAPI.", "skills": ["FastAPI", "API"], "duration_weeks": 3, "estimated_hours": 30, "recommended_resources": [{"type": "course", "name": "FastAPI - The Complete Course", "platform": "Udemy", "url": "https://www.udemy.com/courses/search/?q=FastAPI"}]},
                {"order": 5, "title": "Testing & Deployment", "description": "PyTest, Docker, and CI/CD for Python apps.", "skills": ["PyTest", "Docker"], "duration_weeks": 2, "estimated_hours": 20, "recommended_resources": [{"type": "tutorial", "name": "TestDriven.io", "url": "https://testdriven.io/"}]},
            ]
        else:
            required_skills = ["Python", "Machine Learning", "SQL", "Statistics", "Deep Learning"]
            steps = [
                {"order": 1, "title": "Advanced Python for DS", "description": "Master NumPy, Pandas, and data manipulation for data science.", "skills": ["Python"], "duration_weeks": 4, "estimated_hours": 50, "recommended_resources": [{"type": "course", "name": "Python for Data Science", "platform": "Coursera", "url": "https://www.coursera.org/search?query=Python%20Data%20Science"}, {"type": "book", "name": "Python for Data Analysis", "author": "Wes McKinney"}]},
                {"order": 2, "title": "Statistical Foundations", "description": "Learn inferential statistics, probability, and hypothesis testing.", "skills": ["Statistics"], "duration_weeks": 6, "estimated_hours": 70, "recommended_resources": [{"type": "course", "name": "Statistics for Data Science", "platform": "edX", "url": "https://www.edx.org/search?q=Statistics+Data+Science"}, {"type": "book", "name": "Practical Statistics for Data Scientists", "author": "Peter Bruce"}]},
                {"order": 3, "title": "SQL & Data Engineering", "description": "Master complex queries, joins, optimization, and data pipelines.", "skills": ["SQL"], "duration_weeks": 3, "estimated_hours": 40, "recommended_resources": [{"type": "course", "name": "Complete SQL Bootcamp", "platform": "Udemy", "url": "https://www.udemy.com/courses/search/?q=SQL+Bootcamp"}, {"type": "tutorial", "name": "SQL for Data Science", "url": "https://mode.com/sql-tutorial"}]},
                {"order": 4, "title": "Machine Learning Fundamentals", "description": "Implement supervised and unsupervised learning with Scikit-Learn.", "skills": ["Machine Learning"], "duration_weeks": 8, "estimated_hours": 100, "recommended_resources": [{"type": "course", "name": "Machine Learning Specialization", "platform": "Coursera", "author": "Andrew Ng", "url": "https://www.coursera.org/search?query=Machine%20Learning%20Specialization"}, {"type": "book", "name": "Hands-On Machine Learning", "author": "Aurélien Géron"}]},
                {"order": 5, "title": "Deep Learning & Real Projects", "description": "Build neural networks with TensorFlow/PyTorch and complete capstone projects.", "skills": ["Deep Learning", "Python", "Machine Learning"], "duration_weeks": 10, "estimated_hours": 120, "recommended_resources": [{"type": "course", "name": "Deep Learning Specialization", "platform": "Coursera", "url": "https://www.coursera.org/search?query=Deep%20Learning"}, {"type": "project", "name": "Kaggle Competitions", "url": "https://kaggle.com"}]},
            ]
    elif "Web" in target_job or "Developer" in target_job or "Engineer" in target_job or "React" in target_job:
        required_skills = ["JavaScript", "HTML/CSS", "Backend Integration", "Git"]
        steps = [
            {"order": 1, "title": "Modern Frontend Fundamentals", "description": "Master React and modern CSS architectures.", "skills": ["JavaScript", "React"], "duration_weeks": 3, "estimated_hours": 30, "recommended_resources": [{"type": "course", "name": "React - The Complete Guide", "platform": "Udemy", "url": "https://www.udemy.com/courses/search/?q=React+Complete+Guide"}, {"type": "tutorial", "name": "React Official Docs", "url": "https://react.dev"}]},
            {"order": 2, "title": "Backend Engineering", "description": "Learn Node.js, Express and RESTful API design.", "skills": ["Node.js"], "duration_weeks": 3, "estimated_hours": 35, "recommended_resources": [{"type": "course", "name": "Node.js Developer Course", "platform": "Udemy", "url": "https://www.udemy.com/courses/search/?q=Nodejs+Developer"}, {"type": "book", "name": "Node.js Design Patterns"}]},
            {"order": 3, "title": "Database Systems", "description": "Integrate SQL or MongoDB into your applications.", "skills": ["SQL", "MongoDB"], "duration_weeks": 2, "estimated_hours": 25, "recommended_resources": [{"type": "course", "name": "Complete SQL Bootcamp", "platform": "Udemy", "url": "https://www.udemy.com/courses/search/?q=SQL+Bootcamp"}, {"type": "course", "name": "MongoDB University", "platform": "MongoDB", "url": "https://learn.mongodb.com/"}]},
            {"order": 4, "title": "DevOps & Deployment", "description": "Set up CI/CD pipelines and cloud hosting.", "skills": ["Docker", "Git"], "duration_weeks": 2, "estimated_hours": 20, "recommended_resources": [{"type": "course", "name": "Docker Mastery", "platform": "Udemy", "url": "https://www.udemy.com/courses/search/?q=Docker+Mastery"}, {"type": "tutorial", "name": "GitHub Actions", "url": "https://docs.github.com/en/actions"}]},
            {"order": 5, "title": "Portfolio Capstone", "description": "Build and deploy a complex full-stack application.", "skills": required_skills, "duration_weeks": 4, "estimated_hours": 50, "recommended_resources": [{"type": "project", "name": "Full-Stack Project Ideas", "url": "https://github.com/topics/full-stack-project"}]},
        ]
    else:
        required_skills = ["Technical Proficiency", "Problem Solving", "Collaboration"]
        steps = [
            {"order": 1, "title": "Foundational Mastery", "description": "Learn the core principles of your chosen role.", "skills": ["Core Concepts"], "duration_weeks": 3, "estimated_hours": 30, "recommended_resources": [{"type": "course", "name": "Introduction to " + target_job, "platform": "Udemy", "url": "https://www.udemy.com/courses/search/?q=" + target_job}]},
            {"order": 2, "title": "Skill Deep-Dive", "description": "Intensively study secondary required technologies.", "skills": ["Advanced Tools"], "duration_weeks": 4, "estimated_hours": 45, "recommended_resources": [{"type": "tutorial", "name": "Advanced Tutorials for " + target_job, "url": "https://www.google.com/search?q=" + target_job + "+advanced+tutorials"}]},
            {"order": 3, "title": "Practical Application", "description": "Build real projects to validate your skills.", "skills": ["Project-Based Learning"], "duration_weeks": 5, "estimated_hours": 60, "recommended_resources": [{"type": "project", "name": "Portfolio Projects", "url": "https://github.com/search?q=" + target_job + "+projects"}]},
            {"order": 4, "title": "Professional Optimization", "description": "Optimize your LinkedIn and portfolio for this role.", "skills": ["Career Readiness"], "duration_weeks": 2, "estimated_hours": 20, "recommended_resources": [{"type": "course", "name": "Career Development", "platform": "LinkedIn Learning", "url": "https://www.linkedin.com/learning/topics/career-development"}]},
        ]

    return {
        "title": f"Professional Roadmap to {target_job}",
        "target_goal": target_job,
        "required_skills": required_skills,
        "steps": steps,
    }

def generate_roadmap(user_skills: List[str], goals) -> Dict[str, Any]:
    target_job = goals.get("target_job", goals) if isinstance(goals, dict) else str(goals or "Software Engineer")
    return generate_ai_roadmap(user_skills or [], target_job)

def save_roadmap_to_db(user, data: Dict[str, Any]):
    """Save generated roadmap to DB with guaranteed steps."""
    try:
        title = data.get("title") or f"Roadmap for {data.get('target_goal', 'New Career')}"
        target_goal = data.get('target_goal', 'Skill Improvement')
        
        roadmap = Roadmap.objects.create(
            title=title,
            description=f"Personalized path for {target_goal}",
            required_skills=data.get("required_skills", [])
        )
        # Link roadmap to user
        UserRoadmap.objects.create(user=user, roadmap=roadmap, progress=0.0)
        
        processed_steps = []
        raw_steps = data.get("steps", [])
        
        # Final safety check: if for some reason steps are empty, use basic fallback
        if not raw_steps:
            fallback = generate_career_roadmap_fallback([], target_goal)
            raw_steps = fallback["steps"]

        for idx, s in enumerate(raw_steps):
            if not isinstance(s, dict): continue
            
            step = RoadmapStep.objects.create(
                roadmap=roadmap,
                title=s.get("title", f"Phase {idx+1}"),
                description=s.get("description", "Master the skills outlined below."),
                order=s.get("order", idx + 1),
                skills_list=s.get("skills", []),
                difficulty=s.get("difficulty", "intermediate"),
                skill_demand=s.get("skill_demand", {}),
                duration_weeks=s.get("duration_weeks", 2),
                estimated_hours=s.get("estimated_hours", 20),
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
            "target_goal": target_goal, 
            "timeline_summary": data.get("timeline_summary", ""),
            "total_duration_weeks": sum(s.get('duration_weeks', 0) for s in processed_steps),
            "required_skills": data.get("required_skills", []), 
            "steps": processed_steps
        }
    except Exception as e:
        print(f"DB Save Error: {e}")
        # If DB save failed but we have valid steps (e.g. from fallback), return them
        # so the user at least sees the roadmap content
        if 'raw_steps' in locals() and raw_steps:
            data['steps'] = raw_steps
            # Also ensure other fields are set if missing
            if 'title' not in data and 'roadmap' in locals(): data['title'] = roadmap.title
            if 'id' not in data and 'roadmap' in locals() and roadmap.id: data['id'] = roadmap.id
            
        return data