from django.db import models
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.db.models.signals import pre_delete , pre_save


class Object(models.Model):
    TYPE_CHOICES =  (
        ('porte', 'Porte Automatique'),
        ('lumiere', 'Lumière'),
        ('camera', 'Caméra'),
        ('thermostat', 'Thermostat'),
        ('ventilation','Ventilation'),
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
    PRISON_CHOICES = [
        ('paris', 'Paris'),
        ('lyon', 'Lyon'),
        ('marseille', 'Marseille'),
        ('cergy', 'Cergy')
    ]
    Prison_id = models.CharField(
        max_length=10,
        choices=PRISON_CHOICES,
        blank=True,
        null=True,
        verbose_name="Prison ID"
    )
    consomation = models.IntegerField(help_text="Consommation électrique de l'objet")  # Orthographe correspondant à la base de données
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
        ('thermostat', 'Thermostat'),
        ('ventilation','Ventilation'),
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
    prison_id = models.CharField(max_length=10, choices=[('paris', 'Paris'), ('lyon', 'Lyon'), ('marseille', 'Marseille'), ('cergy', 'Cergy')], null=True, blank=True, verbose_name="Prison ID")
    user = models.ForeignKey('accounts.CustomUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='object_logs')
    
    def __str__(self):
        user_info = f" par {self.user.get_full_name() if self.user else 'Système'}"
        return f"{self.nom} ({self.type}) - {self.date.strftime('%d/%m/%Y %H:%M')}{user_info}"
    
    class Meta:
        verbose_name = "Log d'objet"
        verbose_name_plural = "Logs d'objets"
        ordering = ['-date']


@receiver(post_save, sender=Object)
def create_objet_log(sender, instance, created, **kwargs):
    # Nous utilisons maintenant les méthodes perform_* des viewsets pour créer les logs
    # avec les informations de l'utilisateur qui réalise l'action
    pass

import random

@receiver(pre_save, sender=Object)
def log_object_state_change(sender, instance, **kwargs):
    # Nous utilisons maintenant perform_update du viewset pour gérer cela
    # avec les informations de l'utilisateur
    if not instance.pk:
        return  # Ce n'est pas une mise à jour

    try:
        old_instance = Object.objects.get(pk=instance.pk)
        # On garde uniquement la logique de mise à jour de la durabilité
        if old_instance.etat != instance.etat:
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
    # Nous utilisons maintenant perform_destroy du viewset pour gérer cela
    # avec les informations de l'utilisateur
    pass

@receiver(pre_save, sender=Object)
def log_object_repair(sender, instance, **kwargs):
    # Cette fonction reste pour gérer la réparation automatique
    if not instance.pk:
        return  # Ce n'est pas une mise à jour
    
    try:
        old_instance = Object.objects.get(pk=instance.pk)
        
        # Si on passe de "en panne" à "fonctionnel" ou si la durabilité passe de <= 0 à 100
        if (old_instance.maintenance == 'en panne' and instance.maintenance == 'fonctionnel') or \
           (old_instance.durabilité <= 0 and instance.durabilité == 100):
            # Note: Nous ne pouvons pas accéder à l'utilisateur ici, donc ce sera null
            ObjetLog.objects.create(
                objet=instance,
                type=instance.type,
                nom=instance.nom,
                etat=instance.etat,
                commentaire="Réparation de l'objet",
                user=None,  # Pas d'info utilisateur disponible dans le signal
                prison_id=instance.Prison_id  # Ajouter l'ID de la prison
            )
    except Object.DoesNotExist:
        pass  # l'objet n'existait pas encore