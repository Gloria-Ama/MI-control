from django.db import models
from django.contrib.auth.models import User
from church.models import CommunauteCulte


class MessageGroupe(models.Model):
    TYPE_CHOICES = [
        ("texte",   "Texte"),
        ("image",   "Image"),
        ("fichier", "Fichier"),
        ("sondage", "Sondage"),
    ]

    auteur = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="messages_groupe"
    )
    communaute_culte = models.ForeignKey(
        CommunauteCulte, on_delete=models.CASCADE,
        related_name="messages_groupe", null=True, blank=True
    )
    tous_les_cultes = models.BooleanField(default=False)
    contenu = models.TextField(blank=True)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default="texte")
    fichier = models.FileField(upload_to="chat_groupe/", null=True, blank=True)
    nom_fichier = models.CharField(max_length=255, blank=True)
    date_envoi = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["date_envoi"]

    def __str__(self):
        return f"{self.auteur.username}: {self.contenu[:50] or self.type}"


class SondageGroupe(models.Model):
    message = models.OneToOneField(
        MessageGroupe, on_delete=models.CASCADE, related_name="sondage"
    )
    question = models.CharField(max_length=300)
    date_fin = models.DateTimeField(null=True, blank=True)
    actif = models.BooleanField(default=True)

    def __str__(self):
        return self.question


class OptionSondage(models.Model):
    sondage = models.ForeignKey(
        SondageGroupe, on_delete=models.CASCADE, related_name="options"
    )
    texte = models.CharField(max_length=200)
    ordre = models.IntegerField(default=0)

    class Meta:
        ordering = ["ordre"]

    def __str__(self):
        return self.texte


class VoteSondage(models.Model):
    option = models.ForeignKey(
        OptionSondage, on_delete=models.CASCADE, related_name="votes"
    )
    votant = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="votes_sondage"
    )
    date_vote = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["votant", "option"],
                name="unique_vote_par_option"
            )
    ]

    def __str__(self):
        return f"{self.votant.username} → {self.option.texte}"