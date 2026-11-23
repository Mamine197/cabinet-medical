import pytest
import requests
from playwright.sync_api import Page, expect
from pages.login_page import LoginPage

@pytest.mark.smoke
def test_login_empty_credentials_rejected(page: Page, base_url):
    """Vérifie que la validation applicative bloque les champs vides."""
    login_p = LoginPage(page)
    login_p.navigate_to(base_url)
    
    # Supprimer les attributs required pour tester la validation contrôleur
    page.evaluate("document.querySelectorAll('#login-email, #login-password').forEach(el => el.removeAttribute('required'))")
    login_p.submit_button.click()
    login_p.expect_error("Saisissez votre adresse e-mail et votre mot de passe.")

@pytest.mark.smoke
def test_login_admin_wrong_password_rejected(page: Page, base_url, admin_creds):
    """Vérifie le rejet avec alerte pour l'ADMINISTRATEUR avec un mauvais mot de passe."""
    login_p = LoginPage(page)
    login_p.navigate_to(base_url)
    login_p.login(admin_creds["email"], "FauxPasswordAdmin_999")
    login_p.expect_error()

@pytest.mark.smoke
def test_login_doctor_wrong_password_rejected(page: Page, base_url, doctor_creds):
    """Vérifie le rejet avec alerte pour le MÉDECIN avec un mauvais mot de passe."""
    login_p = LoginPage(page)
    login_p.navigate_to(base_url)
    login_p.login(doctor_creds["email"], "FauxPasswordMedecin_888")
    login_p.expect_error()

@pytest.mark.smoke
def test_login_secretary_wrong_password_rejected(page: Page, base_url, secretary_creds):
    """Vérifie le rejet avec alerte pour la SECRÉTAIRE avec un mauvais mot de passe."""
    login_p = LoginPage(page)
    login_p.navigate_to(base_url)
    login_p.login(secretary_creds["email"], "FauxPasswordSecretaire_777")
    login_p.expect_error()

@pytest.mark.smoke
def test_login_unknown_user_rejected(page: Page, base_url):
    """Vérifie qu'un compte complètement inexistant dans la base est rejeté."""
    login_p = LoginPage(page)
    login_p.navigate_to(base_url)
    login_p.login("utilisateur.inconnu@medicab.ma", "motdepasse123456")
    login_p.expect_error()

@pytest.mark.rbac
def test_public_registration_blocks_admin_role_escalation():
    """Sécurité Anti-Escalade de privilèges : interdiction de créer un compte Admin par inscription publique."""
    res = requests.post(
        "http://127.0.0.1:8000/api/auth/register/",
        json={
            "email": "hacker_test@medicab.ma",
            "password": "HackerPassword123!",
            "first_name": "Infiltrateur",
            "last_name": "Test",
            "role": "Administrateur"
        },
        timeout=5
    )
    assert res.status_code == 400, f"FAILLE DE SÉCURITÉ : Attendu 400 mais reçu {res.status_code}"
    error_data = res.json()
    assert "role" in error_data
    assert "Administrateur" in str(error_data["role"])
