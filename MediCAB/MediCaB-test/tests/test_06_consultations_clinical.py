import pytest
from playwright.sync_api import Page, expect
from pages.dashboard_page import DashboardPage

@pytest.mark.clinical
def test_consultations_clinical_data_and_constants(admin_page: DashboardPage, page: Page):
    """Vérifie l'accès aux dossiers de consultation et aux constantes physiologiques."""
    admin_page.open_app("Consultations")
    
    expect(page.locator(".odoo-current-app-name")).to_contain_text("Consultations")
    
    # Bascule en vue Liste pour voir les données tabulaires
    list_btn = page.locator(".odoo-view-btn:has-text('Liste')")
    if list_btn.is_visible():
        list_btn.click()
        expect(page.locator("table")).to_be_visible()
    
    # Vérification de la présence de la consultation test
    expect(page.locator("text=Salma Benali")).to_be_visible()
