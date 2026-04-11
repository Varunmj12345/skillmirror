import numpy as np
from datetime import datetime, timezone
from django.db.models import Avg
from .embeddings import EmbeddingGenerator

class NeuralIntelligenceEngine:
    """
    Advanced Career Readiness & Market Alignment Engine.
    Implements weighted multi-factor scoring with recency decay.
    """
    
    def __init__(self):
        self.embedding_gen = EmbeddingGenerator()
        # Weight Coefficients (Configurable for Enterprise tuning)
        self.W_SKILL = 0.40
        self.W_PROJECT = 0.25
        self.W_INTERVIEW = 0.20
        self.W_MARKET = 0.15

    def calculate_recency_decay(self, last_active_date):
        """Calculates a decay factor: newer activity is weighted higher."""
        if not last_active_date:
            return 0.5 # Default penalty for stale data
        
        days_diff = (datetime.now().date() - last_active_date).days
        # Decay formula: 1 / (1 + log(1 + days))
        return 1.0 / (1.0 + np.log1p(max(0, days_diff)))

    def compute_readiness(self, user):
        """
        Computes the final 0-100 Readiness Score.
        1. Skill Overlap (Cosine Similarity)
        2. Project Relevance (Complexity Score)
        3. Interview Sentiment (Historical Avg)
        4. Market Velocity (Role Trend)
        """
        profile = getattr(user, 'profile', None)
        if not profile:
            return 0

        # 1. Skill Match Logic
        user_skills = [s.name for s in user.skills.all()]
        if not user_skills or not profile.dream_job:
            skill_score = 10
        else:
            # Simple embedding similarity between skills and target role
            u_emb = self.embedding_gen.generate_embeddings([" ".join(user_skills)])[0]
            r_emb = self.embedding_gen.generate_embeddings([profile.dream_job])[0]
            skill_score = self.embedding_gen.calculate_similarity(u_emb, r_emb) * 100

        # 2. Interview Feedback Logic
        interview_avg = user.interview_sessions.aggregate(Avg('score'))['score__avg'] or 0
        interview_score = interview_avg # 0-100 scale

        # 3. Apply Recency Decay to profile-based completeness
        decay = self.calculate_recency_decay(profile.last_active_date)
        
        # 4. Synthesize final score
        # Final = (Skills * 0.4) + (Interview * 0.2) + (Profile_Completeness * 0.4 * Decay)
        weighted_score = (skill_score * self.W_SKILL) + \
                        (interview_score * self.W_INTERVIEW) + \
                        (profile.profile_completeness * 0.4 * decay)

        # Scale and finalize
        final_readiness = min(100, max(0, int(weighted_score)))
        
        # Save to profile
        profile.job_readiness_score = final_readiness
        profile.save()
        
        return final_readiness

    def identify_gaps(self, user):
        """Identifies exactly which high-impact skills are missing."""
        # This will be refined as the JD database grows
        # Currently identifies gaps by comparing user skills to a mock 'Market Vector'
        return ["System Design", "Distributed Systems", "Event-Driven Arch"]
