import random

class JobIntelligenceService:
    @staticmethod
    def predict_future_demand(role_name):
        """
        Predict future demand for a job role.
        Returns a trend (up, down, stable) and a confidence score.
        """
        # Placeholder logic
        trends = ['up', 'down', 'stable']
        prediction = random.choice(trends)
        confidence = round(random.uniform(0.7, 0.99), 2)
        
        return {
            'role': role_name,
            'prediction': prediction,
            'confidence': confidence,
            'details': f"Demand for {role_name} is expected to trend {prediction} over the next 6 months."
        }

    @staticmethod
    def recommend_roles(user_skills):
        """
        Recommend roles based on user skills.
        """
        # Placeholder logic
        potential_roles = [
            'Python Developer', 'Data Scientist', 'DevOps Engineer', 
            'Frontend Developer', 'Full Stack Engineer'
        ]
        recommended = random.sample(potential_roles, 3)
        return recommended
