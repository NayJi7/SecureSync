# accounts/views.py

from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django import forms
from django.contrib.auth.hashers import check_password
from .models import CustomUser, UserActivityLog, Prison
from .forms import CustomUserCreationForm, CustomAuthenticationForm, CustomUserUpdateForm

from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from .serializers import ProfileSerializer, PrisonSerializer
from .serializers import UserActivityLogSerializer
import logging
logger = logging.getLogger(__name__)


from .serializers import (
    CustomUserSerializer, 
    RegisterSerializer,
    UserLoginSerializer, 
    OTPVerificationSerializer, 
    ResendOTPSerializer,
    UpdateUserPrisonSerializer,
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
            if user.role == 'admin':
                user.is_staff = True
                user.is_superuser = True
                user.save()
            
            # Récupère les données pour l'email
            email = user.email
            username = user.username
            password = self.request.data.get('password1')
            
            # Ajout de log
            logger.info(f"Utilisateur {username} créé avec succès, tentative d'envoi d'email")
            UserActivityLog.objects.create(
            user=user,
            action='create',
            )
            
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
        try:
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
            
            # Essayer d'envoyer l'email mais toujours retourner le code dans le frontend
            try:
                send_otp_email(email, otp.code)
                email_sent = True
                logger.info(f"Email envoyé avec succès à {email}")
            except Exception as email_error:
                logger.error(f"Failed to send OTP email: {str(email_error)}")
                email_sent = False
            
            # Toujours retourner le code OTP pour affichage dans le frontend
            debug_otp_code = otp.code
            logger.info(f"Code OTP généré pour {email}: {otp.code}")
            
            UserActivityLog.objects.create(
                user=user,
                action='otp_request',
            )
            
            response_data = {
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token)
                },
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                },
                'email_sent': email_sent,
                'message': 'Code OTP généré'
            }
            
            # Toujours inclure le code OTP dans la réponse pour affichage frontend
            response_data['otp_code'] = debug_otp_code
            response_data['message'] = f'Code OTP généré et {"envoyé par email" if email_sent else "email non envoyé"}'
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Login API Error: {str(e)}")
            return Response(
                {'detail': 'Une erreur interne s\'est produite.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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
        UserActivityLog.objects.create(
            user=request.user,
            action='otp_validate',
        )

        refresh = RefreshToken.for_user(request.user)

        # Déterminer la prison de l'utilisateur
        prison_id = request.user.prison

        # Stocker le rôle de l'utilisateur
        user_role = 'admin' if request.user.is_superuser or request.user.role == 'admin' else 'user'
        
        return Response({
            'detail': 'OTP vérifié avec succès.',
            'sessionToken': str(refresh.access_token),
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'prison_id': prison_id,
                'role': user_role
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
        
        # Essayer d'envoyer l'email mais toujours retourner le code dans le frontend
        try:
            send_otp_email(email, otp.code)
            email_sent = True
            logger.info(f"Nouvel email envoyé avec succès à {email}")
        except Exception as email_error:
            logger.error(f"Failed to send OTP email: {str(email_error)}")
            email_sent = False
        
        # Toujours retourner le code OTP pour affichage dans le frontend
        debug_otp_code = otp.code
        logger.info(f"Nouveau code OTP généré pour {email}: {otp.code}")
        message = f'Nouveau code généré et {"envoyé par email" if email_sent else "email non envoyé"}'
        
        UserActivityLog.objects.create(
            user=request.user,
            action='otp_request',
        )

        response_data = {
            'detail': message,
            'email_sent': email_sent,
            'otp_code': debug_otp_code  # Toujours inclure le code OTP
        }
        
        return Response(response_data)

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
    UserActivityLog.objects.create(
        user=request.user,
        action='Modification du profil'
    )
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
    
    def get(self, request, username=None):
        # Si un nom d'utilisateur est spécifié, renvoyer les détails de cet utilisateur
        if username:
            try:
                user = CustomUser.objects.get(username=username)
                serializer = StaffSerializer(user)
                print(f"Détails utilisateur récupérés pour {username}:", serializer.data)
                return Response(serializer.data)
            except CustomUser.DoesNotExist:
                return Response({"error": "Utilisateur non trouvé"}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Récupère tous les utilisateurs
            users = CustomUser.objects.all()
            # Sérialiser les utilisateurs
            serializer = StaffSerializer(users, many=True)
            # Pour déboguer
            print("Données renvoyées:", serializer.data)
            return Response(serializer.data)
            
    def put(self, request, username=None):
        # Vérification que nous avons un nom d'utilisateur
        if not username:
            return Response({"error": "Nom d'utilisateur non spécifié"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = CustomUser.objects.get(username=username)
            
            serializer = StaffSerializer(user, data=request.data, partial=True)
            
            if serializer.is_valid():
                updated_user = serializer.save()
                
                if updated_user.role == 'admin':
                    updated_user.is_staff = True
                    updated_user.is_superuser = True
                    updated_user.save()
                else:
                    if 'is_staff' not in request.data and 'is_superuser' not in request.data:
                        updated_user.is_staff = False
                        updated_user.is_superuser = False
                        updated_user.save()
                
                return Response(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except CustomUser.DoesNotExist:
            return Response({"error": "Utilisateur non trouvé"}, status=status.HTTP_404_NOT_FOUND)

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
            UserActivityLog.objects.create(
            user=current_user,
            action='delete',
            )
            # L'utilisateur supprime son propre compte
            user_to_delete.delete()
            return Response({"message": f"Votre compte a été supprimé avec succès."}, 
                          status=status.HTTP_200_OK)
        elif current_user.role == 'admin':
            UserActivityLog.objects.create(
            user=current_user,
            action='delete',
            )
            # Un admin peut supprimer n'importe quel compte
            user_to_delete.delete()
            return Response({"message": f"Le compte de {username} a été supprimé avec succès."}, 
                          status=status.HTTP_200_OK)
        elif current_user.role == 'gerant' and (user_to_delete.role == 'gestionnaire' or user_to_delete.role == 'employe'):
            UserActivityLog.objects.create(
            user=current_user,
            action='delete',
            )
            # Un gérant peut supprimer les gestionnaires et les employés
            user_to_delete.delete()
            return Response({"message": f"Le compte de {username} a été supprimé avec succès."}, 
                          status=status.HTTP_200_OK)
        elif current_user.role == 'gestionnaire' and user_to_delete.role == 'employe':
            UserActivityLog.objects.create(
            user=current_user,
            action='delete',
            )
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_point(request):
    try:
        # Récupérer l'utilisateur courant
        user = request.user
        # Vérifier si le modèle a un champ 'points' directement
        if hasattr(user, 'points'):
            points_to_add = int(request.data.get('points', 0))
            user.points += points_to_add
            user.save()
            return Response({'status': 'success', 'new_total': user.points})
        # Si le champ 'points' n'existe pas directement sur l'utilisateur
        elif hasattr(user, 'profile') and hasattr(user.profile, 'points'):
            # Si on a une relation 'profile' avec un champ 'points'
            user_profile = user.profile
            points_to_add = int(request.data.get('points', 0))
            user_profile.points += points_to_add
            user_profile.save()
            return Response({'status': 'success', 'new_total': user_profile.points})
        else:
            # Si aucun des cas ci-dessus ne correspond
            return Response(
                {'status': 'error', 'message': 'Impossible de trouver le champ points'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    except Exception as e:
        # Logging de l'erreur
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Erreur dans add_point: {str(e)}")
        # Retourner une réponse d'erreur
        return Response(
            {'status': 'error', 'message': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_user_prison(request):
    """
    Endpoint pour permettre à un administrateur de changer sa prison assignée.
    L'utilisateur doit être authentifié et avoir le rôle 'admin'.
    """
    # Vérifier que l'utilisateur est un administrateur
    if request.user.role != 'admin':
        return Response(
            {'detail': 'Seuls les administrateurs peuvent changer leur prison assignée'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Valider les données de la requête
    serializer = UpdateUserPrisonSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Récupérer l'ID de la prison depuis les données validées
    prison_id = serializer.validated_data['prison_id']
    
    # Mettre à jour le champ prison de l'utilisateur
    request.user.prison = prison_id
    request.user.save()
    
    # Retourner une réponse de succès avec les détails mis à jour
    return Response({
        'detail': f'Prison mise à jour avec succès vers {prison_id}',
        'user': {
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'prison': request.user.prison,
            'role': request.user.role
        }
    }, status=status.HTTP_200_OK)

class UserActivityLogListView(generics.ListAPIView):
    queryset = UserActivityLog.objects.select_related('user').order_by('-timestamp')[:100]
    serializer_class = UserActivityLogSerializer


# =======================
# ✅ API REST - Gestion des Prisons
# =======================

# =======================
# 🏢 API REST - Gestion des prisons
# =======================

class PrisonListView(APIView):
    """
    Vue pour lister toutes les prisons et en créer de nouvelles.
    Seuls les administrateurs peuvent accéder à cette vue.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Récupère toutes les prisons."""
        # Vérification des permissions (admin seulement)
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Seuls les administrateurs peuvent accéder à cette ressource.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        prisons = Prison.objects.all().order_by('nom')
        serializer = PrisonSerializer(prisons, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Crée une nouvelle prison."""
        # Vérification des permissions (admin seulement)
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Seuls les administrateurs peuvent créer des prisons.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = PrisonSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            UserActivityLog.objects.create(
                user=request.user,
                action=f'create_prison_{serializer.instance.id}'
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PrisonDetailView(APIView):
    """
    Vue pour gérer les opérations sur une prison spécifique.
    Seuls les administrateurs peuvent accéder à cette vue.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, prison_id):
        """Récupère une prison par son ID."""
        try:
            return Prison.objects.get(pk=prison_id)
        except Prison.DoesNotExist:
            return None

    def get(self, request, prison_id):
        """Récupère les détails d'une prison spécifique."""
        # Vérification des permissions (admin seulement)
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Seuls les administrateurs peuvent accéder à cette ressource.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        prison = self.get_object(prison_id)
        if not prison:
            return Response(
                {'detail': f'La prison avec l\'ID {prison_id} n\'existe pas.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = PrisonSerializer(prison)
        return Response(serializer.data)

    def delete(self, request, prison_id):
        """Supprime une prison spécifique."""
        # Vérification des permissions (admin seulement)
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Seuls les administrateurs peuvent supprimer des prisons.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        prison = self.get_object(prison_id)
        if not prison:
            return Response(
                {'detail': f'La prison avec l\'ID {prison_id} n\'existe pas.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Vérifier si des utilisateurs sont associés à cette prison
        users_count = CustomUser.objects.filter(prison=prison_id).count()
        if users_count > 0:
            return Response(
                {'detail': f'Impossible de supprimer cette prison car {users_count} utilisateur(s) y sont associés.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Log de l'action avant de supprimer
        UserActivityLog.objects.create(
            user=request.user,
            action=f'delete_prison_{prison_id}'
        )
        
        # Suppression de la prison
        prison.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_logout(request):
    """Endpoint pour enregistrer la déconnexion d'un utilisateur"""
    UserActivityLog.objects.create(
        user=request.user,
        action='logout'
    )
    return Response({'detail': 'Déconnexion enregistrée avec succès'})