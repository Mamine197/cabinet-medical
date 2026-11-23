import pytest
from playwright.sync_api import Page, expect
from pages.dashboard_page import DashboardPage

@pytest.mark.functional
def test_launcher_dynamic_search_filtering(admin_page: DashboardPage, page: Page):
    """Vérifie le filtrage temps réel dans le lanceur d'applications Odoo."""
    initial_count = admin_page.get_apps_count()
    assert initial_count == 15, "L'admin doit avoir 15 applications initialement"
    
    # Recherche 'Facturation'
    admin_page.search_app("Facturation")
    page.wait_for_timeout(300)
    
    # Doit filtrer et n'afficher que Facturation
    assert admin_page.is_app_card_visible("Facturation")
    assert not admin_page.is_app_card_visible("Ordonnances")
    
    # Effacer la recherche
    admin_page.search_app("")
    page.wait_for_timeout(300)
    assert admin_page.get_apps_count() == 15

@pytest.mark.functional
def test_discuss_team_chat_toggle(admin_page: DashboardPage, page: Page):
    """Vérifie l'ouverture et fermeture du panneau de discussion d'équipe."""
    chat_btn = page.locator(".odoo-tool-btn:has-text('💬')")
    chat_btn.click()
    
    expect(page.locator(".odoo-discuss-box")).to_be_visible()
    expect(page.locator("text=Discussion d'équipe")).to_be_visible()
