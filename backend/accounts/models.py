from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.files.base import ContentFile
from PIL import Image, ImageDraw, ImageFont
import io

def user_directory_path(instance, filename):
    return f'profile_pics/user_{instance.id}/{filename}'

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    photo = models.ImageField(upload_to=user_directory_path, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.photo:  # Si aucune photo n'est ajoutée
            self.photo.save(f"default_{self.username}.png", self.generate_default_avatar(), save=False)
        super().save(*args, **kwargs)

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
        content = ContentFile(image_io.getvalue(), name=f"default_{self.username}.png")
        
        print(f"Image générée pour {self.username}: {content.name}")  # Debug pour vérifier le nom de l'image

        return content
