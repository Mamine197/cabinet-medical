from rest_framework import serializers
from .models import (
    Patient, DossierMedical, RendezVous, Consultation,
    Prescription, LignePrescription, Facture, Paiement, ModuleRecord
)


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
            "id", "nom", "email", "telephone", "dateNaissance",
            "age", "sexe", "adresse", "groupeSanguin", "derniereVisite", "statut"
        ]


class DossierMedicalSerializer(serializers.ModelSerializer):
    patientId = serializers.PrimaryKeyRelatedField(
        source="patient", queryset=Patient.objects.all()
    )

    class Meta:
        model = DossierMedical
        fields = ["id", "patientId", "antecedents", "allergies", "groupeSanguin"]


class RendezVousSerializer(serializers.ModelSerializer):
    patientId = serializers.PrimaryKeyRelatedField(
        source="patient", queryset=Patient.objects.all()
    )
    medecinId = serializers.CharField(
        source="medecin_id", required=False, allow_null=True, allow_blank=True
    )

    class Meta:
        model = RendezVous
        fields = ["id", "patientId", "date", "heure", "motif", "statut", "medecinId"]

    def validate(self, attrs):
        date = attrs.get("date") or (self.instance and self.instance.date)
        heure = attrs.get("heure") or (self.instance and self.instance.heure)
        statut = attrs.get("statut") or (self.instance and self.instance.statut)
        medecin_id = attrs.get("medecin_id") if "medecin_id" in attrs else (self.instance and self.instance.medecin_id)

        # Règle CDC EF-17 : vérification stricte anti-collision côté serveur
        if statut != "Annulé" and date and heure:
            conflict_qs = RendezVous.objects.filter(
                date=date,
                heure=heure,
            ).exclude(statut="Annulé")

            if medecin_id:
                conflict_qs = conflict_qs.filter(medecin_id=medecin_id)

            if self.instance:
                conflict_qs = conflict_qs.exclude(pk=self.instance.pk)

            if conflict_qs.exists():
                raise serializers.ValidationError({
                    "heure": "Ce créneau horaire est déjà réservé pour cette date."
                })

        return attrs


class ConsultationSerializer(serializers.ModelSerializer):
    patientId = serializers.PrimaryKeyRelatedField(
        source="patient", queryset=Patient.objects.all()
    )
    rendezVousId = serializers.PrimaryKeyRelatedField(
        source="rendezVous", queryset=RendezVous.objects.all(), required=False, allow_null=True
    )
    medecinId = serializers.CharField(
        source="medecin_id", required=False, allow_null=True, allow_blank=True
    )

    class Meta:
        model = Consultation
        fields = [
            "id", "rendezVousId", "patientId", "medecinId", "date", "motif",
            "pressionArterielle", "temperature", "poids", "taille",
            "diagnostic", "notes", "statut"
        ]

    def validate(self, attrs):
        # Règle CDC EF-14 : une consultation terminée ne peut pas être modifiée silencieusement
        if self.instance and self.instance.statut == "Terminée":
            nouveau_statut = attrs.get("statut", self.instance.statut)
            if nouveau_statut != "Terminée":
                raise serializers.ValidationError({
                    "statut": "Une consultation finalisée ne peut pas être rouverte sans procédure spéciale."
                })
        return attrs


class PrescriptionSerializer(serializers.ModelSerializer):
    consultationId = serializers.PrimaryKeyRelatedField(
        source="consultation", queryset=Consultation.objects.all()
    )

    class Meta:
        model = Prescription
        fields = ["id", "consultationId", "date", "statut"]


class LignePrescriptionSerializer(serializers.ModelSerializer):
    ordonnanceId = serializers.PrimaryKeyRelatedField(
        source="ordonnance", queryset=Prescription.objects.all()
    )

    class Meta:
        model = LignePrescription
        fields = ["id", "ordonnanceId", "medicamentId", "posologie", "duree", "quantite"]


class FactureSerializer(serializers.ModelSerializer):
    patientId = serializers.PrimaryKeyRelatedField(
        source="patient", queryset=Patient.objects.all()
    )

    class Meta:
        model = Facture
        fields = [
            "id", "patientId", "date", "designation", "montant",
            "remise", "montantPaye", "statut"
        ]


class PaiementSerializer(serializers.ModelSerializer):
    factureId = serializers.PrimaryKeyRelatedField(
        source="facture", queryset=Facture.objects.all()
    )

    class Meta:
        model = Paiement
        fields = ["id", "factureId", "date", "montant", "mode"]


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
