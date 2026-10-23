from datetime import timedelta
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from apps.problems.models import Problem, ProjectRequirement
from apps.problems.services import LiveUrlVerificationService
from apps.roadmaps.models import Roadmap, RoadmapStep, UserRoadmap
from apps.skills.analysis import validate_uploaded_document
from apps.skills.models import CommunityTemplate
from apps.users.models import PasswordResetToken, User, UserProfile


class SecurityAndPerfAuditTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()

        self.owner = User.objects.create_user(
            username='owner_user',
            email='owner@example.com',
            password='StrongPassword!2026',
        )
        UserProfile.objects.get_or_create(user=self.owner, defaults={'role': 'student'})

        self.attacker = User.objects.create_user(
            username='attacker_user',
            email='attacker@example.com',
            password='StrongPassword!2026',
        )
        UserProfile.objects.get_or_create(user=self.attacker, defaults={'role': 'student'})

    def test_sec15_ssrf_requires_auth_and_blocks_internal_ips(self):
        # Unauthenticated request must be rejected
        res = self.client.post('/api/problems/projects/check-live-url/', {'url': 'https://example.com'}, format='json')
        self.assertEqual(res.status_code, 401)

        # Internal / loopback / metadata targets must be blocked before network I/O
        svc = LiveUrlVerificationService()
        for blocked_url in (
            'http://127.0.0.1:8000/admin/',
            'http://localhost:8000/api/health/deep/',
            'http://169.254.169.254/latest/meta-data/',
            'http://10.0.0.1/internal',
            'http://192.168.1.1/router',
            'ftp://example.com/file',
        ):
            result = svc.check_live_url(blocked_url)
            self.assertFalse(result['is_valid'], f"Expected {blocked_url} to be blocked")
            self.assertEqual(result['status'], 'unreachable')

    def test_sec09_ai_chat_requires_authentication(self):
        res = self.client.post('/api/ai/chat/', {'message': 'Hello'}, format='json')
        self.assertEqual(res.status_code, 401)

    def test_sec10_sec11_problem_idor_and_moderation_access_control(self):
        problem = Problem.objects.create(
            title='Owner Problem',
            description='Detailed problem description for testing IDOR protection.',
            submitted_by=self.owner,
        )
        req = ProjectRequirement.objects.create(
            problem=problem,
            requirement_id='REQ-1',
            title='Must be secure',
            req_type='functional',
        )

        # Attacker cannot confirm requirements or trigger validation/analysis
        self.client.force_authenticate(user=self.attacker)
        r1 = self.client.post(f'/api/problems/{problem.id}/confirm-req/{req.requirement_id}/', {'action': 'confirm'}, format='json')
        self.assertEqual(r1.status_code, 403)

        r2 = self.client.post(f'/api/problems/{problem.id}/analyze/', format='json')
        self.assertEqual(r2.status_code, 403)

        r3 = self.client.post(f'/api/problems/{problem.id}/validate/', format='json')
        self.assertEqual(r3.status_code, 403)

        r4 = self.client.get(f'/api/problems/{problem.id}/duplicates/')
        self.assertEqual(r4.status_code, 403)

        # Problem owner can confirm requirements
        self.client.force_authenticate(user=self.owner)
        r_owner = self.client.post(f'/api/problems/{problem.id}/confirm-req/{req.requirement_id}/', {'action': 'confirm'}, format='json')
        self.assertEqual(r_owner.status_code, 200)
        req.refresh_from_db()
        self.assertEqual(req.status, 'confirmed')

    def test_sec12_roadmap_idor_blocked(self):
        roadmap = Roadmap.objects.create(title='Owner Roadmap', description='Desc')
        UserRoadmap.objects.create(user=self.owner, roadmap=roadmap)
        step = RoadmapStep.objects.create(roadmap=roadmap, title='Phase 1', description='Step 1', order=1)

        self.client.force_authenticate(user=self.attacker)
        self.assertEqual(self.client.get(f'/roadmaps/{roadmap.id}/').status_code, 403)
        self.assertEqual(self.client.delete(f'/roadmaps/{roadmap.id}/').status_code, 403)
        self.assertEqual(self.client.get(f'/roadmaps/ai/recommend/?roadmap_id={roadmap.id}').status_code, 403)
        self.assertEqual(self.client.post('/roadmaps/progress/', {'step_id': step.id, 'completed': True}, format='json').status_code, 403)
        self.assertEqual(self.client.get(f'/roadmaps/mini-mock/?step_id={step.id}').status_code, 403)
        self.assertTrue(Roadmap.objects.filter(id=roadmap.id).exists())

    def test_sec13_community_template_idor_blocked(self):
        tpl = CommunityTemplate.objects.create(
            name='Clean Template',
            description='Approved template',
            created_by=self.owner,
            is_approved=True,
        )
        self.client.force_authenticate(user=self.attacker)
        res_del = self.client.delete(f'/api/skills/resume/community-templates/{tpl.id}/')
        self.assertEqual(res_del.status_code, 403)
        self.assertTrue(CommunityTemplate.objects.filter(id=tpl.id).exists())

    def test_sec06_2fa_brute_force_lockout(self):
        profile = self.owner.profile
        profile.two_factor_enabled = True
        profile.two_factor_code = '654321'
        profile.two_factor_code_expires = timezone.now() + timedelta(minutes=10)
        profile.save()

        # 5 wrong attempts should invalidate the OTP and lock out further attempts
        for i in range(5):
            r = self.client.post('/api/users/verify-2fa/', {'email': self.owner.email, 'code': '000000'}, format='json')
            self.assertEqual(r.status_code, 400)

        # 6th attempt even with the original code must fail with 429 and code must be cleared
        r_locked = self.client.post('/api/users/verify-2fa/', {'email': self.owner.email, 'code': '654321'}, format='json')
        self.assertEqual(r_locked.status_code, 429)
        profile.refresh_from_db()
        self.assertIsNone(profile.two_factor_code)

    def test_sec07_password_reset_enforces_validators(self):
        token_obj = PasswordResetToken.objects.create(
            user=self.owner,
            token='valid-reset-token-12345',
            expires_at=timezone.now() + timedelta(minutes=15),
        )
        # Common password ('password123') has >=8 chars but must be rejected by CommonPasswordValidator
        res = self.client.post('/api/users/reset-password/', {
            'token': token_obj.token,
            'password': 'password123',
        }, format='json')
        self.assertEqual(res.status_code, 400)
        token_obj.refresh_from_db()
        self.assertFalse(token_obj.is_used)

    def test_sec17_file_upload_validation_blocks_html_and_spoofed_pdf(self):
        html_file = SimpleUploadedFile('exploit.html', b'<script>alert(1)</script>', content_type='text/html')
        ok, err, _ = validate_uploaded_document(html_file)
        self.assertFalse(ok)
        self.assertIn('Unsupported file type', err)

        spoofed_pdf = SimpleUploadedFile('resume.pdf', b'<html>not a pdf</html>', content_type='application/pdf')
        ok2, err2, _ = validate_uploaded_document(spoofed_pdf)
        self.assertFalse(ok2)
        self.assertIn('%PDF-', err2)

        valid_pdf = SimpleUploadedFile('resume.pdf', b'%PDF-1.4\n1 0 obj\n<<>>\nendobj\n', content_type='application/pdf')
        ok3, err3, ext3 = validate_uploaded_document(valid_pdf)
        self.assertTrue(ok3)
        self.assertIsNone(err3)
        self.assertEqual(ext3, 'pdf')

    def test_perf01_problem_list_no_n_plus_one_queries(self):
        for i in range(8):
            p = Problem.objects.create(title=f'Prob {i}', description='Desc', submitted_by=self.owner)
            ProjectRequirement.objects.create(problem=p, requirement_id=f'R-{i}', title='Req', req_type='functional')

        with self.assertNumQueries(3):
            res = self.client.get('/api/problems/')
            self.assertEqual(res.status_code, 200)
            self.assertEqual(len(res.data), 8)
