import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

AI_DIR = Path(__file__).resolve().parent.parent.parent / "MediCaB-ai"
if str(AI_DIR) not in sys.path:
    sys.path.insert(0, str(AI_DIR))

from main import app

@pytest.fixture
def client():
    return TestClient(app)

def test_ai_app_info_and_docs(client):
    """Vérifie que l'application FastAPI est correctement initialisée."""
    assert app.title == "MediCAB AI Microservice"
    response = client.get("/docs")
    assert response.status_code == 200

def test_soap_consultation_draft_rhino(client):
    """Vérifie la génération SOAP pour un cas d'infection virale respiratoire."""
    payload = {
        "patient_name": "Salma Benali",
        "age": 28,
        "motif": "Fièvre et toux",
        "notes_brutes": "Patiente se plaint de fièvre, toux sèche et gorge irritée depuis 2 jours.",
        "tension": "12/8",
        "temperature": 38.4
    }
    res = client.post("/api/ai/draft-consultation", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "format_soap" in data
    assert "Subjectif" in data["format_soap"]
    assert "Objectif" in data["format_soap"]
    assert "Analyse" in data["format_soap"]
    assert "Plan" in data["format_soap"]
    assert "Rhinopharyngite" in data["diagnostic_suggere"]
    assert len(data["ordonnance_suggeree"]) >= 1

def test_patient_triage_respiratory_warning(client):
    """Vérifie le triage conversationnel et l'avertissement de conformité CNDP."""
    payload = {
        "patient_id": "PAT-001",
        "message": "J'ai un gros rhume avec de la toux et mal à la tête"
    }
    res = client.post("/api/ai/patient-triage", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["gravite"] in ["Faible", "Modéré"]
    assert data["specialite_recommandee"] == "Médecine Générale"
    assert "CNDP" in data["avertissement_legal"]
    assert len(data["creneaux_suggeres"]) >= 1

def test_cnss_calculator_generaliste(client):
    """Vérifie le calcul légal marocain AMO : 70% prise en charge sur base TNR 150 DH."""
    payload = {
        "type_prestation": "Consultation Généraliste",
        "montant_facture": 250.0,
        "est_ald": False
    }
    res = client.post("/api/ai/cnss-calculator", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["tarif_national_reference_tnr"] == 150.0
    assert data["taux_remboursement_cnss_pct"] == 70.0
    assert data["montant_rembourse_cnss"] == 105.0  # 70% de 150
    assert data["ticket_moderateur_patient"] == 45.0  # 30% de 150
    assert data["part_depassement_honoraires"] == 100.0  # 250 - 150
    assert data["total_a_payer_patient"] == 145.0  # 45 + 100

def test_cnss_calculator_ald_100_percent(client):
    """Vérifie que pour une ALD (Affection Longue Durée), le ticket modérateur est 0 DH."""
    payload = {
        "type_prestation": "Consultation Spécialiste",
        "montant_facture": 250.0,
        "est_ald": True
    }
    res = client.post("/api/ai/cnss-calculator", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["tarif_national_reference_tnr"] == 250.0
    assert data["taux_remboursement_cnss_pct"] == 100.0
    assert data["montant_rembourse_cnss"] == 250.0  # 100% du TNR
    assert data["ticket_moderateur_patient"] == 0.0

def test_predict_noshow_algorithm(client):
    """Vérifie l'évaluation du risque d'absence (No-Show)."""
    payload = {
        "patient_id": "PAT-002",
        "age": 35,
        "delai_prise_rdv_jours": 10,
        "historique_absences": 2,
        "rappel_sms_envoye": False
    }
    res = client.post("/api/ai/predict-noshow", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "probabilite_absence_pct" in data
    assert data["niveau_risque"] in ["Élevé", "Moyen"]
    assert "recommandation_secretaire" in data
