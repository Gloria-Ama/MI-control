from django.db import models
from django.contrib.auth.models import User


class Message(models.Model):
    expediteur = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="messages_envoyes"
    )
    destinataire = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="messages_recus"
    )
    contenu = models.TextField()
    date_envoi = models.DateTimeField(auto_now_add=True)
    lu = models.BooleanField(default=False)
    date_lecture = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Message"
        verbose_name_plural = "Messages"
        ordering = ["date_envoi"]

    def __str__(self):
        return f"{self.expediteur.username} → {self.destinataire.username} : {self.contenu[:30]}"