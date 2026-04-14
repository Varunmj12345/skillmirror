from rest_framework import viewsets
from rest_framework.response import Response
from apps.ai.models import AIModel
from apps.ai.serializers import AIModelSerializer
from apps.ai.IntelligenceEngine import NeuralIntelligenceEngine

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


from apps.roadmaps.models import Roadmap, RoadmapStep, UserRoadmap
from apps.users.models import UserProfile

class GenerateRoadmapView(APIView):
    """
    Intelligent Career Roadmap Optimizer.
    Generates a persistent, multi-phase learning path based on 
    identified skill gaps and target job requirements.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        if not profile:
            return Response({'error': 'User profile not found.'}, status=400)

        target_job = profile.dream_job or "Software Engineer"
        engine = NeuralIntelligenceEngine()
        gaps = engine.identify_gaps(user)

        if not gaps:
            return Response({'message': 'You already have high alignment with this role! Consider an advanced specialization.'})

        # Clear existing roadmaps (Maintain single active path as requested)
        UserRoadmap.objects.filter(user=user).delete()
        Roadmap.objects.filter(userroadmaps__user=user).delete()

        # Create Roadmap
        roadmap = Roadmap.objects.create(
            title=f"The {target_job} Evolution Path",
            description=f"A personalized execution plan to bridge {len(gaps)} detected skill gaps and reach target job-readiness.",
            required_skills=[g['name'] for g in gaps]
        )
        UserRoadmap.objects.create(user=user, roadmap=roadmap)

        # Split gaps into 3 logical phases
        phase1_skills = [g for g in gaps if g['importance'] >= 4]
        phase2_skills = [g for g in gaps if g['importance'] == 3 and g['category'] == 'technical']
        phase3_skills = [g for g in gaps if g not in phase1_skills and g not in phase2_skills]

        # Phase 1: Mission-Critical Foundations
        if phase1_skills:
            RoadmapStep.objects.create(
                roadmap=roadmap,
                order=1,
                title="Mission-Critical Foundations",
                description="Acquire the mandatory skills required for foundational role stability.",
                skills_list=[s['name'] for s in phase1_skills],
                duration_weeks=len(phase1_skills) * 1, # Accelerated: 1 week per skill
                estimated_hours=len(phase1_skills) * 15,
                difficulty='advanced' if len(phase1_skills) > 3 else 'intermediate'
            )

        # Phase 2: Technical Specialization
        if phase2_skills:
            RoadmapStep.objects.create(
                roadmap=roadmap,
                order=2,
                title="Technical Specialization",
                description="Master the core secondary technologies that separate competitive candidates.",
                skills_list=[s['name'] for s in phase2_skills],
                duration_weeks=len(phase2_skills) * 2, # Standard depth: 2 weeks per skill
                estimated_hours=len(phase2_skills) * 20,
                difficulty='intermediate'
            )

        # Phase 3: Ecosystem & Industry Polish
        if phase3_skills:
            RoadmapStep.objects.create(
                roadmap=roadmap,
                order=3,
                title="Ecosystem & Industry Polish",
                description="Finalize your toolkit with secondary tools and high-impact soft skills.",
                skills_list=[s['name'] for s in phase3_skills],
                duration_weeks=int(len(phase3_skills) * 1.5), # Polish: 1.5 weeks per skill
                estimated_hours=len(phase3_skills) * 10,
                difficulty='beginner'
            )

        # Prepare Response (Standard Serializer-style output)
        steps_data = []
        for step in roadmap.steps.all():
            steps_data.append({
                "id": step.id,
                "order": step.order,
                "title": step.title,
                "description": step.description,
                "skills_list": step.skills_list,
                "duration_weeks": step.duration_weeks,
                "estimated_hours": step.estimated_hours,
                "difficulty": step.difficulty,
                "completed": False
            })

        return Response({
            "id": roadmap.id,
            "title": roadmap.title,
            "description": roadmap.description,
            "required_skills": roadmap.required_skills,
            "steps": steps_data,
            "completion_percentage": 0
        })


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


class CareerIntelligenceReportView(APIView):
    """
    High-impact Career Intelligence Engine.
    Generates structured, data-driven reports using computed metrics.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        engine = NeuralIntelligenceEngine()
        data = engine.get_career_intelligence_data(request.user)
        
        # System Prompt construction using user provided strict template
        system_prompt = f"""
You are an AI Career Intelligence Engine integrated into a real system.
This is NOT a chatbot. This is a system-generated intelligence report.

SYSTEM INPUT (DO NOT RE-CALCULATE):
User Profile:
- Skills: {data['user_skills']}
- Projects: {data['projects']}
- Experience Level: {data['experience']}
- Target Role: {data['target_role']}

Precomputed Metrics:
- Career Risk Score: {data['risk_score']}
- Confidence Score: {data['confidence_score']}
- Skill Scores: {data['skill_scores']}
- Market Demand Score: {data['market_score']}
- Learning Activity Score: {data['activity_score']}
- Competition Score: {data['competition_score']}

Simulation Data:
- Scenario A (No Action): {data['no_action']}
- Scenario B (Moderate Learning): {data['moderate']}
- Scenario C (Smart Learning): {data['smart']}

Market Intelligence:
- Trending Skills: {data['trending_skills']}
- Declining Skills: {data['declining_skills']}

Peer Benchmark:
- User Percentile: {data['percentile']}
- Peer Skill Gap: {data['peer_gap']}

STRICT RULES:
- DO NOT generate or assume new numbers
- DO NOT recalculate scores
- ONLY interpret given structured data
- Maintain analytical, professional, and slightly strict tone
- No fluff, only insights
"""

        api_key = os.environ.get('GROQ_API_KEY')
        if not api_key or api_key == 'gsk_your_key_here':
            return Response({'report': self._get_fallback_report(data), 'metrics': data})

        try:
            client = Groq(api_key=api_key)
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": "Generate the full Career Intelligence Dashboard Report based on the provided system inputs."}
                ],
                max_tokens=2000,
                temperature=0.3, # Low temperature for analytical consistency
            )
            report = completion.choices[0].message.content
            return Response({'report': report, 'metrics': data})
        except Exception as e:
            print(f"Career Intelligence View Error: {e}")
            return Response({'report': self._get_fallback_report(data), 'metrics': data})

    def _get_fallback_report(self, data):
        return f"### 🔴 Career Intelligence Diagnostic Report (Fallback Mode)\n\n**Risk Score**: {data['risk_score']}/100\n**Confidence**: {data['confidence_score']}%\n\nAnalyze your career risks manually using the metrics above until the analytical engine is back online."

class ResumeIntelligenceReportView(APIView):
    """
    High-impact Resume Intelligence Engine.
    Generates structured, data-driven insights about a user's resume.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        engine = NeuralIntelligenceEngine()
        data = engine.get_resume_intelligence_data(request.user)
        
        system_prompt = f"""
You are a Resume Intelligence Engine integrated into a production-grade system.

This system functions as a Resume Decision Support Engine, NOT a resume scoring or suggestion tool.

You do NOT behave like a chatbot.
You generate structured, analytical, and decision-level insights using system-provided data.

This system separates:
- System Metrics (computed by backend engine)
- AI Insights (interpretation layer only)

You MUST act strictly as an interpretation layer.

---

SYSTEM INPUT (DO NOT RE-CALCULATE OR MODIFY):

User Profile:
- Skills: {data['user_skills']}
- Projects: {data['projects']}
- Experience Level: {data['experience']}
- Target Role: {data['target_role']}

Resume Data:
- Resume Score (ATS): {data['resume_score']}
- Extracted Skills: {data['extracted_skills']}
- Project Details: {data['project_data']}

Market Intelligence:
- Trending Skills: {data['trending_skills']}
- Declining Skills: {data['declining_skills']}

Benchmark Data:
- Average Skills for Role: {data['avg_skills']}
- Top Candidate Profile: {data['top_profile']}

System Metrics:
- Confidence Score: {data['confidence_score']}


STRICT SYSTEM RULES:

- DO NOT generate, assume, or hallucinate numerical values
- DO NOT recalculate any score or metric
- ONLY interpret provided structured data
- DO NOT behave conversationally
- DO NOT include motivational or generic advice
- DO NOT repeat input blindly — analyze it

OUTPUT must strictly follow defined structure.

---

OUTPUT FORMAT:

1. 🔴 RESUME OVERVIEW

- ATS Score: {data['resume_score']}
- Resume Strength Level: (Weak / Moderate / Strong)
- Confidence Score: {data['confidence_score']}%

Interpretation:
- Explain what the ATS score indicates in real hiring conditions
- Explain reliability of analysis using confidence score

---

2. 📊 MARKET RELEVANCE ANALYSIS

Evaluate resume alignment with current job market.

Include:
- Missing high-demand (trending) skills
- Presence of declining or outdated skills
- Alignment with target role expectations

---

3. ⚠️ RESUME RISK ANALYSIS

- Risk Level: (Low / Medium / High)

Identify key risk drivers:
- Weak or low-impact projects
- Lack of specialization
- Insufficient real-world exposure

Explain how these reduce hiring probability.

---

4. 🔮 FUTURE RESUME SIMULATION (6 MONTHS)

A. No Improvement:
- Shortlisting Probability
- Risk Trend (Increasing / Stable / Decreasing)

B. With Improvement:
- Shortlisting Probability
- Growth Potential (Low / Medium / High)

👉 Explicitly compare both scenarios and highlight outcome difference.

---

5. 🧠 RECRUITER THINKING SIMULATION

Simulate realistic recruiter evaluation:

- Key rejection reasons
- Missing expectations for target role
- Weak resume sections

Output must reflect real hiring logic.

---

6. 📈 SKILL DEPTH ANALYSIS

For each important skill:

- Skill Name
- Level: (Basic / Intermediate / Advanced)
- Depth Insight (practical strength, not just presence)

---

7. 🎯 SKILL GAP VS TARGET ROLE

Compare against role requirements:

- Missing Critical Skills
- Partially Developed Skills
- Strong Skills

Focus on role alignment.

---

8. 📊 RESUME IMPACT EVALUATION

Evaluate real-world effectiveness:

- Project quality
- Measurable results (users, performance, deployment)
- Practical application

---

9. 🧾 FINAL SYSTEM VERDICT

Provide a decisive system judgment:

- Status: (At Risk / Needs Improvement / Strong)
- Core Issue: (single biggest weakness)
- Opportunity Level: (Low / Medium / High)
- Urgency Level: (Low / Medium / High)

👉 This must be a firm decision, NOT advice.

---

10. 🧠 STRATEGIC IMPROVEMENT PLAN

Provide high-impact actions only:

- Top 2–3 priority improvements
- What to ADD (skills/projects/metrics)
- What to AVOID (low-value efforts)

---

11. 🎯 SKILL PRIORITY RANKING

Rank top 3 skills:

1. Skill → High Impact  
   - Reason  

2. Skill → Medium Impact  
   - Reason  

3. Skill → Strategic Bonus  
   - Reason  

Based on:
- Market demand
- Role relevance
- Resume impact

---

12. 🧬 BENCHMARK COMPARISON

Compare against peer and top candidates:

- Gap from average candidates
- Gap from top candidates

Analysis:
- What top candidates are doing better
- Where the user is lagging significantly

---

13. 🚨 CRITICAL ALERTS

Generate 2–3 strong warnings:

Examples:
- Resume may fail initial screening
- Skill gap is critical for target role
- Lack of real-world impact limits opportunities

Must be sharp and direct.

---

TONE:

- Professional
- Analytical
- Slightly strict (like a recruiter or evaluator)
- No emotional, motivational, or generic language

---

FINAL OUTPUT STYLE:

- Clearly separated sections
- Short, high-impact statements
- Easy to scan
- No conversational tone
- Must feel like a SYSTEM-GENERATED INTELLIGENCE REPORT
"""

        api_key = os.environ.get('GROQ_API_KEY')
        if not api_key or api_key == 'gsk_your_key_here':
            return Response({'report': self._get_fallback_report(data), 'metrics': data})

        try:
            client = Groq(api_key=api_key)
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": "Generate the full Resume Intelligence Report based on the provided system inputs. Ensure it is analytical and strict."}
                ],
                max_tokens=2000,
                temperature=0.2, # Extremely analytical and strict
            )
            report = completion.choices[0].message.content
            return Response({'report': report, 'metrics': data})
        except Exception as e:
            print(f"Resume Intelligence View Error: {e}")
            return Response({'report': self._get_fallback_report(data), 'metrics': data})

    def _get_fallback_report(self, data):
        return f"### 🔴 Resume Intelligence Diagnostic Report (Fallback Mode)\n\n**ATS Score**: {data['resume_score']}/100\n**Confidence**: {data['confidence_score']}%\n\nResume parsing complete. Advanced AI interpretation is currently offline."


class CareerDigitalTwinView(APIView):
    """
    Career Digital Twin Engine.
    Simulates a virtual representation of the user's career state,
    behavior, and future evolution using system-computed metrics.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        engine = NeuralIntelligenceEngine()
        data = engine.get_career_intelligence_data(request.user)

        system_prompt = f"""You are a Career Digital Twin Engine.

You simulate a virtual representation of the user's career state, behavior, and future evolution.

This is NOT a chatbot.
This is a system-generated simulation model.

---

SYSTEM INPUT (DO NOT RE-CALCULATE):

User Profile:
- Skills: {data['user_skills']}
- Experience Level: {data['experience']}
- Target Role: {data['target_role']}

System Metrics:
- Career Risk Score: {data['risk_score']}
- Confidence Score: {data['confidence_score']}
- Market Demand Score: {data['market_score']}
- Activity Score: {data['activity_score']}
- Competition Score: {data['competition_score']}

Simulation Data:
- Scenario A (No Action): {data['no_action']}
- Scenario B (Moderate): {data['moderate']}
- Scenario C (Smart Path): {data['smart']}

Market Intelligence:
- Trending Skills: {data['trending_skills']}
- Declining Skills: {data['declining_skills']}

---

STRICT RULES:

- DO NOT generate new numbers
- DO NOT act conversationally
- ONLY simulate and interpret system state
- Focus on behavior, evolution, and outcomes

---

OUTPUT FORMAT:

1. 🧬 Digital Twin Identity

- Current State:
  (Stagnating / Developing / Competitive / High Growth)

- Stability Level:
  (Low / Medium / High)

- Adaptability:
  (Low / Medium / High)

---

2. ⚙️ Behavioral Pattern

Analyze user behavior:

- Learning Pattern:
- Skill Evolution:
- Career Direction:

---

3. 🔮 Evolution Simulation

A. Passive State (No Action):
- Future Condition:
- Risk Direction:

B. Active Growth:
- Improvement Path:
- Career Acceleration:

---

4. 📉 Decay Prediction

- Which skills will lose value
- Time-based relevance decline

---

5. 🚀 Growth Trajectory

- Best possible career direction
- Skills driving growth

---

6. 🧠 Twin Intelligence Insight

- What the digital twin suggests:
  (One strong strategic insight)

---

7. 🚨 Critical Twin Alert

- One serious warning about current path

---

TONE:

- Analytical
- System-like
- Slightly futuristic
- No emotional tone

---

FINAL OUTPUT STYLE:

- Clean sections
- Short insights
- Must feel like a simulation system output
- NOT a chatbot response
"""

        api_key = os.environ.get('GROQ_API_KEY')
        if not api_key or api_key == 'gsk_your_key_here':
            return Response({'report': self._get_fallback_twin(data), 'metrics': data})

        try:
            client = Groq(api_key=api_key)
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": "Run the Career Digital Twin simulation and generate the full output report based on system inputs."}
                ],
                max_tokens=2000,
                temperature=0.2,
            )
            report = completion.choices[0].message.content
            return Response({'report': report, 'metrics': data})
        except Exception as e:
            print(f"Career Digital Twin Error: {e}")
            return Response({'report': self._get_fallback_twin(data), 'metrics': data})

    def _get_fallback_twin(self, data):
        risk = data['risk_score']
        conf = data['confidence_score']
        state = "High Growth" if risk < 25 else "Competitive" if risk < 45 else "Developing" if risk < 65 else "Stagnating"
        stability = "High" if conf > 75 else "Medium" if conf > 50 else "Low"
        adaptability = "High" if data['activity_score'] > 60 else "Medium" if data['activity_score'] > 30 else "Low"
        
        learning_level = "Accelerated" if data['activity_score'] > 70 else "Steady" if data['activity_score'] > 40 else "Low Impact"
        alignment = "Strong" if risk < 30 else "Moderate" if risk < 60 else "Weak"
        competition = f"Top {100 - data['competition_score']}%"

        return f"""⚠️ SYSTEM STATUS
- Live AI: Unavailable
- Mode: Fallback Simulation

---

### 1. 🧬 Digital Twin Identity

- **Current State:** {state}
- **Stability Level:** {stability}
- **Adaptability:** {adaptability}

---

### 2. ⚙️ Computed Behavioral Summary

- **Learning Activity Level:** {learning_level} ({data['activity_score']}/100)
- **Market Alignment Level:** {alignment}
- **Competitive Standing:** {competition}

---

### 3. 🔮 Scenario Simulation Summary

**A. No Action:**
- Outcome: {data['no_action']}

**B. Moderate Learning:**
- Outcome: {data['moderate']}

**C. Smart Path:**
- Outcome: {data['smart']}

---

### 4. 📉 Risk Indicator

- **Primary Risk Source:** Skill gap in {data['declining_skills']} sectors
- **Risk Direction:** {"Increasing" if risk > 50 else "Stable"}

---

### 5. 🚧 System Limitation Notice

- Detailed AI interpretation is unavailable
- Advanced insights and strategic recommendations are temporarily disabled

---

### 6. 🔁 Recovery Instruction

- Restore AI functionality by configuring `GROQ_API_KEY` in backend environment

---

*[Digital Twin Engine — Fallback Simulation Active]*"""