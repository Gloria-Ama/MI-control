from django.db import models
from church.models import CommunauteCulte, Departement
from django.contrib.auth.models import User


class BudgetAnnuel(models.Model):
    communaute_culte = models.ForeignKey(
        CommunauteCulte, on_delete=models.CASCADE, related_name="budgets"
    )
    annee = models.IntegerField()
    montant_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    cree_par = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    class Meta:
        verbose_name = "Budget annuel"
        verbose_name_plural = "Budgets annuels"
        unique_together = ["communaute_culte", "annee"]
        ordering = ["-annee"]

    def __str__(self):
        return f"Budget {self.annee} — {self.communaute_culte}"


class LigneBudget(models.Model):
    CATEGORIE_CHOICES = [
        ("departement", "Département"),
        ("operations",  "Opérations"),
        ("evenements",  "Événements"),
        ("missions",    "Missions"),
        ("entretien",   "Entretien"),
        ("autre",       "Autre"),
    ]

    budget = models.ForeignKey(
        BudgetAnnuel, on_delete=models.CASCADE, related_name="lignes"
    )
    departement = models.ForeignKey(
        Departement, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="lignes_budget"
    )
    categorie = models.CharField(max_length=20, choices=CATEGORIE_CHOICES, default="autre")
    description = models.CharField(max_length=200)
    montant_prevu = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    montant_realise = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = "Ligne de budget"
        verbose_name_plural = "Lignes de budget"
        ordering = ["categorie", "description"]

    def __str__(self):
        return f"{self.description} — {self.montant_prevu}$"

    @property
    def ecart(self):
        return float(self.montant_realise) - float(self.montant_prevu)

    @property
    def taux_execution(self):
        if self.montant_prevu > 0:
            return round((float(self.montant_realise) / float(self.montant_prevu)) * 100)
        return 0