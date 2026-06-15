from django.contrib import admin
from .models import CommunauteCulte, Departement, Visiteur, Membre
from .models import Responsable

admin.site.register(CommunauteCulte)
admin.site.register(Departement)
admin.site.register(Visiteur)
admin.site.register(Membre)
admin.site.register(Responsable)