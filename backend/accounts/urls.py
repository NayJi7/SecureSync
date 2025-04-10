
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomUserViewSet, register
from . import views

router = DefaultRouter()
router.register(r'users', CustomUserViewSet)

from django.urls import path
from .views import LoginAPIView, VerifyOTPView, ResendOTPView

urlpatterns = [
    path('api/login/', LoginAPIView.as_view(), name='login'),
    path('register/', register, name='register'),
    path('api/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('api/resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
]

