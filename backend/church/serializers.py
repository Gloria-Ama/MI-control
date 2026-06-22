from rest_framework import serializers
from .models import CommunauteCulte, Membre, Departement, Visiteur, Presence, Responsable
from .chat_models import Message
from .evenement_model import Evenement
from .notification_model import Notification
from .pastoral_model import SuiviPastoral
from .budget_model import BudgetAnnuel, LigneBudget


class CommunauteCulteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunauteCulte
        fields = ["id", "nom", "description"]


class DepartementSerializer(serializers.ModelSerializer):
    communaute_nom = serializers.CharField(source="communaute_culte.nom", read_only=True)

    class Meta:
        model = Departement
        fields = ["id", "nom", "description", "communaute_culte", "communaute_nom"]


class MembreSerializer(serializers.ModelSerializer):
    departement_nom = serializers.SerializerMethodField()
    taux_presence = serializers.SerializerMethodField()
    absences_recentes = serializers.SerializerMethodField()
    communautes_culte = serializers.PrimaryKeyRelatedField(
        many=True, queryset=CommunauteCulte.objects.all(),
    )
    communautes_noms = serializers.SerializerMethodField()

    class Meta:
        model = Membre
        fields = [
            "id", "nom", "telephone", "email", "sexe",
            "date_anniversaire", "adresse", "departement",
            "departement_nom", "date_integration", "statut",
            "notes", "communautes_culte", "communautes_noms",
            "taux_presence", "absences_recentes",
        ]

    def get_departement_nom(self, obj):
        return obj.departement.nom if obj.departement else None

    def get_communautes_noms(self, obj):
        return [c.nom for c in obj.communautes_culte.all()]

    def get_taux_presence(self, obj):
        presences = obj.presences.all()
        total = presences.count()
        if total == 0:
            return None
        presents = presences.filter(present=True).count()
        return round((presents / total) * 100)

    def get_absences_recentes(self, obj):
        presences = obj.presences.order_by("-date")[:5]
        count = 0
        for p in presences:
            if not p.present:
                count += 1
            else:
                break
        return count


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

    class Meta:
        model = Responsable
        fields = [
            "id", "username", "email", "role",
            "communaute_culte", "departement",
            "mot_de_passe_change", "actif",
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