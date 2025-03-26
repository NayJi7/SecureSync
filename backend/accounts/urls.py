# accounts/urls.py
from django.urls import path
from . import views
from .views import home_view 

urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
     path('home/', home_view, name='home')
]
