from django.db import models
from django.contrib.auth.models import User

class CommunauteCulte(models.Model):
    nom = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = "Communauté de culte"
        verbose_name_plural = "Communautés de culte"

    def __str__(self):
        return self.nom


class Departement(models.Model):
    communaute_culte = models.ForeignKey(
        CommunauteCulte,
        on_delete=models.CASCADE,
        related_name="departements"
    )
    nom = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = "Département"
        verbose_name_plural = "Départements"

    def __str__(self):
        return f"{self.nom} - {self.communaute_culte.nom}"


class Visiteur(models.Model):
    SEXE_CHOICES = [
        ("feminin", "Féminin"),
        ("masculin", "Masculin"),
        ("autre", "Autre"),
    ]
    communaute_culte = models.ForeignKey(
        CommunauteCulte,
        on_delete=models.CASCADE,
        related_name="visiteurs"
    )
    nom = models.CharField(max_length=150)
    telephone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    sexe = models.CharField(max_length=20, choices=SEXE_CHOICES, blank=True)
    date_premiere_visite = models.DateField(auto_now_add=True)
    nombre_visites = models.IntegerField(default=1)
    notes = models.TextField(blank=True)
    class Meta:
        verbose_name = "Visiteur"
        verbose_name_plural = "Visiteurs"
    def __str__(self):
        return self.nom


class Membre(models.Model):
    STATUT_CHOICES = [
        ("actif", "Actif"),
        ("inactif", "Inactif"),
        ("en_pause", "En pause"),
    ]
    SEXE_CHOICES = [
        ("feminin", "Féminin"),
        ("masculin", "Masculin"),
        ("autre", "Autre"),
    ]
    communaute_culte = models.ForeignKey(
        CommunauteCulte,
        on_delete=models.CASCADE,
        related_name="membres"
    )
    nom = models.CharField(max_length=150)
    telephone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    sexe = models.CharField(max_length=20, choices=SEXE_CHOICES, blank=True)
    date_anniversaire = models.CharField(max_length=5, blank=True,null=True)
    adresse = models.TextField(blank=True)
    departement = models.ForeignKey(
        Departement,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="membres"
    )
    date_integration = models.DateField(auto_now_add=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default="actif")
    notes = models.TextField(blank=True)
    class Meta:
        verbose_name = "Membre"
        verbose_name_plural = "Membres"
    def __str__(self):
        return self.nom
    

class Presence(models.Model):
    communaute_culte = models.ForeignKey(
        CommunauteCulte,
        on_delete=models.CASCADE,
        related_name="presences"
    )

    membre = models.ForeignKey(
        Membre,
        on_delete=models.CASCADE,
        related_name="presences"
    )

    date = models.DateField()
    present = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Présence"
        verbose_name_plural = "Présences"
        unique_together = ("membre", "date", "communaute_culte")

    def __str__(self):
        statut = "Présent" if self.present else "Absent"
        return f"{self.membre.nom} - {self.date} - {statut}"
    

class Responsable(models.Model):
    ROLE_CHOICES = [
        ("pasteur", "Pasteur"),
        ("tresoriere", "Trésorière"),
        ("secretaire", "Secrétaire"),
        ("responsable", "Responsable de département"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)

    role = models.CharField(
        max_length=50,
        choices=ROLE_CHOICES
    )

    communaute_culte = models.ForeignKey(
        CommunauteCulte,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    departement = models.ForeignKey(
        Departement,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    mot_de_passe_change = models.BooleanField(default=False)
    actif = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.email} - {self.role}"

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)

    communaute_culte = models.ForeignKey(
        CommunauteCulte,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    departement = models.ForeignKey(
        Departement,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    mot_de_passe_change = models.BooleanField(default=False)
    actif = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.email} - {self.role}"