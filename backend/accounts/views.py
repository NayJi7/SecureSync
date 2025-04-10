# accounts/views.py
from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from .forms import CustomUserCreationForm, CustomAuthenticationForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .forms import CustomUserUpdateForm 
from .models import CustomUser
from django import forms

from rest_framework import viewsets
from .serializers import CustomUserSerializer


class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer



def index(request):
    return render(request, 'index.html')

@login_required
def home_view(request):
    return render(request, 'home.html')  # Affiche home.html

def register(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST, request.FILES)  # Prendre en compte les fichiers pour l'image
        if form.is_valid():
            user = form.save(commit=False)  # On ne sauvegarde pas tout de suite pour modifier les champs
            user.email = form.cleaned_data['email']
            user.photo = form.cleaned_data['photo']
            user.sexe = form.cleaned_data['sexe']
            user.first_name = form.cleaned_data['prenom']  # first_name correspond à prenom
            user.last_name = form.cleaned_data['nom']  # last_name correspond à nom
            user.date_naissance = form.cleaned_data['date_naissance']
            user.save()  # Maintenant, on sauvegarde
            login(request, user)  # Connecte automatiquement l'utilisateur
            messages.success(request, "Votre compte a été créé avec succès !")  # Message de succès
            return redirect('home')  # Redirige vers la page d'accueil
        else:
            messages.error(request, "Une erreur est survenue. Veuillez vérifier les champs.")  # Message d'erreur
    else:
        form = CustomUserCreationForm()  # Crée un formulaire vide si la méthode est GET

    # Retourne la page d'inscription avec le formulaire
    return render(request, "register.html", {"form": form})

def user_login(request):
    if request.method == "POST":
        form = CustomAuthenticationForm(data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                login(request, user)
                messages.success(request, f"Bienvenue {username} !")
                return redirect('home')
            else:
                messages.error(request, "Nom d'utilisateur ou mot de passe incorrect.")
        else:
            messages.error(request, "Erreur dans le formulaire. Vérifiez vos informations.")
    else:
        form = CustomAuthenticationForm()
    
    # Important : changez ceci pour utiliser login.html au lieu de home.html
    return render(request, 'login.html', {'form': form})

def user_logout(request):
    logout(request)
    return redirect("login")  # Redirige vers la page de connexion après la déconnexion

@login_required
def profile_view(request):
    """
    Affiche le profil de l'utilisateur actuellement connecté
    """
    # Aucune logique particulière requise puisque l'utilisateur est déjà disponible via request.user
    return render(request, 'profile.html')

@login_required
def edit_profile(request):
    """
    Permet à l'utilisateur de modifier son profil
    """
    if request.method == 'POST':
        form = CustomUserUpdateForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, "Votre profil a été mis à jour avec succès.")
            return redirect('profile')
        else:
            messages.error(request, "Une erreur est survenue. Veuillez vérifier les informations fournies.")
    else:
        form = CustomUserUpdateForm(instance=request.user)
    
    return render(request, 'edit_profile.html', {'form': form})


class EditProfileForm(forms.ModelForm):
    """Formulaire de modification de profil utilisateur"""
    
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'photo']
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'photo': forms.FileInput(attrs={'class': 'form-control'}),
        }
    
    def clean_username(self):
        username = self.cleaned_data.get('username')
        user_id = self.instance.id
        
        # Vérifier si le nom d'utilisateur existe déjà (pour un autre utilisateur)
        if CustomUser.objects.filter(username=username).exclude(id=user_id).exists():
            raise forms.ValidationError("Ce nom d'utilisateur est déjà utilisé.")
        
        return username
    
    def clean_email(self):
        email = self.cleaned_data.get('email')
        user_id = self.instance.id
        
        # Vérifier si l'email existe déjà (pour un autre utilisateur)
        if CustomUser.objects.filter(email=email).exclude(id=user_id).exists():
            raise forms.ValidationError("Cet email est déjà utilisé.")
        
        return email
    
    def clean_photo(self):
        photo = self.cleaned_data.get('photo')
        if photo:
            # Vérifier la taille du fichier (5MB max)
            if hasattr(photo, 'size') and photo.size > 5 * 1024 * 1024:
                raise forms.ValidationError("La taille de l'image ne doit pas dépasser 5 MB.")
            
            # Vérifier le format du fichier
            if hasattr(photo, 'content_type'):
                # Si c'est un nouveau fichier téléchargé
                allowed_formats = ['image/jpeg', 'image/png', 'image/gif']
                if photo.content_type not in allowed_formats:
                    raise forms.ValidationError("Seuls les formats JPG, PNG et GIF sont acceptés.")
            else:
                # Pour les fichiers existants, vérifier l'extension
                import os
                ext = os.path.splitext(photo.name)[1].lower()
                if ext not in ['.jpg', '.jpeg', '.png', '.gif']:
                    raise forms.ValidationError("Seuls les formats JPG, PNG et GIF sont acceptés.")
        
        return photo

@login_required
def edit_profile(request):
    """
    Vue pour modifier le profil utilisateur avec tous les champs requis
    """
    if request.method == 'POST':
        form = CustomUserUpdateForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, "Votre profil a été mis à jour avec succès.")
            return redirect('profile')  # Redirection vers la page de profil
        else:
            messages.error(request, "Une erreur est survenue. Veuillez vérifier les informations fournies.")
    else:
        form = CustomUserUpdateForm(instance=request.user)
    
    return render(request, 'edit_profile.html', {'form': form})


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import OTPCode
from .serializers import UserLoginSerializer, OTPVerificationSerializer, ResendOTPSerializer
from .utils import send_otp_email

class LoginAPIView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        username = serializer.validated_data.get('username')
        email = serializer.validated_data.get('email')
        password = serializer.validated_data.get('password')
        
        # Authentifier l'utilisateur
        user = authenticate(username=username, password=password)
        
        if not user:
            return Response({'detail': 'Identifiants invalides. Veuillez vérifier votre nom d\'utilisateur et mot de passe.'}, 
                            status=status.HTTP_401_UNAUTHORIZED)
        
        # Vérifier que l'email correspond à l'utilisateur
        if user.email != email:
            return Response({'detail': 'L\'email ne correspond pas à cet utilisateur.'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        # Créer un token JWT
        refresh = RefreshToken.for_user(user)
        tokens = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
        
        # Créer un code OTP et l'envoyer par email
        otp = OTPCode.objects.create(user=user, email=email)
        send_otp_email(email, otp.code)
        
        return Response({
            'tokens': tokens,
            'access': str(refresh.access_token),  # Pour compatibilité avec votre frontend
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = OTPVerificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        code = serializer.validated_data.get('code')
        email = serializer.validated_data.get('email')
        
        # Récupérer le dernier code OTP valide pour cet utilisateur et cet email
        try:
            otp = OTPCode.objects.filter(
                user=request.user,
                email=email,
                is_used=False
            ).latest('created_at')
        except OTPCode.DoesNotExist:
            return Response({'detail': 'Aucun code de vérification valide trouvé.'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier la validité du code
        if not otp.is_valid():
            return Response({'detail': 'Le code de vérification a expiré.'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        if otp.code != code:
            return Response({'detail': 'Code de vérification incorrect.'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        # Marquer le code comme utilisé
        otp.is_used = True
        otp.save()
        
        # Créer un token de session pour l'utilisateur authentifié
        refresh = RefreshToken.for_user(request.user)
        session_token = str(refresh.access_token)
        
        return Response({
            'detail': 'Vérification réussie.',
            'sessionToken': session_token,
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email
            }
        }, status=status.HTTP_200_OK)


class ResendOTPView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data.get('email')
        
        # Vérifier que l'email correspond à l'utilisateur authentifié
        if request.user.email != email:
            return Response({'detail': 'L\'email ne correspond pas à votre compte.'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        # Créer un nouveau code OTP
        otp = OTPCode.objects.create(user=request.user, email=email)
        
        # Envoyer le code par email
        send_otp_email(email, otp.code)
        
        return Response({
            'detail': 'Un nouveau code de vérification a été envoyé à votre adresse email.'
        }, status=status.HTTP_200_OK)
