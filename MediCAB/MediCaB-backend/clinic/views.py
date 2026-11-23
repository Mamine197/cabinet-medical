from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import ModuleRecord
from .serializers import ModuleRecordSerializer

# Clés réellement présentes dans app.component.ts.
MODULES = {
    "patients", "dossiers-medicaux", "appointments", "consultations",
    "documents-medicaux", "prescriptions", "lignes-prescription",
    "brouillons-ia", "billing", "lignes-facture", "paiements",
    "fournisseurs", "bons-commande", "lignes-commande", "bons-reception",
    "factures-fournisseurs", "articles", "medicaments", "lots",
    "mouvements-stock", "inventaires", "organismes-assurance",
    "couvertures-medicales", "feuilles-soins", "dossiers-remboursement",
}

class ModuleRecordListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def dispatch(self, request, *args, **kwargs):
        if kwargs.get("module") not in MODULES:
            return Response({"detail": "Module MediCAB inconnu."}, status=404)
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, module):
        rows = ModuleRecord.objects.filter(module=module)
        result = []
        for row in rows:
            item = dict(row.data or {})
            item["id"] = str(row.id)
            result.append(item)
        return Response(result)

    def post(self, request, module):
        serializer = ModuleRecordSerializer(data={"data": request.data})
        serializer.is_valid(raise_exception=True)
        row = ModuleRecord.objects.create(
            module=module, data=serializer.validated_data["data"],
            created_by=request.user, updated_by=request.user
        )
        result = dict(row.data)
        result["id"] = str(row.id)
        return Response(result, status=status.HTTP_201_CREATED)


class ModuleRecordDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def dispatch(self, request, *args, **kwargs):
        if kwargs.get("module") not in MODULES:
            return Response({"detail": "Module MediCAB inconnu."}, status=404)
        return super().dispatch(request, *args, **kwargs)

    def get_object(self, module, record_id):
        return get_object_or_404(ModuleRecord, module=module, pk=record_id)

    def get(self, request, module, record_id):
        row = self.get_object(module, record_id)
        result = dict(row.data or {})
        result["id"] = str(row.id)
        return Response(result)

    def put(self, request, module, record_id):
        return self._update(request, module, record_id)

    def patch(self, request, module, record_id):
        return self._update(request, module, record_id)

    def _update(self, request, module, record_id):
        row = self.get_object(module, record_id)
        serializer = ModuleRecordSerializer(data={"data": request.data})
        serializer.is_valid(raise_exception=True)
        row.data = serializer.validated_data["data"]
        row.updated_by = request.user
        row.save(update_fields=["data", "updated_by", "updated_at"])
        result = dict(row.data)
        result["id"] = str(row.id)
        return Response(result)

    def delete(self, request, module, record_id):
        row = self.get_object(module, record_id)
        row.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
