from django.db import models
from django.contrib.auth.models import User


class NotePersonnelle(models.Model):
    COULEURS = [
        ("jaune",  "Jaune"),
        ("bleu",   "Bleu"),
        ("vert",   "Vert"),
        ("rose",   "Rose"),
        ("orange", "Orange"),
        ("violet", "Violet"),
        ("gris",   "Gris"),
    ]

    auteur            = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes_personnelles")
    titre             = models.CharField(max_length=200, blank=True, default="Sans titre")
    contenu           = models.TextField(blank=True)
    couleur           = models.CharField(max_length=20, choices=COULEURS, default="jaune")
    epinglee          = models.BooleanField(default=False)
    date_creation     = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-epinglee", "-date_modification"]

    def __str__(self):
        return f"{self.titre} ({self.auteur.username})"