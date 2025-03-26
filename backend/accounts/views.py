# accounts/views.py
from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import login, authenticate
from django.http import HttpResponse
from django.contrib import messages
from django.contrib.auth.models import User

def index(request):
    return render(request, 'index.html')

def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('index')  # Redirige vers la page d'accueil après la connexion
    else:
        form = AuthenticationForm()
    return render(request, 'login.html', {'form': form})


def home_view(request):
    return render(request, 'home.html')  # Affiche home.html

def signup_view(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            # Sauvegarder l'utilisateur dans la base de données
            user = form.save(commit=False)
            user.is_active = True  # Assurez-vous que l'utilisateur est actif
            user.save()

            # Message de succès et redirection
            messages.success(request, "Compte créé avec succès ! 🎉 Connectez-vous maintenant.")
            return redirect('login')  # Redirige vers la page de connexion
        else:
            messages.error(request, "Erreur dans la création du compte. Veuillez vérifier vos informations.")
    else:
        form = UserCreationForm()  # Si la requête n'est pas en POST, crée un formulaire vide
    return render(request, 'signup.html', {'form': form})
