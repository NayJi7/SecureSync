# accounts/views.py

from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django import forms
from django.contrib.auth.hashers import check_password
from .models import CustomUser
from .forms import CustomUserCreationForm, CustomAuthenticationForm, CustomUserUpdateForm

from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from .serializers import ProfileSerializer
import logging
logger = logging.getLogger(__name__)


from .serializers import (
    CustomUserSerializer, 
    RegisterSerializer,
    UserLoginSerializer, 
    OTPVerificationSerializer, 
    ResendOTPSerializer,
    StaffSerializer
)
from .models import OTPCode
from .utils import send_otp_email
from .utils import send_otp_email_Register


from django.contrib.auth import get_user_model

# =======================
# ✅ API REST - Utilisateurs
# =======================

class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AllowAny]

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        try:
            # Sauvegarde l'utilisateur
            user = serializer.save()
            
            # Récupère les données pour l'email
            email = user.email
            username = user.username
            password = self.request.data.get('password1')
            
            # Ajout de log
            logger.info(f"Utilisateur {username} créé avec succès, tentative d'envoi d'email")
            
            # Envoi de l'email
            email_sent = send_otp_email_Register(email, username, password)
            
            if not email_sent:
                logger.warning(f"L'email n'a pas pu être envoyé à {email}")
            
            return user
        except Exception as e:
            logger.error(f"Erreur dans perform_create: {str(e)}")
            raise

# =======================
# ✅ API REST - Authentification avec OTP
# =======================

class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        username = serializer.validated_data.get('username')
        email = serializer.validated_data.get('email')
        password = serializer.validated_data.get('password')

        user = authenticate(username=username, password=password)

        if not user:
            return Response({'detail': 'Identifiants invalides.'}, status=status.HTTP_401_UNAUTHORIZED)

        if user.email != email:
            return Response({'detail': 'Email incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

        refresh = RefreshToken.for_user(user)
        otp = OTPCode.objects.create(user=user, email=email)
        send_otp_email(email, otp.code)

        return Response({
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token)
            },
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        })

class VerifyOTPView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = OTPVerificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        code = serializer.validated_data['code']
        email = serializer.validated_data['email']

        try:
            otp = OTPCode.objects.filter(user=request.user, email=email, is_used=False).latest('created_at')
        except OTPCode.DoesNotExist:
            return Response({'detail': 'Aucun code OTP valide.'}, status=status.HTTP_400_BAD_REQUEST)

        if not otp.is_valid():
            return Response({'detail': 'Le code a expiré.'}, status=status.HTTP_400_BAD_REQUEST)

        if otp.code != code:
            return Response({'detail': 'Code incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

        otp.is_used = True
        otp.save()

        refresh = RefreshToken.for_user(request.user)

        return Response({
            'detail': 'OTP vérifié avec succès.',
            'sessionToken': str(refresh.access_token),
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email
            }
        })

class ResendOTPView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']

        if request.user.email != email:
            return Response({'detail': "Email ne correspond pas à l'utilisateur connecté."}, status=status.HTTP_400_BAD_REQUEST)

        otp = OTPCode.objects.create(user=request.user, email=email)
        send_otp_email(email, otp.code)

        return Response({'detail': 'Nouveau code envoyé.'})


# =======================
# 🌐 Vues HTML Django (Frontend classique)
# =======================

def index(request):
    return render(request, 'index.html')

@login_required
def home_view(request):
    return render(request, 'home.html')

def register(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST, request.FILES)
        if form.is_valid():
            user = form.save(commit=False)
            user.email = form.cleaned_data['email']
            user.photo = form.cleaned_data['photo']
            user.sexe = form.cleaned_data['sexe']
            user.first_name = form.cleaned_data['prenom']
            user.last_name = form.cleaned_data['nom']
            user.date_naissance = form.cleaned_data['date_naissance']
            user.section = form.cleaned_data['section']
            user.save()
            login(request, user)
            messages.success(request, "Compte créé avec succès.")
            return redirect('home')
        else:
            messages.error(request, "Erreur dans le formulaire.")
    else:
        form = CustomUserCreationForm()

    return render(request, "register.html", {"form": form})

def user_login(request):
    if request.method == "POST":
        form = CustomAuthenticationForm(data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, username=username, password=password)
            if user:
                login(request, user)
                messages.success(request, f"Bienvenue {username} !")
                return redirect('home')
            else:
                messages.error(request, "Identifiants incorrects.")
        else:
            messages.error(request, "Formulaire invalide.")
    else:
        form = CustomAuthenticationForm()
    
    return render(request, 'login.html', {'form': form})

def user_logout(request):
    logout(request)
    return redirect("login")

@login_required
def profile_view(request):
    return render(request, 'profile.html')

@login_required
def edit_profile(request):
    if request.method == 'POST':
        form = CustomUserUpdateForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, "Profil mis à jour.")
            return redirect('profile')
        else:
            messages.error(request, "Erreur lors de la mise à jour.")
    else:
        form = CustomUserUpdateForm(instance=request.user)

    return render(request, 'edit_profile.html', {'form': form})

# Ajoutez ces endpoints à views.py
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_api_view(request):
    """Endpoint pour récupérer les informations du profil"""
    serializer = ProfileSerializer(request.user)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile_api_view(request):
    """Endpoint pour mettre à jour le profil avec vérification du mot de passe"""
    # Récupération du mot de passe pour vérification
    password = request.data.get('password', '')
    
    # Vérification du mot de passe
    if not check_password(password, request.user.password):
        return Response({'detail': 'Mot de passe incorrect'}, status=status.HTTP_403_FORBIDDEN)
    
    # Mise à jour du profil
    serializer = ProfileSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_password_view(request):
    """Endpoint pour vérifier uniquement le mot de passe de l'utilisateur connecté sans déclencher de connexion/OTP"""
    password = request.data.get('password', '')
    
    # Vérification du mot de passe de l'utilisateur connecté
    if not check_password(password, request.user.password):
        return Response({'detail': 'Mot de passe incorrect'}, status=status.HTTP_401_UNAUTHORIZED)
    
    # Si le mot de passe est correct, on renvoie une réponse positive
    return Response({
        'detail': 'Mot de passe vérifié avec succès',
        'user': {
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email
        }
    })

class StaffView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        # Récupère tous les utilisateurs
        users = CustomUser.objects.all()
        # Sérialiser les utilisateurs
        serializer = StaffSerializer(users, many=True)
        # Pour déboguer
        print("Données renvoyées:", serializer.data)
        return Response(serializer.data)


User = get_user_model()

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request, username=None):
    """
    Supprime le compte de l'utilisateur spécifié par username si l'utilisateur connecté
    en a le droit (admin pour tous ou gestionnaire pour les employés).
    L'utilisateur peut aussi supprimer son propre compte s'il fournit son username.
    """
    User = get_user_model()  # Utilisation correcte du modèle utilisateur
    
    # Si un username est fourni (suppression d'un autre utilisateur)
    if username:
        # Vérification que l'utilisateur à supprimer existe
        try:
            user_to_delete = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "Utilisateur non trouvé."}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        # Vérification des permissions
        current_user = request.user
        if current_user.username == username:
            # L'utilisateur supprime son propre compte
            user_to_delete.delete()
            return Response({"message": f"Votre compte a été supprimé avec succès."}, 
                          status=status.HTTP_200_OK)
        elif current_user.role == 'admin':
            # Un admin peut supprimer n'importe quel compte
            user_to_delete.delete()
            return Response({"message": f"Le compte de {username} a été supprimé avec succès."}, 
                          status=status.HTTP_200_OK)
        elif current_user.role == 'gerant' and (user_to_delete.role == 'gestionnaire' or user_to_delete.role == 'employe'):
            # Un gérant peut supprimer les gestionnaires et les employés
            user_to_delete.delete()
            return Response({"message": f"Le compte de {username} a été supprimé avec succès."}, 
                          status=status.HTTP_200_OK)
        elif current_user.role == 'gestionnaire' and user_to_delete.role == 'employe':
            # Un gestionnaire peut supprimer uniquement les employés
            user_to_delete.delete()
            return Response({"message": f"Le compte de {username} a été supprimé avec succès."}, 
                          status=status.HTTP_200_OK)
        else:
            # Autres cas : permission refusée
            return Response({"error": "Vous n'avez pas les permissions nécessaires pour supprimer cet utilisateur."}, 
                          status=status.HTTP_403_FORBIDDEN)
    else:
        # Aucun username fourni, ce cas ne devrait pas arriver avec l'API actuelle
        return Response({"error": "Nom d'utilisateur non spécifié."}, 
                      status=status.HTTP_400_BAD_REQUEST)