from django.contrib import admin
from django.urls import path, include
from authentication import views  # Importer les vues depuis l'application authentication

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('authentication.urls')),
    path('', views.home, name='home'),  # Rediriger vers home.html
    path('login/', views.login_view, name='login'),  # Rediriger vers login.html
]