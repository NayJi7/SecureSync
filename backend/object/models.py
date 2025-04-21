from django.db import models
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.db.models.signals import pre_delete , pre_save


class Object(models.Model):
    TYPE_CHOICES =  (
        ('porte', 'Porte Automatique'),
        ('lumiere', 'Lumière'),
        ('camera', 'Caméra'),
        ('chauffage', 'Chauffage'),
        ('climatisation','Climatisation'),
        ("paneau d'affichage","paneau d'affichage")
    )
    ETAT_CHOICES = (
        ('on', 'On'),
        ('off', 'Off')
    )
    CONNEXION_CHOICES = (
        ('wifi','Wifi'),
        ('filaire','Filaire')
    )
    MAINTENANCE_CHOICES = (
        ('en panne', 'En Panne'),
        ('fonctionnel', 'Fonctionnel')
    )
    nom = models.CharField(max_length=100)
    type = models.CharField(
        max_length=20, #  Chauffage
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
    connection = models.CharField(
        max_length=20,  
        choices=CONNEXION_CHOICES,
        blank=True,
        null=True,
        verbose_name="Connection"
    )
    consomation = models.IntegerField()
    valeur_actuelle = models.CharField(blank=True)
    valeur_cible = models.CharField(blank=True)
    durabilité = models.IntegerField(default=100)
    maintenance = models.CharField(
        max_length=20,  
        choices=MAINTENANCE_CHOICES,
        blank=True,
        null=True,
        default='fonctionnel',
        verbose_name="Maintenance"
    )

    def __str__(self):
        return f"{self.nom} ({self.type})"


class ObjetLog(models.Model):

    TYPE_CHOICES = (
        ('porte', 'Porte Automatique'),
        ('lumiere', 'Lumière'),
        ('camera', 'Caméra'),
        ('chauffage', 'Chauffage'),
        ('climatisation','Climatisation'),
        ("paneau d'affichage","paneau d'affichage")
    )
    
    ETAT_CHOICES = (
        ('on', 'On'),
        ('off', 'Off'),
    )

    objet = models.ForeignKey( Object, on_delete=models.SET_NULL, null=True, blank=True, related_name='logs')
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, verbose_name="Type d'objet")
    nom = models.CharField(max_length=255)  # Nom de l'objet connecté
    etat = models.CharField(max_length=50, choices=ETAT_CHOICES, verbose_name="État")
    date = models.DateTimeField(auto_now_add=True)  # Date du log
    commentaire = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.nom} ({self.type}) - {self.date.strftime('%d/%m/%Y %H:%M')}"
    
    class Meta:
        verbose_name = "Log d'objet"
        verbose_name_plural = "Logs d'objets"
        ordering = ['-date']


@receiver(post_save, sender=Object)
def create_objet_log(sender, instance, created, **kwargs):
    if created:  # Uniquement lors de la création
        ObjetLog.objects.create(
            objet=instance,
            type=instance.type,
            nom=instance.nom,
            etat=instance.etat,
            commentaire="Création"  # Commentaire automatique pour la création
        )

import random

@receiver(pre_save, sender=Object)
def log_object_state_change(sender, instance, **kwargs):
    
    if not instance.pk:
        return  # Ce n'est pas une mise à jour

    try:
        old_instance = Object.objects.get(pk=instance.pk)
        if old_instance.etat != instance.etat:
            # Log du changement
            ObjetLog.objects.create(
                objet=instance,
                type=instance.type,
                nom=instance.nom,
                etat=instance.etat,
                commentaire=f"Changement d'état: {old_instance.etat} ➜ {instance.etat}"
            )

            # 💡 Si on passe de off ➜ on, on diminue la durabilité
            if old_instance.etat == "off" and instance.etat == "on":
                perte = random.randint(1, 10)
                instance.durabilité = max(0, old_instance.durabilité - perte)
                
                # 🛠️ Mise à jour de la maintenance si durabilité = 0
                if instance.durabilité <= 0:
                    instance.maintenance = 'en panne'
                    
    except Object.DoesNotExist:
        pass  # l'objet n'existait pas encore

 

@receiver(pre_delete, sender=Object)
def log_object_deletion(sender, instance, **kwargs):
    ObjetLog.objects.create(
        objet=instance,
        type=instance.type,
        nom=instance.nom,
        etat=instance.etat,
        commentaire="Suppression"
    )

@receiver(pre_save, sender=Object)
def log_object_repair(sender, instance, **kwargs):
    if not instance.pk:
        return  # Ce n'est pas une mise à jour
    
    try:
        old_instance = Object.objects.get(pk=instance.pk)
        
        # Si on passe de "en panne" à "fonctionnel" ou si la durabilité passe de <= 0 à 100
        if (old_instance.maintenance == 'en panne' and instance.maintenance == 'fonctionnel') or \
           (old_instance.durabilité <= 0 and instance.durabilité == 100):
            ObjetLog.objects.create(
                objet=instance,
                type=instance.type,
                nom=instance.nom,
                etat=instance.etat,
                commentaire="Réparation de l'objet"
            )
    except Object.DoesNotExist:
        pass  # l'objet n'existait pas encore