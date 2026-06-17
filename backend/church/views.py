from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import CommunauteCulte, Membre, Departement, Visiteur, Presence, Responsable
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from .models import Responsable, CommunauteCulte, Departement
from .serializers import ResponsableSerializer
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q, Max, Count
from django.utils import timezone
from django.contrib.auth.models import User
from .chat_models import Message
from .serializers import MessageSerializer
from .serializers import (
    CommunauteCulteSerializer, MembreSerializer, DepartementSerializer,
    VisiteurSerializer, PresenceSerializer, ResponsableSerializer,
)
from .evenement_model import Evenement
from .serializers import EvenementSerializer
from django.db.models import Q
from .evenement_model import Evenement
from .serializers import EvenementSerializer

class EvenementViewSet(viewsets.ModelViewSet):
    serializer_class = EvenementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Evenement.objects.all()

        communaute = self.request.query_params.get("communaute_culte")
        if communaute:
            queryset = queryset.filter(
                Q(communaute_culte__id=communaute) |
                Q(tous_les_cultes=True)
            )

        mois = self.request.query_params.get("mois")
        annee = self.request.query_params.get("annee")
        if mois and annee:
            queryset = queryset.filter(
                date_debut__year=annee,
                date_debut__month=mois,
            )

        a_venir = self.request.query_params.get("a_venir")
        if a_venir:
            from datetime import date
            queryset = queryset.filter(date_debut__gte=date.today())

        return queryset.order_by("date_debut")

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
    queryset = Responsable.objects.all().select_related("user", "communaute_culte", "departement")
    serializer_class = ResponsableSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """Créer un user Django + un responsable en même temps."""
        data = request.data

        username = data.get("username", "").strip()
        password = data.get("password", "").strip()
        email = data.get("email", "").strip()
        role = data.get("role", "responsable")
        communaute_culte_id = data.get("communaute_culte")
        departement_id = data.get("departement")
        actif = data.get("actif", True)

        # Validations
        if not username:
            return Response({"username": ["Ce champ est requis."]}, status=status.HTTP_400_BAD_REQUEST)
        if not password:
            return Response({"password": ["Ce champ est requis."]}, status=status.HTTP_400_BAD_REQUEST)
        if len(password) < 6:
            return Response({"password": ["Le mot de passe doit avoir au moins 6 caractères."]}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exists():
            return Response({"username": ["Ce nom d'utilisateur existe déjà."]}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Créer le user Django
            user = User.objects.create_user(
                username=username,
                password=password,
                email=email,
            )

            # Récupérer la communauté
            communaute = None
            if communaute_culte_id:
                try:
                    communaute = CommunauteCulte.objects.get(id=communaute_culte_id)
                except CommunauteCulte.DoesNotExist:
                    pass

            # Récupérer le département
            departement = None
            if departement_id:
                try:
                    departement = Departement.objects.get(id=departement_id)
                except Departement.DoesNotExist:
                    pass

            # Créer le responsable
            responsable = Responsable.objects.create(
                user=user,
                role=role,
                communaute_culte=communaute,
                departement=departement,
                actif=bool(actif),
                mot_de_passe_change=False,
            )

            return Response(ResponsableSerializer(responsable).data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        """Modifier le responsable (rôle, culte, département, actif)."""
        instance = self.get_object()
        data = request.data

        # Mettre à jour le user si email fourni
        email = data.get("email", "").strip()
        if email:
            instance.user.email = email
            instance.user.save()

        # Rôle
        if "role" in data:
            instance.role = data["role"]

        # Communauté
        communaute_culte_id = data.get("communaute_culte")
        if communaute_culte_id:
            try:
                instance.communaute_culte = CommunauteCulte.objects.get(id=communaute_culte_id)
            except CommunauteCulte.DoesNotExist:
                pass
        else:
            instance.communaute_culte = None

        # Département
        departement_id = data.get("departement")
        if departement_id:
            try:
                instance.departement = Departement.objects.get(id=departement_id)
            except Departement.DoesNotExist:
                pass
        else:
            instance.departement = None

        # Actif
        if "actif" in data:
            instance.actif = bool(data["actif"])

        instance.save()
        return Response(ResponsableSerializer(instance).data)

    @action(detail=True, methods=["post"], url_path="reinitialiser-mot-de-passe")
    def reinitialiser_mot_de_passe(self, request, pk=None):
        """Réinitialiser le mot de passe d'un responsable."""
        responsable = self.get_object()
        nouveau_mdp = request.data.get("mot_de_passe", "").strip()

        if not nouveau_mdp:
            return Response(
                {"detail": "Le nouveau mot de passe est requis."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if len(nouveau_mdp) < 6:
            return Response(
                {"detail": "Le mot de passe doit avoir au moins 6 caractères."},
                status=status.HTTP_400_BAD_REQUEST
            )

        responsable.user.set_password(nouveau_mdp)
        responsable.user.save()
        responsable.mot_de_passe_change = False
        responsable.save()

        return Response({"detail": "Mot de passe réinitialisé avec succès."})

    @action(detail=True, methods=["post"], url_path="toggle-actif")
    def toggle_actif(self, request, pk=None):
        """Activer ou désactiver un responsable."""
        responsable = self.get_object()
        responsable.actif = not responsable.actif
        responsable.save()
        return Response({
            "actif": responsable.actif,
            "detail": f"Responsable {'activé' if responsable.actif else 'désactivé'}."
        })


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
    
class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Messages de/vers l'utilisateur connecté
        queryset = Message.objects.filter(
            Q(expediteur=user) | Q(destinataire=user)
        )

        # Filtrer par conversation avec un utilisateur spécifique
        avec = self.request.query_params.get("avec")
        if avec:
            queryset = queryset.filter(
                Q(expediteur__id=avec, destinataire=user) |
                Q(expediteur=user, destinataire__id=avec)
            ).order_by("date_envoi")

        return queryset

    def create(self, request, *args, **kwargs):
        destinataire_id = request.data.get("destinataire")
        contenu = request.data.get("contenu", "").strip()

        if not contenu:
            return Response(
                {"detail": "Le message ne peut pas être vide."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not destinataire_id:
            return Response(
                {"detail": "Le destinataire est requis."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            destinataire = User.objects.get(id=destinataire_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "Destinataire introuvable."},
                status=status.HTTP_404_NOT_FOUND
            )

        message = Message.objects.create(
            expediteur=request.user,
            destinataire=destinataire,
            contenu=contenu,
        )
        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"], url_path="conversations")
    def conversations(self, request):
        """Liste des conversations — derniers messages groupés par interlocuteur."""
        user = request.user
        messages = Message.objects.filter(
            Q(expediteur=user) | Q(destinataire=user)
        ).order_by("-date_envoi")

        # Grouper par interlocuteur
        vus = set()
        conversations = []
        for msg in messages:
            autre = msg.destinataire if msg.expediteur == user else msg.expediteur
            if autre.id not in vus:
                vus.add(autre.id)
                non_lus = Message.objects.filter(
                    expediteur=autre, destinataire=user, lu=False
                ).count()
                conversations.append({
                    "interlocuteur_id": autre.id,
                    "interlocuteur_nom": autre.username,
                    "dernier_message": msg.contenu,
                    "date_dernier": msg.date_envoi.isoformat(),
                    "est_moi": msg.expediteur == user,
                    "non_lus": non_lus,
                })

        return Response(conversations)

    @action(detail=False, methods=["post"], url_path="marquer-lus")
    def marquer_lus(self, request):
        """Marquer tous les messages d'un expéditeur comme lus."""
        expediteur_id = request.data.get("expediteur_id")
        if not expediteur_id:
            return Response({"detail": "expediteur_id requis."}, status=400)

        messages = Message.objects.filter(
            expediteur__id=expediteur_id,
            destinataire=request.user,
            lu=False,
        )
        count = messages.count()
        messages.update(lu=True, date_lecture=timezone.now())
        return Response({"marques": count})

    @action(detail=False, methods=["get"], url_path="non-lus")
    def non_lus(self, request):
        """Nombre total de messages non lus."""
        count = Message.objects.filter(
            destinataire=request.user, lu=False
        ).count()
        return Response({"non_lus": count})