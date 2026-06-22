from django.db import models
from django.contrib.auth.models import User
from church.models import Membre


class SuiviPastoral(models.Model):
    CATEGORIE_CHOICES = [
        ("sante",       "Santé"),
        ("famille",     "Famille"),
        ("spirituel",   "Spirituel"),
        ("financier",   "Financier"),
        ("integration", "Intégration"),
        ("conflit",     "Conflit"),
        ("autre",       "Autre"),
    ]

    STATUT_CHOICES = [
        ("ouvert",    "Ouvert"),
        ("en_cours",  "En cours"),
        ("resolu",    "Résolu"),
        ("archive",   "Archivé"),
    ]

    membre = models.ForeignKey(
        Membre, on_delete=models.CASCADE, related_name="suivis_pastoraux"
    )
    auteur = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="suivis_crees"
    )
    categorie = models.CharField(max_length=20, choices=CATEGORIE_CHOICES, default="autre")
    titre = models.CharField(max_length=200)
    notes = models.TextField()
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default="ouvert")
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    confidentiel = models.BooleanField(default=True)
    date_suivi_prochain = models.DateField(null=True, blank=True)

    class Meta:
        verbose_name = "Suivi pastoral"
        verbose_name_plural = "Suivis pastoraux"
        ordering = ["-date_modification"]

    def __str__(self):
        return f"{self.membre.nom} — {self.titre}"