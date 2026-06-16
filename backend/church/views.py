from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Membre, Departement, Visiteur, Presence, Responsable
from .serializers import (MembreSerializer,DepartementSerializer,VisiteurSerializer,PresenceSerializer,ResponsableSerializer,)


class MembreViewSet(viewsets.ModelViewSet):
    queryset = Membre.objects.all()
    serializer_class = MembreSerializer

class DepartementViewSet(viewsets.ModelViewSet):
    queryset = Departement.objects.all()
    serializer_class = DepartementSerializer

class VisiteurViewSet(viewsets.ModelViewSet):
    queryset = Visiteur.objects.all()
    serializer_class = VisiteurSerializer

class PresenceViewSet(viewsets.ModelViewSet):
    queryset = Presence.objects.all()
    serializer_class = PresenceSerializer

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    responsable = Responsable.objects.get(user=request.user)
    serializer = ResponsableSerializer(responsable)
    return Response(serializer.data)