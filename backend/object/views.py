# backend/accounts/views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Object
from .serializers import ObjectSerializer
from rest_framework import viewsets


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_object(request):
    serializer = ObjectSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ObjectViewSet(viewsets.ModelViewSet):
    queryset = Object.objects.all()
    serializer_class = ObjectSerializer