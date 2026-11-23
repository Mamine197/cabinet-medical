from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, PermissionFeature, RolePermission, DoctorProfile, SecretaryProfile

@admin.register(User)
class MediCABUserAdmin(UserAdmin):
    ordering = ("email",)
    list_display = ("email", "first_name", "last_name", "role", "is_active", "is_staff")
    fieldsets = ((None, {"fields": ("email", "password")}), ("Profil", {"fields": ("first_name", "last_name", "phone", "role")}), ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}))
    add_fieldsets = ((None, {"classes": ("wide",), "fields": ("email", "first_name", "last_name", "role", "password1", "password2")}),)
    search_fields = ("email", "first_name", "last_name")
    filter_horizontal = ("groups", "user_permissions")
admin.site.register([PermissionFeature, RolePermission, DoctorProfile, SecretaryProfile])
