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


class ObjetLog(models.Model):

    TYPE_CHOICES = (
        ('porte', 'Porte Automatique'),
        ('lumiere', 'Lumière'),
        ('camera', 'Caméra'),
        ('chauffage', 'Chauffage'),
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


@receiver(pre_save, sender=Object)
def log_object_state_change(sender, instance, **kwargs):
    if not instance.pk:
        return  # Ce n'est pas une mise à jour

    try:
        old_instance = Object.objects.get(pk=instance.pk)
        if old_instance.etat != instance.etat:
            # L'état a changé
            ObjetLog.objects.create(
                objet=instance,
                type=instance.type,
                nom=instance.nom,
                etat=instance.etat,
                commentaire=f"Changement d'état: {old_instance.etat} ➜ {instance.etat}"
            )
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