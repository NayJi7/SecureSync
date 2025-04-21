
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomUserViewSet, register
from . import views
from .views import RegisterView
from .views import StaffView , add_point

router = DefaultRouter()
router.register(r'users', CustomUserViewSet)

from django.urls import path
from .views import LoginAPIView, VerifyOTPView, ResendOTPView

urlpatterns = [
    path('api/login/', LoginAPIView.as_view(), name='login'),
    path('register/', register, name='register'),
    path('api/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('api/resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/profile/', views.profile_api_view, name='profile_api'),
    path('api/profile/update/', views.update_profile_api_view, name='update_profile_api'),
    path('api/verify-password/', views.verify_password_view, name='verify_password'),
    path('api/staff/', StaffView.as_view(), name='staff-list'),  
    path('api/account/delete/<str:username>/', views.delete_account, name='delete-account'),
    path('api/user/add_point/', views.add_point),
]


