from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import CustomUser

class CustomUserCreationForm(UserCreationForm):
    GENDER_CHOICES = [
    ('M', 'Homme'),
    ('F', 'Femme'),
    ('O', 'Autre'),
]
    email = forms.EmailField(required=True)
    photo = forms.ImageField(required=False)
    sexe = forms.ChoiceField(choices=GENDER_CHOICES, widget=forms.Select(), required=False)
    nom = forms.CharField( max_length=100, required=True,widget=forms.TextInput(attrs={'placeholder': 'Votre nom', 'class': 'form-control'}),label="Nom" )
    prenom = forms.CharField( max_length=100, required=True,widget=forms.TextInput(attrs={'placeholder': 'Votre prenom', 'class': 'form-control'}),label="Prenom" )
    date_naissance = forms.DateField(required=True,widget=forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),label="Date de naissance")

    
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password1', 'password2', 'photo','sexe','nom','prenom','date_naissance' ]

class CustomAuthenticationForm(AuthenticationForm):
    username = forms.CharField(label="Nom d'utilisateur", widget=forms.TextInput(attrs={
        'class': 'form-control',
        'placeholder': 'Entrez votre nom d\'utilisateur'
    }))
    password = forms.CharField(widget=forms.PasswordInput(attrs={
        'class': 'form-control',
        'placeholder': 'Entrez votre mot de passe'
    }))
    

class CustomUserUpdateForm(forms.ModelForm):
    """
    Formulaire pour la mise à jour des informations de profil
    """
    email = forms.EmailField(required=True)
    photo = forms.ImageField(required=False)
    