from django.contrib import admin
from django.urls import path
from authentication.views import (
    login_view, 
    register_view, 
    logout_view, 
    home_view  # Assurez-vous d'importer home_view
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home_view, name='home'),  # Page d'accueil
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'),
    path('logout/', logout_view, name='logout'),
]