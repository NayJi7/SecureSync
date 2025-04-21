from django.urls import path, include
from .views import create_object, get_objects
from .views import ObjectViewSet,ObjetLogViewSet
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r'objects', ObjectViewSet)
router.register(r'logs', ObjetLogViewSet, basename='logs') 

urlpatterns = [
    # Vos autres URLs
    path('', include(router.urls)),
    path('objets/', create_object, name='create-objet'),
    path('objets/prison/', get_objects, name='get-objects-by-prison'),
]