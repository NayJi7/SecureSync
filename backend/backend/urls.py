from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("accounts.urls")),
    path("api/", include("statistique.urls")),
    path("api/", include("object.urls")),
]

# Fallback pour toute autre route : sert index.html (React SPA)
urlpatterns += [
    re_path(r"^.*$", TemplateView.as_view(template_name="index.html")),
]

# Pour les fichiers médias, si nécessaire
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
