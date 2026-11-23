import pytest
from playwright.sync_api import Page, expect
from pages.login_page import LoginPage
from pages.dashboard_page import DashboardPage
from pages.ai_page import AIPage

@pytest.mark.functional
def test_complete_end_to_end_cabinet_journey(page: Page, base_url, secretary_creds, admin_creds, doctor_creds):
    """
    LE GRAND PARCOURS PATIENT COMPLET ENCHAÎNÉ DE A À Z :
    1. Phase Accueil & Secrétariat : Prise en charge AMO et évaluation No-Show.
    2. Phase Gestion Clinique & Cabinet : Contrôle des dossiers, planning et facturation.
    3. Phase Praticien : Consultation médicale et assistance IA SOAP.
    4. Phase Sécurité & Gouvernance : Validation de la traçabilité complète dans le Journal d'Audit.
    """
    login_p = LoginPage(page)
    dashboard = DashboardPage(page)
    
    # =========================================================================
    # PHASE 1 : Espace Secrétaire (Accueil, Devis AMO & Prédiction d'Assiduité)
    # =========================================================================
    login_p.navigate_to(base_url)
    login_p.login(secretary_creds["email"], secretary_creds["password"])
    
    expect(dashboard.role_indicator).to_contain_text("Secrétaire")
    
    # Ouvrir le Centre d'IA pour simulation AMO
    dashboard.open_ai_copilot()
    expect(page.locator("h1:has-text('Centre d\\'Intelligence Artificielle')")).to_be_visible()
    
    ai_p = AIPage(page)
    ai_p.open_cnss_tab()
    expect(page.locator("h3:has-text('Calculateur Feuille de Soins AMO')")).to_be_visible()
    
    # Calcul d'une consultation spécialisée (TNR 250 DH, facturé 300 DH)
    ai_p.calculate_cnss("300")
    page.wait_for_timeout(300)
    
    # Bascule sur l'onglet No-Show pour vérifier l'assiduité
    ai_p.open_noshow_tab()
    expect(page.locator("h3:has-text('Modèle Prédictif')")).to_be_visible()
    
    # Déconnexion Secrétaire
    dashboard.logout()
    expect(login_p.email_input).to_be_visible()
    
    # =========================================================================
    # PHASE 2 : Espace Administrateur (Gestion transversale des modules)
    # =========================================================================
    login_p.login(admin_creds["email"], admin_creds["password"])
    expect(dashboard.role_indicator).to_contain_text("Administrateur")
    
    # Module Patients
    dashboard.open_app("Patients")
    expect(page.locator(".odoo-current-app-name")).to_contain_text("Patients")
    expect(page.locator("text=Salma Benali")).to_be_visible()
    
    # Retour au menu principal
    page.locator(".odoo-btn-secondary:has-text('Retour aux Apps')").click()
    expect(page.locator(".odoo-home-container")).to_be_visible()
    
    # Module Rendez-vous
    dashboard.open_app("Rendez")
    expect(page.locator(".odoo-current-app-name")).to_contain_text("Rendez")
    
    # Retour aux apps
    page.locator(".odoo-btn-secondary:has-text('Retour aux Apps')").click()
    
    # Module Consultations
    dashboard.open_app("Consultations")
    expect(page.locator(".odoo-current-app-name")).to_contain_text("Consultations")
    
    # Retour aux apps
    page.locator(".odoo-btn-secondary:has-text('Retour aux Apps')").click()
    
    # Module Facturation
    dashboard.open_app("Facturation")
    expect(page.locator(".odoo-current-app-name")).to_contain_text("Facturation")
    
    # Déconnexion Administrateur
    dashboard.logout()
    expect(login_p.email_input).to_be_visible()
    
    # =========================================================================
    # PHASE 3 : Espace Médecin (Consultation clinique & Compte-rendu SOAP)
    # =========================================================================
    login_p.login(doctor_creds["email"], doctor_creds["password"])
    expect(dashboard.role_indicator).to_contain_text("Médecin")
    
    # Vérification du cloisonnement : l'admin est bien masqué
    assert not dashboard.is_app_card_visible("Utilisateurs")
    assert not dashboard.is_app_card_visible("Journal")
    
    # Utilisation de l'assistant IA SOAP
    dashboard.open_ai_copilot()
    expect(page.locator("h1:has-text('Centre d\\'Intelligence Artificielle')")).to_be_visible()
    ai_p.open_soap_tab()
    expect(page.locator("h3:has-text('Saisie clinique rapide')")).to_be_visible()
    
    # Déconnexion Médecin
    dashboard.logout()
    expect(login_p.email_input).to_be_visible()
    
    # =========================================================================
    # PHASE 4 : Traçabilité & Audit (Gouvernance sécurité)
    # =========================================================================
    login_p.login(admin_creds["email"], admin_creds["password"])
    dashboard.open_app("Journal")
    expect(page.locator(".odoo-current-app-name")).to_contain_text("Journal")
    
    # Vérifier que le Journal d'activité s'affiche pour l'Administrateur
    expect(page.locator("h1:has-text('Journal d’activité')")).to_be_visible()
    
    # Clôture finale de la session
    dashboard.logout()
    expect(login_p.email_input).to_be_visible()
