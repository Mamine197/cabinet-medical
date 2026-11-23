from django.contrib import admin
from .models import ModuleRecord

@admin.register(ModuleRecord)
class ModuleRecordAdmin(admin.ModelAdmin):
    list_display = ("id", "module", "created_by", "created_at", "updated_at")
    list_filter = ("module", "created_at")
    search_fields = ("id", "module")
