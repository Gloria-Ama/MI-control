from django.shortcuts import render
from .serializers import DepartementSerializer, PresenceSerializer
from .models import Departement
from .models import Visiteur
from .serializers import VisiteurSerializer
from .models import Presence
from .serializers import PresenceSerializer

# Create your views here.
from rest_framework import viewsets
from .models import Membre
from .serializers import MembreSerializer

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