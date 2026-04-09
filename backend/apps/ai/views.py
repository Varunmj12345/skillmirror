from rest_framework import viewsets
from rest_framework.response import Response
from .models import AIModel
from .serializers import AIModelSerializer

class AIModelViewSet(viewsets.ModelViewSet):
    queryset = AIModel.objects.all()
    serializer_class = AIModelSerializer

    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=201)

    def update(self, request, pk=None):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, pk=None):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=204)


from rest_framework.views import APIView
from rest_framework import permissions


class GenerateRoadmapView(APIView):
    """Mock AI endpoint that returns a structured roadmap JSON for a given job/skills."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        job = data.get('job') or data.get('target_job')
        skills = data.get('skills', [])
        roadmap = {
            'title': f"Roadmap for {job if job else 'your goal'}",
            'steps': [
                {'order': 1, 'title': 'Foundations', 'description': 'Learn basics', 'skills': skills[:2]},
                {'order': 2, 'title': 'Intermediate Projects', 'description': 'Build projects', 'skills': skills[2:4]},
                {'order': 3, 'title': 'Advanced Topics', 'description': 'Deepen knowledge', 'skills': skills[4:]},
            ]
        }
        return Response(roadmap)


import os
from groq import Groq

class CareerChatView(APIView):
    """AI Career Assistant - returns real AI career advice using Groq Llama 3."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        msg = request.data.get('message', '')
        if not msg:
            return Response({'reply': "I'm listening! Ask me anything about your career."})

        api_key = os.environ.get('GROQ_API_KEY')
        if not api_key or api_key == 'gsk_your_key_here':
            # Fallback to mock logic if no real key provided
            return self._mock_response(msg, request.user)

        try:
            client = Groq(api_key=api_key)
            
            # Get user context
            user_context = ""
            try:
                from apps.users.models import UserProfile
                profile = UserProfile.objects.get(user=request.user)
                user_context = f"User is aiming for: {profile.dream_job or 'Unknown'}. Experience level: {profile.experience_level or 'Unknown'}."
            except:
                pass

            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": f"You are SkillMirror AI, a helpful career assistant. {user_context} Provide concise, actionable career advice. If the user asks for a roadmap, guide them to use our dedicated Analyzer section."},
                    {"role": "user", "content": msg}
                ],
                max_tokens=500,
                temperature=0.7,
            )
            reply = completion.choices[0].message.content
            return Response({'reply': reply})
        except Exception as e:
            print(f"Groq API Error: {e}")
            return Response({'reply': "I'm having trouble connecting to my brain right now. Please try again later."}, status=500)

    def _mock_response(self, msg, user):
        msg = msg.lower()
        try:
            from apps.users.models import UserProfile
            profile = UserProfile.objects.get(user=user)
            dream_job = profile.dream_job or 'Software Developer'
        except Exception:
            dream_job = 'Software Developer'

        responses = {
            'roadmap': f"Go to the Career Roadmap page and select your goal (e.g. {dream_job}). I'll generate a personalized step-by-step plan.",
            'skills': "Check the Skills section on your Dashboard. Add skills you have and review the Recommended Skills to grow.",
            'resume': "Upload your resume in the Dashboard. I'll help you identify gaps and suggest improvements.",
            'career': f"Based on your profile, consider focusing on {dream_job}. Build projects, network, and track progress weekly.",
            'help': "I can help with: roadmap (career path), skills (what to learn), resume (upload & tips), career (general advice). Ask me anything!",
        }
        reply = "I'm your AI Career Assistant. (Live mode disabled, please add GROQ_API_KEY). Try asking about your roadmap, skills, resume, or career advice."
        for key, resp in responses.items():
            if key in msg or msg.startswith(key[:3]):
                reply = resp
                break
        return Response({'reply': reply})

import random

class PredictDemandView(APIView):
    """
    Predict future demand for a job role.
    Returns: Growth %, Stability Score, Risk Level, Insight.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        role = request.query_params.get('role', 'Unknown Role')
        
        # Mock AI Prediction Logic
        growth_percentage = round(random.uniform(-5.0, 25.0), 1)
        stability_score = random.randint(50, 95)
        
        if growth_percentage > 10:
            risk_level = 'Low'
            insight = f"Demand for {role} is skyrocketing! Companies are heavily investing in this area."
        elif growth_percentage > 0:
            risk_level = 'Medium'
            insight = f"{role} roles are seeing steady growth, aligning with general market trends."
        else:
            risk_level = 'High'
            insight = f"The market for {role} is currently saturating. Consider upskilling in adjacent areas."

        return Response({
            'role': role,
            'predicted_growth': growth_percentage,
            'stability_score': stability_score,
            'risk_level': risk_level,
            'insight': insight
        })