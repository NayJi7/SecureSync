from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.files.base import ContentFile
from PIL import Image, ImageDraw, ImageFont
from django.db import models
import io

def user_directory_path(instance, filename):
    return f'profile_pics/user_{instance.id}/{filename}'

class CustomUser(AbstractUser):
    GENDER_CHOICES = (
        ('M', 'Masculin'),
        ('F', 'Féminin'),
        ('O', 'Autre'),
        ('N', 'Préfère ne pas préciser')
    )
    email = models.EmailField(unique=True)
    photo = models.ImageField(upload_to=user_directory_path, blank=True, null=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True, null=True, verbose_name="Sexe")
    date_naissance = models.DateField(null=True, blank=True)

    
    def save(self, *args, **kwargs):
        # On doit d'abord sauvegarder pour avoir un ID si c'est un nouvel utilisateur
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Après la sauvegarde, on vérifie si une photo par défaut doit être créée
        if not self.photo:
            self.photo.save(f"default_{self.username}.png", self.generate_default_avatar(), save=False)
            super().save(update_fields=['photo'])
    
    def generate_default_avatar(self):
        """Génère une image avec l'initiale du pseudo."""
        initial = self.username[0].upper() if self.username else "U"
        img_size = (100, 100)
        bg_color = (100, 100, 255)  # Bleu
        text_color = (255, 255, 255)  # Blanc
        img = Image.new("RGB", img_size, bg_color)
        draw = ImageDraw.Draw(img)
        try:
            font = ImageFont.truetype("arial.ttf", 40)  # Police par défaut
        except IOError:
            font = ImageFont.load_default()  # Police de secours
        
        text_size = draw.textbbox((0, 0), initial, font=font)
        text_x = (img_size[0] - (text_size[2] - text_size[0])) // 2
        text_y = (img_size[1] - (text_size[3] - text_size[1])) // 2
        draw.text((text_x, text_y), initial, font=font, fill=text_color)
        
        # Sauvegarde en mémoire
        image_io = io.BytesIO()
        img.save(image_io, format="PNG")
        image_io.seek(0)
        content = ContentFile(image_io.getvalue(), name=f"default_{self.username}.png")
        print(f"Image générée pour {self.username}: {content.name}")  # Debug
        return content