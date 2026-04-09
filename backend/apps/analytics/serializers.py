from rest_framework import serializers
from .models import MarketTrend, SalaryData

class MarketTrendSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketTrend
        fields = '__all__'

class SalaryDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryData
        fields = '__all__'
