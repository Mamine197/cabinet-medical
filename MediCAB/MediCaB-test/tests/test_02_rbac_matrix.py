import pytest
import requests
from playwright.sync_api import Page, expect
from pages.dashboard_page import DashboardPage

@pytest.mark.rbac
def test_admin_has_full_access(admin_page: DashboardPage):
    """L'Administrateur doit voir les 15 applications dont Utilisateurs et Journal d'audit."""
    expect(admin_page.role_indicator).to_contain_text("Administrateur")
    expect(admin_page.role_indicator).to_contain_text("15 applications disponibles")
    
    assert admin_page.is_app_card_visible("Utilisateurs"), "L'admin doit voir le module Utilisateurs"
    assert admin_page.is_app_card_visible("Journal"), "L'admin doit voir le Journal d'audit"

@pytest.mark.rbac
def test_doctor_has_clinical_access_and_no_admin(doctor_page: DashboardPage):
    """Le Médecin doit voir 11 applications : accès clinique mais masquage de l'administration."""
    expect(doctor_page.role_indicator).to_contain_text("Médecin")
    expect(doctor_page.role_indicator).to_contain_text("11 applications disponibles")
    
    assert doctor_page.is_app_card_visible("Consultations"), "Le médecin doit voir ses Consultations"
    assert doctor_page.is_app_card_visible("Ordonnances"), "Le médecin doit voir les Ordonnances"
    assert not doctor_page.is_app_card_visible("Utilisateurs"), "Le médecin NE doit PAS voir Utilisateurs"
    assert not doctor_page.is_app_card_visible("Journal"), "Le médecin NE doit PAS voir le Journal d'audit"

@pytest.mark.rbac
def test_secretary_has_reception_access_and_no_medical_records(secretary_page: DashboardPage):
    """La Secrétaire doit voir 12 applications : gestion administrative mais SECRET MÉDICAL préservé."""
    expect(secretary_page.role_indicator).to_contain_text("Secrétaire")
    expect(secretary_page.role_indicator).to_contain_text("12 applications disponibles")
    
    assert secretary_page.is_app_card_visible("Rendez-vous"), "La secrétaire doit gérer les RDV"
    assert secretary_page.is_app_card_visible("Facturation"), "La secrétaire doit voir la Facturation"
    assert not secretary_page.is_app_card_visible("Consultations"), "SECRET MÉDICAL : Consultations doit être masqué"
    assert not secretary_page.is_app_card_visible("Dossiers"), "SECRET MÉDICAL : Dossiers médicaux doit être masqué"
    assert not secretary_page.is_app_card_visible("Utilisateurs"), "La secrétaire NE doit PAS gérer les utilisateurs"

@pytest.mark.rbac
def test_backend_api_blocks_secretary_from_clinical_endpoints(secretary_creds):
    """Preuve de sécurité API : le token Secrétaire reçoit HTTP 403 Forbidden sur les dossiers médicaux."""
    # 1. Obtenir le token secrétaire via l'API
    login_res = requests.post(
        "http://127.0.0.1:8000/api/auth/login/",
        json={"email": secretary_creds["email"], "password": secretary_creds["password"]},
        timeout=5
    )
    assert login_res.status_code == 200, f"Erreur de login API : {login_res.text}"
    token = login_res.json().get("token")
    assert token, "Token JWT/DRF manquant dans la réponse"
    
    headers = {"Authorization": f"Token {token}"}
    
    # 2. Tenter d'accéder aux dossiers médicaux confidentiels
    dossiers_res = requests.get("http://127.0.0.1:8000/api/data/dossiers-medicaux/", headers=headers, timeout=5)
    assert dossiers_res.status_code == 403, f"ATTENTION SÉCURITÉ : Attendu 403 Forbidden mais reçu {dossiers_res.status_code}"
    
    # 3. Tenter d'accéder aux consultations médicales
    consultations_res = requests.get("http://127.0.0.1:8000/api/data/consultations/", headers=headers, timeout=5)
    assert consultations_res.status_code == 403, f"ATTENTION SÉCURITÉ : Attendu 403 Forbidden mais reçu {consultations_res.status_code}"
