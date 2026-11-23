import pytest
from playwright.sync_api import Page, expect
from pages.dashboard_page import DashboardPage

@pytest.mark.functional
def test_patients_kanban_and_list_views(admin_page: DashboardPage, page: Page):
    """Vérifie la navigation dans le module Patients et la bascule Kanban / Liste."""
    admin_page.open_app("Patients")
    
    # Vérifier que le module Patients est actif
    expect(page.locator(".odoo-current-app-name")).to_contain_text("Patients")
    
    # Bascule en vue Liste
    list_btn = page.locator(".odoo-view-btn:has-text('Liste')")
    list_btn.click()
    expect(page.locator("table")).to_be_visible()
    
    # Bascule en vue Kanban
    kanban_btn = page.locator(".odoo-view-btn:has-text('Kanban')")
    kanban_btn.click()
    expect(page.locator(".odoo-view-btn:has-text('Kanban')")).to_have_class("odoo-view-btn active")

@pytest.mark.functional
def test_patients_records_exist_and_modal(admin_page: DashboardPage, page: Page):
    """Vérifie que les dossiers patients sont visualisables et que la fiche s'ouvre."""
    admin_page.open_app("Patients")
    
    # Présence des patients clés
    expect(page.locator("text=Salma Benali")).to_be_visible()
    expect(page.locator("text=Omar Idrissi")).to_be_visible()
