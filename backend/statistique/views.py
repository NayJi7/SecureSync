from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Stat
from .serializers import StatSerializer

class StatViewSet(viewsets.ModelViewSet):
    queryset = Stat.objects.all()
    serializer_class = StatSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['prison_id']
    
    def get_queryset(self):
        """
        Filtre les statistiques par prison_id si fourni dans les paramètres de requête.
        """
        queryset = Stat.objects.all().order_by('-date_creation')
        prison_id = self.request.query_params.get('prison_id', None)
        
        if prison_id is not None:
            queryset = queryset.filter(prison_id=prison_id)
        
        return queryset
