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
            'experience_level', 'dream_job', 'country', 'current_role', 
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
    experience_level = serializers.CharField(required=False, allow_blank=True)
    dream_job = serializers.CharField(required=False, allow_blank=True)
    country = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def create(self, validated_data):
        user = User(username=validated_data['username'], email=validated_data['email'])
        user.set_password(validated_data['password'])
        user.save()
        profile, _ = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'experience_level': validated_data.get('experience_level', ''),
                'dream_job': validated_data.get('dream_job', ''),
                'country': validated_data.get('country', ''),
            }
        )
        return user

class ProfileUpdateSerializer(serializers.Serializer):
    username = serializers.CharField(required=False)
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    experience_level = serializers.CharField(required=False)
    dream_job = serializers.CharField(required=False)
    country = serializers.CharField(required=False)