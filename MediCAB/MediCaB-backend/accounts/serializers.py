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
    specialty = serializers.CharField(source="doctor_profile.specialty", required=False, allow_blank=True)
    registration_number = serializers.CharField(source="doctor_profile.registration_number", required=False, allow_blank=True)

    class Meta:
        model = User
        fields = (
            "id", "email", "first_name", "last_name", "name", "phone",
            "role", "is_active", "date_joined", "specialty", "registration_number"
        )
        read_only_fields = ("id", "date_joined")

    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

    def update(self, instance, validated_data):
        doctor_profile_data = validated_data.pop("doctor_profile", None)
        user = super().update(instance, validated_data)

        if user.role == User.Role.DOCTOR and doctor_profile_data is not None:
            DoctorProfile.objects.update_or_create(
                user=user,
                defaults={
                    "specialty": doctor_profile_data.get("specialty", "Médecine générale"),
                    "registration_number": doctor_profile_data.get("registration_number", "")
                }
            )
        elif user.role == User.Role.SECRETARY:
            SecretaryProfile.objects.update_or_create(
                user=user,
                defaults={"phone": user.phone}
            )

        return user


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    specialty = serializers.CharField(required=False, allow_blank=True, default="")
    registration_number = serializers.CharField(required=False, allow_blank=True, default="")

    class Meta:
        model = User
        fields = (
            "id", "email", "first_name", "last_name", "phone", "role",
            "password", "specialty", "registration_number"
        )
        read_only_fields = ("id",)

    PUBLIC_REGISTER_ROLES = {User.Role.DOCTOR, User.Role.SECRETARY}

    def validate_role(self, value):
        request = self.context.get("request")
        if value == User.Role.ADMIN:
            # Seul un admin connecté peut créer un admin
            if not request or not request.user or not request.user.is_staff:
                raise serializers.ValidationError(
                    "Le rôle Administrateur est attribué uniquement par un administrateur."
                )
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        specialty = validated_data.pop("specialty", "Médecine générale")
        registration_number = validated_data.pop("registration_number", "")

        user = User.objects.create_user(password=password, **validated_data)

        if user.role == User.Role.DOCTOR:
            DoctorProfile.objects.create(
                user=user,
                specialty=specialty or "Médecine générale",
                registration_number=registration_number
            )
        elif user.role == User.Role.SECRETARY:
            SecretaryProfile.objects.create(
                user=user,
                phone=user.phone
            )

        return user


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
            "id", "user", "user_email", "user_role", "action",
            "module", "description", "created_at"
        )
        read_only_fields = ("id", "user", "user_email", "user_role", "created_at")
