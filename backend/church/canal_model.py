from django.db import models
from django.contrib.auth.models import User
from church.models import CommunauteCulte


class Canal(models.Model):
    TYPE_CHOICES = [
        ("principal",  "Groupe principal"),
        ("restreint",  "Groupe restreint"),
        ("prive",      "Conversation privée"),
    ]

    nom = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="restreint")
    createur = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="canaux_crees"
    )
    communaute_culte = models.ForeignKey(
        CommunauteCulte, on_delete=models.CASCADE,
        null=True, blank=True, related_name="canaux"
    )
    date_creation = models.DateTimeField(auto_now_add=True)
    actif = models.BooleanField(default=True)

    class Meta:
        ordering = ["-date_creation"]

    def __str__(self):
        return self.nom or f"Canal {self.id} ({self.type})"

    def dernier_message(self):
        return self.messages.order_by("-date_envoi").first()

    def nb_non_lus(self, user):
        lus = LectureMessage.objects.filter(
            message__canal=self, user=user
        ).values_list("message_id", flat=True)
        return self.messages.exclude(id__in=lus).exclude(auteur=user).count()


class MembreCanal(models.Model):
    canal = models.ForeignKey(Canal, on_delete=models.CASCADE, related_name="membres")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="canaux")
    est_admin = models.BooleanField(default=False)
    date_ajout = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["canal", "user"]

    def __str__(self):
        return f"{self.user.username} → {self.canal}"


class MessageCanal(models.Model):
    TYPE_CHOICES = [
        ("texte",   "Texte"),
        ("image",   "Image"),
        ("fichier", "Fichier"),
        ("sondage", "Sondage"),
    ]

    canal = models.ForeignKey(Canal, on_delete=models.CASCADE, related_name="messages")
    auteur = models.ForeignKey(User, on_delete=models.CASCADE, related_name="messages_canal")
    contenu = models.TextField(blank=True)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default="texte")
    fichier = models.FileField(upload_to="chat/", null=True, blank=True)
    nom_fichier = models.CharField(max_length=255, blank=True)
    date_envoi = models.DateTimeField(auto_now_add=True)
    modifie = models.BooleanField(default=False)

    class Meta:
        ordering = ["date_envoi"]

    def __str__(self):
        return f"{self.auteur.username}: {self.contenu[:40] or self.type}"


class LectureMessage(models.Model):
    message = models.ForeignKey(MessageCanal, on_delete=models.CASCADE, related_name="lectures")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="lectures")
    date_lecture = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["message", "user"]


class SondageCanal(models.Model):
    message = models.OneToOneField(MessageCanal, on_delete=models.CASCADE, related_name="sondage")
    question = models.CharField(max_length=300)
    actif = models.BooleanField(default=True)

    def __str__(self):
        return self.question


class OptionSondageCanal(models.Model):
    sondage = models.ForeignKey(SondageCanal, on_delete=models.CASCADE, related_name="options")
    texte = models.CharField(max_length=200)
    ordre = models.IntegerField(default=0)

    class Meta:
        ordering = ["ordre"]


class VoteSondageCanal(models.Model):
    option = models.ForeignKey(OptionSondageCanal, on_delete=models.CASCADE, related_name="votes")
    votant = models.ForeignKey(User, on_delete=models.CASCADE, related_name="votes_canal")
    date_vote = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["votant", "option"]