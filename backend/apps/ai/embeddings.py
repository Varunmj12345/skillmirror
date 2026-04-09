from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class EmbeddingGenerator:
    def __init__(self):
        self.vectorizer = TfidfVectorizer()

    def generate_embeddings(self, documents):
        tfidf_matrix = self.vectorizer.fit_transform(documents)
        return tfidf_matrix.toarray()

    def calculate_similarity(self, embedding1, embedding2):
        return cosine_similarity([embedding1], [embedding2])[0][0]

    def analyze_skill_embeddings(self, skills):
        skill_embeddings = self.generate_embeddings(skills)
        return skill_embeddings

    def analyze_job_description_embeddings(self, job_descriptions):
        job_embeddings = self.generate_embeddings(job_descriptions)
        return job_embeddings

    def find_most_similar(self, target_embedding, embeddings):
        similarities = [self.calculate_similarity(target_embedding, emb) for emb in embeddings]
        most_similar_index = np.argmax(similarities)
        return most_similar_index, similarities[most_similar_index]