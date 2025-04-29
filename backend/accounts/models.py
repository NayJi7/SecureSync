from django.contrib.auth.models import AbstractUser
from django.db import models

def user_directory_path(instance, filename):
    return f'profile_pics/user_{instance.id}/{filename}'

class Prison(models.Model):
    """
    Modèle pour les prisons du système.
    """
    id = models.CharField(max_length=20, primary_key=True, unique=True)
    nom = models.CharField(max_length=100)
    adresse = models.TextField(blank=True, null=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    nb_detenus = models.IntegerField(default=0)
    
    def save(self, *args, **kwargs):
        # Si c'est une nouvelle prison sans ID, générer un ID basé sur le nom
        if not self.id:
            # Générer un ID basé sur le nom de la prison en minuscule sans accent
            try:
                from unidecode import unidecode
                self.id = unidecode(self.nom.lower())
            except ImportError:
                # Solution de repli si unidecode n'est pas disponible
                import unicodedata
                self.id = ''.join(
                    c for c in unicodedata.normalize('NFD', self.nom.lower())
                    if unicodedata.category(c) != 'Mn'
                )
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.nom} ({self.id})"

class CustomUser(AbstractUser):
    GENDER_CHOICES = (
        ('M', 'Masculin'),
        ('F', 'Féminin'),
        ('O', 'Autre'),
        ('N', 'Préfère ne pas préciser')
    )
    ROLE_CHOICES = [
        ('admin', 'Administrateur'),
        ('gerant', 'Gérant'),
        ('gestionnaire', 'Gestionnaire'),
        ('employe', 'Employé')
    ]

    SECTION_CHOICES = [
        ('a', 'Section A'),
        ('b', 'Section B'),
        ('c', 'Section C'),
        ('toutes', 'Toutes')
    ]   

    # Conservons les choix statiques pour la rétrocompatibilité
    PRISON_CHOICES = [
        ('paris', 'Paris'),
        ('lyon', 'Lyon'),
        ('marseille', 'Marseille'),
        ('cergy', 'Cergy')
    ]
    points = models.IntegerField(default=0)
    email = models.EmailField(unique=True)
    photo = models.ImageField(upload_to=user_directory_path, blank=True, null=True)
    sexe = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True, null=True, verbose_name="Sexe")
    date_naissance = models.DateField(null=True, blank=True)
    role = models.CharField(
        max_length=12,  # "gestionnaire"
        choices=ROLE_CHOICES,
        blank=True,
        null=True,
        verbose_name="Role"
    )

    section = models.CharField(
        max_length=6,  # "toutes"
        choices=SECTION_CHOICES,
        blank=True,
        null=True,
        verbose_name="Section"
    )

    # Champ de compatibilité pour les anciennes données
    prison = models.CharField(
        max_length=20,  # "marseille"
        choices=PRISON_CHOICES,
        blank=True,
        null=True,
        verbose_name="Prison (legacy)"
    )
    
    # Nouvelle relation vers le modèle Prison
    prison_obj = models.ForeignKey(
        'Prison',
        on_delete=models.SET_NULL,
        related_name='users',
        blank=True,
        null=True,
        verbose_name="Prison"
    )

    
        # Définir un nom spécifique pour les relations inverses
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='customuser_set',  # Un nom unique pour la relation inverse
        blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='customuser_permissions_set',  # Un nom unique pour la relation inverse
        blank=True
    )

    def save(self, *args, **kwargs):
        # Sauvegarde standard sans création d'image de profil
        super().save(*args, **kwargs)

from django.db import models
from django.conf import settings
import random
import string
from datetime import timedelta
from django.utils import timezone

class OTPCode(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE,  related_name='otps')
    email = models.EmailField()
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        # Si c'est un nouveau code
        if not self.pk:
            # Génère un code OTP à 6 chiffres
            self.code = ''.join(random.choices(string.digits, k=6))
            # Le code expire après 10 minutes
            self.expires_at = timezone.now() + timedelta(minutes=10)
        return super().save(*args, **kwargs)

    def is_valid(self):
        now = timezone.now()
        return not self.is_used and now <= self.expires_at

class UserActivityLog(models.Model):
    ACTION_TYPES = [
        ('login', 'Connexion'),
        ('logout', 'Déconnexion'),
        ('update_profile', 'Modification du profil'),
        ('password_change', 'Changement de mot de passe'),
        ('create', 'Création de compte'),
        ('delete', 'Suppression de compte'),
        ('otp_request', 'Demande de code OTP'),
        ('otp_validate', 'Validation OTP'),
        # Ajoute d'autres actions ici selon tes besoins
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    action = models.CharField(max_length=50, choices=ACTION_TYPES)
    timestamp = models.DateTimeField(default=timezone.now)
