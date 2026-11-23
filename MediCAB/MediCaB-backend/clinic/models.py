import uuid
from django.conf import settings
from django.db import models

class ModuleRecord(models.Model):
    """Enregistrement métier d'un module MediCAB.

    Le payload conserve les champs propres à chaque écran Angular.
    Les enregistrements sont isolés par module et identifiés par un UUID.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    module = models.SlugField(max_length=80, db_index=True)
    data = models.JSONField(default=dict)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="clinic_records_created"
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="clinic_records_updated"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["module", "-created_at"])]

    def __str__(self):
        return f"{self.module}:{self.id}"
