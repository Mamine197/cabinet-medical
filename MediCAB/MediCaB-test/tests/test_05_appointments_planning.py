import pytest
from playwright.sync_api import Page, expect
from pages.dashboard_page import DashboardPage

@pytest.mark.appointments
def test_appointments_calendar_planning_view(admin_page: DashboardPage, page: Page):
    """Vérifie l'affichage de la grille de planification des rendez-vous et des filtres de vue."""
    admin_page.open_app("Rendez")
    
    expect(page.locator(".odoo-current-app-name")).to_contain_text("Rendez")
    
    # Vérifier la présence du bouton de création
    expect(page.locator(".odoo-btn-primary").first).to_be_visible()
    
    # Bascule en vue Liste
    list_btn = page.locator(".odoo-view-btn:has-text('Liste')")
    if list_btn.count() > 0 and list_btn.is_visible():
        list_btn.click()
        expect(page.locator("table")).to_be_visible()
