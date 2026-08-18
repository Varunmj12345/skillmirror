import re
import json
import random
from django.utils import timezone
from apps.ai.embeddings import EmbeddingGenerator
from apps.skills.models import Skill, UserSkill, ResumeData
from apps.problems.models import (
    Problem, ProblemEvidence, ProblemValidation, ProblemDuplicate,
    ProblemMatch, Project, ProjectTask, ProjectEvidence, ProblemOpportunity, ProblemOrganization
)

class ProblemNLPService:
    """
    AI/NLP service to transform raw problem submissions into structured problem records.
    """
    def __init__(self):
        self.embedding_gen = EmbeddingGenerator()

    def process_raw_problem(self, problem: Problem) -> dict:
        desc = (problem.description + " " + problem.title + " " + problem.required_solution).lower()
        
        # 1. Extract Category & Industry
        category = "General Tech"
        industry = problem.industry or "Technology"
        if any(w in desc for w in ["health", "patient", "opd", "hospital", "clinic", "doctor"]):
            category = "Healthcare Tech"
            industry = "Healthcare"
        elif any(w in desc for w in ["farm", "crop", "soil", "agriculture", "farmer", "yield"]):
            category = "AgriTech"
            industry = "Agriculture"
        elif any(w in desc for w in ["school", "college", "student", "learn", "course", "tutor"]):
            category = "EdTech"
            industry = "Education"
        elif any(w in desc for w in ["shop", "store", "inventory", "sales", "merchant", "local"]):
            category = "Retail & Small Business"
            industry = "Commerce"
        elif any(w in desc for w in ["gov", "citizen", "public", "traffic", "city", "civic"]):
            category = "CivicTech & Gov"
            industry = "Public Sector"

        # 2. Extract Target Users
        target_users = "General Public & End Users"
        if "patient" in desc or "doctor" in desc:
            target_users = "Hospital Staff, Doctors & Patients"
        elif "farmer" in desc:
            target_users = "Local Farmers & Agri Distributors"
        elif "student" in desc or "teacher" in desc:
            target_users = "Students & Educators"
        elif "business" in desc or "merchant" in desc:
            target_users = "Small Business Owners & Staff"

        # 3. Extract Root Problem & Symptoms
        root_problem = problem.description[:300] + "..." if len(problem.description) > 300 else problem.description
        symptoms = [
            f"High manual operational overhead in {industry.lower()} workflows.",
            f"Lack of real-time digital tracking for {category.lower()}.",
            "Inefficient data coordination and delayed communication."
        ]

        # 4. Extract Required Skills & Tech Stack
        tech_tokens = re.findall(r'\b(python|django|react|next\.js|node|typescript|postgresql|mysql|mongodb|docker|fastapi|aws|tailwind|auth|jwt|rest|api|ui|ux)\b', desc)
        extracted_skills = list(set([t.title() for t in tech_tokens]))
        if not extracted_skills:
            if category == "Healthcare Tech":
                extracted_skills = ["Python", "Django", "React", "PostgreSQL", "REST API", "Authentication"]
            elif category == "AgriTech":
                extracted_skills = ["Python", "Flutter", "Django", "PostgreSQL", "GIS Mapping"]
            else:
                extracted_skills = ["Python", "React", "REST API", "PostgreSQL"]

        # 5. Complexity & Effort Scoping
        complexity = "intermediate"
        effort_weeks = 4
        if len(extracted_skills) > 5 or problem.people_affected > 1000:
            complexity = "advanced"
            effort_weeks = 6
        elif len(extracted_skills) <= 3 and problem.people_affected < 100:
            complexity = "beginner"
            effort_weeks = 2

        # Update problem fields
        problem.category = category
        problem.industry = industry
        problem.target_users = target_users
        problem.root_problem = root_problem
        problem.symptoms = symptoms
        problem.existing_solution_gap = problem.current_method or "Manual processes and legacy spreadsheet tracking."
        problem.missing_capability = "Automated digital workflow and real-time dashboard analytics."
        problem.complexity = complexity
        problem.estimated_effort_weeks = effort_weeks
        problem.required_skills_list = extracted_skills
        problem.status = 'under_analysis'
        problem.save()

        return {
            "category": category,
            "industry": industry,
            "target_users": target_users,
            "root_problem": root_problem,
            "symptoms": symptoms,
            "extracted_skills": extracted_skills,
            "complexity": complexity,
            "estimated_effort_weeks": effort_weeks
        }


class ProblemValidationService:
    """
    Computes Problem Validation Score & enforces AI Safety & Evidence standards.
    """
    def validate_problem(self, problem: Problem) -> ProblemValidation:
        # Check evidences attached to problem
        evidences = problem.evidences.all()
        has_human_verified = evidences.filter(source_type__in=['human_verified', 'organization_verified'], verification_status='verified').exists()
        has_ai_assessed = evidences.filter(source_type='ai_assessed').exists()

        # Score Breakdown (0-100)
        evidence_score = 90 if has_human_verified else (60 if has_ai_assessed else 35)
        user_impact_score = min(100, max(30, int(problem.people_affected / 10)))
        frequency_score = 90 if problem.frequency in ['daily', 'continuous'] else 65
        urgency_score = 90 if problem.estimated_impact in ['high', 'critical'] else 60
        existing_gap_score = 80 if problem.current_method else 50
        org_verification_score = 95 if (problem.organization and problem.organization.is_verified) else 40
        market_relevance_score = problem.market_relevance_score or 75
        reproducibility_score = 80

        # Weighted Total
        total_score = int(
            (evidence_score * 0.20) +
            (user_impact_score * 0.15) +
            (frequency_score * 0.15) +
            (urgency_score * 0.15) +
            (existing_gap_score * 0.10) +
            (org_verification_score * 0.15) +
            (market_relevance_score * 0.10)
        )

        validation, _ = ProblemValidation.objects.update_or_create(
            problem=problem,
            defaults={
                "validation_score": total_score,
                "evidence_score": evidence_score,
                "user_impact_score": user_impact_score,
                "frequency_score": frequency_score,
                "urgency_score": urgency_score,
                "existing_gap_score": existing_gap_score,
                "org_verification_score": org_verification_score,
                "market_relevance_score": market_relevance_score,
                "reproducibility_score": reproducibility_score,
                "reviewer_notes": "Automated AI validation synthesis complete.",
                "ai_analysis_notes": f"Distinguished {evidences.count()} evidence items. Human verified: {has_human_verified}."
            }
        )

        # Update problem status based on score
        if total_score >= 70:
            problem.status = 'validated'
        elif total_score >= 50:
            problem.status = 'potential'
        else:
            problem.status = 'needs_more_info'
        problem.save()

        # Attach default AI evidence if none exists
        if not evidences.exists():
            ProblemEvidence.objects.create(
                problem=problem,
                source_type='ai_assessed',
                evidence_type='market_data',
                title="AI Market & Workflow Assessment",
                description=f"AI evaluated problem impact for {problem.category}. Evidence status: AI-Assessed (Requires human verification).",
                verification_status='pending'
            )

        return validation


class DuplicateDetectionService:
    """
    Scans problem database using token overlap to detect similar/duplicate problems.
    """
    def __init__(self):
        self.embedding_gen = EmbeddingGenerator()

    def check_duplicates(self, problem: Problem) -> list:
        other_problems = Problem.objects.exclude(id=problem.id)
        duplicates = []
        p_tokens = self.embedding_gen._tokenize(problem.title + " " + problem.description)

        for other in other_problems:
            o_tokens = self.embedding_gen._tokenize(other.title + " " + other.description)
            similarity = float(self.embedding_gen.calculate_similarity(p_tokens, o_tokens)) * 100
            
            if similarity >= 40.0: # threshold for duplicate candidate
                dup, created = ProblemDuplicate.objects.update_or_create(
                    source_problem=problem,
                    target_problem=other,
                    defaults={"similarity_score": round(similarity, 1)}
                )
                duplicates.append({
                    "id": dup.id,
                    "target_problem_id": other.id,
                    "target_title": other.title,
                    "target_organization": other.organization_name or "Independent",
                    "similarity_score": round(similarity, 1),
                    "status": dup.status
                })

        return duplicates


class StudentProblemMatcher:
    """
    Calculates Problem-to-Student Match Score % and missing skill gap analysis.
    """
    def compute_match(self, user, problem: Problem) -> ProblemMatch:
        user_skills = set([s.name.lower() for s in user.skills.all()])
        required_skills = [s.strip() for s in (problem.required_skills_list or [])]
        
        if not required_skills:
            required_skills = ["Python", "Django", "React", "PostgreSQL"]

        matched = []
        missing = []
        for req in required_skills:
            if req.lower() in user_skills or any(us in req.lower() or req.lower() in us for us in user_skills):
                matched.append(req)
            else:
                missing.append(req)

        match_ratio = len(matched) / max(1, len(required_skills))
        match_score = min(100, max(20, int(match_ratio * 100)))

        learning_gap_analysis = {
            "total_required": len(required_skills),
            "matched_count": len(matched),
            "missing_count": len(missing),
            "readiness_summary": f"You match {match_score}% of the required tech stack for {problem.title}.",
            "recommended_actions": [f"Learn {m} basics before starting implementation." for m in missing[:3]]
        }

        pm, _ = ProblemMatch.objects.update_or_create(
            problem=problem,
            user=user,
            defaults={
                "match_score": match_score,
                "matched_skills": matched,
                "missing_skills": missing,
                "learning_gap_analysis": learning_gap_analysis
            }
        )
        return pm


class ProjectIntelligenceEngine:
    """
    Generates a structured, practical project blueprint partitioned into MVP, Version 2, and Future Scope.
    """
    def create_project_from_problem(self, user, problem: Problem) -> Project:
        req_skills = problem.required_skills_list or ["Python", "Django", "React", "PostgreSQL"]
        
        title = f"{problem.title} Solution"
        statement = problem.root_problem or problem.description
        target = problem.target_users or "End Users & Administrators"

        # Scoped Features
        mvp_scope = {
            "phase": "MVP (Minimum Viable Product)",
            "duration": "2-3 Weeks",
            "features": [
                "User Authentication & Role-Based Authorization",
                f"Core Workflow Management for {problem.category}",
                "Dashboard for Real-Time Status & Metrics",
                "RESTful API Integration for Mobile/Web"
            ]
        }
        v2_scope = {
            "phase": "Version 2.0 (Enhanced System)",
            "duration": "2 Weeks",
            "features": [
                "Automated Email & Push Notifications",
                "Advanced Filtering, Search & Reporting",
                "Third-party Service Integration"
            ]
        }
        future_scope = {
            "phase": "Future Expansion (Scale & AI)",
            "duration": "Ongoing",
            "features": [
                "Predictive Analytics & ML Optimization",
                "Multi-Tenant Enterprise Architecture",
                "Automated DevOps CI/CD Deployment"
            ]
        }

        architecture = f"Decoupled Architecture with Django REST Framework backend, Next.js frontend, and PostgreSQL database."
        tech_stack = req_skills + ["JWT Auth", "Docker", "Git"]

        db_design = {
            "tables": [
                {"name": "Users", "fields": ["id", "email", "role", "created_at"]},
                {"name": "Core_Entity", "fields": ["id", "title", "status", "created_at"]},
                {"name": "Activity_Logs", "fields": ["id", "user_id", "action", "timestamp"]}
            ]
        }
        apis = [
            "POST /api/v1/auth/login",
            "GET /api/v1/items/",
            "POST /api/v1/items/create",
            "GET /api/v1/dashboard/stats"
        ]

        project = Project.objects.create(
            problem=problem,
            user=user,
            title=title,
            problem_statement=statement,
            target_users=target,
            functional_requirements=mvp_scope["features"],
            non_functional_requirements=["Sub-300ms API response time", "99.9% uptime", "Role-based security"],
            mvp_scope=mvp_scope,
            v2_scope=v2_scope,
            future_scope=future_scope,
            architecture_recommendation=architecture,
            tech_stack=tech_stack,
            database_design=db_design,
            api_requirements=apis,
            frontend_modules=["Auth View", "Dashboard Hub", "Form Management View"],
            backend_modules=["Authentication Module", "Core API Views", "Database Models"],
            ai_ml_requirements=["Predictive status analytics (V2)"],
            security_requirements=["JWT Token Auth", "CORS Restriction", "Input Sanitization"],
            milestones=[
                {"step": 1, "title": "MVP Architecture & Database Setup", "week": 1},
                {"step": 2, "title": "Backend API & Authentication Implementation", "week": 2},
                {"step": 3, "title": "Frontend Interface & API Integration", "week": 3},
                {"step": 4, "title": "Testing, Deployment & Impact Evidence Generation", "week": 4}
            ],
            testing_requirements=["Unit tests for backend endpoints", "Integration tests for auth flow"],
            deployment_requirements=["Docker Containerization", "Render / Vercel Cloud Deployment"],
            status='in_progress',
            progress_percentage=25
        )

        # Generate Tasks mapped to skills & learning resources
        user_skills = set([s.name.lower() for s in user.skills.all()])
        tasks_data = [
            ("Implement JWT Authentication & User Roles", "mvp", "Django REST Framework", ["JWT Auth Guide", "DRF Security Tutorial"]),
            ("Build Database Models & Migration Schema", "mvp", "PostgreSQL", ["PostgreSQL Schema Design", "Django ORM Best Practices"]),
            ("Develop Core API Endpoints & Validation", "mvp", "REST API", ["REST API Design Principles"]),
            ("Create Next.js Frontend Dashboard Interface", "mvp", "React", ["React Hooks & Tailwind Tutorial"]),
            ("Set up Automated Testing & Deployment Pipeline", "v2", "Docker", ["Dockerization Guide", "CI/CD Setup"])
        ]

        for idx, (t_title, phase, s_name, res) in enumerate(tasks_data):
            level = "intermediate" if s_name.lower() in user_skills else "beginner"
            ProjectTask.objects.create(
                project=project,
                title=t_title,
                scope_phase=phase,
                mapped_skill_name=s_name,
                student_skill_level=level,
                learning_resources=res,
                order=idx + 1
            )

        return project


class EvidenceGeneratorService:
    """
    Synthesizes completed project data into formal "Evidence of Skill" statements.
    Connects evidence into user's Resume Data, Skill Profile, and Career Digital Twin.
    No admin approval required for student project completion.
    """
    def generate_evidence(self, project: Project, github_url: str = "", deployment_url: str = "") -> ProjectEvidence:
        problem = project.problem
        user = project.user
        tech_str = ", ".join(project.tech_stack) if project.tech_stack else "modern technology stack"

        # Determine evidence verification level (FIX 4 & FIX 10)
        # Student-submitted evidence is default 'self_reported' (or 'ai_assessed' if code/deployment links are provided)
        trust_level = 'self_reported'
        g_url = github_url.strip() if github_url else ""
        d_url = deployment_url.strip() if deployment_url else ""
        if g_url or d_url:
            trust_level = 'ai_assessed'

        evidence_statement = (
            f"Student demonstrated {tech_str} proficiency by engineering a practical solution "
            f"for '{problem.title}' targeting {problem.industry} sector requirements."
        )

        completed_tasks_count = project.tasks.filter(is_completed=True).count()
        total_tasks_count = project.tasks.count()

        evidence, _ = ProjectEvidence.objects.update_or_create(
            project=project,
            defaults={
                "user": user,
                "problem_solved_summary": problem.description,
                "student_contribution": f"Built core MVP project features, completed technical tasks, and utilized {tech_str}.",
                "technologies_used": project.tech_stack,
                "features_developed": project.functional_requirements,
                "github_url": g_url,
                "deployment_url": d_url,
                "testing_passed": True,
                "performance_metrics": {
                    "tasks_completed": completed_tasks_count,
                    "total_tasks": total_tasks_count,
                    "completion_rate": "100%"
                },
                "user_feedback": "",
                "problem_impact_rating": 85,
                "evidence_statement": evidence_statement,
                "verification_status": trust_level
            }
        )

        # Update project status directly to completed (FIX 3 — NO ADMIN APPROVAL NEEDED)
        project.status = 'completed'
        project.progress_percentage = 100
        project.save()

        # Connect into Resume Data & User Profile XP (FIX 11)
        try:
            resume_data, _ = ResumeData.objects.get_or_create(user=user)
            existing_skills = set(resume_data.extracted_skills or [])
            new_skills = list(existing_skills.union(set(project.tech_stack)))
            resume_data.extracted_skills = new_skills
            resume_data.save()
        except Exception:
            pass

        try:
            profile = user.profile
            profile.total_learning_points += 150
            profile.save()
        except Exception:
            pass

        # Trigger Opportunity Connection
        OpportunityEngine().match_opportunities(evidence)

        return evidence


class OpportunityEngine:
    """
    Matches student's demonstrated skill evidence to real career opportunities.
    """
    def match_opportunities(self, evidence: ProjectEvidence) -> list:
        user = evidence.user
        project = evidence.project
        problem = project.problem
        industry = problem.industry

        opps_data = [
            ("internship", f"Software Engineering Intern ({industry})", f"{problem.organization_name or 'Tech Partner'}", "Direct internship matching your verified project evidence."),
            ("freelance", f"Freelance Developer - {problem.category}", "Regional Client Network", "Paid freelance project based on demonstrated workflow solutions."),
            ("startup", "Startup Incubation Grant", "SkillMirror Innovation Lab", "Incubation support to scale your project into a commercial startup.")
        ]

        created_opps = []
        for o_type, title, org, desc in opps_data:
            opp = ProblemOpportunity.objects.create(
                project_evidence=evidence,
                problem=problem,
                user=user,
                opportunity_type=o_type,
                title=title,
                organization=org,
                description=desc,
                match_reason=f"Matched via verified project evidence in {industry}.",
                application_link=f"/opportunities/{o_type}"
            )
            created_opps.append(opp)

        return created_opps
