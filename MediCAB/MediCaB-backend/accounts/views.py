
from rest_framework import generics, permissions, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User, PermissionFeature, RolePermission, AuditLog

from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    PermissionFeatureSerializer,
    RolePermissionSerializer,
    AuditLogSerializer
)


# Enregistrer une action dans le journal
def record_audit(user, action, module, description):
    AuditLog.objects.create(
        user=user,
        user_email=user.email,
        user_role=user.role,
        action=action,
        module=module,
        description=description
    )


# Inscription
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "token": token.key,
                "user": UserSerializer(user).data
            },
            status=status.HTTP_201_CREATED
        )


# Connexion
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        token, _ = Token.objects.get_or_create(user=user)

        record_audit(
            user,
            "LOGIN",
            "Authentification",
            "Connexion réussie à MediCAB."
        )

        return Response({
            "token": token.key,
            "user": UserSerializer(user).data
        })


# Déconnexion
class LogoutView(APIView):
    def post(self, request):
        record_audit(
            request.user,
            "LOGOUT",
            "Authentification",
            "Déconnexion de MediCAB."
        )

        request.auth.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


# Utilisateur connecté
class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)


# Permission administrateur
class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.is_staff
                or request.user.role == User.Role.ADMIN
            )
        )


# Gestion des utilisateurs
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("last_name", "first_name")
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        qs = super().get_queryset()
        role = self.request.query_params.get("role")

        if role:
            qs = qs.filter(role=role)

        return qs

    def create(self, request, *args, **kwargs):
        serializer = RegisterSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED
        )

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data.copy()
        password = data.pop("password", None)

        serializer = self.get_serializer(
            instance,
            data=data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        if password:
            if len(password) < 8:
                return Response(
                    {"password": ["8 caractères minimum."]},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.set_password(password)
            user.save(update_fields=["password"])

        return Response(self.get_serializer(user).data)


# Gestion des permissions
class PermissionViewSet(viewsets.ModelViewSet):
    queryset = PermissionFeature.objects.all().order_by("code")
    serializer_class = PermissionFeatureSerializer
    permission_classes = [IsAdmin]


# Gestion des associations rôle-permission
class RolePermissionViewSet(viewsets.ModelViewSet):
    queryset = RolePermission.objects.select_related("permission").all()
    serializer_class = RolePermissionSerializer
    permission_classes = [IsAdmin]


# Liste des rôles
class RolesView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        return Response([
            {"value": value, "label": label}
            for value, label in User.Role.choices
        ])


# Journal d'activité
class AuditLogViewSet(viewsets.ModelViewSet):
    queryset = AuditLog.objects.select_related("user").all()
    serializer_class = AuditLogSerializer
    http_method_names = ["get", "post", "head", "options"]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAdmin()]

        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        user = self.request.user

        serializer.save(
            user=user,
            user_email=user.email,
            user_role=user.role
        )
