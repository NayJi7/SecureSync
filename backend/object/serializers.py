from rest_framework import serializers
from .models import Object
from rest_framework import viewsets

class ObjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Object
        fields = '__all__'

