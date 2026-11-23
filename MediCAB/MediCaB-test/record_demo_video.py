import os
import time
import shutil
from playwright.sync_api import sync_playwright
from pages.login_page import LoginPage
from pages.dashboard_page import DashboardPage
from pages.ai_page import AIPage

BASE_URL = "http://127.0.0.1:4200"
VIDEO_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "videos"))

def record_full_app_demo():
    print(f"[*] Initialisation de l'enregistrement vidéo dans : {VIDEO_DIR}")
    os.makedirs(VIDEO_DIR, exist_ok=True)
    
    with sync_playwright() as p:
        # Enregistrement en résolution HD 1280x720
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir=VIDEO_DIR,
            record_video_size={"width": 1280, "height": 720},
            viewport={"width": 1280, "height": 720}
        )
        
        page = context.new_page()
        login_p = LoginPage(page)
        dashboard = DashboardPage(page)
        ai_p = AIPage(page)
        
        # ---------------------------------------------------------------------
        # SCÈNE 1 : MIRE D'AUTHENTIFICATION & PRÉSENTATION
        # ---------------------------------------------------------------------
        print("[1/5] Présentation de la mire d'authentification...")
        login_p.navigate_to(BASE_URL)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(2500)
        
        # ---------------------------------------------------------------------
        # SCÈNE 2 : ESPACE SECRÉTAIRE (ACCUEIL, DEVIS AMO & PRÉDICTION NO-SHOW)
        # ---------------------------------------------------------------------
        print("[2/5] Démonstration Espace Secrétaire...")
        login_p.login("secretaire@medicab.ma", "secretairepassword123")
        page.wait_for_selector(".odoo-home-container", timeout=8000)
        page.wait_for_timeout(3000)
        
        # Ouverture du Centre d'Intelligence Artificielle
        print("  -> Simulation Feuille de Soins AMO...")
        dashboard.open_ai_copilot()
        page.wait_for_timeout(2000)
        
        ai_p.open_cnss_tab()
        page.wait_for_timeout(1500)
        ai_p.calculate_cnss("300")
        page.wait_for_timeout(3000)
        
        # Consultation Modèle Prédictif No-Show
        print("  -> Modèle Prédictif d'Absence No-Show...")
        ai_p.open_noshow_tab()
        page.wait_for_timeout(3000)
        
        # Déconnexion Secrétaire
        print("  -> Déconnexion Secrétaire...")
        dashboard.logout()
        page.wait_for_timeout(2500)
        
        # ---------------------------------------------------------------------
        # SCÈNE 3 : ESPACE MÉDECIN (CLINIQUE & IA SOAP)
        # ---------------------------------------------------------------------
        print("[3/5] Démonstration Espace Médecin...")
        login_p.login("medecin@medicab.ma", "medecinpassword123")
        page.wait_for_selector(".odoo-home-container", timeout=8000)
        page.wait_for_timeout(3000)
        
        # Assistant IA SOAP
        print("  -> Assistant de Rédaction Clinique SOAP...")
        dashboard.open_ai_copilot()
        page.wait_for_timeout(2000)
        ai_p.open_soap_tab()
        page.wait_for_timeout(1500)
        
        if ai_p.soap_notes.is_visible():
            ai_p.soap_notes.fill("Patient adulte présentant rhinorrhée, céphalée fébrile depuis 48h.")
            page.wait_for_timeout(1500)
            if ai_p.soap_generate_btn.is_visible():
                ai_p.soap_generate_btn.click()
                page.wait_for_timeout(3500)
                
        # Déconnexion Médecin
        print("  -> Déconnexion Médecin...")
        dashboard.logout()
        page.wait_for_timeout(2500)
        
        # ---------------------------------------------------------------------
        # SCÈNE 4 : ESPACE ADMINISTRATEUR (SUPERVISION TRANSVERSALE)
        # ---------------------------------------------------------------------
        print("[4/5] Démonstration Espace Administrateur...")
        login_p.login("admin@medicab.ma", "adminpassword123")
        page.wait_for_selector(".odoo-home-container", timeout=8000)
        page.wait_for_timeout(3000)
        
        # Module Patients
        print("  -> Visite Module Patients...")
        dashboard.open_app("Patients")
        page.wait_for_timeout(3000)
        page.locator(".odoo-btn-secondary:has-text('Retour aux Apps')").click()
        page.wait_for_timeout(2000)
        
        # Module Rendez-vous
        print("  -> Visite Module Planning Rendez-vous...")
        dashboard.open_app("Rendez")
        page.wait_for_timeout(3500)
        page.locator(".odoo-btn-secondary:has-text('Retour aux Apps')").click()
        page.wait_for_timeout(2000)
        
        # Module Consultations
        print("  -> Visite Module Consultations Cliniques...")
        dashboard.open_app("Consultations")
        page.wait_for_timeout(3500)
        page.locator(".odoo-btn-secondary:has-text('Retour aux Apps')").click()
        page.wait_for_timeout(2000)
        
        # Module Facturation
        print("  -> Visite Module Facturation & Règlements...")
        dashboard.open_app("Facturation")
        page.wait_for_timeout(3500)
        page.locator(".odoo-btn-secondary:has-text('Retour aux Apps')").click()
        page.wait_for_timeout(2000)
        
        # Test Recherche Rapide Odoo
        print("  -> Démonstration Recherche Rapide du Lanceur...")
        dashboard.search_app("Pat")
        page.wait_for_timeout(1500)
        dashboard.search_app("Fact")
        page.wait_for_timeout(1500)
        dashboard.search_app("")
        page.wait_for_timeout(1500)
        
        # Module Journal d'Audit
        print("  -> Traçabilité & Journal d'Audit du Cabinet...")
        dashboard.open_app("Journal")
        page.wait_for_timeout(4000)
        page.locator(".odoo-btn-secondary:has-text('Retour aux Apps')").click()
        page.wait_for_timeout(2000)
        
        # ---------------------------------------------------------------------
        # SCÈNE 5 : DÉCONNEXION FINALE
        # ---------------------------------------------------------------------
        print("[5/5] Déconnexion finale et clôture...")
        dashboard.logout()
        page.wait_for_timeout(3000)
        
        video_obj = page.video
        context.close()
        browser.close()
        
        if video_obj:
            video_path = video_obj.path()
            target_path = os.path.join(VIDEO_DIR, "demo_complete_medicab.webm")
            shutil.copy(video_path, target_path)
            print(f"[+] Vidéo officielle enregistrée : {target_path}")

    print("[SUCCESS] Enregistrement vidéo de la démo terminé avec succès !")

if __name__ == "__main__":
    record_full_app_demo()
