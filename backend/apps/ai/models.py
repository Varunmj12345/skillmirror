from django.db import models

class AIModel(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Embedding(models.Model):
    model = models.ForeignKey(AIModel, related_name='embeddings', on_delete=models.CASCADE)
    vector = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Embedding for {self.model.name}"

class Pipeline(models.Model):
    name = models.CharField(max_length=255)
    steps = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name