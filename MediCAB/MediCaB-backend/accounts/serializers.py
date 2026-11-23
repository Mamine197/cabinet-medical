from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import (
    User,
    PermissionFeature,
    RolePermission,
    DoctorProfile,
    SecretaryProfile,
    AuditLog
)

class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "name", "phone", "role", "is_active", "date_joined")
        read_only_fields = ("id", "date_joined")
    def get_name(self, obj): return f"{obj.first_name} {obj.last_name}".strip()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "phone", "role", "password")
        read_only_fields = ("id",)
    def validate_role(self, value):
        request = self.context.get("request")
        if value == User.Role.ADMIN:
            raise serializers.ValidationError("Le rôle Administrateur est attribué uniquement par un administrateur.")
        if request and request.user.is_authenticated and not request.user.is_staff and value != request.user.role:
            raise serializers.ValidationError("Vous ne pouvez pas attribuer ce rôle.")
        return value
    def create(self, validated_data):
        password = validated_data.pop("password")
        return User.objects.create_user(password=password, **validated_data)

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    def validate(self, attrs):
        user = authenticate(username=attrs["email"].lower(), password=attrs["password"])
        if not user or not user.is_active:
            raise serializers.ValidationError("Adresse e-mail ou mot de passe incorrect.")
        attrs["user"] = user
        return attrs

class PermissionFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = PermissionFeature
        fields = ("id", "code", "description")

class RolePermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RolePermission
        fields = ("id", "role", "permission")
class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = (
            "id",
            "user",
            "user_email",
            "user_role",
            "action",
            "module",
            "description",
            "created_at",
        )
        read_only_fields = (
            "id",
            "user",
            "user_email",
            "user_role",
            "created_at",
        )