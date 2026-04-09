from rest_framework import serializers
from .models import Roadmap, RoadmapStep, UserRoadmap

class RoadmapStepSerializer(serializers.ModelSerializer):
    skills = serializers.ReadOnlyField(source='skills_list')
    class Meta:
        model = RoadmapStep
        fields = ['id', 'title', 'description', 'order', 'skills', 'duration_weeks', 'estimated_hours', 'recommended_resources']

class RoadmapSerializer(serializers.ModelSerializer):
    steps = RoadmapStepSerializer(many=True, read_only=True)

    class Meta:
        model = Roadmap
        fields = ['id', 'title', 'description', 'required_skills', 'created_at', 'updated_at', 'steps']

class UserRoadmapSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRoadmap
        fields = ['id', 'user', 'roadmap', 'progress']
