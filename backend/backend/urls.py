# myproject/urls.py
from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponseRedirect

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),  # Changé de '' à 'api/' pour s'assurer que les URLs commencent par /api/
    path('api/', include('statistique.urls')),
    path('api/', include('object.urls')),
    path("", lambda request: HttpResponseRedirect("http://localhost:5173/")),
]
