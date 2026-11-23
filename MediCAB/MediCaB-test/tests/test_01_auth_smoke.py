import pytest
from playwright.sync_api import Page, expect
from pages.login_page import LoginPage
from pages.dashboard_page import DashboardPage

@pytest.mark.smoke
def test_login_page_renders_properly(page: Page, base_url):
    """Vérifie que la page d'authentification s'affiche avec tous ses composants clés."""
    login_p = LoginPage(page)
    login_p.navigate_to(base_url)
    
    expect(login_p.email_input).to_be_visible()
    expect(login_p.password_input).to_be_visible()
    expect(login_p.submit_button).to_be_visible()
    expect(page.locator("text=PLATEFORME ERP DE GESTION MÉDICALE")).to_be_visible()

@pytest.mark.smoke
def test_login_invalid_credentials_shows_error(page: Page, base_url):
    """Vérifie qu'un mot de passe erroné est rejeté avec un message d'erreur clair."""
    login_p = LoginPage(page)
    login_p.navigate_to(base_url)
    login_p.login("admin@medicab.ma", "mauvais_mot_de_passe")
    
    login_p.expect_error()

@pytest.mark.smoke
def test_login_admin_success_and_logout(page: Page, base_url, admin_creds):
    """Vérifie la connexion nominale de l'administrateur et sa déconnexion propre."""
    login_p = LoginPage(page)
    login_p.navigate_to(base_url)
    login_p.login(admin_creds["email"], admin_creds["password"])
    
    # Doit arriver sur le Dashboard Odoo
    dashboard = DashboardPage(page)
    expect(dashboard.role_indicator).to_be_visible()
    expect(dashboard.role_indicator).to_contain_text("Administrateur")
    
    # Déconnexion
    dashboard.logout()
    expect(login_p.email_input).to_be_visible()
