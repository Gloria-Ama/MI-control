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
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse
import json
from .notes_model import NotePersonnelle
from .culte_model import ProgrammeCulte, ElementProgramme
from .serializers import NotePersonnelleSerializer, ProgrammeCulteSerializer, ElementProgrammeSerializer
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

    # ✅ FIX — get_queryset au bon niveau d'indentation
    def get_queryset(self):
        queryset = Departement.objects.all().select_related("communaute_culte")
        communaute = self.request.query_params.get("communaute_culte")
        if communaute:
            queryset = queryset.filter(communaute_culte__id=communaute)
        return queryset.order_by("nom")

    @action(detail=True, methods=["post"], url_path="assigner-responsable")
    def assigner_responsable(self, request, pk=None):
        departement = self.get_object()
        responsable_id = request.data.get("responsable_id")
        Responsable.objects.filter(departement=departement).update(departement=None)
        if responsable_id:
            try:
                resp = Responsable.objects.get(id=responsable_id)
                resp.departement = departement
                resp.save()
                return Response({"detail": f"{resp.user.username} assigné au département {departement.nom}."})
            except Responsable.DoesNotExist:
                return Response({"detail": "Responsable introuvable."}, status=404)
        return Response({"detail": "Responsable retiré du département."})


# ── Membres ───────────────────────────────────────────────────────────────────

class MembreViewSet(viewsets.ModelViewSet):
    serializer_class = MembreSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # ✅ FIX — prefetch_related("departements") au lieu de select_related("departement")
        queryset = Membre.objects.all().prefetch_related("departements", "communautes_culte")
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(nom__icontains=search)
        # ✅ FIX — filtrer par departements (ManyToMany) au lieu de departement (FK)
        departement = self.request.query_params.get("departement")
        if departement:
            queryset = queryset.filter(departements__id=departement)
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
    
    @action(detail=True, methods=["post"], url_path="photo")
    def upload_photo(self, request, pk=None):
        responsable = self.get_object()
        photo = request.FILES.get("photo")
        if not photo:
            return Response({"detail": "Photo requise."}, status=400)
        responsable.photo = photo
        responsable.save()
        return Response(
            ResponsableSerializer(responsable, context={"request": request}).data
    )
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
                from .finances_model import DemandeFinance
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
    membre_id = request.data.get("membre_id")
    date_culte = request.data.get("date")
    communaute_id = request.data.get("communaute_culte")
    if not membre_id or not date_culte:
        return Response({"detail": "membre_id et date sont requis."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        membre = Membre.objects.get(id=membre_id)
    except Membre.DoesNotExist:
        return Response({"detail": "Membre introuvable."}, status=status.HTTP_404_NOT_FOUND)
    presence, created = Presence.objects.update_or_create(
        membre=membre, date=date_culte, communaute_culte_id=communaute_id,
        defaults={"present": True},
    )
    return Response({
        "detail": f"{membre.nom} marqué présent.",
        "membre_nom": membre.nom,
        "deja_pointe": not created,
        "presence_id": presence.id,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def enregistrer_push_token(request):
    token = request.data.get("token", "").strip()
    if not token:
        return Response({"detail": "Token requis."}, status=status.HTTP_400_BAD_REQUEST)
    PushToken.objects.update_or_create(user=request.user, defaults={"token": token, "actif": True})
    return Response({"detail": "Token enregistré."})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def envoyer_push(request):
    titre = request.data.get("titre", "MI Control")
    corps = request.data.get("corps", "")
    destinataires = request.data.get("destinataires", [])
    if not corps:
        return Response({"detail": "Corps du message requis."}, status=status.HTTP_400_BAD_REQUEST)
    if destinataires == "tous":
        tokens = PushToken.objects.filter(actif=True).exclude(user=request.user)
    else:
        tokens = PushToken.objects.filter(user__id__in=destinataires, actif=True)
    if not tokens.exists():
        return Response({"detail": "Aucun destinataire avec push token.", "envoyes": 0})
    messages = [{"to": pt.token, "title": titre, "body": corps, "sound": "default", "data": {"type": "mi_control"}} for pt in tokens]
    try:
        http_requests.post("https://exp.host/--/api/v2/push/send", json=messages,
            headers={"Accept": "application/json", "Content-Type": "application/json"}, timeout=10)
        return Response({"envoyes": len(messages), "detail": f"Notification envoyée à {len(messages)} appareil(s)."})
    except Exception as e:
        return Response({"detail": f"Erreur envoi: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def envoyer_push_utilisateur(user_id: int, titre: str, corps: str, data: dict = {}):
    try:
        push = PushToken.objects.get(user__id=user_id, actif=True)
        http_requests.post("https://exp.host/--/api/v2/push/send",
            json={"to": push.token, "title": titre, "body": corps, "sound": "default", "data": data},
            headers={"Accept": "application/json", "Content-Type": "application/json"}, timeout=5)
    except Exception:
        pass


# ── Messages Groupe ───────────────────────────────────────────────────────────

from .group_chat_model import MessageGroupe, SondageGroupe, OptionSondage, VoteSondage
from .serializers import MessageGroupeSerializer, SondageGroupeSerializer

class MessageGroupeViewSet(viewsets.ModelViewSet):
    serializer_class = MessageGroupeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = MessageGroupe.objects.select_related("auteur", "communaute_culte")
        communaute = self.request.query_params.get("communaute_culte")
        if communaute:
            queryset = queryset.filter(Q(communaute_culte__id=communaute) | Q(tous_les_cultes=True))
        return queryset.order_by("date_envoi")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data["auteur"] = request.user.id
        type_msg = data.get("type", "texte")
        if type_msg == "sondage":
            question = data.get("question", "").strip()
            options = data.getlist("options") or []
            if not question:
                return Response({"detail": "Question requise."}, status=status.HTTP_400_BAD_REQUEST)
            if len(options) < 2:
                return Response({"detail": "Minimum 2 options."}, status=status.HTTP_400_BAD_REQUEST)
            msg = MessageGroupe.objects.create(auteur=request.user, communaute_culte_id=data.get("communaute_culte"),
                tous_les_cultes=data.get("tous_les_cultes", False), contenu=question, type="sondage")
            sondage = SondageGroupe.objects.create(message=msg, question=question)
            for i, opt in enumerate(options):
                OptionSondage.objects.create(sondage=sondage, texte=opt, ordre=i)
            return Response(MessageGroupeSerializer(msg, context={"request": request}).data, status=status.HTTP_201_CREATED)
        if type_msg in ["image", "fichier"]:
            fichier = request.FILES.get("fichier")
            if not fichier:
                return Response({"detail": "Fichier requis."}, status=status.HTTP_400_BAD_REQUEST)
            msg = MessageGroupe.objects.create(auteur=request.user, communaute_culte_id=data.get("communaute_culte"),
                tous_les_cultes=data.get("tous_les_cultes", False), contenu=data.get("contenu", ""),
                type=type_msg, fichier=fichier, nom_fichier=fichier.name)
            return Response(MessageGroupeSerializer(msg, context={"request": request}).data, status=status.HTTP_201_CREATED)
        contenu = data.get("contenu", "").strip()
        if not contenu:
            return Response({"detail": "Message vide."}, status=status.HTTP_400_BAD_REQUEST)
        msg = MessageGroupe.objects.create(auteur=request.user, communaute_culte_id=data.get("communaute_culte"),
            tous_les_cultes=data.get("tous_les_cultes", False), contenu=contenu, type="texte")
        return Response(MessageGroupeSerializer(msg, context={"request": request}).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], url_path="voter")
    def voter(self, request):
        option_id = request.data.get("option_id")
        if not option_id:
            return Response({"detail": "option_id requis."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            option = OptionSondage.objects.get(id=option_id)
        except OptionSondage.DoesNotExist:
            return Response({"detail": "Option introuvable."}, status=status.HTTP_404_NOT_FOUND)
        sondage = option.sondage
        VoteSondage.objects.filter(votant=request.user, option__sondage=sondage).delete()
        VoteSondage.objects.create(option=option, votant=request.user)
        return Response(MessageGroupeSerializer(sondage.message, context={"request": request}).data)


# ── Inscription membre ────────────────────────────────────────────────────────

@csrf_exempt
def inscription_membre(request, communaute_id):
    try:
        communaute = CommunauteCulte.objects.get(id=communaute_id)
    except CommunauteCulte.DoesNotExist:
        return HttpResponse("Communauté introuvable.", status=404)

    departements = Departement.objects.filter(communaute_culte=communaute).order_by("nom")

    if request.method == "GET":
        return HttpResponse(generer_formulaire_html(communaute, departements), content_type="text/html; charset=utf-8")

    if request.method == "POST":
        try:
            if request.content_type == "application/json":
                data = json.loads(request.body)
            else:
                data = request.POST
            nom = data.get("nom", "").strip()
            telephone = data.get("telephone", "").strip()
            sexe = data.get("sexe", "M").strip()
            date_anniversaire = data.get("date_anniversaire", "").strip()
            adresse = data.get("adresse", "").strip()
            departement_id = data.get("departement", "").strip()
            if not nom or not telephone:
                return JsonResponse({"succes": False, "message": "Le nom et le téléphone sont obligatoires."}, status=400)
            if Membre.objects.filter(telephone=telephone).exists():
                return JsonResponse({"succes": False, "message": "Un membre avec ce numéro existe déjà."}, status=400)
            kwargs = {"nom": nom, "telephone": telephone, "sexe": sexe, "statut": "actif"}
            if date_anniversaire:
                kwargs["date_anniversaire"] = date_anniversaire
            if adresse:
                kwargs["adresse"] = adresse
            membre = Membre.objects.create(**kwargs)
            membre.communautes_culte.add(communaute)
            if departement_id:
                try:
                    dept = Departement.objects.get(id=departement_id)
                    membre.departements.add(dept)
                except Departement.DoesNotExist:
                    pass
            try:
                responsables = Responsable.objects.filter(actif=True)
                for resp in responsables:
                    Notification.objects.create(
                        destinataire=resp.user, type="info",
                        titre=f"Nouveau membre inscrit — {communaute.nom}",
                        message=f"{nom} vient de s'inscrire via le formulaire.",
                        lien_id=membre.id,
                    )
            except Exception:
                pass
            return JsonResponse({"succes": True, "message": f"Bienvenue {nom} ! Votre inscription a été enregistrée.", "membre_id": membre.id})
        except Exception as e:
            return JsonResponse({"succes": False, "message": f"Erreur: {str(e)}"}, status=500)

    return HttpResponse("Méthode non autorisée.", status=405)


def generer_formulaire_html(communaute, departements):
    options_dept = "".join(f'<option value="{d.id}">{d.nom}</option>' for d in departements)
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Inscription — {communaute.nom}</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F8F5F0; min-height: 100vh; }}
    .header {{ background: #07074C; color: white; padding: 24px 20px; text-align: center; }}
    .header h1 {{ font-size: 22px; font-weight: 700; }}
    .header p {{ font-size: 14px; opacity: 0.8; margin-top: 4px; }}
    .container {{ max-width: 480px; margin: 0 auto; padding: 20px; }}
    .card {{ background: white; border-radius: 16px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 16px; }}
    .section-title {{ font-size: 13px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }}
    label {{ font-size: 14px; font-weight: 600; color: #1E293B; display: block; margin-bottom: 6px; }}
    input, select {{ width: 100%; padding: 12px 14px; border: 1px solid #E2E8F0; border-radius: 10px; font-size: 15px; color: #1E293B; background: #F8F5F0; margin-bottom: 14px; -webkit-appearance: none; }}
    input:focus, select:focus {{ outline: none; border-color: #07074C; background: white; }}
    .radio-group {{ display: flex; gap: 12px; margin-bottom: 14px; }}
    .radio-option {{ flex: 1; padding: 12px; border: 1.5px solid #E2E8F0; border-radius: 10px; text-align: center; cursor: pointer; font-size: 14px; font-weight: 600; color: #64748B; background: #F8F5F0; }}
    .radio-option.selected {{ border-color: #07074C; background: #07074C; color: white; }}
    .btn {{ width: 100%; padding: 16px; background: #07074C; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; margin-top: 8px; }}
    .success {{ background: #F0FDF4; border: 1px solid #86EFAC; border-radius: 12px; padding: 20px; text-align: center; display: none; }}
    .success h2 {{ color: #065F46; font-size: 20px; margin-bottom: 8px; }}
    .error-msg {{ background: #FEF2F2; border: 1px solid #FECACA; border-radius: 10px; padding: 12px; color: #991B1B; font-size: 14px; margin-bottom: 14px; display: none; }}
    .required {{ color: #EF4444; }}
  </style>
</head>
<body>
  <div class="header"><h1>MI Control</h1><p>Inscription — {communaute.nom}</p></div>
  <div class="container">
    <div id="errorMsg" class="error-msg"></div>
    <div id="successMsg" class="success"><h2>Bienvenue !</h2><p id="successText"></p></div>
    <form id="inscriptionForm">
      <div class="card">
        <div class="section-title">Informations personnelles</div>
        <label>Nom complet <span class="required">*</span></label>
        <input type="text" name="nom" placeholder="Ex: Jean Pierre Dupont" required />
        <label>Téléphone <span class="required">*</span></label>
        <input type="tel" name="telephone" placeholder="Ex: +509 1234 5678" required />
        <label>Sexe <span class="required">*</span></label>
        <div class="radio-group">
          <div class="radio-option selected" id="optH" onclick="choisirSexe('M')">Homme</div>
          <div class="radio-option" id="optF" onclick="choisirSexe('F')">Femme</div>
        </div>
        <input type="hidden" name="sexe" id="sexeInput" value="M" />
        <label>Date d'anniversaire (JJ/MM)</label>
        <input type="text" name="date_anniversaire" placeholder="Ex: 15/03" maxlength="5" />
        <label>Adresse</label>
        <input type="text" name="adresse" placeholder="Ex: Delmas 75, Port-au-Prince" />
      </div>
      <div class="card">
        <div class="section-title">Église</div>
        <label>Département</label>
        <select name="departement"><option value="">Aucun département</option>{options_dept}</select>
      </div>
      <button type="submit" class="btn">S'inscrire maintenant</button>
    </form>
  </div>
  <script>
    function choisirSexe(v) {{
      document.getElementById('sexeInput').value = v;
      document.getElementById('optH').classList.toggle('selected', v === 'M');
      document.getElementById('optF').classList.toggle('selected', v === 'F');
    }}
    document.getElementById('inscriptionForm').addEventListener('submit', async function(e) {{
      e.preventDefault();
      const btn = document.querySelector('.btn');
      btn.textContent = 'Envoi en cours...'; btn.disabled = true;
      const data = {{}};
      new FormData(e.target).forEach((v, k) => data[k] = v);
      try {{
        const res = await fetch(window.location.href, {{ method: 'POST', headers: {{'Content-Type': 'application/json'}}, body: JSON.stringify(data) }});
        const result = await res.json();
        if (result.succes) {{
          document.getElementById('inscriptionForm').style.display = 'none';
          document.getElementById('successText').textContent = result.message;
          document.getElementById('successMsg').style.display = 'block';
        }} else {{
          const err = document.getElementById('errorMsg');
          err.textContent = result.message; err.style.display = 'block';
          btn.textContent = "S'inscrire maintenant"; btn.disabled = false;
        }}
      }} catch(e) {{
        document.getElementById('errorMsg').textContent = 'Erreur de connexion.';
        document.getElementById('errorMsg').style.display = 'block';
        btn.textContent = "S'inscrire maintenant"; btn.disabled = false;
      }}
    }});
  </script>
</body>
</html>"""


# ── Canaux (Chat WhatsApp-like) ───────────────────────────────────────────────

from .canal_model import Canal, MembreCanal, MessageCanal, LectureMessage, SondageCanal, OptionSondageCanal, VoteSondageCanal
from .serializers import CanalSerializer, MessageCanalSerializer

class CanalViewSet(viewsets.ModelViewSet):
    serializer_class = CanalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Canal.objects.filter(membres__user=self.request.user, actif=True).distinct()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def create(self, request, *args, **kwargs):
        nom = request.data.get("nom", "").strip()
        description = request.data.get("description", "").strip()
        type_canal = request.data.get("type", "restreint")
        membres_ids = request.data.get("membres", [])
        communaute_id = request.data.get("communaute_culte")

        if type_canal == "prive":
            if len(membres_ids) != 1:
                return Response({"detail": "Une conversation privée nécessite exactement 1 destinataire."}, status=400)
            canal_existant = Canal.objects.filter(type="prive", membres__user=request.user).filter(membres__user__id=membres_ids[0]).first()
            if canal_existant:
                return Response(CanalSerializer(canal_existant, context={"request": request}).data)

        canal = Canal.objects.create(nom=nom, description=description, type=type_canal, createur=request.user, communaute_culte_id=communaute_id)
        MembreCanal.objects.create(canal=canal, user=request.user, est_admin=True)
        for mid in membres_ids:
            try:
                u = User.objects.get(id=mid)
                MembreCanal.objects.get_or_create(canal=canal, user=u)
            except User.DoesNotExist:
                pass
        return Response(CanalSerializer(canal, context={"request": request}).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="ajouter-membre")
    def ajouter_membre(self, request, pk=None):
        canal = self.get_object()
        user_id = request.data.get("user_id")
        try:
            u = User.objects.get(id=user_id)
            MembreCanal.objects.get_or_create(canal=canal, user=u)
            return Response({"detail": f"{u.username} ajouté."})
        except User.DoesNotExist:
            return Response({"detail": "Utilisateur introuvable."}, status=404)

    @action(detail=True, methods=["post"], url_path="quitter")
    def quitter(self, request, pk=None):
        canal = self.get_object()
        MembreCanal.objects.filter(canal=canal, user=request.user).delete()
        return Response({"detail": "Vous avez quitté le groupe."})

    @action(detail=False, methods=["post"], url_path="initialiser-principal")
    def initialiser_principal(self, request):
        communaute_id = request.data.get("communaute_culte")
        try:
            communaute = CommunauteCulte.objects.get(id=communaute_id)
        except CommunauteCulte.DoesNotExist:
            return Response({"detail": "Communauté introuvable."}, status=404)
        canal, created = Canal.objects.get_or_create(
            type="principal", communaute_culte=communaute,
            defaults={"nom": f"Groupe — {communaute.nom}", "createur": request.user}
        )
        for resp in Responsable.objects.filter(actif=True):
            MembreCanal.objects.get_or_create(canal=canal, user=resp.user)
        MembreCanal.objects.get_or_create(canal=canal, user=request.user)
        return Response(CanalSerializer(canal, context={"request": request}).data)


class MessageCanalViewSet(viewsets.ModelViewSet):
    serializer_class = MessageCanalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        canal_id = self.request.query_params.get("canal")
        if canal_id:
            if not MembreCanal.objects.filter(canal__id=canal_id, user=self.request.user).exists():
                return MessageCanal.objects.none()
            return MessageCanal.objects.filter(canal__id=canal_id).select_related("auteur")
        return MessageCanal.objects.none()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def create(self, request, *args, **kwargs):
        canal_id = request.data.get("canal")
        type_msg = request.data.get("type", "texte")
        try:
            canal = Canal.objects.get(id=canal_id)
            if not MembreCanal.objects.filter(canal=canal, user=request.user).exists():
                return Response({"detail": "Vous n'êtes pas membre de ce canal."}, status=403)
        except Canal.DoesNotExist:
            return Response({"detail": "Canal introuvable."}, status=404)

        if type_msg == "sondage":
            question = request.data.get("question", "").strip()
            options = request.data.getlist("options") if hasattr(request.data, 'getlist') else request.data.get("options", [])
            if not question:
                return Response({"detail": "Question requise."}, status=400)
            if len([o for o in options if o.strip()]) < 2:
                return Response({"detail": "Minimum 2 options."}, status=400)
            msg = MessageCanal.objects.create(canal=canal, auteur=request.user, contenu=question, type="sondage")
            sondage = SondageCanal.objects.create(message=msg, question=question)
            for i, opt in enumerate([o for o in options if o.strip()]):
                OptionSondageCanal.objects.create(sondage=sondage, texte=opt, ordre=i)
            return Response(MessageCanalSerializer(msg, context={"request": request}).data, status=201)

        if type_msg in ["image", "fichier"]:
            fichier = request.FILES.get("fichier")
            if not fichier:
                return Response({"detail": "Fichier requis."}, status=400)
            msg = MessageCanal.objects.create(canal=canal, auteur=request.user,
                contenu=request.data.get("contenu", ""), type=type_msg, fichier=fichier, nom_fichier=fichier.name)
            return Response(MessageCanalSerializer(msg, context={"request": request}).data, status=201)

        contenu = request.data.get("contenu", "").strip()
        if not contenu:
            return Response({"detail": "Message vide."}, status=400)
        msg = MessageCanal.objects.create(canal=canal, auteur=request.user, contenu=contenu, type="texte")
        return Response(MessageCanalSerializer(msg, context={"request": request}).data, status=201)

    @action(detail=False, methods=["post"], url_path="marquer-lus")
    def marquer_lus(self, request):
        canal_id = request.data.get("canal_id")
        if not canal_id:
            return Response({"detail": "canal_id requis."}, status=400)
        messages = MessageCanal.objects.filter(canal__id=canal_id).exclude(auteur=request.user)
        count = 0
        for msg in messages:
            _, created = LectureMessage.objects.get_or_create(message=msg, user=request.user)
            if created:
                count += 1
        return Response({"marques": count})

    @action(detail=False, methods=["post"], url_path="voter")
    def voter(self, request):
        option_id = request.data.get("option_id")
        try:
            option = OptionSondageCanal.objects.get(id=option_id)
        except OptionSondageCanal.DoesNotExist:
            return Response({"detail": "Option introuvable."}, status=404)
        sondage = option.sondage
        VoteSondageCanal.objects.filter(votant=request.user, option__sondage=sondage).delete()
        VoteSondageCanal.objects.create(option=option, votant=request.user)
        return Response(MessageCanalSerializer(sondage.message, context={"request": request}).data)



# ── Notes personnelles ────────────────────────────────────────────────────────

class NotePersonnelleViewSet(viewsets.ModelViewSet):
    serializer_class = NotePersonnelleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = NotePersonnelle.objects.filter(auteur=self.request.user)
        recherche = self.request.query_params.get("search")
        if recherche:
            queryset = queryset.filter(
                Q(titre__icontains=recherche) | Q(contenu__icontains=recherche)
            )
        couleur = self.request.query_params.get("couleur")
        if couleur:
            queryset = queryset.filter(couleur=couleur)
        return queryset

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data["auteur"] = request.user.id
        serializer = self.get_serializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save(auteur=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="epingler")
    def epingler(self, request, pk=None):
        note = self.get_object()
        note.epinglee = not note.epinglee
        note.save()
        return Response({"epinglee": note.epinglee})


# ── Gestion du culte ──────────────────────────────────────────────────────────

class ProgrammeCulteViewSet(viewsets.ModelViewSet):
    serializer_class = ProgrammeCulteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ProgrammeCulte.objects.prefetch_related("elements")
        communaute = self.request.query_params.get("communaute_culte")
        if communaute:
            queryset = queryset.filter(communaute_culte__id=communaute)
        return queryset

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data["cree_par"] = request.user.id
        serializer = self.get_serializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save(cree_par=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="dupliquer")
    def dupliquer(self, request, pk=None):
        """Dupliquer un programme pour un nouveau culte."""
        from datetime import date
        programme = self.get_object()
        nouveau = ProgrammeCulte.objects.create(
            communaute_culte=programme.communaute_culte,
            date=date.today(),
            theme=programme.theme,
            predicateur=programme.predicateur,
            verset_cle=programme.verset_cle,
            notes_generales="",
            cree_par=request.user,
        )
        for element in programme.elements.all():
            ElementProgramme.objects.create(
                programme=nouveau,
                type=element.type,
                titre=element.titre,
                responsable=element.responsable,
                duree_minutes=element.duree_minutes,
                ordre=element.ordre,
                notes=element.notes,
                complete=False,
            )
        return Response(ProgrammeCulteSerializer(nouveau).data, status=status.HTTP_201_CREATED)


class ElementProgrammeViewSet(viewsets.ModelViewSet):
    serializer_class = ElementProgrammeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ElementProgramme.objects.all()
        programme = self.request.query_params.get("programme")
        if programme:
            queryset = queryset.filter(programme__id=programme)
        return queryset

    @action(detail=True, methods=["post"], url_path="cocher")
    def cocher(self, request, pk=None):
        """Marquer un élément comme complété pendant le culte."""
        element = self.get_object()
        element.complete = not element.complete
        element.save()
        return Response({"complete": element.complete})

    @action(detail=False, methods=["post"], url_path="reordonner")
    def reordonner(self, request):
        """Mettre à jour l'ordre des éléments."""
        elements = request.data.get("elements", [])
        for item in elements:
            ElementProgramme.objects.filter(id=item["id"]).update(ordre=item["ordre"])
        return Response({"detail": "Ordre mis à jour."})