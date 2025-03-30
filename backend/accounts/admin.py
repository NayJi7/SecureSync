# accounts/admin.py
from django.contrib import admin
from .models import CustomUser  # Si tu as un modèle User personnalisé, sinon supprime cette ligne

admin.site.register(CustomUser)  # Enregistrer le modèle User dans l'admin
