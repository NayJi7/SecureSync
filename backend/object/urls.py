from django.urls import path
from .views import create_object

urlpatterns = [
    path('objets/', create_object, name='create-objet'),
]
