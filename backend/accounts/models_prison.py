from django.db import models
from django.utils import timezone
from unidecode import unidecode

class Prison(models.Model):
    """
    Modèle pour les prisons du système.
    """
    id = models.CharField(max_length=50, primary_key=True, unique=True)
    nom = models.CharField(max_length=100)
    detainees_count = models.IntegerField(default=0)
    date_creation = models.DateTimeField(default=timezone.now)
    
    def save(self, *args, **kwargs):
        # Si c'est une nouvelle prison sans ID, générer un ID basé sur le nom
        if not self.id:
            # Générer un ID basé sur le nom de la ville en minuscule sans accent
            self.id = unidecode(self.nom).lower()
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.nom} ({self.id})"
