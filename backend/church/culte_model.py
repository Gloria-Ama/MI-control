from django.db import models
from django.contrib.auth.models import User
from .models import CommunauteCulte


class ProgrammeCulte(models.Model):
    communaute_culte = models.ForeignKey(CommunauteCulte, on_delete=models.CASCADE, related_name="programmes")
    date             = models.DateField()
    theme            = models.CharField(max_length=200, blank=True)
    predicateur      = models.CharField(max_length=100, blank=True)
    verset_cle       = models.CharField(max_length=200, blank=True)
    notes_generales  = models.TextField(blank=True)
    cree_par         = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    date_creation    = models.DateTimeField(auto_now_add=True)
    date_modification= models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"Programme {self.communaute_culte.nom} — {self.date}"


class ElementProgramme(models.Model):
    TYPES = [
        ("accueil",    "Accueil"),
        ("activite",  "Activité"),
        ("adoration",  "Adoration"),
        ("priere",     "Prière"),
        ("chant",      "Chant"),
        ("lecture",    "Lecture biblique"),
        ("predication","Prédication"),
        ("offrande",   "Offrande"),
        ("annonce",    "Annonces"),
        ("communion",  "Sainte Cène"),
        ("temoignage", "Témoignage"),
        ("autre",      "Autre"),
    ]

    programme       = models.ForeignKey(ProgrammeCulte, on_delete=models.CASCADE, related_name="elements")
    type            = models.CharField(max_length=30, choices=TYPES, default="autre")
    titre           = models.CharField(max_length=200, blank=True)
    responsable     = models.CharField(max_length=100, blank=True)
    duree_minutes   = models.IntegerField(default=5)
    ordre           = models.IntegerField(default=0)
    notes           = models.CharField(max_length=500, blank=True)
    complete        = models.BooleanField(default=False)

    class Meta:
        ordering = ["ordre"]

    def __str__(self):
        return f"{self.get_type_display()} — {self.programme}"