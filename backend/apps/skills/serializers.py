from rest_framework import serializers
from .models import (
    Skill, SkillGapReport, RequiredSkill, ResumeData, ResumeHistory, 
    ResumeBuilderProfile, UserSkill, CommunityTemplate, CustomTemplate, GeneratedResume
)

class ResumeDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeData
        fields = ['id', 'extracted_skills', 'resume_file', 'created_at', 'updated_at']
        read_only_fields = ['extracted_skills']


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']


class UserSkillSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only=True)
    skill_id = serializers.IntegerField(write_only=True, required=True)

    class Meta:
        model = UserSkill
        fields = ['id', 'skill', 'skill_id', 'category', 'level', 'progress_percentage', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        skill_id = validated_data.pop('skill_id')
        skill = Skill.objects.get(pk=skill_id)
        obj, _ = UserSkill.objects.update_or_create(user=user, skill=skill, defaults=validated_data)
        return obj

class SkillGapReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillGapReport
        fields = '__all__'

class RequiredSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequiredSkill
        fields = '__all__'

class ResumeHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeHistory
        fields = '__all__'

class ResumeBuilderProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeBuilderProfile
        fields = '__all__'

class CommunityTemplateSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = CommunityTemplate
        fields = ['id', 'name', 'description', 'category', 'config', 'use_count', 'created_at', 'created_by_name']
        read_only_fields = ['id', 'use_count', 'created_at', 'created_by_name']

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() or obj.created_by.email.split('@')[0]

class CustomTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomTemplate
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']

class GeneratedResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneratedResume
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'version_number']