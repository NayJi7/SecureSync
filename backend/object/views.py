from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Object
from .serializers import ObjectSerializer
from rest_framework import viewsets
from .models import Object, ObjetLog 
from .serializers import ObjetLogSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_objects(request):
    # Récupérer la prison de l'utilisateur connecté
    prison_id = request.user.Prison_id
    
    # Pour les administrateurs (qui peuvent ne pas avoir de prison attribuée)
    if request.user.is_superuser or request.user.role == 'admin':
        # Si un paramètre prison_id est spécifié dans la requête, on l'utilise
        prison_filter = request.query_params.get('prison_id')
        if prison_filter:
            objects = Object.objects.filter(Prison_id=prison_filter)
        else:
            # Sinon, on retourne tous les objets (pour les admins)
            objects = Object.objects.all()
    else:
        # Pour les utilisateurs normaux, filtrer par leur prison assignée
        if prison_id:
            objects = Object.objects.filter(Prison_id=prison_id)
        else:
            return Response(
                {"detail": "Aucune prison assignée à cet utilisateur."},
                status=status.HTTP_403_FORBIDDEN
            )
    
    serializer = ObjectSerializer(objects, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_object(request):
    # Récupérer les données de la requête
    data = request.data.copy()
    
    # Si l'utilisateur n'est pas admin, on force l'objet à être dans sa prison
    if not request.user.is_superuser and request.user.role != 'admin':
        if request.user.Prison_id:
            data['Prison_id'] = request.user.Prison_id
        else:
            return Response(
                {"detail": "Aucune prison assignée à cet utilisateur."},
                status=status.HTTP_403_FORBIDDEN
            )
    
    serializer = ObjectSerializer(data=data)

    if serializer.is_valid():
        try:
            # Sauvegarder l'objet — le signal post_save créera le log automatiquement
            obj = serializer.save()
            
            # Créer un log avec l'utilisateur actuel
            ObjetLog.objects.create(
                objet=obj,
                type=obj.type,
                nom=obj.nom,
                etat=obj.etat,
                commentaire="Création",
                user=request.user  # Ajouter l'utilisateur courant
            )

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ObjectViewSet(viewsets.ModelViewSet):
    queryset = Object.objects.all()
    serializer_class = ObjectSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        # Créer l'objet
        instance = serializer.save()
        
        # Ajouter un log avec l'utilisateur actuel
        ObjetLog.objects.create(
            objet=instance,
            type=instance.type,
            nom=instance.nom,
            etat=instance.etat,
            commentaire="Création",
            user=self.request.user
        )
    
    def perform_update(self, serializer):
        old_instance = self.get_object()
        old_etat = old_instance.etat
        
        # Sauvegarder les changements
        instance = serializer.save()
        
        # Détecter si l'état a changé
        if old_etat != instance.etat:
            ObjetLog.objects.create(
                objet=instance,
                type=instance.type,
                nom=instance.nom,
                etat=instance.etat,
                commentaire=f"Changement d'état: {old_etat} ➜ {instance.etat}",
                user=self.request.user
            )
    
    def perform_destroy(self, instance):
        # Créer un log avant de supprimer l'objet
        ObjetLog.objects.create(
            objet=None,  # L'objet va être supprimé
            type=instance.type,
            nom=instance.nom,
            etat=instance.etat,
            commentaire="Suppression",
            user=self.request.user
        )
        instance.delete()

class ObjetLogViewSet(viewsets.ReadOnlyModelViewSet):  # ReadOnly car on ne veut que GET
    queryset = ObjetLog.objects.all()
    serializer_class = ObjetLogSerializer
    permission_classes = [IsAuthenticated]  # Facultatif selon ton besoin
