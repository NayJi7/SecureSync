from django.urls import path
from . import views

urlpatterns = [
    path('home/', views.home_view, name='home'),
    # Vous pouvez ajouter d'autres routes ici selon vos besoins
]