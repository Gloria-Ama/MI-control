from rest_framework import serializers
from .models import Membre
from .models import Departement
from .models import Visiteur
from .models import Presence
from .models import Responsable


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


class ResponsableSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Responsable
        fields = [
            "id",
            "username",
            "email",
            "role",
            "communaute_culte",
            "departement",
            "mot_de_passe_change",
            "actif",
        ]