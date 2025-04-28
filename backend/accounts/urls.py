
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomUserViewSet, register
from . import views
from .views import RegisterView
from .views import StaffView , add_point
from .utils import send_contact_email

router = DefaultRouter()
router.register(r'users', CustomUserViewSet)

from django.urls import path
from .views import LoginAPIView, VerifyOTPView, ResendOTPView, UserActivityLogListView

urlpatterns = [
    path('login/', LoginAPIView.as_view(), name='login'),
    path('register/', register, name='register'),  # Celle-ci n'a pas de préfixe 'api/', on la garde telle quelle
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', views.profile_api_view, name='profile_api'),
    path('profile/update/', views.update_profile_api_view, name='update_profile_api'),
    path('verify-password/', views.verify_password_view, name='verify_password'),
    path('staff/', StaffView.as_view(), name='staff-list'),  
    path('staff/<str:username>/', StaffView.as_view(), name='staff-detail'),
    path('staff/<str:username>/update/', StaffView.as_view(), name='staff-update'),
    path('account/delete/<str:username>/', views.delete_account, name='delete-account'),
    path('user/add_point/', views.add_point),
    path('update-user-prison/', views.update_user_prison, name='update-user-prison'),
    path('Userslogs/', UserActivityLogListView.as_view(), name='api_logs'),
    path('contact/', send_contact_email, name='contact_email'),
]


