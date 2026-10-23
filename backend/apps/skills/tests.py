from django.test import TestCase
from .models import Skill
from .analysis import extract_skills_from_text, extract_resume_details, clean_and_normalize_text

class SkillModelTest(TestCase):

    def setUp(self):
        self.skill, _ = Skill.objects.get_or_create(name="CustomTestLang", defaults={"description": "Test Language"})

    def test_skill_creation(self):
        skill = Skill.objects.get(name="CustomTestLang")
        self.assertEqual(skill.name, "CustomTestLang")
        self.assertEqual(skill.description, "Test Language")

    def test_skill_str(self):
        skill = Skill.objects.get(name="CustomTestLang")
        self.assertEqual(str(skill), "CustomTestLang")

    def test_resume_skill_extraction(self):
        sample = "Full Stack Engineer with Python, React, Next.js, and Docker skills."
        skills = extract_skills_from_text(sample)
        self.assertIn("Python", skills)
        self.assertIn("React", skills)
        self.assertIn("Docker", skills)

    def test_resume_detail_parsing(self):
        sample = "John Doe\njohn@example.com | (555) 123-4567 | linkedin.com/in/johndoe\nExperience\nSoftware Engineer at TechCorp\n• Built APIs with Django"
        details = extract_resume_details(sample)
        self.assertEqual(details["personal"]["email"], "john@example.com")
        self.assertIn("johndoe", details["personal"]["linkedin"])
        self.assertIn("Django", details["skills"])