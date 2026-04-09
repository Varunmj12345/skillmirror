from rest_framework import serializers
from .models import Job, JobApplication, JobData, UserJobMatch
from apps.skills.serializers import SkillSerializer

class JobSerializer(serializers.ModelSerializer):
    required_skills = SkillSerializer(many=True, read_only=True)
    
    class Meta:
        model = Job
        fields = '__all__'

class JobApplicationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    
    class Meta:
        model = JobApplication
        fields = '__all__'

class JobDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobData
        fields = '__all__'

class UserJobMatchSerializer(serializers.ModelSerializer):
    job_data = JobDataSerializer(read_only=True)
    
    class Meta:
        model = UserJobMatch
        fields = '__all__'