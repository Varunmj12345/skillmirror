from rest_framework import serializers
from .models import SmartAlert

class SmartAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = SmartAlert
        fields = '__all__'
