from rest_framework import serializers
from .models import ModuleRecord

class ModuleRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModuleRecord
        fields = ("id", "module", "data", "created_at", "updated_at")
        read_only_fields = ("id", "module", "created_at", "updated_at")

    def validate_data(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Les données doivent être un objet JSON.")
        if "id" in value:
            value = dict(value)
            value.pop("id", None)
        return value
