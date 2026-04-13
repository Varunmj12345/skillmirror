import numpy as np
import re
from collections import Counter

class EmbeddingGenerator:
    """
    Lightweight similarity engine. 
    Uses token-based Jaccard similarity and vector overlap.
    Replaces sklearn (TfidfVectorizer/cosine_similarity) to save ~300MB RAM.
    """
    def __init__(self):
        # We no longer need TfidfVectorizer
        pass

    def _tokenize(self, text):
        # Simple cleaner and tokenizer
        text = text.lower()
        return set(re.findall(r'\w+', text))

    def generate_embeddings(self, documents):
        """
        Mock for compatibility with IntelligenceEngine.
        In this lightweight version, we return token sets or simple counts.
        """
        return [self._tokenize(doc) for doc in documents]

    def calculate_similarity(self, tokens1, tokens2):
        """
        Calculate Jaccard Similarity between two token sets.
        Gives a score between 0 and 1.
        """
        if not tokens1 or not tokens2:
            return 0.0
        
        intersection = tokens1.intersection(tokens2)
        union = tokens1.union(tokens2)
        
        if not union:
            return 0.0
            
        return float(len(intersection)) / len(union)

    def analyze_skill_embeddings(self, skills):
        return self.generate_embeddings(skills)

    def analyze_job_description_embeddings(self, job_descriptions):
        return self.generate_embeddings(job_descriptions)

    def find_most_similar(self, target_tokens, tokens_list):
        similarities = [self.calculate_similarity(target_tokens, t) for t in tokens_list]
        most_similar_index = np.argmax(similarities)
        return most_similar_index, similarities[most_similar_index]