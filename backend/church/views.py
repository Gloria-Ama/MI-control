from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from django.contrib.auth.models import User
from datetime import date, timedelta
import requests as http_requests
from .push_model import PushToken
from .models import CommunauteCulte, Membre, Departement, Visiteur, Presence, Responsable
from .chat_models import Message
from .evenement_model import Evenement
from .notification_model import Notification
from .pastoral_model import SuiviPastoral
from .budget_model import BudgetAnnuel, LigneBudget

from .serializers import (
    CommunauteCulteSerializer, MembreSerializer, DepartementSerializer,
    VisiteurSerializer, PresenceSerializer, ResponsableSerializer,
    MessageSerializer, EvenementSerializer, NotificationSerializer,
    SuiviPastoralSerializer, BudgetAnnuelSerializer, LigneBudgetSerializer,
)


# ── Communautés ───────────────────────────────────────────────────────────────

class CommunauteCulteViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CommunauteCulte.objects.all()
    serializer_class = CommunauteCulteSerializer
    permission_classes = [IsAuthenticated]


# ── Départements ──────────────────────────────────────────────────────────────

class DepartementViewSet(viewsets.ModelViewSet):
    serializer_class = DepartementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Departement.objects.all().select_related("communaute_culte")
        communaute = self.request.query_params.get("communaute_culte")
        if communaute:
            queryset = queryset.filter(communaute_culte__id=communaute)
        return queryset.order_by("nom")


# ── Membres ───────────────────────────────────────────────────────────────────

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
        semaines = int(request.query_params.get("semaines", 3))
        date_limite = date.today() - timedelta(weeks=semaines)
        membres_absents = []
        for membre in Membre.objects.filter(statut="actif"):
            derniere = Presence.objects.filter(membre=membre, present=True).order_by("-date").first()
            if not derniere or derniere.date < date_limite:
                membres_absents.append(membre)
        return Response(MembreSerializer(membres_absents, many=True).data)

    @action(detail=False, methods=["get"], url_path="anniversaires")
    def anniversaires(self, request):
        periode = request.query_params.get("periode", "aujourd_hui")
        aujourd_hui = date.today()
        if periode == "aujourd_hui":
            membres = Membre.objects.filter(date_anniversaire=aujourd_hui.strftime("%d/%m"), statut="actif")
        elif periode == "demain":
            demain = aujourd_hui + timedelta(days=1)
            membres = Membre.objects.filter(date_anniversaire=demain.strftime("%d/%m"), statut="actif")
        elif periode == "semaine":
            dates = [(aujourd_hui + timedelta(days=i)).strftime("%d/%m") for i in range(7)]
            membres = Membre.objects.filter(date_anniversaire__in=dates, statut="actif")
        else:
            membres = Membre.objects.none()
        return Response(MembreSerializer(membres, many=True).data)


# ── Visiteurs ─────────────────────────────────────────────────────────────────

class VisiteurViewSet(viewsets.ModelViewSet):
    serializer_class = VisiteurSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Visiteur.objects.all()
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(nom__icontains=search)
        statut = self.request.query_params.get("statut")
        if statut:
            queryset = queryset.filter(statut=statut)
        date_visite = self.request.query_params.get("date")
        if date_visite:
            queryset = queryset.filter(date_premiere_visite=date_visite)
        communaute = self.request.query_params.get("communaute_culte")
        if communaute:
            queryset = queryset.filter(communaute_culte__id=communaute)
        return queryset.order_by("-date_premiere_visite")


# ── Présences ─────────────────────────────────────────────────────────────────

class PresenceViewSet(viewsets.ModelViewSet):
    serializer_class = PresenceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Presence.objects.all().select_related("membre")
        date_filtre = self.request.query_params.get("date")
        if date_filtre:
            queryset = queryset.filter(date=date_filtre)
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


# ── Responsables ──────────────────────────────────────────────────────────────

class ResponsableViewSet(viewsets.ModelViewSet):
    queryset = Responsable.objects.all().select_related("user", "communaute_culte", "departement")
    serializer_class = ResponsableSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data
        username = data.get("username", "").strip()
        password = data.get("password", "").strip()
        email = data.get("email", "").strip()
        role = data.get("role", "responsable")
        communaute_culte_id = data.get("communaute_culte")
        departement_id = data.get("departement")
        actif = data.get("actif", True)

        if not username:
            return Response({"username": ["Ce champ est requis."]}, status=status.HTTP_400_BAD_REQUEST)
        if not password:
            return Response({"password": ["Ce champ est requis."]}, status=status.HTTP_400_BAD_REQUEST)
        if len(password) < 6:
            return Response({"password": ["Minimum 6 caractères."]}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exists():
            return Response({"username": ["Ce nom d'utilisateur existe déjà."]}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.create_user(username=username, password=password, email=email)
            communaute = CommunauteCulte.objects.get(id=communaute_culte_id) if communaute_culte_id else None
            departement = Departement.objects.get(id=departement_id) if departement_id else None
            responsable = Responsable.objects.create(
                user=user, role=role, communaute_culte=communaute,
                departement=departement, actif=bool(actif), mot_de_passe_change=False,
            )
            return Response(ResponsableSerializer(responsable).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data
        email = data.get("email", "").strip()
        if email:
            instance.user.email = email
            instance.user.save()
        if "role" in data:
            instance.role = data["role"]
        communaute_culte_id = data.get("communaute_culte")
        if communaute_culte_id:
            try:
                instance.communaute_culte = CommunauteCulte.objects.get(id=communaute_culte_id)
            except CommunauteCulte.DoesNotExist:
                pass
        else:
            instance.communaute_culte = None
        departement_id = data.get("departement")
        if departement_id:
            try:
                instance.departement = Departement.objects.get(id=departement_id)
            except Departement.DoesNotExist:
                pass
        else:
            instance.departement = None
        if "actif" in data:
            instance.actif = bool(data["actif"])
        instance.save()
        return Response(ResponsableSerializer(instance).data)

    @action(detail=True, methods=["post"], url_path="reinitialiser-mot-de-passe")
    def reinitialiser_mot_de_passe(self, request, pk=None):
        responsable = self.get_object()
        nouveau_mdp = request.data.get("mot_de_passe", "").strip()
        if not nouveau_mdp or len(nouveau_mdp) < 6:
            return Response({"detail": "Minimum 6 caractères."}, status=status.HTTP_400_BAD_REQUEST)
        responsable.user.set_password(nouveau_mdp)
        responsable.user.save()
        responsable.mot_de_passe_change = False
        responsable.save()
        return Response({"detail": "Mot de passe réinitialisé."})

    @action(detail=True, methods=["post"], url_path="toggle-actif")
    def toggle_actif(self, request, pk=None):
        responsable = self.get_object()
        responsable.actif = not responsable.actif
        responsable.save()
        return Response({"actif": responsable.actif})


# ── Profil ────────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    try:
        responsable = Responsable.objects.get(user=request.user)
        return Response(ResponsableSerializer(responsable).data)
    except Responsable.DoesNotExist:
        return Response({
            "id": None, "username": request.user.username,
            "email": request.user.email,
            "role": "administrateur" if request.user.is_superuser else None,
            "communaute_culte": None, "departement": None,
            "mot_de_passe_change": True, "actif": True,
        })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def changer_mot_de_passe(request):
    ancien = request.data.get("ancien_mot_de_passe", "")
    nouveau = request.data.get("nouveau_mot_de_passe", "")
    if not ancien or not nouveau:
        return Response({"detail": "Les deux mots de passe sont requis."}, status=status.HTTP_400_BAD_REQUEST)
    if not request.user.check_password(ancien):
        return Response({"detail": "L'ancien mot de passe est incorrect."}, status=status.HTTP_400_BAD_REQUEST)
    if len(nouveau) < 6:
        return Response({"detail": "Minimum 6 caractères."}, status=status.HTTP_400_BAD_REQUEST)
    request.user.set_password(nouveau)
    request.user.save()
    try:
        responsable = Responsable.objects.get(user=request.user)
        responsable.mot_de_passe_change = True
        responsable.save()
    except Responsable.DoesNotExist:
        pass
    return Response({"detail": "Mot de passe changé avec succès."})


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_profil(request):
    user = request.user
    email = request.data.get("email", "").strip()
    first_name = request.data.get("first_name", "").strip()
    last_name = request.data.get("last_name", "").strip()
    if email: user.email = email
    if first_name: user.first_name = first_name
    if last_name: user.last_name = last_name
    user.save()
    try:
        responsable = Responsable.objects.get(user=user)
        return Response(ResponsableSerializer(responsable).data)
    except Responsable.DoesNotExist:
        return Response({"detail": "Profil mis à jour."})


# ── Messages ──────────────────────────────────────────────────────────────────

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Message.objects.filter(Q(expediteur=user) | Q(destinataire=user))
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
            return Response({"detail": "Message vide."}, status=status.HTTP_400_BAD_REQUEST)
        if not destinataire_id:
            return Response({"detail": "Destinataire requis."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            destinataire = User.objects.get(id=destinataire_id)
        except User.DoesNotExist:
            return Response({"detail": "Destinataire introuvable."}, status=status.HTTP_404_NOT_FOUND)
        message = Message.objects.create(expediteur=request.user, destinataire=destinataire, contenu=contenu)
        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], url_path="groupe")
    def envoyer_groupe(self, request):
        contenu = request.data.get("contenu", "").strip()
        if not contenu:
            return Response({"detail": "Message vide."}, status=status.HTTP_400_BAD_REQUEST)
        responsables = Responsable.objects.filter(actif=True).exclude(user=request.user)
        count = 0
        for resp in responsables:
            Message.objects.create(
                expediteur=request.user, destinataire=resp.user,
                contenu=f"📢 [Groupe] {contenu}",
            )
            count += 1
        return Response({"envoyes": count, "detail": f"Message envoyé à {count} responsable(s)."})

    @action(detail=False, methods=["get"], url_path="conversations")
    def conversations(self, request):
        user = request.user
        messages = Message.objects.filter(Q(expediteur=user) | Q(destinataire=user)).order_by("-date_envoi")
        vus = set()
        conversations = []
        for msg in messages:
            autre = msg.destinataire if msg.expediteur == user else msg.expediteur
            if autre.id not in vus:
                vus.add(autre.id)
                non_lus = Message.objects.filter(expediteur=autre, destinataire=user, lu=False).count()
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
        expediteur_id = request.data.get("expediteur_id")
        if not expediteur_id:
            return Response({"detail": "expediteur_id requis."}, status=400)
        messages = Message.objects.filter(expediteur__id=expediteur_id, destinataire=request.user, lu=False)
        count = messages.count()
        messages.update(lu=True, date_lecture=timezone.now())
        return Response({"marques": count})

    @action(detail=False, methods=["get"], url_path="non-lus")
    def non_lus(self, request):
        count = Message.objects.filter(destinataire=request.user, lu=False).count()
        return Response({"non_lus": count})


# ── Événements ────────────────────────────────────────────────────────────────

class EvenementViewSet(viewsets.ModelViewSet):
    serializer_class = EvenementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Evenement.objects.all()
        communaute = self.request.query_params.get("communaute_culte")
        if communaute:
            queryset = queryset.filter(Q(communaute_culte__id=communaute) | Q(tous_les_cultes=True))
        mois = self.request.query_params.get("mois")
        annee = self.request.query_params.get("annee")
        if mois and annee:
            queryset = queryset.filter(date_debut__year=annee, date_debut__month=mois)
        a_venir = self.request.query_params.get("a_venir")
        if a_venir:
            queryset = queryset.filter(date_debut__gte=date.today())
        return queryset.order_by("date_debut")


# ── Notifications ─────────────────────────────────────────────────────────────

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(destinataire=self.request.user)

    @action(detail=False, methods=["post"], url_path="marquer-toutes-lues")
    def marquer_toutes_lues(self, request):
        count = Notification.objects.filter(destinataire=request.user, lue=False).update(lue=True)
        return Response({"marquees": count})

    @action(detail=True, methods=["post"], url_path="lire")
    def lire(self, request, pk=None):
        notif = self.get_object()
        notif.lue = True
        notif.save()
        return Response(NotificationSerializer(notif).data)

    @action(detail=False, methods=["get"], url_path="non-lues")
    def non_lues(self, request):
        count = Notification.objects.filter(destinataire=request.user, lue=False).count()
        return Response({"non_lues": count})

    @action(detail=False, methods=["post"], url_path="generer")
    def generer(self, request):
        user = request.user
        aujourd_hui = date.today()
        generees = 0

        try:
            date_str = aujourd_hui.strftime("%d/%m")
            for m in Membre.objects.filter(date_anniversaire=date_str, statut="actif"):
                deja = Notification.objects.filter(
                    destinataire=user, type="anniversaire",
                    lien_id=m.id, date_creation__date=aujourd_hui,
                ).exists()
                if not deja:
                    Notification.objects.create(
                        destinataire=user, type="anniversaire",
                        titre=f"Anniversaire de {m.nom}",
                        message=f"{m.nom} fête son anniversaire aujourd'hui !",
                        lien_id=m.id,
                    )
                    generees += 1
        except Exception:
            pass

        try:
            date_limite = aujourd_hui - timedelta(weeks=3)
            for m in Membre.objects.filter(statut="actif"):
                derniere = Presence.objects.filter(membre=m, present=True).order_by("-date").first()
                if not derniere or derniere.date < date_limite:
                    deja = Notification.objects.filter(
                        destinataire=user, type="absence", lien_id=m.id,
                        date_creation__date__gte=aujourd_hui - timedelta(days=7),
                    ).exists()
                    if not deja:
                        semaines = (aujourd_hui - (derniere.date if derniere else date_limite)).days // 7
                        Notification.objects.create(
                            destinataire=user, type="absence",
                            titre=f"Absence prolongée : {m.nom}",
                            message=f"{m.nom} est absent(e) depuis {semaines} semaine(s).",
                            lien_id=m.id,
                        )
                        generees += 1
        except Exception:
            pass

        try:
            responsable = Responsable.objects.get(user=user)
            if responsable.role in ["pasteur", "administrateur", "tresoriere"]:
                from finance.models import DemandeFinance
                for d in DemandeFinance.objects.filter(statut="en_attente"):
                    deja = Notification.objects.filter(
                        destinataire=user, type="finance", lien_id=d.id,
                        date_creation__date__gte=aujourd_hui - timedelta(days=1),
                    ).exists()
                    if not deja:
                        Notification.objects.create(
                            destinataire=user, type="finance",
                            titre="Demande financière en attente",
                            message=f"Une demande de {d.montant}$ attend votre approbation.",
                            lien_id=d.id,
                        )
                        generees += 1
        except Exception:
            pass

        return Response({"generees": generees})


# ── Suivi pastoral ────────────────────────────────────────────────────────────

class SuiviPastoralViewSet(viewsets.ModelViewSet):
    serializer_class = SuiviPastoralSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = SuiviPastoral.objects.all().select_related("membre", "auteur")
        membre = self.request.query_params.get("membre")
        if membre:
            queryset = queryset.filter(membre__id=membre)
        statut = self.request.query_params.get("statut")
        if statut:
            queryset = queryset.filter(statut=statut)
        categorie = self.request.query_params.get("categorie")
        if categorie:
            queryset = queryset.filter(categorie=categorie)
        return queryset.order_by("-date_modification")

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data["auteur"] = request.user.id
        serializer = self.get_serializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="changer-statut")
    def changer_statut(self, request, pk=None):
        suivi = self.get_object()
        nouveau_statut = request.data.get("statut")
        if nouveau_statut not in ["ouvert", "en_cours", "resolu", "archive"]:
            return Response({"detail": "Statut invalide."}, status=status.HTTP_400_BAD_REQUEST)
        suivi.statut = nouveau_statut
        suivi.save()
        return Response(SuiviPastoralSerializer(suivi).data)


# ── Budget ────────────────────────────────────────────────────────────────────

class BudgetAnnuelViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetAnnuelSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = BudgetAnnuel.objects.prefetch_related("lignes__departement")
        communaute = self.request.query_params.get("communaute_culte")
        if communaute:
            queryset = queryset.filter(communaute_culte__id=communaute)
        annee = self.request.query_params.get("annee")
        if annee:
            queryset = queryset.filter(annee=annee)
        return queryset.order_by("-annee")

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data["cree_par"] = request.user.id
        serializer = self.get_serializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class LigneBudgetViewSet(viewsets.ModelViewSet):
    serializer_class = LigneBudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = LigneBudget.objects.select_related("departement", "budget")
        budget = self.request.query_params.get("budget")
        if budget:
            queryset = queryset.filter(budget__id=budget)
        return queryset


# ── Statistiques de croissance ────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def stats_croissance(request):
    import calendar
    communaute_id = request.query_params.get("communaute_culte")
    aujourd_hui = date.today()

    membres_qs = Membre.objects.all()
    presences_qs = Presence.objects.all()
    visiteurs_qs = Visiteur.objects.all()

    if communaute_id:
        membres_qs = membres_qs.filter(communautes_culte__id=communaute_id)
        presences_qs = presences_qs.filter(communaute_culte__id=communaute_id)
        visiteurs_qs = visiteurs_qs.filter(communaute_culte__id=communaute_id)

    mois_labels = []
    mois_dates = []
    for i in range(11, -1, -1):
        month = aujourd_hui.month - i
        year = aujourd_hui.year
        while month <= 0:
            month += 12
            year -= 1
        mois_dates.append(date(year, month, 1))
        mois_labels.append(f"{calendar.month_abbr[month]} {str(year)[2:]}")

    nouveaux_par_mois = [
        membres_qs.filter(date_integration__year=d.year, date_integration__month=d.month).count()
        for d in mois_dates
    ]

    total_par_mois = []
    for d in mois_dates:
        if d.month < 12:
            fin = date(d.year, d.month + 1, 1) - timedelta(days=1)
        else:
            fin = date(d.year + 1, 1, 1) - timedelta(days=1)
        total_par_mois.append(membres_qs.filter(date_integration__lte=fin).count())

    taux_par_mois = []
    for d in mois_dates:
        p = presences_qs.filter(date__year=d.year, date__month=d.month)
        total = p.count()
        presents = p.filter(present=True).count()
        taux_par_mois.append(round((presents / total) * 100) if total > 0 else 0)

    visiteurs_par_mois = [
        visiteurs_qs.filter(date_premiere_visite__year=d.year, date_premiere_visite__month=d.month).count()
        for d in mois_dates
    ]

    non_zero = [t for t in taux_par_mois if t > 0]
    taux_moyen = round(sum(non_zero) / len(non_zero)) if non_zero else 0

    return Response({
        "mois": mois_labels,
        "nouveaux_membres": nouveaux_par_mois,
        "total_membres": total_par_mois,
        "taux_presence": taux_par_mois,
        "visiteurs": visiteurs_par_mois,
        "resume": {
            "total_actifs": membres_qs.filter(statut="actif").count(),
            "total_inactifs": membres_qs.filter(statut="inactif").count(),
            "nouveaux_ce_mois": nouveaux_par_mois[-1] if nouveaux_par_mois else 0,
            "taux_moyen": taux_moyen,
        }
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def pointer_par_qr(request):
    """Marquer un membre présent via QR Code."""
    membre_id = request.data.get("membre_id")
    date_culte = request.data.get("date")
    communaute_id = request.data.get("communaute_culte")

    if not membre_id or not date_culte:
        return Response(
            {"detail": "membre_id et date sont requis."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        membre = Membre.objects.get(id=membre_id)
    except Membre.DoesNotExist:
        return Response(
            {"detail": "Membre introuvable."},
            status=status.HTTP_404_NOT_FOUND
        )

    presence, created = Presence.objects.update_or_create(
        membre=membre,
        date=date_culte,
        communaute_culte_id=communaute_id,
        defaults={"present": True},
    )

    return Response({
        "detail": f"{membre.nom} marqué présent.",
        "membre_nom": membre.nom,
        "deja_pointe": not created,
        "presence_id": presence.id,
    })

api_view(["POST"])
@permission_classes([IsAuthenticated])
def enregistrer_push_token(request):
    """Enregistre le token de notification push pour l'utilisateur connecté."""
    token = request.data.get("token", "").strip()
    if not token:
        return Response({"detail": "Token requis."}, status=status.HTTP_400_BAD_REQUEST)

    PushToken.objects.update_or_create(
        user=request.user,
        defaults={"token": token, "actif": True},
    )
    return Response({"detail": "Token enregistré."})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def envoyer_push(request):
    """Envoyer une notification push à tous les responsables actifs."""
    titre = request.data.get("titre", "MI Control")
    corps = request.data.get("corps", "")
    destinataires = request.data.get("destinataires", [])  # liste d'IDs ou "tous"

    if not corps:
        return Response({"detail": "Corps du message requis."}, status=status.HTTP_400_BAD_REQUEST)

    # Récupérer les tokens
    if destinataires == "tous":
        tokens = PushToken.objects.filter(actif=True).exclude(user=request.user)
    else:
        tokens = PushToken.objects.filter(user__id__in=destinataires, actif=True)

    if not tokens.exists():
        return Response({"detail": "Aucun destinataire avec push token.", "envoyes": 0})

    # Envoyer via Expo Push API
    messages = [
        {
            "to": pt.token,
            "title": titre,
            "body": corps,
            "sound": "default",
            "data": {"type": "mi_control"},
        }
        for pt in tokens
    ]

    try:
        response = http_requests.post(
            "https://exp.host/--/api/v2/push/send",
            json=messages,
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            timeout=10,
        )
        return Response({"envoyes": len(messages), "detail": f"Notification envoyée à {len(messages)} appareil(s)."})
    except Exception as e:
        return Response({"detail": f"Erreur envoi: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ── Fonction utilitaire — envoyer push depuis n'importe où dans le code ────────

def envoyer_push_utilisateur(user_id: int, titre: str, corps: str, data: dict = {}):
    """Envoyer une notification push à un utilisateur spécifique."""
    try:
        push = PushToken.objects.get(user__id=user_id, actif=True)
        http_requests.post(
            "https://exp.host/--/api/v2/push/send",
            json={
                "to": push.token,
                "title": titre,
                "body": corps,
                "sound": "default",
                "data": data,
            },
            headers={"Accept": "application/json", "Content-Type": "application/json"},
            timeout=5,
        )
    except Exception:
        pass
