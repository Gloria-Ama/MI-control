from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CommunauteCulteViewSet, MembreViewSet, DepartementViewSet,
    VisiteurViewSet, PresenceViewSet, ResponsableViewSet,
    MessageViewSet, EvenementViewSet, NotificationViewSet,
    SuiviPastoralViewSet, BudgetAnnuelViewSet, LigneBudgetViewSet,
)
from .views import NotePersonnelleViewSet,ProgrammeCulteViewSet,ElementProgrammeViewSet
from .views import me, changer_mot_de_passe, update_profil, stats_croissance
from .views import pointer_par_qr
from .views import enregistrer_push_token, envoyer_push
from .views import MessageGroupeViewSet
from church.views import inscription_membre
from .views import CanalViewSet, MessageCanalViewSet


router = DefaultRouter()
router.register(r'notes', NotePersonnelleViewSet, basename='note')
router.register(r'programmes-culte', ProgrammeCulteViewSet, basename='programme-culte')
router.register(r'elements-programme', ElementProgrammeViewSet, basename='element-programme')
router.register(r'canaux', CanalViewSet, basename='canal')
router.register(r'messages-canal', MessageCanalViewSet, basename='message-canal')
router.register(r'communautes', CommunauteCulteViewSet, basename='communaute')
router.register(r'membres', MembreViewSet, basename='membre')
router.register(r'departements', DepartementViewSet, basename='departement')
router.register(r'visiteurs', VisiteurViewSet, basename='visiteur')
router.register(r'presences', PresenceViewSet, basename='presence')
router.register(r'responsables', ResponsableViewSet, basename='responsable')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'evenements', EvenementViewSet, basename='evenement')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'suivis-pastoraux', SuiviPastoralViewSet, basename='suivi-pastoral')
router.register(r'budgets', BudgetAnnuelViewSet, basename='budget')
router.register(r'lignes-budget', LigneBudgetViewSet, basename='ligne-budget')
router.register(r'messages-groupe', MessageGroupeViewSet, basename='message-groupe')


urlpatterns = [
    path('', include(router.urls)),
    path('me/', me, name='me'),
    path('me/changer-mot-de-passe/', changer_mot_de_passe, name='changer_mdp'),
    path('me/update/', update_profil, name='update_profil'),
    path('stats/croissance/', stats_croissance, name='stats_croissance'),
    path('presences/qr/', pointer_par_qr, name='pointer_qr'),
    path('push/token/', enregistrer_push_token, name='push_token'),
    path('push/envoyer/', envoyer_push, name='push_envoyer'),
    path('inscription/<int:communaute_id>/', inscription_membre, name='inscription_membre'),
]


