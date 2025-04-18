from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import CustomUser
from django.db import models

class CustomUserCreationForm(UserCreationForm):
    GENDER_CHOICES = [
        ('M', 'Homme'),
        ('F', 'Femme'),
        ('O', 'Autre'),
    ]
    ROLE_CHOICES = [
        ('admin', 'Administrateur'),
        ('gestionnaire', 'Gestionnaire'),
        ('employe', 'Employé')
    ]

    SECTION_CHOICES = [
    ('a', 'Section A'),
    ('b', 'Section B'),
    ('c', 'Section C'),
    ('toutes', 'Toutes')
]   

    PRISON_CHOICES = [
        ('paris', 'Paris'),
        ('lyon', 'Lyon'),
        ('marseille', 'Marseille'),
        ('cergy', 'Cergy')
    ]

    email = forms.EmailField(required=True)
    photo = forms.ImageField(required=False)
    sexe = forms.ChoiceField(choices=GENDER_CHOICES, required=True)
    nom = forms.CharField(max_length=100)
    prenom = forms.CharField(max_length=100)
    date_naissance = forms.DateField(required=False, widget=forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}), label="Date de naissance")
    roles = forms.ChoiceField(choices=ROLE_CHOICES, required=True)
    section = forms.ChoiceField(choices=SECTION_CHOICES, required=True)
    Prison_id = forms.ChoiceField(choices=PRISON_CHOICES, required=True)
    
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password1', 'password2', 'photo', 'sexe', 'nom', 'prenom', 'date_naissance', 'section','roles','Prison_id']

class CustomAuthenticationForm(AuthenticationForm): 
    username = forms.CharField(label="Nom d'utilisateur", widget=forms.TextInput(attrs={
        'class': 'form-control',
        'placeholder': 'Entrez votre nom d\'utilisateur'
    }))
    password = forms.CharField(widget=forms.PasswordInput(attrs={
        'class': 'form-control',
        'placeholder': 'Entrez votre mot de passe'
    }))
    
import os

class CustomUserUpdateForm(forms.ModelForm):
    """Formulaire de modification de profil utilisateur avec champs optionnels"""
    
    # Les champs essentiels restent obligatoires
    username = forms.CharField(
        label="Nom d'utilisateur",
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    email = forms.EmailField(
        label="Email",
        widget=forms.EmailInput(attrs={'class': 'form-control'})
    )
    
    # Les autres champs sont maintenant optionnels
    nom = forms.CharField(
        label="Nom",
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    prenom = forms.CharField(
        label="Prénom",
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    sexe = forms.ChoiceField(
        label="Sexe", 
        choices=[('M', 'Homme'), ('F', 'Femme')],
        required=False,
        widget=forms.RadioSelect(attrs={'class': 'form-check-input'})
    )
    date_naissance = forms.DateField(
        label="Date de naissance",
        required=False,
        widget=forms.DateInput(attrs={'class': 'form-control', 'type': 'date'})
    )
    photo = forms.ImageField(
        label="Photo de profil",
        required=False,
        widget=forms.FileInput(attrs={'class': 'form-control'})
    )
    
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'nom', 'prenom', 'sexe', 'date_naissance', 'photo']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Initialiser les champs avec les valeurs actuelles
        if self.instance:
            self.fields['nom'].initial = self.instance.last_name
            self.fields['prenom'].initial = self.instance.first_name
    
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
        if photo and hasattr(photo, 'size'):  # Vérifier si c'est un nouveau fichier
            # Vérifier la taille du fichier (5MB max)
            if photo.size > 5 * 1024 * 1024:
                raise forms.ValidationError("La taille de l'image ne doit pas dépasser 5 MB.")
            
            # Vérifier le format du fichier pour les nouveaux uploads
            if hasattr(photo, 'content_type'):
                allowed_formats = ['image/jpeg', 'image/png', 'image/gif']
                if photo.content_type not in allowed_formats:
                    raise forms.ValidationError("Seuls les formats JPG, PNG et GIF sont acceptés.")
            else:
                # Vérifier l'extension de fichier
                ext = os.path.splitext(photo.name)[1].lower()
                if ext not in ['.jpg', '.jpeg', '.png', '.gif']:
                    raise forms.ValidationError("Seuls les formats JPG, PNG et GIF sont acceptés.")
        
        return photo
    
    def save(self, commit=True):
        user = super().save(commit=False)
        
        # Mettre à jour les champs first_name et last_name seulement s'ils sont fournis
        if self.cleaned_data.get('prenom'):
            user.first_name = self.cleaned_data['prenom']
        if self.cleaned_data.get('nom'):
            user.last_name = self.cleaned_data['nom']
        
        if commit:
            user.save()
        return user
