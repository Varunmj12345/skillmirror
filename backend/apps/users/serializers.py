from rest_framework import serializers
from apps.users.models import User, UserProfile, UserSkill, ActivityLog, Achievement

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user

class UserSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSkill
        fields = ['id', 'name', 'category', 'level', 'verified']

class ActivityLogSerializer(serializers.ModelSerializer):
    action_type_display = serializers.CharField(source='get_action_type_display', read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = ['id', 'action_type', 'action_type_display', 'description', 'impact_score', 'timestamp']

class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['id', 'title', 'description', 'badge_type', 'earned_at']

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'experience_level', 'dream_job', 'country', 'current_role', 'role',
            'market_readiness_level', 'job_readiness_score', 'profile_completeness',
            'current_streak', 'total_learning_points'
        ]

class CareerDashboardSerializer(serializers.Serializer):
    profile = UserProfileSerializer()
    skills = UserSkillSerializer(many=True)
    activities = ActivityLogSerializer(many=True)
    achievements = AchievementSerializer(many=True)
    stats = serializers.DictField()
    suggestions = serializers.ListField()

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(required=False, default='student')
    experience_level = serializers.CharField(required=False, allow_blank=True)
    dream_job = serializers.CharField(required=False, allow_blank=True)
    country = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        import re
        email = (value or '').strip().lower()
        if not email or '@' not in email:
            raise serializers.ValidationError('Please enter a valid Gmail address (e.g. yourname@gmail.com).')

        local_part, domain = email.rsplit('@', 1)
        if domain not in ('gmail.com', 'googlemail.com'):
            raise serializers.ValidationError('Registration requires a valid Google Gmail account (@gmail.com).')

        # Enforce Google Gmail username rules: 6-30 chars, alphanumeric + single dots, no leading/trailing dots
        if len(local_part) < 6 or len(local_part) > 30:
            raise serializers.ValidationError('Gmail username must be between 6 and 30 characters before @gmail.com.')
        if not re.match(r'^[a-z0-9]+(\.[a-z0-9]+)*$', local_part):
            raise serializers.ValidationError('Enter a real Gmail ID (only letters, numbers, and non-consecutive periods allowed).')

        normalized_handle = local_part.replace('.', '')
        blocked_handles = {
            'testuser', 'testing', 'example', 'sampleuser', 'adminuser',
            'user123', 'user1234', 'demoaccount', 'fakeemail', 'qwerty',
            '123456', '1234567', '12345678', '123456789', 'abcdef', 'abcdefgh',
        }
        if normalized_handle in blocked_handles or len(set(normalized_handle)) <= 2:
            raise serializers.ValidationError('Please use your real personal Gmail ID to sign up.')

        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError('A user with this Gmail address already exists.')
        return email

    def create(self, validated_data):
        user = User(username=validated_data['username'], email=validated_data['email'])
        user.set_password(validated_data['password'])
        user.save()
        role = validated_data.get('role', 'student')
        if role != 'admin':
            role = 'student'

        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'role': role,
                'experience_level': validated_data.get('experience_level', ''),
                'dream_job': validated_data.get('dream_job', ''),
                'country': validated_data.get('country', ''),
                'subscription_plan': 'free',
                'credits_remaining': 10,
                'credits_limit': 10,
            }
        )
        if not created:
            profile.role = role
            profile.subscription_plan = 'free'
            profile.credits_remaining = 10
            profile.credits_limit = 10
            profile.save()
        return user

class ProfileUpdateSerializer(serializers.Serializer):
    username = serializers.CharField(required=False)
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    role = serializers.CharField(required=False)
    experience_level = serializers.CharField(required=False)
    dream_job = serializers.CharField(required=False)
    country = serializers.CharField(required=False)