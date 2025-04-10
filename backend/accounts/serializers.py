from rest_framework import serializers
from .models import CustomUser

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'photo', 'sexe', 'date_naissance','password']

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import OTPCode

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

class OTPVerificationSerializer(serializers.Serializer):
    code = serializers.CharField(required=True, max_length=6, min_length=6)
    email = serializers.EmailField(required=True)

class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

