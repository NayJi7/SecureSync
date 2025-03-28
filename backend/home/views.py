from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Create your views here.
@api_view(['GET'])
def home_view(request):
    """
    Vue simple pour la page d'accueil retournant un JSON
    """
    data = {
        "message": "Bienvenue sur l'API de SmartHub",
        "status": "success"
    }
    return Response(data)
