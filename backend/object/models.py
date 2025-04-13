from django.db import models

class Object(models.Model):
    TYPE_CHOICES =  (
        ('porte', 'Porte Automatique'),
        ('lumiere', 'Lumière'),
        ('camera', 'Caméra'),
        ('chauffage', 'Chauffage'),
    )
    ETAT_CHOICES = (
        ('on', 'On'),
        ('off', 'Off')
    )

    nom = models.CharField(max_length=100)
    type = models.CharField(
        max_length=9, #  Chauffage
        choices=TYPE_CHOICES,
        blank=True,
        null=True,
        verbose_name="Role"
    )
    coord_x = models.FloatField()
    coord_y = models.FloatField()
    etat =  models.CharField(
        max_length=3,  # "off"
        choices=ETAT_CHOICES,
        blank=True,
        null=True,
        verbose_name="Etat"
    )
    def __str__(self):
        return f"{self.nom} ({self.type})"
