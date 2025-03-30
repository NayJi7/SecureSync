# accounts/views.py
from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from .forms import CustomUserCreationForm, CustomAuthenticationForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .forms import CustomUserUpdateForm 
from .models import CustomUser
def index(request):
    return render(request, 'index.html')

@login_required
def home_view(request):
    return render(request, 'home.html')  # Affiche home.html

def register(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST, request.FILES)  # Prendre en compte les fichiers pour l'image
        if form.is_valid():
            user = form.save()  # Crée le compte utilisateur
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

