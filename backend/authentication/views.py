from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required

from .forms import CustomAuthenticationForm



# Vue pour la page de connexion
def login_view(request):
    if request.method == 'POST':
        form = CustomAuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)  # Connecte l'utilisateur
                return redirect('home')  # Redirige vers la page d'accueil
            else:
                form.add_error(None, 'Identifiants incorrects')
    else:
        form = CustomAuthenticationForm()

    return render(request, 'authentication/login.html', {'form': form})

def register_view(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('login')  # Redirige vers la page de login après inscription
    else:
        form = UserCreationForm()
    
    return render(request, 'authentication/register.html', {'form': form})


def logout_view(request):
    logout(request)
    messages.info(request, 'Vous avez été déconnecté')
    return redirect('login')

def home(request):
    return render(request, 'authentication/home.html')

def login_page(request):
    return render(request, 'authentication/login.html')

