from django.test import TestCase
from .models import Skill

class SkillModelTest(TestCase):

    def setUp(self):
        Skill.objects.create(name="Python", proficiency_level="Expert")
        Skill.objects.create(name="JavaScript", proficiency_level="Intermediate")

    def test_skill_creation(self):
        python_skill = Skill.objects.get(name="Python")
        javascript_skill = Skill.objects.get(name="JavaScript")
        self.assertEqual(python_skill.proficiency_level, "Expert")
        self.assertEqual(javascript_skill.proficiency_level, "Intermediate")

    def test_skill_str(self):
        skill = Skill.objects.get(name="Python")
        self.assertEqual(str(skill), "Python")