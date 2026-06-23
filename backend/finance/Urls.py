from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter
from finance.views import DemandeFinanceViewSet, TransactionFinanceViewSet

router = DefaultRouter()
router.register(r'finances', DemandeFinanceViewSet, basename='finance')
router.register(r'transactions', TransactionFinanceViewSet, basename='transaction')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('church.urls')),
    path('api/', include(router.urls)),
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]