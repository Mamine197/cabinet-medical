from playwright.sync_api import Page, expect
from pages.base_page import BasePage

class AIPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)
        self.tab_soap = page.locator("button:has-text('1. Consultation IA (Médecin)')")
        self.tab_chatbot = page.locator("button:has-text('2. Chatbot Patient & Triage')")
        self.tab_cnss = page.locator("button:has-text('3. Simulateur CNSS / AMO')")
        self.tab_noshow = page.locator("button:has-text('4. Prédiction No-Show (Secrétariat)')")

        # SOAP
        self.soap_notes = page.locator("textarea")
        self.soap_generate_btn = page.locator("button:has-text('Générer Compte-Rendu SOAP')")
        self.soap_result = page.locator(".card:has-text('Brouillon Structuré SOAP')")

        # CNSS
        self.cnss_montant_input = page.locator("input[type='number']").first
        self.cnss_prestation_select = page.locator("select").first

    def open_cnss_tab(self):
        self.tab_cnss.click()

    def open_soap_tab(self):
        self.tab_soap.click()

    def open_noshow_tab(self):
        self.tab_noshow.click()

    def calculate_cnss(self, montant: str):
        self.cnss_montant_input.fill(montant)

    def is_soap_tab_accessible(self) -> bool:
        return self.tab_soap.count() > 0 and self.tab_soap.is_visible()
