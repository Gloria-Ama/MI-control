from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CommunauteCulteViewSet, MembreViewSet, DepartementViewSet,
    VisiteurViewSet, PresenceViewSet, ResponsableViewSet,
    MessageViewSet, EvenementViewSet, NotificationViewSet,
    SuiviPastoralViewSet, BudgetAnnuelViewSet, LigneBudgetViewSet,
)
from .views import me, changer_mot_de_passe, update_profil, stats_croissance

router = DefaultRouter()
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

urlpatterns = [
    path('', include(router.urls)),
    path('me/', me, name='me'),
    path('me/changer-mot-de-passe/', changer_mot_de_passe, name='changer_mdp'),
    path('me/update/', update_profil, name='update_profil'),
    path('stats/croissance/', stats_croissance, name='stats_croissance'),
]