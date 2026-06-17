from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MembreViewSet, DepartementViewSet, VisiteurViewSet,
    PresenceViewSet, ResponsableViewSet,
    CommunauteCulteViewSet, me,
)

router = DefaultRouter()
router.register(r'membres',      MembreViewSet,          basename='membre')
router.register(r'departements', DepartementViewSet,     basename='departement')
router.register(r'visiteurs',    VisiteurViewSet,        basename='visiteur')
router.register(r'presences',    PresenceViewSet,        basename='presence')
router.register(r'responsables', ResponsableViewSet,     basename='responsable')
router.register(r'communautes',  CommunauteCulteViewSet, basename='communaute')

urlpatterns = [
    path('', include(router.urls)),
    path('me/', me, name='me'),
]