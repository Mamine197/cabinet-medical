
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    MeView,
    UserViewSet,
    PermissionViewSet,
    RolePermissionViewSet,
    RolesView,
    AuditLogViewSet
)

router = DefaultRouter()

router.register("users", UserViewSet, basename="users")
router.register("permissions", PermissionViewSet, basename="permissions")
router.register("role-permissions", RolePermissionViewSet, basename="role-permissions")
router.register("audit-logs", AuditLogViewSet, basename="audit-logs")

urlpatterns = [
    path("auth/register/", RegisterView.as_view()),
    path("auth/login/", LoginView.as_view()),
    path("auth/logout/", LogoutView.as_view()),
    path("auth/me/", MeView.as_view()),
    path("roles/", RolesView.as_view()),
    path("", include(router.urls)),
]
