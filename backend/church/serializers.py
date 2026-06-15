from rest_framework import serializers
from .models import Membre
from .models import Departement
from .models import Visiteur
from .models import Presence

class MembreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Membre
        fields = "__all__"


class DepartementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Departement
        fields = "__all__"

class VisiteurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visiteur
        fields = "__all__"

class PresenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Presence
        fields = "__all__"