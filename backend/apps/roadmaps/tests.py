from django.test import TestCase
from .models import Roadmap

class RoadmapModelTest(TestCase):
    def setUp(self):
        self.roadmap = Roadmap.objects.create(
            title="Sample Roadmap",
            description="A roadmap for testing purposes."
        )

    def test_roadmap_creation(self):
        self.assertEqual(self.roadmap.title, "Sample Roadmap")
        self.assertEqual(self.roadmap.description, "A roadmap for testing purposes.")

    def test_roadmap_str(self):
        self.assertEqual(str(self.roadmap), "Sample Roadmap")