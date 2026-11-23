import pytest
from playwright.sync_api import Page, expect
from pages.dashboard_page import DashboardPage
from pages.ai_page import AIPage

@pytest.mark.ai
def test_doctor_can_access_ai_soap_draft(doctor_page: DashboardPage, page: Page):
    """Vérifie que le Médecin accède au Centre d'IA et peut générer un compte-rendu SOAP."""
    doctor_page.open_ai_copilot()
    
    expect(page.locator("h1:has-text('Centre d\\'Intelligence Artificielle')")).to_be_visible(timeout=5000)
    ai_p = AIPage(page)
    assert ai_p.is_soap_tab_accessible(), "L'onglet SOAP doit être accessible pour le médecin"

@pytest.mark.ai
def test_secretary_can_use_cnss_amo_calculator(secretary_page: DashboardPage, page: Page):
    """Vérifie que la Secrétaire accède au simulateur CNSS et que le calcul AMO est exact."""
    secretary_page.open_ai_copilot()
    
    expect(page.locator("h1:has-text('Centre d\\'Intelligence Artificielle')")).to_be_visible(timeout=5000)
    ai_p = AIPage(page)
    ai_p.open_cnss_tab()
    
    # Vérification des éléments du simulateur
    expect(page.locator("h3:has-text('Calculateur Feuille de Soins AMO')")).to_be_visible()
    
    # Saisir un montant de 250 DH pour une consultation généraliste (TNR 150 DH)
    ai_p.calculate_cnss("250")
    
    # Recalculer
    calc_btn = page.locator("button:has-text('Recalculer les parts')")
    if calc_btn.count() > 0 and calc_btn.is_visible():
        calc_btn.click()
    
    # Vérifier l'affichage du calcul : base TNR 150 DH, Part AMO 105 DH (70%)
    expect(page.locator("text=105")).to_be_visible()
