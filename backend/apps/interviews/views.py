import os
import uuid
import json
import random
from datetime import datetime
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from groq import Groq
from apps.interviews.models import MockInterview, MockInterviewQuestion, LiveInterviewSession
from apps.interviews.serializers import MockInterviewSerializer, MockInterviewQuestionSerializer, LiveInterviewSessionSerializer

# Audio Analysis Placeholder Logic
def analyze_audio_metrics(audio_file):
    """
    Simulates librosa analysis for pitch, speed, and fillers.
    In a real env, this would use librosa.load(audio_file)
    """
    # Dummy logic to represent the structure
    return {
        'avg_pitch': 220.5,
        'speaking_pace': 135.0, # words per minute
        'filler_words': ['um', 'ah', 'like'],
        'confidence_score': 0.85
    }

class MockInterviewHistoryView(generics.ListAPIView):
    serializer_class = MockInterviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MockInterview.objects.filter(user=self.request.user)

class MockInterviewDetailView(generics.RetrieveAPIView):
    serializer_class = MockInterviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return MockInterview.objects.filter(user=self.request.user)

class StartMockInterviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        role = request.data.get('role', 'Software Developer')
        experience = request.data.get('experience_level', 'Entry')
        interview_type = request.data.get('interview_type', 'Mixed')
        difficulty = request.data.get('difficulty', 'Moderate')
        count = int(request.data.get('question_count', 5))
        jd = request.data.get('job_description', '')
        mode = request.data.get('interview_mode', 'standard')
        instant = request.data.get('instant_feedback', False)

        # Create Interview Object
        interview = MockInterview.objects.create(
            user=request.user,
            role=role,
            experience_level=experience,
            interview_type=interview_type,
            difficulty=difficulty,
            question_count=count,
            interview_mode=mode,
            instant_feedback=instant
        )

        # Generate Questions using AI
        questions_with_metadata = self._generate_questions(role, experience, interview_type, difficulty, count, jd, mode)
        
        if not questions_with_metadata:
            interview.delete() # Cleanup
            return Response({'error': 'Failed to generate interview questions. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        for i, q_data in enumerate(questions_with_metadata):
            MockInterviewQuestion.objects.create(
                interview=interview,
                question_text=q_data.get('question', q_data),
                category=q_data.get('category', 'Technical'),
                difficulty_badge=q_data.get('difficulty', difficulty),
                order=i
            )

        return Response({
            'interview_id': interview.id,
            'role': role,
            'count': count,
            'first_question': questions_with_metadata[0].get('question') if questions_with_metadata else None
        }, status=status.HTTP_201_CREATED)

    def _generate_questions(self, role, exp, type, diff, count, jd, mode):
        api_key = os.environ.get('GROQ_API_KEY')
        if not api_key or api_key == 'gsk_your_key_here':
            return [{"question": f"Question {i+1}", "category": "General", "difficulty": diff} for i in range(count)]

        # --- UNIQUENESS: Pick a random variation directive each session ---
        variation_directives = [
            "Focus on real-world system design trade-offs and scalability.",
            "Focus on debugging, edge-cases, and failure scenarios.",
            "Focus on recent industry trends and emerging technologies.",
            "Focus on data structures, algorithms, and time-complexity analysis.",
            "Focus on team collaboration, leadership, and conflict resolution.",
            "Focus on security, performance optimisation, and best practices.",
            "Focus on cloud infrastructure, DevOps, and deployment pipelines.",
            "Focus on API design, microservices, and distributed systems.",
            "Focus on testing strategies, CI/CD, and code quality.",
            "Focus on product thinking, user empathy, and cross-functional work.",
            "Focus on database design, query optimisation, and data modelling.",
            "Focus on problem decomposition and step-by-step reasoning.",
            "Focus on open-source contributions and community best practices.",
            "Focus on machine learning integration and AI-driven features.",
            "Focus on communication clarity, stakeholder management, and reporting.",
        ]
        variation = random.choice(variation_directives)
        session_seed = datetime.now().strftime("%Y%m%d%H%M%S%f")

        try:
            client = Groq(api_key=api_key)
            prompt = f"""
            You are a senior hiring manager. Generate {count} COMPLETELY UNIQUE interview questions for:
            Role: {role}
            Experience Level: {exp}
            Interview Type: {type}
            Difficulty: {diff}
            Mode: {mode}
            Session ID (use for entropy, never repeat): {session_seed}
            Variation focus this session: {variation}
            {f"Job Description context: {jd}" if jd else ""}

            IMPORTANT RULES:
            - Every question MUST be different from typical overused questions.
            - Do NOT use common questions like 'Tell me about yourself' or 'What is a linked list'.
            - Make the questions specific, thought-provoking, and varied.
            - Questions must be completely unique — not from any previous session.

            Return the questions as a JSON list of objects with keys:
            - question (string)
            - category (Core Concepts, Problem Solving, System Design, Debugging, Behavioral, Scenario-Based)
            - difficulty (Easy, Moderate, Hard, Expert)

            Example: {{"questions": [{{ "question": "...", "category": "...", "difficulty": "..." }}]}}
            """

            completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                response_format={"type": "json_object"}
            )
            data = json.loads(completion.choices[0].message.content)
            questions = data.get('questions', [])
            # Shuffle for extra variety in ordering
            random.shuffle(questions)
            return questions[:count]
        except Exception as e:
            print(f"Question Generation Error: {e}")
            return [{"question": f"Describe a challenging project in {role}.", "category": "Problem Solving", "difficulty": diff}]

class EvaluateAnswerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, question_id):
        question = get_object_or_404(MockInterviewQuestion, id=question_id, interview__user=request.user)
        answer = request.data.get('answer', '')
        
        question.user_answer = answer
        question.is_answered = True
        
        # AI Evaluation
        eval_data = self._evaluate(question.question_text, answer, question.interview)
        
        question.score = eval_data.get('score', 0)
        question.feedback = eval_data.get('feedback', '')
        question.strengths = eval_data.get('strengths', '')
        question.weaknesses = eval_data.get('weaknesses', '')
        question.improved_answer = eval_data.get('ai_answer', eval_data.get('improved_answer', ''))
        question.sample_answer = eval_data.get('ai_answer', eval_data.get('ideal_sample_answer', ''))
        question.reviewer_intent = eval_data.get('interviewer_intent', '')
        
        question.technical_accuracy = eval_data.get('technical_accuracy', eval_data.get('score', 0))
        question.communication_rating = eval_data.get('communication_rating', 0)
        question.depth_score = eval_data.get('depth_score', 0)
        question.relevance_score = eval_data.get('relevance_score', 0)
        question.structure_score = eval_data.get('structure_score', 0)
        question.completeness_score = eval_data.get('completeness_score', 0)
        question.save()

        # Follow-up Logic: If score is low or answer is shallow, check for follow-up
        follow_up = None
        if question.score < 6 and not question.is_follow_up:
            follow_up_text = eval_data.get('follow_up_question')
            if follow_up_text:
                follow_up = MockInterviewQuestion.objects.create(
                    interview=question.interview,
                    question_text=follow_up_text,
                    category='Follow-up',
                    difficulty_badge='Adaptive',
                    order=question.order + 1,
                    is_follow_up=True
                )
                # Re-order subsequent questions
                subsequent = question.interview.questions.filter(order__gt=question.order).exclude(id=follow_up.id)
                for q in subsequent:
                    q.order += 1
                    q.save()

        # Build structured response as requested
        return Response({
            "success": True,
            "question": MockInterviewQuestionSerializer(question).data,
            "ai_answer": question.sample_answer,
            "score": question.score,
            "feedback": question.feedback,
            "follow_up": MockInterviewQuestionSerializer(follow_up).data if follow_up else None
        })

    def _evaluate(self, q, a, interview):
        api_key = os.environ.get('GROQ_API_KEY')
        if not api_key or api_key == 'gsk_your_key_here':
            return {
                'score': 7.5, 
                'feedback': 'Good answer. (Mock Eval)',
                'ai_answer': 'The ideal answer would cover the following points...'
            }

        try:
            client = Groq(api_key=api_key)
            prompt = f"""
            You are a professional technical interviewer.
            Evaluate this answer. 
            Question: {q}
            Answer: {a}
            Role: {interview.role}
            Experience Level: {interview.experience_level}

            STRICT JSON RESPONSE ONLY. DO NOT INCLUDE ANY OTHER TEXT.
            {{
              "ai_answer": "ideal sample answer covering all technical nuances",
              "score": 8,
              "feedback": "clear explanation but missing depth",
              "strengths": "precise terminology",
              "weaknesses": "lacks practical examples",
              "interviewer_intent": "Testing mastery of Core Concepts",
              "technical_accuracy": 8,
              "communication_rating": 9,
              "depth_score": 7,
              "relevance_score": 10,
              "structure_score": 8,
              "completeness_score": 7,
              "follow_up_question": "if answer was shallow, ask a deeper follow-up, else null"
            }}
            """
            
            completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                response_format={"type": "json_object"}
            )
            return json.loads(completion.choices[0].message.content)
        except Exception as e:
            print(f"Evaluation Error: {e}")
            return {
                'score': 0, 
                'feedback': 'Error during AI analysis.',
                'ai_answer': 'Unable to generate ideal answer at this time.'
            }


class SkipQuestionView(APIView):
    """Mark question as skipped but still get the AI ideal answer."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, question_id):
        question = get_object_or_404(MockInterviewQuestion, id=question_id, interview__user=request.user)

        # Mark as answered (skipped) with empty answer
        question.user_answer = ''
        question.is_answered = True
        question.score = 0

        # Still evaluate to get AI ideal answer — pass context that it was skipped
        eval_data = EvaluateAnswerView()._evaluate(
            question.question_text,
            "[The candidate skipped this question without providing an answer. Provide the ideal answer as if coaching the candidate.]",
            question.interview
        )

        question.feedback = eval_data.get('feedback', 'No answer was provided for this question.')
        question.strengths = ''
        question.weaknesses = eval_data.get('weaknesses', 'Question was skipped — no answer given.')
        question.improved_answer = eval_data.get('ai_answer', '')
        question.sample_answer = eval_data.get('ai_answer', '')
        question.reviewer_intent = eval_data.get('interviewer_intent', '')
        question.technical_accuracy = 0
        question.communication_rating = 0
        question.depth_score = 0
        question.relevance_score = 0
        question.structure_score = 0
        question.completeness_score = 0
        question.save()

        return Response({
            "success": True,
            "skipped": True,
            "question": MockInterviewQuestionSerializer(question).data,
            "ai_answer": question.sample_answer,
            "score": 0,
            "feedback": question.feedback,
            "strengths": "",
            "weaknesses": question.weaknesses,
            "follow_up": None
        })


class NextQuestionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, interview_id):
        interview = get_object_or_404(MockInterview, id=interview_id, user=request.user)
        next_q = interview.questions.filter(is_answered=False).order_by('order').first()
        
        if next_q:
            return Response({
                "question": MockInterviewQuestionSerializer(next_q).data,
                "question_id": next_q.id,
                "next_available": True,
                "current_index": interview.questions.filter(is_answered=True).count() + 1,
                "total_questions": interview.questions.count()
            })
        else:
            return Response({
                "next_available": False,
                "message": "All questions completed."
            })

class InterviewResultView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, interview_id):
        interview = get_object_or_404(MockInterview, id=interview_id, user=request.user)
        questions = interview.questions.all().order_by('order')
        
        return Response({
            "interview": MockInterviewSerializer(interview).data,
            "questions": MockInterviewQuestionSerializer(questions, many=True).data,
            "final_score": interview.total_score
        })

class FinalizeInterviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, interview_id):
        interview = get_object_or_404(MockInterview, id=interview_id, user=request.user)
        
        # New: Accept rich AI data from the engine
        ai_data = request.data.get('ai_report', {})
        
        if ai_data:
            interview.total_score = ai_data.get('overall_score', interview.total_score)
            interview.ai_summary = ai_data.get('evaluation', {}).get('feedback', interview.ai_summary)
            interview.strengths = ai_data.get('strengths', interview.strengths)
            interview.weaknesses = ai_data.get('weaknesses', interview.weaknesses)
            interview.improvement_areas = ai_data.get('skill_gap', interview.improvement_areas)
            
            # Additional metrics if provided
            market = ai_data.get('market_intelligence', {})
            if market:
                interview.performance_trend = f"Market Demand: {market.get('market_demand')} | Growth: {market.get('growth_forecast')}"

        else:
            # Fallback to traditional averaging
            questions = interview.questions.all()
            if questions:
                total_q = questions.count()
                avg_score = sum(q.score for q in questions) / total_q
                interview.total_score = round(avg_score * 10, 1)

        interview.is_completed = True
        interview.save()
        
        # Sync with activity log
        try:
            from apps.users.models import ActivityLog
            ActivityLog.objects.create(
                user=request.user,
                action_type='interview',
                description=f"Completed {interview.role} Advanced AI interview. Score: {interview.total_score}%",
                impact_score=15
            )
        except:
            pass

        return Response(MockInterviewSerializer(interview).data)

class ProcessAudioAnalysisView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, question_id):
        question = get_object_or_404(MockInterviewQuestion, id=question_id, interview__user=request.user)
        audio_file = request.FILES.get('audio')
        
        if not audio_file:
            return Response({'error': 'No audio file provided'}, status=400)
            
        # Save file
        question.audio_answer_url = audio_file
        
        # Analyze
        try:
            metrics = analyze_audio_metrics(audio_file)
            question.avg_pitch = metrics['avg_pitch']
            question.speaking_pace = metrics['speaking_pace']
            question.filler_words = metrics['filler_words']
            question.confidence_score = metrics['confidence_score']
            
            # Update interview-wide metrics
            interview = question.interview
            interview.filler_words_count += len(metrics['filler_words'])
            interview.speaking_pace = (interview.speaking_pace + metrics['speaking_pace']) / 2 if interview.speaking_pace > 0 else metrics['speaking_pace']
            interview.save()
            question.save()
            
            return Response(metrics)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class CreateLiveSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        candidate_email = request.data.get('candidate_email')
        role = request.data.get('role', 'Technical Interview')
        room_id = str(uuid.uuid4())[:8]
        
        # Create underlying mock interview
        interview = MockInterview.objects.create(
            user=request.user,
            role=role,
            is_live=True,
            interview_mode='technical_panel'
        )
        
        session = LiveInterviewSession.objects.create(
            room_id=room_id,
            hiring_manager=request.user,
            candidate_email=candidate_email,
            mock_interview=interview
        )
        
        return Response({
            'room_id': room_id,
            'interview_id': interview.id,
            'invite_link': f"/mock-interview/live/{room_id}"
        })

class LiveQuestionGenerationView(APIView):
    """Real-time adaptive questioning for Live sessions"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, interview_id):
        interview = get_object_or_404(MockInterview, id=interview_id)
        last_answer = request.data.get('last_answer', '')
        context = request.data.get('context', '')
        
        # Call Groq for next dynamic question
        api_key = os.environ.get('GROQ_API_KEY')
        client = Groq(api_key=api_key)
        
        prompt = f"""
        Adaptive Live Interviewer:
        State: {context}
        Last Answer: {last_answer}
        Role: {interview.role}
        
        Generate the NEXT natural follow-up or a new topic question.
        Keep it concise as it will be spoken by AI.
        """
        
        completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            max_tokens=150
        )
        
        question_text = completion.choices[0].message.content.strip()
        
        new_q = MockInterviewQuestion.objects.create(
            interview=interview,
            question_text=question_text,
            order=interview.questions.count()
        )
        
        return Response({
            'question': question_text,
            'id': new_q.id
        })


# =============================================================================
# AI CAREER INTELLIGENCE ENGINE — Unified 7-Stage Endpoint
# =============================================================================

class AICareerEngineView(APIView):
    """
    Single endpoint that drives the entire interview intelligence flow.
    POST /api/interviews/ai-engine/

    Body:
        role         (str)  - Target job role
        level        (str)  - Difficulty / experience level
        skills       (list) - User's current skills
        history      (list) - Previous Q&A pairs [{"question": "", "answer": ""}]
        answer       (str)  - Current answer (empty = generate question mode)
        index        (int)  - Current question index (0-based)
        total        (int)  - Total questions in the session
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        role         = request.data.get('role', 'Software Engineer')
        level        = request.data.get('level', 'Mid')
        skills       = request.data.get('skills', [])
        history      = request.data.get('history', [])
        answer       = request.data.get('answer', '').strip()
        index        = int(request.data.get('index', 0))
        total        = int(request.data.get('total', 5))

        # Determine operational mode
        is_final = (index >= total) and answer
        has_answer = bool(answer)

        result = self._call_engine(
            role=role,
            level=level,
            skills=skills,
            history=history,
            answer=answer,
            index=index,
            total=total,
            is_final=is_final,
            has_answer=has_answer
        )

        # Increment index on evaluation
        result['next_index'] = index + 1 if has_answer else index

        return Response(result)

    def _call_engine(self, role, level, skills, history, answer, index, total,
                     is_final, has_answer):
        api_key = os.environ.get('GROQ_API_KEY')
        if not api_key or api_key == 'gsk_your_key_here':
            return self._fallback_response(has_answer, is_final, index, total)

        skills_text = ", ".join(skills) if skills else "Not specified"
        history_text = "\n".join([
            f"Q{i+1}: {h.get('question','')}\nA: {h.get('answer','[skipped]')}"
            for i, h in enumerate(history)
        ]) if history else "None yet."

        # Adaptive logic for Mandatory vs Dynamic questions
        mandatory_focus = ""
        if index == 0: mandatory_focus = "MANDATORY: Start with a professional Introduction question."
        elif index == 1: mandatory_focus = "MANDATORY: Focus on a Core Technical Skill relevant to " + role
        elif index == 2: mandatory_focus = "MANDATORY: Focus on a complex Problem-solving scenario."

        prompt_context = f"""
        Role: {role}
        Level: {level}
        Skills: {skills_text}
        Question Index: {index + 1} of {total}
        History: {history_text}
        """

        if not has_answer:
            # Stage: question
            prompt = f"""
            You are an advanced AI Interview Engine.
            GOAL: Generate the next interview question.
            
            CONTEXT:
            {prompt_context}
            {mandatory_focus if index < 3 else "ADAPTIVE: Generate a probing or advanced question based on previous performance."}

            RULES:
            1. Stage: question
            2. If QIndex < 3, follow the mandatory sequence (Intro -> Core Tech -> Problem).
            3. If QIndex >= 3, use adaptive branching (Harder if strong, simpler if weak).
            4. CROSS-CHECK: If user mentioned skills in history, validate their understanding.

            OUTPUT FORMAT (STRICT JSON):
            {{
              "stage": "question",
              "question": "The question text",
              "type": "concept|problem|system-design|behavioral",
              "expected_concepts": ["key1", "key2"]
            }}
            """
        elif not is_final:
            # Stage: evaluation + next_question
            prompt = f"""
            You are an advanced AI Interview Engine.
            GOAL: Evaluate the answer and generate the NEXT question.

            CONTEXT:
            {prompt_context}
            Current Answer: {answer}
            {mandatory_focus if index < 3 else ""}

            EVALUATION METRICS:
            Analyze: Clarity, Technical Accuracy, Confidence, Depth (all 0-10).
            Detect filler words (um, uh, etc.) and hesitation.
            
            MARKET INTELLIGENCE:
            Generate Salary Projection, Top 3 Companies, and Demand for {role}.

            RULES:
            1. If QIndex < 3, the 'next_question' must be the next mandatory one.
            2. Cross-check Answer against Skills/Resume. Detect mismatches.

            OUTPUT FORMAT (STRICT JSON):
            {{
              "stage": "evaluation",
              "evaluation": {{
                "clarity": 0-10,
                "technical_accuracy": 0-10,
                "confidence": 0-10,
                "depth": 0-10,
                "keyword_match": 0-10,
                "filler_words": [],
                "feedback": "..."
              }},
              "behavioral_analysis": {{
                "communication": "Good|Average|Poor",
                "confidence_level": "High|Medium|Low",
                "issues_detected": []
              }},
              "market_intelligence": {{
                "salary_projection": "₹X - ₹Y LPA",
                "top_companies": ["C1", "C2", "C3"],
                "market_demand": "High|Medium|Low",
                "growth_forecast": "X%"
              }},
              "skill_gap_analysis": {{
                "missing_skills": [],
                "improvement_suggestions": []
              }},
              "next_question": {{
                "question": "...",
                "type": "..."
              }}
            }}
            """
        else:
            # Stage: final_report
            prompt = f"""
            You are an advanced AI Interview Engine.
            GOAL: Final Intelligence Report.
            
            {prompt_context}
            Final Answer: {answer}

            Provide a comprehensive summary of strengths, weaknesses, skill gaps, and a realistic growth path.
            
            OUTPUT FORMAT (STRICT JSON):
            {{
              "stage": "final_report",
              "overall_score": 0-100,
              "evaluation": {{ "feedback": "Final summary..." }},
              "market_intelligence": {{ ... }},
              "skill_gap_analysis": {{ ... }},
              "career_simulation": {{
                "growth_path": "Realistic 3-5 year trajectory",
                "salary_projection": "Year-by-year growth",
                "key_decisions": [],
                "risks": []
              }}
            }}
            """

        try:
            client = Groq(api_key=api_key)
            completion = client.chat.completions.create(
                messages=[{"role": "system", "content": "You are a professional hiring engine. Respond ONLY in valid JSON."},
                          {"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                response_format={"type": "json_object"},
                temperature=0.7
            )
            return json.loads(completion.choices[0].message.content)
        except Exception as e:
            print(f"AI Career Engine Error: {e}")
            return self._fallback_response(has_answer, is_final, index, total)
        except Exception as e:
            print(f"AI Career Engine Error: {e}")
            return self._fallback_response(has_answer, is_final, index, total)

    def _fallback_response(self, has_answer, is_final, index, total):
        """Returns a graceful fallback when the AI call fails."""
        if not has_answer:
            return {
                "stage": "question",
                "question": f"Question {index + 1}: Describe a challenging technical problem you solved recently and walk through your approach.",
                "type": "behavioral",
                "difficulty_hint": "Moderate",
                "what_is_tested": "Problem-solving and communication"
            }
        if is_final:
            return {
                "stage": "final_report",
                "score": 7,
                "feedback": "Good effort overall.",
                "ideal_answer": "Available after full AI analysis.",
                "improvement": "Practice explaining concepts with concrete examples.",
                "overall_score": 70,
                "strengths": ["Attempted all questions", "Clear communication"],
                "weaknesses": ["Could use more depth on technical topics"],
                "skill_gap": ["System design", "Advanced algorithms"],
                "recommended_skills": ["Docker", "Kubernetes", "System Design"],
                "learning_path": ["Step 1: Complete a system design course", "Step 2: Build 2 portfolio projects"],
                "interview_summary": "The candidate demonstrated basic knowledge but needs more depth in technical areas.",
                "job_insights": {
                    "top_skills": ["Python", "System Design", "APIs", "SQL", "Cloud"],
                    "salary_range": "Depends on region and experience",
                    "market_growth": "Steady growth expected",
                    "top_hiring_companies": ["Google", "Amazon", "Microsoft"],
                    "risk_level": "medium"
                },
                "skill_match": {
                    "match_percentage": 60,
                    "matched_skills": [],
                    "missing_skills": [],
                    "priority_skills": []
                },
                "career_simulation": {
                    "growth_path": "With focused effort, progression to senior level is achievable in 3 years.",
                    "salary_projection": "Growth trajectory depends on skill development.",
                    "key_decisions": ["Specialise in a high-demand stack", "Build a strong portfolio"],
                    "risks": ["Skill gaps in system design may limit senior roles"]
                }
            }
        return {
            "stage": "evaluation",
            "score": 7,
            "feedback": "Good answer. Keep working on depth and real-world examples.",
            "ideal_answer": "AI analysis unavailable at this moment.",
            "improvement": "Add concrete examples and edge-case thinking.",
            "next_question": {
                "question": f"Question {index + 2}: How would you design a scalable system for this use case?",
                "type": "system-design",
                "difficulty_hint": "Hard"
            },
            "job_insights": {
                "top_skills": ["Python", "System Design", "APIs", "SQL", "Cloud"],
                "salary_range": "Depends on region and experience",
                "market_growth": "Steady growth expected",
                "top_hiring_companies": ["Google", "Amazon", "Microsoft"],
                "risk_level": "medium"
            },
            "skill_match": {
                "match_percentage": 60,
                "matched_skills": [],
                "missing_skills": [],
                "priority_skills": []
            }
        }

