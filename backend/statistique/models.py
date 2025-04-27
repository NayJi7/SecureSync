from django.db import models
from django.utils import timezone

class Stat(models.Model):
    date_creation = models.DateTimeField(
        default=timezone.now,
        help_text="Date et heure de création de la statistique.",
        verbose_name="Date de création"
    )
    prison_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="ID de la prison associée à cette statistique.",
        verbose_name="ID Prison"
    )
    nombre_objets = models.IntegerField(
        default=0,
        help_text="Nombre total d'objets.",
        verbose_name="Nombre d'objets"
    )
    pourcentage_allumes = models.FloatField(
        default=0.0,
        help_text="Pourcentage d'objets allumés (0 à 100).",
        verbose_name="Pourcentage allumés"
    )
    nbr_on = models.IntegerField(default=0, verbose_name="Objets allumés")
    nbr_off = models.IntegerField(default=0, verbose_name="Objets éteints")
    
    type = models.IntegerField(
        default=6,
        help_text="Type de statistique (par défaut : 6).",
        verbose_name="Type de statistique"
    )

    consommation_total_actuelle = models.FloatField(default=0.0, verbose_name="Consommation totale actuelle")
    consommation_moyenne = models.FloatField(default=0.0, verbose_name="Consommation moyenne")
    cout_horaire = models.FloatField(default=0.0, verbose_name="Coût horaire")

    porte_allumees = models.IntegerField(default=0, verbose_name="Portes allumées")
    porte_consommation = models.FloatField(default=0.0, verbose_name="Consommation des portes")

    camera_allumees = models.IntegerField(default=0, verbose_name="Caméras allumées")
    camera_consommation = models.FloatField(default=0.0, verbose_name="Consommation des caméras")

    lumiere_allumees = models.IntegerField(default=0, verbose_name="Lumières allumées")
    lumiere_consommation = models.FloatField(default=0.0, verbose_name="Consommation des lumières")

    panneau_allumes = models.IntegerField(default=0, verbose_name="Panneaux allumés")
    panneau_consommation = models.FloatField(default=0.0, verbose_name="Consommation des panneaux")

    thermostat_allumes = models.IntegerField(default=0, verbose_name="Thermostats allumés")
    thermostat_consommation = models.FloatField(default=0.0, verbose_name="Consommation des thermostats")

    ventilation_allumees = models.IntegerField(default=0, verbose_name="Ventilations allumées")
    ventilation_consommation = models.FloatField(default=0.0, verbose_name="Consommation des ventilations")

    def __str__(self):
        return f"Stat ID {self.id} - {self.nombre_objets} objets (type {self.type})"
