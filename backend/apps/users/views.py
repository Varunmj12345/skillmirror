import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.db.models import Count, Sum
from .models import UserProfile, UserSkill, ActivityLog, Achievement, User
# from .serializers import (...) # Moved to local imports to fix circularity

from apps.roadmaps.models import Roadmap, RoadmapStep, ProgressTracker

from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
import random
from datetime import timedelta
from django.utils import timezone

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = User.objects.filter(email=email).first()
        if not user or not user.check_password(password):
            return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check 2FA
        profile, _ = UserProfile.objects.get_or_create(user=user)
        if profile.two_factor_enabled:
            code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
            profile.two_factor_code = code
            profile.two_factor_code_expires = timezone.now() + timedelta(minutes=10)
            profile.save()
            
            # Send Email
            send_mail(
                'Your 2FA Code - SkillMirror',
                f'Your security code is: {code}. It expires in 10 minutes.',
                'support@skillmirror.ai',
                [user.email],
                fail_silently=False,
            )
            return Response({'detail': '2FA code sent to your email.', '2fa_required': True, 'email': email}, status=status.HTTP_200_OK)

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {'email': user.email, 'username': user.username or user.email},
        })

class Verify2FAView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        user = User.objects.filter(email=email).first()
        if not user:
             return Response({'detail': 'User not found.'}, status=404)
        
        profile = user.profile
        if profile.two_factor_code == code and profile.two_factor_code_expires > timezone.now():
            profile.two_factor_code = None # Consume code
            profile.save()
            
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {'email': user.email, 'username': user.username or user.email},
            })
        return Response({'detail': 'Invalid or expired code.'}, status=400)

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        from .serializers import RegisterSerializer
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'detail': 'User created'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CareerDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .serializers import UserSkillSerializer, ActivityLogSerializer
        user = request.user
        profile, _ = UserProfile.objects.get_or_create(user=user)
        
        # Calculate dynamic stats
        skills_completed = UserSkill.objects.filter(user=user, level=5).count()
        total_skills = UserSkill.objects.filter(user=user).count()
        
        # Roadmap progress
        roadmaps = Roadmap.objects.filter(user_roadmaps__user=user)
        total_steps = RoadmapStep.objects.filter(roadmap__in=roadmaps).count()
        completed_steps = ProgressTracker.objects.filter(user=user, completed=True).count()

        roadmap_progress = int((completed_steps / total_steps * 100)) if total_steps > 0 else 0
        
        # Update profile metrics
        profile.calculate_completeness()
        
        # Mock suggestions based on skills
        skills_names = [s.name.lower() for s in UserSkill.objects.filter(user=user)]
        suggestions = []
        if profile.dream_job and "react" in profile.dream_job.lower() and "typescript" not in skills_names:
            suggestions.append({
                "text": "Your React skill is strong but TypeScript is missing. Adding TypeScript will increase job readiness by 12%.",
                "impact": 12
            })
        
        data = {
            "profile": {
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "dream_job": profile.dream_job,
                "experience_level": profile.experience_level,
                "market_readiness_level": profile.market_readiness_level,
                "job_readiness_score": profile.job_readiness_score,
                "profile_completeness": profile.profile_completeness,
                "total_learning_points": profile.total_learning_points,
                "current_streak": profile.current_streak,
                "two_factor_enabled": profile.two_factor_enabled,
                "profile_visibility": profile.profile_visibility,
            },
            "skills": UserSkillSerializer(UserSkill.objects.filter(user=user), many=True).data,
            "activities": ActivityLogSerializer(ActivityLog.objects.filter(user=user).order_by('-timestamp')[:10], many=True).data,
            "stats": {
                "skills_completed": skills_completed,
                "total_skills": total_skills,
                "roadmap_progress": roadmap_progress,
                "resume_score": 75, # Mock for now
                "chats_used": 5, # Mock for now
            },
            "suggestions": suggestions
        }
        return Response(data)

class SkillManagementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .serializers import UserSkillSerializer
        skills = UserSkill.objects.filter(user=request.user)
        return Response(UserSkillSerializer(skills, many=True).data)

    def post(self, request):
        from .serializers import UserSkillSerializer
        serializer = UserSkillSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            ActivityLog.objects.create(
                user=request.user,
                action_type='skill',
                description=f"Added skill: {serializer.validated_data['name']}",
                impact_score=5
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            skill = UserSkill.objects.get(pk=pk, user=request.user)
            skill.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except UserSkill.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        return Response({
            'username': request.user.username,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'experience_level': profile.experience_level,
            'dream_job': profile.dream_job,
            'country': profile.country,
            'has_resume': bool(profile.resume),
            'two_factor_enabled': profile.two_factor_enabled,
            'profile_visibility': profile.profile_visibility,
        })

    def put(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        u = request.user
        u.first_name = request.data.get('first_name', u.first_name)
        u.last_name = request.data.get('last_name', u.last_name)
        u.save()
        profile.dream_job = request.data.get('dream_job', profile.dream_job)
        profile.experience_level = request.data.get('experience_level', profile.experience_level)
        profile.country = request.data.get('country', profile.country)
        if 'two_factor_enabled' in request.data:
            profile.two_factor_enabled = request.data.get('two_factor_enabled')
        if 'profile_visibility' in request.data:
            profile.profile_visibility = request.data.get('profile_visibility')
        profile.save()
        return Response({'detail': 'Profile updated'})

class ResumeUploadView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        resume_file = request.FILES.get('resume')
        if not resume_file: return Response({'detail': 'No file.'}, status=400)
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        profile.resume = resume_file
        profile.save()
        ActivityLog.objects.create(user=request.user, action_type='resume', description="Uploaded new resume", impact_score=10)
        return Response({'detail': 'Resume uploaded.'})

class ForgotPasswordView(APIView):
    """
    POST /api/users/forgot-password/
    Body: { "email": "user@example.com" }

    Validates email, stores a secure UUID token in DB (15-min expiry),
    sends a real SMTP email with the reset link.
    NEVER exposes the token in the response.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        import uuid
        from .models import PasswordResetToken
        from django.core.mail import send_mail
        from django.conf import settings as django_settings

        email = request.data.get('email', '').strip().lower()

        if not email:
            return Response(
                {"status": "error", "message": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(email__iexact=email).first()

        # Always return success to prevent email enumeration
        if not user:
            return Response({
                "status": "success",
                "message": "If an account exists with this email, a password reset link has been sent."
            })

        # Purge any existing unused tokens for this user
        PasswordResetToken.objects.filter(user=user, is_used=False).delete()

        # Generate secure token and store in DB
        token = uuid.uuid4().hex + uuid.uuid4().hex  # 64-char hex token
        expiry = timezone.now() + timedelta(minutes=15)
        PasswordResetToken.objects.create(
            user=user,
            token=token,
            expires_at=expiry
        )

        # Build frontend reset URL (reads FRONTEND_URL from env, fallback to localhost)
        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        reset_link = f"{frontend_url}/reset-password?token={token}"

        # Email content (plain + HTML)
        plain_body = (
            f"Hello {user.first_name or user.email},\n\n"
            f"You requested a password reset for your SkillMirror account.\n\n"
            f"Click the link below to reset your password:\n{reset_link}\n\n"
            f"This link expires in 15 minutes.\n\n"
            f"If you did not request this, please ignore this email — your account is safe.\n\n"
            f"— The SkillMirror Team"
        )
        html_body = f"""
        <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;background:#0f172a;color:#f1f5f9;padding:40px;border-radius:16px;">
          <h1 style="color:#818cf8;font-size:22px;margin-bottom:4px;">SkillMirror</h1>
          <p style="color:#94a3b8;font-size:12px;margin-top:0;">AI Career Intelligence Platform</p>
          <hr style="border:1px solid #1e293b;margin:24px 0;" />
          <h2 style="font-size:20px;">Password Reset Request</h2>
          <p style="color:#cbd5e1;">Hello {user.first_name or user.email},</p>
          <p style="color:#cbd5e1;">We received a request to reset your SkillMirror password. Click the button below to set a new password:</p>
          <a href="{reset_link}"
             style="display:inline-block;margin:24px 0;padding:14px 32px;background:#6366f1;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
            Reset My Password
          </a>
          <p style="color:#64748b;font-size:13px;">This link will expire in <strong style="color:#f59e0b;">15 minutes</strong>.</p>
          <p style="color:#64748b;font-size:13px;">If you did not request a password reset, you can safely ignore this email.</p>
          <hr style="border:1px solid #1e293b;margin:24px 0;" />
          <p style="color:#475569;font-size:11px;">© 2025 SkillMirror · AI-Powered Career Intelligence</p>
        </div>
        """

        try:
            send_mail(
                subject='Password Reset Request — SkillMirror',
                message=plain_body,
                from_email=django_settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
                html_message=html_body,
            )
            print(f"✅ [PasswordReset] Email sent successfully to: {user.email}")
        except Exception as e:
            # Log internally but never expose details to client
            print(f"[PasswordReset] Email send failed for {user.email}: {e}")
            return Response(
                {"status": "error", "message": "Unable to send reset email. Please try again later."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        return Response({
            "status": "success",
            "message": "Password reset email successfully sent to user's inbox."
        })


class ResetPasswordView(APIView):
    """
    POST /api/users/reset-password/
    Body: { "token": "...", "password": "new_password" }

    Validates the DB token (not expired, not used), sets new password,
    marks token as used so it cannot be reused.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        from .models import PasswordResetToken

        token = request.data.get('token', '').strip()
        new_password = request.data.get('password', '').strip()

        if not token or not new_password:
            return Response(
                {"status": "error", "message": "Token and new password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 8:
            return Response(
                {"status": "error", "message": "Password must be at least 8 characters."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            reset_record = PasswordResetToken.objects.select_related('user').get(token=token)
        except PasswordResetToken.DoesNotExist:
            return Response(
                {"status": "error", "message": "Invalid reset link."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not reset_record.is_valid():
            return Response(
                {"status": "error", "message": "This reset link has expired or already been used. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Set new password
        user = reset_record.user
        user.set_password(new_password)
        user.save()

        # Consume the token — one-time use only
        reset_record.is_used = True
        reset_record.save()

        return Response({
            "status": "success",
            "message": "Password has been reset successfully. You can now log in."
        })


class ExportDataView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        data = {
            'user': {
                'email': user.email,
                'username': user.username,
                'date_joined': user.date_joined.isoformat(),
            },
            'profile': {
                'dream_job': profile.dream_job if profile else None,
                'experience_level': profile.experience_level if profile else None,
                'readiness_score': profile.job_readiness_score if profile else 0,
            },
            'skills': list(user.skills.values('name', 'level', 'category')),
            'activities': list(user.activities.values('action_type', 'description', 'timestamp'))
        }
        return Response(data)

class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]
    def delete(self, request):
        user = request.user
        user.delete()
        return Response({'detail': 'Account permanently deleted.'})