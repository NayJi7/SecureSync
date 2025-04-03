# accounts/urls.py
from django.urls import path
from .views import register, user_login, user_logout, home_view,index, profile_view, edit_profile
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("register/", register, name="register"),
    path("login/", user_login, name="login"),
    path("logout/", user_logout, name="logout"),
    path('home/', home_view, name='home'),
    path('profile/', profile_view, name='profile'),
    path('edit/', edit_profile, name='edit_profile'),
    path('', index, name='index'),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
