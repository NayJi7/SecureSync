# myproject/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),  # Changé de '' à 'api/' pour s'assurer que les URLs commencent par /api/
    path('api/', include('statistique.urls')),
    path('api/', include('object.urls')),
   
]
