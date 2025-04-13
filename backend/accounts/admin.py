# accounts/admin.py
from django.contrib import admin
from .models import CustomUser  # Si tu as un modèle User personnalisé, sinon supprime cette ligne
from .models import OTPCode

admin.site.register(CustomUser)  # Enregistrer le modèle User dans l'admin
admin.site.register(OTPCode)
