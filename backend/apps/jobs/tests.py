from django.test import TestCase
from .models import Job

class JobModelTest(TestCase):

    def setUp(self):
        Job.objects.create(title="Software Engineer", description="Develop and maintain software applications.", company="Tech Corp", location="Remote", salary=100000)

    def test_job_creation(self):
        job = Job.objects.get(title="Software Engineer")
        self.assertEqual(job.description, "Develop and maintain software applications.")
        self.assertEqual(job.company, "Tech Corp")
        self.assertEqual(job.location, "Remote")
        self.assertEqual(job.salary, 100000)

    def test_job_str(self):
        job = Job.objects.get(title="Software Engineer")
        self.assertEqual(str(job), "Software Engineer at Tech Corp")