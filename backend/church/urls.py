from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MembreViewSet, DepartementViewSet, VisiteurViewSet, PresenceViewSet
from .views import me



router = DefaultRouter()
router.register(r'membres', MembreViewSet)
router.register(r'departements', DepartementViewSet)
router.register(r'visiteurs', VisiteurViewSet)
router.register(r'presences', PresenceViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('me/', me, name='me'),
]