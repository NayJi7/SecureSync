from rest_framework import serializers
from .models import CustomUser
from .models import CustomUser
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.hashers import check_password
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


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



class RegisterSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    # Mapper `nom` à `last_name` et `prenom` à `first_name`
    nom = serializers.CharField(source='last_name', write_only=True)
    prenom = serializers.CharField(source='first_name', write_only=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password1', 'password2', 'photo', 'sexe', 'date_naissance', 'nom', 'prenom']

    def validate(self, attrs):
        if attrs['password1'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password1')

        # Crée un utilisateur avec les données validées
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user


# Créez un serializer pour le profil dans serializers.py
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'first_name', 'last_name', 
                  'date_naissance', 'sexe', 'photo']
        read_only_fields = ['username']  # Nom d'utilisateur ne peut pas être modifié

