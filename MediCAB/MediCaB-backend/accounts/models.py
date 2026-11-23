from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class UserManager(BaseUserManager):
    use_in_migrations = True
    def _create_user(self, email, password, **extra_fields):
        if not email: raise ValueError("Une adresse e-mail est obligatoire.")
        email = self.normalize_email(email).lower()
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.ADMIN)
        return self._create_user(email, password, **extra_fields)

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "Administrateur", "Administrateur"
        DOCTOR = "Médecin", "Médecin"
        SECRETARY = "Secrétaire", "Secrétaire"
    username = None
    email = models.EmailField(unique=True)
    first_name = models.CharField("prénom", max_length=150)
    last_name = models.CharField("nom", max_length=150)
    phone = models.CharField("téléphone", max_length=30, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.SECRETARY)
    is_active = models.BooleanField(default=True)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]
    objects = UserManager()
    def __str__(self): return self.email

class PermissionFeature(models.Model):
    code = models.SlugField(max_length=80, unique=True)
    description = models.CharField(max_length=255, blank=True)
    def __str__(self): return self.code

class RolePermission(models.Model):
    role = models.CharField(max_length=20, choices=User.Role.choices)
    permission = models.ForeignKey(PermissionFeature, on_delete=models.CASCADE, related_name="role_links")
    class Meta:
        unique_together = ("role", "permission")

class DoctorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="doctor_profile")
    specialty = models.CharField(max_length=120)
    registration_number = models.CharField(max_length=80, blank=True)

class SecretaryProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="secretary_profile")
    phone = models.CharField(max_length=30, blank=True)
class AuditLog(models.Model):
    ACTION_CHOICES = [
        ("LOGIN", "Connexion"),
        ("LOGOUT", "Déconnexion"),
        ("CREATE", "Ajout"),
        ("UPDATE", "Modification"),
        ("DELETE", "Suppression"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs"
    )

    user_email = models.EmailField(blank=True)
    user_role = models.CharField(max_length=20, blank=True)

    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    module = models.CharField(max_length=100)
    description = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Journal d'activité"
        verbose_name_plural = "Journal d'activité"

    def __str__(self):
        return f"{self.user_email} - {self.action} - {self.module}"