from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StatViewSet

router = DefaultRouter()
router.register(r'stats', StatViewSet)

urlpatterns = [
    path('', include(router.urls)),
]