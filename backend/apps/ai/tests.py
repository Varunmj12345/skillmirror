from django.test import TestCase
from rest_framework.test import APIClient
from unittest.mock import patch

class SkillAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_get_skills(self):
        resp = self.client.get("/api/skills/")
        self.assertEqual(resp.status_code, 200)

    @patch("urllib.request.urlopen")
    def test_some_ai_call(self, mock_urlopen):
        mock_urlopen.return_value = None
        # run code that would call urlopen
