
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomUserViewSet
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView

router = DefaultRouter()
router.register(r'users', CustomUserViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('register/', views.register,name = 'register')
]

