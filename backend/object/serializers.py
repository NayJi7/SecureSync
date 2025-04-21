from rest_framework import serializers
from .models import Object, ObjetLog
from accounts.models import CustomUser

class ObjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Object
        fields = '__all__'

class UserBasicSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'full_name', 'role']
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

class ObjetLogSerializer(serializers.ModelSerializer):
    user_info = UserBasicSerializer(source='user', read_only=True)
    
    class Meta:
        model = ObjetLog
        fields = ['id', 'objet', 'type', 'nom', 'etat', 'date', 'commentaire', 'user', 'user_info']
        read_only_fields = ['date']