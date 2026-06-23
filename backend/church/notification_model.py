from django.db import models
from django.contrib.auth.models import User


class Notification(models.Model):
    TYPE_CHOICES = [
        ("anniversaire", "Anniversaire"),
        ("absence",      "Absence"),
        ("finance",      "Finance"),
        ("message",      "Message"),
        ("info",         "Information"),
    ]

    destinataire = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notifications"
    )
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="info")
    titre = models.CharField(max_length=200)
    message = models.TextField()
    lue = models.BooleanField(default=False)
    date_creation = models.DateTimeField(auto_now_add=True)
    lien_id = models.IntegerField(null=True, blank=True)  # ID de l'objet lié

    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ["-date_creation"]

    def __str__(self):
        return f"{self.type} → {self.destinataire.username} : {self.titre}"