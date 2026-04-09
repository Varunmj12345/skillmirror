from rest_framework import serializers
from .models import MockInterview, MockInterviewQuestion, LiveInterviewSession

class MockInterviewQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MockInterviewQuestion
        fields = '__all__'

class MockInterviewSerializer(serializers.ModelSerializer):
    questions = MockInterviewQuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = MockInterview
        fields = '__all__'
        read_only_fields = ['user', 'total_score', 'ai_summary', 'is_completed', 'created_at']

class LiveInterviewSessionSerializer(serializers.ModelSerializer):
    mock_interview_details = MockInterviewSerializer(source='mock_interview', read_only=True)
    
    class Meta:
        model = LiveInterviewSession
        fields = '__all__'
