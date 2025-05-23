from rest_framework import serializers
from .models import CustomUser, UserActivityLog, Prison
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.hashers import check_password
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


class PrisonSerializer(serializers.ModelSerializer):
    """
    Serializer pour le modèle Prison.
    """
    class Meta:
        model = Prison
        fields = ['id', 'nom', 'nb_detenus', 'date_creation']
        read_only_fields = ['id', 'date_creation']  # L'ID est auto-généré


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'photo', 'sexe', 'date_naissance', 'date_joined', 'password']

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

class UpdateUserPrisonSerializer(serializers.Serializer):
    prison_id = serializers.CharField(required=True)
    
    def validate_prison_id(self, value):
        # Vérifier si l'ID de prison existe dans la base de données
        try:
            Prison.objects.get(id=value)
        except Prison.DoesNotExist:
            raise serializers.ValidationError("Prison ID invalide.")
        return value

class RegisterSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    # Mapper `nom` à `last_name` et `prenom` à `first_name`
    nom = serializers.CharField(source='last_name', write_only=True)
    prenom = serializers.CharField(source='first_name', write_only=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password1', 'password2', 'photo', 'sexe', 'date_naissance', 'nom', 'prenom','section', 'prison', 'role']

    def validate(self, attrs):
        if attrs['password1'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password1')

        # Définir les valeurs par défaut si les champs sont vides
        if 'sexe' not in validated_data or validated_data['sexe'] == '':
            validated_data['sexe'] = 'M'
        
        if 'role' not in validated_data or validated_data['role'] == '':
            validated_data['role'] = 'employe'
            
        if 'prison' not in validated_data or validated_data['prison'] == '':
            validated_data['prison'] = 'paris'
            
        if 'section' not in validated_data or validated_data['section'] == '':
            validated_data['section'] = 'a'

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
                  'date_naissance', 'sexe', 'photo', 'role', 'points']
        read_only_fields = ['username']  # Nom d'utilisateur ne peut pas être modifié


# serializers.py
from rest_framework import serializers
from .models import CustomUser

class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'first_name', 'last_name', 'sexe', 'date_naissance', 'date_joined', 'role', 'section', 'prison', 'points']

class UserActivityLogSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = UserActivityLog
        fields = ['id', 'user', 'action', 'timestamp']
        
    def get_user(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'username': obj.user.username,
                'role': obj.user.role,
                'prison': obj.user.prison,
                'full_name': f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username
            }
        return None

