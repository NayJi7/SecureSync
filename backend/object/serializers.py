from rest_framework import serializers
from .models import Object
from rest_framework import viewsets
from .models import Object, ObjetLog


class ObjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Object
        fields = '__all__'

class ObjetLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObjetLog
        fields = ['id', 'objet', 'type', 'nom', 'etat', 'date', 'commentaire']
        read_only_fields = ['date']
