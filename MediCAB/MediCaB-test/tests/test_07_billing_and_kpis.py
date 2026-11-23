import pytest
from playwright.sync_api import Page, expect
from pages.dashboard_page import DashboardPage

@pytest.mark.functional
def test_billing_module_invoices_and_status(admin_page: DashboardPage, page: Page):
    """Vérifie l'accès au module Facturation par l'administrateur et l'affichage des factures."""
    admin_page.open_app("Facturation")
    
    expect(page.locator(".odoo-current-app-name")).to_contain_text("Facturation")
    
    # Bascule en vue Liste
    list_btn = page.locator(".odoo-view-btn:has-text('Liste')")
    if list_btn.is_visible():
        list_btn.click()
        expect(page.locator("table")).to_be_visible()
        expect(page.locator("text=Payée").first).to_be_visible()
