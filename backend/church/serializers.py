from rest_framework import serializers
from .models import CommunauteCulte, Membre, Departement, Visiteur, Presence, Responsable
from .chat_models import Message
from .evenement_model import Evenement
from .notification_model import Notification
from .pastoral_model import SuiviPastoral
from .budget_model import BudgetAnnuel, LigneBudget
from .group_chat_model import MessageGroupe, SondageGroupe, OptionSondage, VoteSondage
from .canal_model import Canal, MembreCanal, MessageCanal, LectureMessage, SondageCanal, OptionSondageCanal, VoteSondageCanal
from .notes_model import NotePersonnelle
from .culte_model import ProgrammeCulte, ElementProgramme

class CommunauteCulteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunauteCulte
        fields = ["id", "nom", "description"]

class DepartementSerializer(serializers.ModelSerializer):
    communaute_nom = serializers.CharField(source="communaute_culte.nom", read_only=True)
    responsable_nom = serializers.SerializerMethodField()
    responsable_id = serializers.SerializerMethodField()

    class Meta:
        model = Departement
        fields = [
            "id", "nom", "description", "communaute_culte",
            "communaute_nom", "responsable_nom", "responsable_id",
        ]

    def get_responsable_nom(self, obj):
        try:
            resp = Responsable.objects.filter(
                departement=obj, actif=True
            ).first()
            return resp.user.username if resp else None
        except Exception:
            return None

    def get_responsable_id(self, obj):
        try:
            resp = Responsable.objects.filter(
                departement=obj, actif=True
            ).first()
            return resp.id if resp else None
        except Exception:
            return None

class MembreSerializer(serializers.ModelSerializer):
    departements_noms = serializers.SerializerMethodField()
    communautes_culte = serializers.PrimaryKeyRelatedField(
        many=True, queryset=CommunauteCulte.objects.all()
    )
    departements = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Departement.objects.all()
    )

    class Meta:
        model = Membre
        fields = [
            "id", "nom", "telephone", "email", "sexe",
            "date_anniversaire", "adresse", "statut", "notes",
            "communautes_culte", "departements", "departements_noms",
            "date_integration",
        ]

    def get_departements_noms(self, obj):
        return [d.nom for d in obj.departements.all()]

    def create(self, validated_data):
        departements = validated_data.pop("departements", [])
        communautes = validated_data.pop("communautes_culte", [])
        membre = Membre.objects.create(**validated_data)
        membre.departements.set(departements)
        membre.communautes_culte.set(communautes)
        return membre

    def update(self, instance, validated_data):
        departements = validated_data.pop("departements", None)
        communautes = validated_data.pop("communautes_culte", None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        if departements is not None:
            instance.departements.set(departements)
        if communautes is not None:
            instance.communautes_culte.set(communautes)
        return instance

class VisiteurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visiteur
        fields = "__all__"


class PresenceSerializer(serializers.ModelSerializer):
    membre_nom = serializers.CharField(source="membre.nom", read_only=True)

    class Meta:
        model = Presence
        fields = ["id", "membre", "membre_nom", "date", "present", "communaute_culte"]


class ResponsableSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    photo_url = serializers.SerializerMethodField()

    def get_photo_url(self, obj):
        if obj.photo:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return None
    class Meta:
        model = Responsable
        fields = [
            "id", "username", "email", "role",
            "communaute_culte", "departement",
            "mot_de_passe_change", "actif","photo_url",
        ]


class MessageSerializer(serializers.ModelSerializer):
    expediteur_nom = serializers.CharField(source="expediteur.username", read_only=True)
    destinataire_nom = serializers.CharField(source="destinataire.username", read_only=True)

    class Meta:
        model = Message
        fields = [
            "id", "expediteur", "expediteur_nom",
            "destinataire", "destinataire_nom",
            "contenu", "date_envoi", "lu", "date_lecture",
        ]


class EvenementSerializer(serializers.ModelSerializer):
    type_label = serializers.SerializerMethodField()

    class Meta:
        model = Evenement
        fields = [
            "id", "communaute_culte", "titre", "description",
            "type", "type_label", "date_debut", "heure_debut",
            "date_fin", "heure_fin", "lieu", "tous_les_cultes",
        ]

    def get_type_label(self, obj):
        return obj.get_type_display()


class NotificationSerializer(serializers.ModelSerializer):
    type_label = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            "id", "type", "type_label", "titre", "message",
            "lue", "date_creation", "lien_id",
        ]

    def get_type_label(self, obj):
        return obj.get_type_display()


class SuiviPastoralSerializer(serializers.ModelSerializer):
    membre_nom = serializers.CharField(source="membre.nom", read_only=True)
    auteur_nom = serializers.CharField(source="auteur.username", read_only=True)
    categorie_label = serializers.SerializerMethodField()
    statut_label = serializers.SerializerMethodField()

    class Meta:
        model = SuiviPastoral
        fields = [
            "id", "membre", "membre_nom", "auteur", "auteur_nom",
            "categorie", "categorie_label", "titre", "notes",
            "statut", "statut_label", "confidentiel",
            "date_creation", "date_modification", "date_suivi_prochain",
        ]

    def get_categorie_label(self, obj):
        return obj.get_categorie_display()

    def get_statut_label(self, obj):
        return obj.get_statut_display()


class LigneBudgetSerializer(serializers.ModelSerializer):
    departement_nom = serializers.CharField(source="departement.nom", read_only=True)
    categorie_label = serializers.SerializerMethodField()
    ecart = serializers.ReadOnlyField()
    taux_execution = serializers.ReadOnlyField()

    class Meta:
        model = LigneBudget
        fields = [
            "id", "budget", "departement", "departement_nom",
            "categorie", "categorie_label", "description",
            "montant_prevu", "montant_realise", "notes",
            "ecart", "taux_execution",
        ]

    def get_categorie_label(self, obj):
        return obj.get_categorie_display()


class BudgetAnnuelSerializer(serializers.ModelSerializer):
    lignes = LigneBudgetSerializer(many=True, read_only=True)
    total_prevu = serializers.SerializerMethodField()
    total_realise = serializers.SerializerMethodField()
    taux_global = serializers.SerializerMethodField()

    class Meta:
        model = BudgetAnnuel
        fields = [
            "id", "communaute_culte", "annee", "montant_total",
            "notes", "date_creation", "lignes",
            "total_prevu", "total_realise", "taux_global",
        ]

    def get_total_prevu(self, obj):
        return float(sum(l.montant_prevu for l in obj.lignes.all()))

    def get_total_realise(self, obj):
        return float(sum(l.montant_realise for l in obj.lignes.all()))

    def get_taux_global(self, obj):
        prevu = sum(l.montant_prevu for l in obj.lignes.all())
        realise = sum(l.montant_realise for l in obj.lignes.all())
        if prevu > 0:
            return round((float(realise) / float(prevu)) * 100)
        return 0
    



class OptionSondageSerializer(serializers.ModelSerializer):
    nb_votes = serializers.SerializerMethodField()
    a_vote = serializers.SerializerMethodField()

    class Meta:
        model = OptionSondage
        fields = ["id", "texte", "ordre", "nb_votes", "a_vote"]

    def get_nb_votes(self, obj):
        return obj.votes.count()

    def get_a_vote(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.votes.filter(votant=request.user).exists()
        return False


class SondageGroupeSerializer(serializers.ModelSerializer):
    options = OptionSondageSerializer(many=True, read_only=True)
    total_votes = serializers.SerializerMethodField()

    class Meta:
        model = SondageGroupe
        fields = ["id", "question", "date_fin", "actif", "options", "total_votes"]

    def get_total_votes(self, obj):
        return VoteSondage.objects.filter(option__sondage=obj).count()


class MessageGroupeSerializer(serializers.ModelSerializer):
    auteur_nom = serializers.CharField(source="auteur.username", read_only=True)
    sondage = SondageGroupeSerializer(read_only=True)
    fichier_url = serializers.SerializerMethodField()

    class Meta:
        model = MessageGroupe
        fields = [
            "id", "auteur", "auteur_nom", "communaute_culte",
            "tous_les_cultes", "contenu", "type",
            "fichier", "fichier_url", "nom_fichier",
            "date_envoi", "sondage",
        ]

    def get_fichier_url(self, obj):
        if obj.fichier:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.fichier.url)
            return obj.fichier.url
        return None

from .group_chat_model import MessageGroupe, SondageGroupe, OptionSondage, VoteSondage

class OptionSondageSerializer(serializers.ModelSerializer):
    nb_votes = serializers.SerializerMethodField()
    a_vote = serializers.SerializerMethodField()
    class Meta:
        model = OptionSondage
        fields = ["id", "texte", "ordre", "nb_votes", "a_vote"]
    def get_nb_votes(self, obj):
        return obj.votes.count()
    def get_a_vote(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.votes.filter(votant=request.user).exists()
        return False

class SondageGroupeSerializer(serializers.ModelSerializer):
    options = OptionSondageSerializer(many=True, read_only=True)
    total_votes = serializers.SerializerMethodField()
    class Meta:
        model = SondageGroupe
        fields = ["id", "question", "date_fin", "actif", "options", "total_votes"]
    def get_total_votes(self, obj):
        return VoteSondage.objects.filter(option__sondage=obj).count()

class MessageGroupeSerializer(serializers.ModelSerializer):
    auteur_nom = serializers.CharField(source="auteur.username", read_only=True)
    sondage = SondageGroupeSerializer(read_only=True)
    fichier_url = serializers.SerializerMethodField()
    class Meta:
        model = MessageGroupe
        fields = ["id", "auteur", "auteur_nom", "communaute_culte", "tous_les_cultes",
                "contenu", "type", "fichier", "fichier_url", "nom_fichier", "date_envoi", "sondage"]
    def get_fichier_url(self, obj):
        if obj.fichier:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.fichier.url)
            return obj.fichier.url
        return None
class MembreCanalSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    class Meta:
        model = MembreCanal
        fields = ["id", "user", "username", "est_admin", "date_ajout"]

class OptionSondageCanalSerializer(serializers.ModelSerializer):
    nb_votes = serializers.SerializerMethodField()
    a_vote = serializers.SerializerMethodField()
    class Meta:
        model = OptionSondageCanal
        fields = ["id", "texte", "ordre", "nb_votes", "a_vote"]
    def get_nb_votes(self, obj):
        return obj.votes.count()
    def get_a_vote(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.votes.filter(votant=request.user).exists()
        return False

class SondageCanalSerializer(serializers.ModelSerializer):
    options = OptionSondageCanalSerializer(many=True, read_only=True)
    total_votes = serializers.SerializerMethodField()
    class Meta:
        model = SondageCanal
        fields = ["id", "question", "actif", "options", "total_votes"]
    def get_total_votes(self, obj):
        return VoteSondageCanal.objects.filter(option__sondage=obj).count()

class MessageCanalSerializer(serializers.ModelSerializer):
    auteur_nom = serializers.CharField(source="auteur.username", read_only=True)
    sondage = SondageCanalSerializer(read_only=True)
    fichier_url = serializers.SerializerMethodField()
    lu = serializers.SerializerMethodField()

    class Meta:
        model = MessageCanal
        fields = ["id", "canal", "auteur", "auteur_nom", "contenu", "type",
                  "fichier", "fichier_url", "nom_fichier", "date_envoi", "sondage", "lu"]

    def get_fichier_url(self, obj):
        if obj.fichier:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.fichier.url)
        return None

    def get_lu(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.lectures.filter(user=request.user).exists() or obj.auteur == request.user
        return False

class CanalSerializer(serializers.ModelSerializer):
    membres = MembreCanalSerializer(many=True, read_only=True)
    nb_membres = serializers.SerializerMethodField()
    dernier_message = serializers.SerializerMethodField()
    non_lus = serializers.SerializerMethodField()
    type_label = serializers.SerializerMethodField()

    class Meta:
        model = Canal
        fields = ["id", "nom", "description", "type", "type_label", "createur",
                  "communaute_culte", "date_creation", "membres", "nb_membres",
                  "dernier_message", "non_lus"]

    def get_nb_membres(self, obj):
        return obj.membres.count()

    def get_dernier_message(self, obj):
        msg = obj.messages.order_by("-date_envoi").first()
        if msg:
            return {
                "contenu": msg.contenu or f"[{msg.type}]",
                "auteur": msg.auteur.username,
                "date": msg.date_envoi.isoformat(),
                "type": msg.type,
            }
        return None

    def get_non_lus(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.nb_non_lus(request.user)
        return 0

    def get_type_label(self, obj):
        return obj.get_type_display()

class NotePersonnelleSerializer(serializers.ModelSerializer):
    auteur_nom = serializers.CharField(source="auteur.username", read_only=True)

    class Meta:
        model = NotePersonnelle
        fields = [
            "id", "titre", "contenu", "couleur", "epinglee",
            "auteur_nom", "date_creation", "date_modification",
        ]


class ElementProgrammeSerializer(serializers.ModelSerializer):
    type_label = serializers.CharField(source="get_type_display", read_only=True)

    class Meta:
        model = ElementProgramme
        fields = [
            "id", "programme", "type", "type_label",
            "titre", "responsable", "duree_minutes",
            "ordre", "notes", "complete",
        ]


class ProgrammeCulteSerializer(serializers.ModelSerializer):
    elements         = ElementProgrammeSerializer(many=True, read_only=True)
    cree_par_nom     = serializers.CharField(source="cree_par.username", read_only=True)
    duree_totale     = serializers.SerializerMethodField()

    class Meta:
        model = ProgrammeCulte
        fields = [
            "id", "communaute_culte", "date", "theme",
            "predicateur", "verset_cle", "notes_generales",
            "cree_par", "cree_par_nom", "elements",
            "duree_totale", "date_creation",
        ]

    def get_duree_totale(self, obj):
        return sum(e.duree_minutes for e in obj.elements.all())
