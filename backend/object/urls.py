from django.urls import path, include
from .views import create_object
from .views import ObjectViewSet
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r'objects', ObjectViewSet)

urlpatterns = [
    # Vos autres URLs
    path('', include(router.urls)),
    path('objets/', create_object, name='create-objet'),
]