from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Object
from .serializers import ObjectSerializer
from rest_framework import viewsets
from .models import Object, ObjetLog 

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_object(request):
    serializer = ObjectSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            # Sauvegarder l'objet
            obj = serializer.save()
            
            # Création manuelle du log si vous n'utilisez pas les signaux
            ObjetLog.objects.create(
                objet=obj,
                type=obj.type,
                nom=obj.nom,
                etat=obj.etat,
                commentaire="Création"
            )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ObjectViewSet(viewsets.ModelViewSet):
    queryset = Object.objects.all()
    serializer_class = ObjectSerializer