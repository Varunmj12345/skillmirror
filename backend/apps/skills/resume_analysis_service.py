# resume_analysis_service.py
"""Service layer that orchestrates resume extraction and stores a structured profile.
It uses the lightweight ``resume_extractor`` utilities and populates the
``ResumeProfile`` model. All heavy‑lifting is intentionally simple to avoid extra
dependencies – the service can be expanded later without touching callers.
"""
import logging
from typing import Any

from django.core.files.uploadedfile import UploadedFile

# Local imports – these resolve because ``apps.skills`` is a Django app.
from .resume_extractor import extract_text_from_file, extract_resume_details, extract_skills_from_text
from .models import ResumeProfile

logger = logging.getLogger(__name__)


class ResumeAnalysisService:
    @staticmethod
    def analyze(user: Any, uploaded_file: UploadedFile) -> ResumeProfile:
        """Extract information from ``uploaded_file`` and upsert a ``ResumeProfile``.
        The function is best‑effort: if extraction fails we still create an empty
        profile so that downstream engines have something to read.
        """
        # 1. Pull raw text – supports txt/docx, returns "" for PDF/unknown.
        raw_text = extract_text_from_file(uploaded_file)
        # 2. Parse structured sections.
        parsed = extract_resume_details(raw_text) if raw_text else {}
        # 3. Fallback skill extraction if not captured.
        if not parsed.get("skills"):
            parsed["skills"] = extract_skills_from_text(raw_text)
        # 4. Build the dict matching ResumeProfile fields.
        profile_data = {
            "personal_details": {},  # can be extended later
            "summary": parsed.get("summary", ""),
            "skills": parsed.get("skills", []),
            "experience": parsed.get("experience", []),
            "education": parsed.get("education", []),
            "projects": parsed.get("projects", []),
            "certifications": parsed.get("certifications", []),
            "achievements": [],
            "template_config": {},
        }
        # 5. Upsert model.
        profile, _ = ResumeProfile.objects.update_or_create(user=user, defaults=profile_data)
        logger.info("[ResumeAnalysis] Profile updated for user %s", user.id)
        return profile
