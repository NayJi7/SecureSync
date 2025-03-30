from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import CustomUser

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True)
    photo = forms.ImageField(required=False)
    
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password1', 'password2', 'photo']

class CustomAuthenticationForm(AuthenticationForm):
    username = forms.CharField(label="Nom d'utilisateur", widget=forms.TextInput(attrs={
        'class': 'form-control',
        'placeholder': 'Entrez votre nom d\'utilisateur'
    }))
    password = forms.CharField(widget=forms.PasswordInput(attrs={
        'class': 'form-control',
        'placeholder': 'Entrez votre mot de passe'
    }))
    
    class Meta:
        model = CustomUser
        fields = ['username', 'password']

class CustomUserUpdateForm(forms.ModelForm):
    """
    Formulaire pour la mise à jour des informations de profil
    """
    email = forms.EmailField(required=True)
    photo = forms.ImageField(required=False)
    
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'photo'] 
        # Vous pouvez ajouter d'autres champs selon votre modèle CustomUser