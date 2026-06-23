from rest_framework import serializers
from .models import DemandeFinance, TransactionFinance
import json


class DemandeFinanceSerializer(serializers.ModelSerializer):
    responsable_nom = serializers.SerializerMethodField()
    departement_nom = serializers.SerializerMethodField()
    type_label = serializers.SerializerMethodField()
    statut_label = serializers.SerializerMethodField()
    pieces_jointes_list = serializers.SerializerMethodField()

    class Meta:
        model = DemandeFinance
        fields = [
            "id", "type", "type_label", "responsable", "responsable_nom",
            "departement", "departement_nom", "communaute_culte",
            "montant", "motif", "statut", "statut_label",
            "date_demande", "date_traitement", "notes_traitement",
            "pieces_jointes", "pieces_jointes_list",
        ]

    def get_responsable_nom(self, obj):
        return obj.responsable.user.username if obj.responsable else None

    def get_departement_nom(self, obj):
        return obj.departement.nom if obj.departement else None

    def get_type_label(self, obj):
        return obj.get_type_display()

    def get_statut_label(self, obj):
        return obj.get_statut_display()

    def get_pieces_jointes_list(self, obj):
        try:
            return json.loads(obj.pieces_jointes or "[]")
        except Exception:
            return []


class TransactionFinanceSerializer(serializers.ModelSerializer):
    responsable_nom = serializers.SerializerMethodField()
    type_label = serializers.SerializerMethodField()
    est_entree = serializers.SerializerMethodField()

    class Meta:
        model = TransactionFinance
        fields = [
            "id", "type", "type_label", "est_entree",
            "montant", "description", "date", "culte_date",
            "communaute_culte", "responsable", "responsable_nom",
        ]

    def get_responsable_nom(self, obj):
        return obj.responsable.user.username if obj.responsable else None

    def get_type_label(self, obj):
        return obj.get_type_display()

    def get_est_entree(self, obj):
        return obj.type in ["cotisation", "offrande", "dime", "don", "entree"]