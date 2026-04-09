from rest_framework import serializers
from .models import AIModel, Embedding, Pipeline

class EmbeddingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Embedding
        fields = ['id', 'model', 'vector', 'created_at']

class PipelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pipeline
        fields = ['id', 'name', 'steps', 'created_at', 'updated_at']

class AIModelSerializer(serializers.ModelSerializer):
    embeddings = EmbeddingSerializer(many=True, read_only=True)

    class Meta:
        model = AIModel
        fields = ['id', 'name', 'description', 'created_at', 'updated_at', 'embeddings']
