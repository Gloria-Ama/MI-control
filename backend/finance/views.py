from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum, Q
from .models import DemandeFinance, TransactionFinance
from .serializers import DemandeFinanceSerializer, TransactionFinanceSerializer
from church.models import Responsable


class DemandeFinanceViewSet(viewsets.ModelViewSet):
    serializer_class = DemandeFinanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = DemandeFinance.objects.all()
        statut = self.request.query_params.get("statut")
        if statut:
            queryset = queryset.filter(statut=statut)
        type_demande = self.request.query_params.get("type")
        if type_demande:
            queryset = queryset.filter(type=type_demande)
        communaute = self.request.query_params.get("communaute_culte")
        if communaute:
            queryset = queryset.filter(communaute_culte__id=communaute)
        return queryset.order_by("-date_demande")

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        try:
            responsable = Responsable.objects.get(user=request.user)
            if not data.get("responsable"):
                data["responsable"] = responsable.id
            if not data.get("communaute_culte") and responsable.communaute_culte:
                data["communaute_culte"] = responsable.communaute_culte.id
        except Responsable.DoesNotExist:
            pass

        serializer = self.get_serializer(data=data)
        if not serializer.is_valid():
            print("ERREUR FINANCE:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="approuver")
    def approuver(self, request, pk=None):
        demande = self.get_object()
        demande.statut = "approuvee"
        demande.date_traitement = timezone.now()
        demande.notes_traitement = request.data.get("notes", "")
        demande.save()
        return Response(self.get_serializer(demande).data)

    @action(detail=True, methods=["post"], url_path="refuser")
    def refuser(self, request, pk=None):
        demande = self.get_object()
        demande.statut = "refusee"
        demande.date_traitement = timezone.now()
        demande.notes_traitement = request.data.get("notes", "")
        demande.save()
        return Response(self.get_serializer(demande).data)

    @action(detail=True, methods=["post"], url_path="rembourser")
    def rembourser(self, request, pk=None):
        demande = self.get_object()
        demande.statut = "remboursee"
        demande.date_traitement = timezone.now()
        demande.save()
        return Response(self.get_serializer(demande).data)


class TransactionFinanceViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionFinanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = TransactionFinance.objects.all()
        communaute = self.request.query_params.get("communaute_culte")
        if communaute:
            queryset = queryset.filter(communaute_culte__id=communaute)
        type_t = self.request.query_params.get("type")
        if type_t:
            queryset = queryset.filter(type=type_t)
        date_debut = self.request.query_params.get("date_debut")
        if date_debut:
            queryset = queryset.filter(date__gte=date_debut)
        date_fin = self.request.query_params.get("date_fin")
        if date_fin:
            queryset = queryset.filter(date__lte=date_fin)
        return queryset.order_by("-date")

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        try:
            responsable = Responsable.objects.get(user=request.user)
            if not data.get("responsable"):
                data["responsable"] = responsable.id
            if not data.get("communaute_culte") and responsable.communaute_culte:
                data["communaute_culte"] = responsable.communaute_culte.id
        except Responsable.DoesNotExist:
            pass

        serializer = self.get_serializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"], url_path="resume")
    def resume(self, request):
        communaute = request.query_params.get("communaute_culte")
        qs = TransactionFinance.objects.all()
        if communaute:
            qs = qs.filter(communaute_culte__id=communaute)

        types_entree = ["cotisation", "offrande", "dime", "don", "entree"]
        types_sortie = ["sortie", "depense"]

        total_entrees = qs.filter(type__in=types_entree).aggregate(
            total=Sum("montant")
        )["total"] or 0

        total_sorties = qs.filter(type__in=types_sortie).aggregate(
            total=Sum("montant")
        )["total"] or 0

        par_type = {}
        for t, label in TransactionFinance.TYPE_CHOICES:
            montant = qs.filter(type=t).aggregate(total=Sum("montant"))["total"] or 0
            par_type[t] = {"label": label, "montant": float(montant)}

        return Response({
            "total_entrees": float(total_entrees),
            "total_sorties": float(total_sorties),
            "solde": float(total_entrees - total_sorties),
            "par_type": par_type,
        })