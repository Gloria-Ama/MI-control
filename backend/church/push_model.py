from django.db import models
from django.contrib.auth.models import User

class PushToken(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="push_token"
    )
    token = models.CharField(max_length=200)
    date_enregistrement = models.DateTimeField(auto_now=True)
    actif = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Push Token"

    def __str__(self):
        return f"{self.user.username} — {self.token[:30]}..."