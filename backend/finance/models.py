from django.db import models
from church.models import CommunauteCulte, Departement, Responsable


class DemandeFinance(models.Model):
    TYPE_CHOICES = [
        ("financement", "Demande de financement"),
        ("remboursement", "Demande de remboursement"),
    ]
    STATUT_CHOICES = [
        ("en_attente", "En attente"),
        ("approuvee", "Approuvée"),
        ("refusee", "Refusée"),
        ("remboursee", "Remboursée"),
    ]

    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    responsable = models.ForeignKey(
        Responsable, on_delete=models.SET_NULL, null=True, blank=True
    )
    departement = models.ForeignKey(
        Departement, on_delete=models.SET_NULL, null=True, blank=True
    )
    communaute_culte = models.ForeignKey(
        CommunauteCulte, on_delete=models.CASCADE, related_name="demandes_finance"
    )
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    motif = models.TextField()
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default="en_attente")
    date_demande = models.DateTimeField(auto_now_add=True)
    date_traitement = models.DateTimeField(null=True, blank=True)
    notes_traitement = models.TextField(blank=True)
    # Photos/documents en base64 — liste JSON
    pieces_jointes = models.TextField(blank=True, default="[]")

    class Meta:
        verbose_name = "Demande de finance"
        verbose_name_plural = "Demandes de finance"
        ordering = ["-date_demande"]

    def __str__(self):
        return f"{self.get_type_display()} — {self.montant}$ — {self.statut}"


class TransactionFinance(models.Model):
    TYPE_CHOICES = [
        ("cotisation", "Cotisation"),
        ("offrande", "Offrande"),
        ("dime", "Dîme"),
        ("don", "Don"),
        ("entree", "Autre entrée"),
        ("sortie", "Sortie d'argent"),
        ("depense", "Dépense"),
    ]

    communaute_culte = models.ForeignKey(
        CommunauteCulte, on_delete=models.CASCADE, related_name="transactions"
    )
    responsable = models.ForeignKey(
        Responsable, on_delete=models.SET_NULL, null=True, blank=True
    )
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    date = models.DateField()
    culte_date = models.DateField(null=True, blank=True)

    class Meta:
        verbose_name = "Transaction"
        verbose_name_plural = "Transactions"
        ordering = ["-date"]

    def __str__(self):
        return f"{self.get_type_display()} — {self.montant}$ — {self.date}"