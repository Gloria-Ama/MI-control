from django.db import models
from church.models import CommunauteCulte


class Evenement(models.Model):
    TYPE_CHOICES = [
        ("culte",        "Culte"),
        ("reunion",      "Réunion"),
        ("formation",    "Formation"),
        ("evangelisation", "Évangélisation"),
        ("social",       "Activité sociale"),
        ("anniversaire", "Anniversaire"),
        ("autre",        "Autre"),
    ]

    communaute_culte = models.ForeignKey(
        CommunauteCulte, on_delete=models.CASCADE,
        related_name="evenements", null=True, blank=True
    )
    titre = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="autre")
    date_debut = models.DateField()
    heure_debut = models.TimeField(null=True, blank=True)
    date_fin = models.DateField(null=True, blank=True)
    heure_fin = models.TimeField(null=True, blank=True)
    lieu = models.CharField(max_length=200, blank=True)
    tous_les_cultes = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Événement"
        verbose_name_plural = "Événements"
        ordering = ["date_debut"]

    def __str__(self):
        return f"{self.titre} — {self.date_debut}"