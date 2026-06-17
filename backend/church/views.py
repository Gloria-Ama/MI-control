from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import CommunauteCulte, Membre, Departement, Visiteur, Presence, Responsable
from .serializers import (
    CommunauteCulteSerializer, MembreSerializer, DepartementSerializer,
    VisiteurSerializer, PresenceSerializer, ResponsableSerializer,
)


class CommunauteCulteViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CommunauteCulte.objects.all()
    serializer_class = CommunauteCulteSerializer
    permission_classes = [IsAuthenticated]


class DepartementViewSet(viewsets.ModelViewSet):
    serializer_class = DepartementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Departement.objects.all().select_related("communaute_culte")
        communaute = self.request.query_params.get("communaute_culte")
        if communaute:
            queryset = queryset.filter(communaute_culte__id=communaute)
        return queryset.order_by("nom")


class MembreViewSet(viewsets.ModelViewSet):
    serializer_class = MembreSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Membre.objects.all().select_related("departement").prefetch_related("communautes_culte")

        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(nom__icontains=search)

        departement = self.request.query_params.get("departement")
        if departement:
            queryset = queryset.filter(departement__id=departement)

        sexe = self.request.query_params.get("sexe")
        if sexe:
            queryset = queryset.filter(sexe=sexe)

        statut = self.request.query_params.get("statut")
        if statut:
            queryset = queryset.filter(statut=statut)

        communaute = self.request.query_params.get("communaute_culte")
        if communaute:
            queryset = queryset.filter(communautes_culte__id=communaute)

        return queryset.order_by("nom").distinct()

    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        communautes = data.get("communautes_culte", [])
        if isinstance(communautes, str):
            communautes = [communautes]
        if not communautes:
            try:
                responsable = Responsable.objects.get(user=request.user)
                if responsable.communaute_culte:
                    data["communautes_culte"] = [responsable.communaute_culte.id]
            except Responsable.DoesNotExist:
                pass

        serializer = self.get_serializer(data=data)
        if not serializer.is_valid():
            print("ERREUR VALIDATION MEMBRE:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data.copy()

        communautes = data.get("communautes_culte", [])
        if isinstance(communautes, str):
            communautes = [communautes]
        if not communautes:
            try:
                responsable = Responsable.objects.get(user=request.user)
                if responsable.communaute_culte:
                    data["communautes_culte"] = [responsable.communaute_culte.id]
            except Responsable.DoesNotExist:
                pass

        serializer = self.get_serializer(instance, data=data)
        if not serializer.is_valid():
            print("ERREUR VALIDATION MEMBRE UPDATE:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=["get"], url_path="presences")
    def historique_presences(self, request, pk=None):
        membre = self.get_object()
        presences = Presence.objects.filter(membre=membre).order_by("-date")[:30]
        return Response(PresenceSerializer(presences, many=True).data)

    @action(detail=False, methods=["get"], url_path="absents")
    def absents_recents(self, request):
        from datetime import date, timedelta
        semaines = int(request.query_params.get("semaines", 3))
        date_limite = date.today() - timedelta(weeks=semaines)
        membres_absents = []
        for membre in Membre.objects.filter(statut="actif"):
            derniere = Presence.objects.filter(
                membre=membre, present=True
            ).order_by("-date").first()
            if not derniere or derniere.date < date_limite:
                membres_absents.append(membre)
        return Response(MembreSerializer(membres_absents, many=True).data)

    @action(detail=False, methods=["get"], url_path="anniversaires")
    def anniversaires(self, request):
        from datetime import date, timedelta
        periode = request.query_params.get("periode", "aujourd_hui")
        aujourd_hui = date.today()
        if periode == "aujourd_hui":
            membres = Membre.objects.filter(
                date_anniversaire=aujourd_hui.strftime("%d/%m"), statut="actif"
            )
        elif periode == "demain":
            demain = aujourd_hui + timedelta(days=1)
            membres = Membre.objects.filter(
                date_anniversaire=demain.strftime("%d/%m"), statut="actif"
            )
        elif periode == "semaine":
            dates = [(aujourd_hui + timedelta(days=i)).strftime("%d/%m") for i in range(7)]
            membres = Membre.objects.filter(date_anniversaire__in=dates, statut="actif")
        else:
            membres = Membre.objects.none()
        return Response(MembreSerializer(membres, many=True).data)


class VisiteurViewSet(viewsets.ModelViewSet):
    queryset = Visiteur.objects.all()
    serializer_class = VisiteurSerializer
    permission_classes = [IsAuthenticated]


class PresenceViewSet(viewsets.ModelViewSet):
    serializer_class = PresenceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Presence.objects.all().select_related("membre")
        date = self.request.query_params.get("date")
        if date:
            queryset = queryset.filter(date=date)
        membre = self.request.query_params.get("membre")
        if membre:
            queryset = queryset.filter(membre__id=membre)
        return queryset.order_by("-date")

    @action(detail=False, methods=["post"], url_path="bulk")
    def bulk_create(self, request):
        presences_data = request.data.get("presences", [])
        resultats = []
        for p in presences_data:
            obj, created = Presence.objects.update_or_create(
                membre_id=p["membre"],
                date=p["date"],
                communaute_culte_id=p.get("communaute_culte"),
                defaults={"present": p["present"]},
            )
            resultats.append(PresenceSerializer(obj).data)
        return Response(resultats, status=status.HTTP_200_OK)


class ResponsableViewSet(viewsets.ModelViewSet):
    queryset = Responsable.objects.all()
    serializer_class = ResponsableSerializer
    permission_classes = [IsAuthenticated]


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    try:
        responsable = Responsable.objects.get(user=request.user)
        return Response(ResponsableSerializer(responsable).data)
    except Responsable.DoesNotExist:
        return Response({
            "id": None,
            "username": request.user.username,
            "email": request.user.email,
            "role": "administrateur" if request.user.is_superuser else None,
            "communaute_culte": None,
            "departement": None,
            "mot_de_passe_change": True,
            "actif": True,
        })