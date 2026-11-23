import os
import sys
from pathlib import Path
import pytest

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent / "MediCaB-backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from accounts.models import AuditLog
from clinic.models import Patient, RendezVous
from clinic.serializers import RendezVousSerializer, PatientSerializer

User = get_user_model()

@pytest.mark.django_db
def test_user_creation_roles():
    """Vérifie la création et les contraintes des rôles utilisateurs (Email-based)."""
    admin = User.objects.create_user(
        email="admin_unit@medicab.ma",
        password="password123",
        first_name="Admin",
        last_name="Test",
        role=User.Role.ADMIN
    )
    assert admin.pk is not None
    assert admin.role == User.Role.ADMIN

    doctor = User.objects.create_user(
        email="doctor_unit@medicab.ma",
        password="password123",
        first_name="Dr.",
        last_name="Karim",
        role=User.Role.DOCTOR
    )
    assert doctor.role == User.Role.DOCTOR

    sec = User.objects.create_user(
        email="sec_unit@medicab.ma",
        password="password123",
        first_name="Fatima",
        last_name="Sec",
        role=User.Role.SECRETARY
    )
    assert sec.role == User.Role.SECRETARY

@pytest.mark.django_db
def test_audit_log_creation():
    """Vérifie l'enregistrement d'une trace d'audit immuable."""
    log = AuditLog.objects.create(
        user=None,
        user_email="audit_test@medicab.ma",
        user_role="Secrétaire",
        action="LOGIN",
        module="Authentification",
        description="Connexion réussie depuis le test unitaire"
    )
    assert log.pk is not None
    assert log.created_at is not None
    assert log.action == "LOGIN"
    assert log.module == "Authentification"

@pytest.mark.django_db
def test_appointment_anti_collision_rule_ef17():
    """Vérifie la règle CDC EF-17 : interdiction de deux RDV sur le même créneau pour le même médecin."""
    patient = Patient.objects.create(
        nom="Karim Bennani",
        telephone="0611223344",
        email="karim@test.ma",
        statut="Actif"
    )
    doctor = User.objects.create_user(
        email="med_collision@medicab.ma",
        password="pass",
        first_name="Doc",
        last_name="Collision",
        role=User.Role.DOCTOR
    )

    # Création du 1er RDV
    rdv1 = RendezVous.objects.create(
        patient=patient,
        date="2026-12-01",
        heure="10:00",
        motif="Contrôle annuel",
        statut="Confirmé",
        medecin=doctor
    )
    assert rdv1.pk is not None

    # Tentative de création d'un 2ème RDV sur le même créneau horaire avec le même médecin
    serializer = RendezVousSerializer(data={
        "patientId": str(patient.pk),
        "date": "2026-12-01",
        "heure": "10:00",
        "motif": "Deuxième patient urgent",
        "statut": "Confirmé",
        "medecinId": doctor.pk
    })

    with pytest.raises(ValidationError):
        serializer.is_valid(raise_exception=True)

    assert "heure" in serializer.errors
    assert "Ce créneau horaire est déjà réservé" in str(serializer.errors["heure"][0])

@pytest.mark.django_db
def test_patient_serializer_validation():
    """Vérifie la sérialisation et validation d'une fiche patient."""
    serializer = PatientSerializer(data={
        "nom": "Mehdi El Fassi",
        "telephone": "0600112233",
        "email": "mehdi.elfassi@test.ma",
        "statut": "Actif"
    })
    assert serializer.is_valid(), serializer.errors
    patient = serializer.save()
    assert patient.pk is not None
    assert patient.nom == "Mehdi El Fassi"
