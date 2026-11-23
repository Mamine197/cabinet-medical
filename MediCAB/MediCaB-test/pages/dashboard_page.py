from playwright.sync_api import Page, expect
from pages.base_page import BasePage

class DashboardPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)
        self.search_input = page.locator("input[placeholder='Rechercher une application...']")
        self.role_indicator = page.locator(".odoo-role-indicator")
        self.app_cards = page.locator(".odoo-app-card")
        self.ai_btn = page.locator(".odoo-ai-pill-btn")
        self.profile_badge = page.locator(".odoo-user-badge-wrap")
        self.logout_btn = page.locator("button:has-text('Se déconnecter')")

    def get_role_indicator_text(self) -> str:
        return self.role_indicator.inner_text()

    def get_apps_count(self) -> int:
        return self.app_cards.count()

    def search_app(self, name: str):
        self.search_input.fill(name)

    def is_app_card_visible(self, name: str) -> bool:
        card = self.page.locator(f".odoo-app-card:has-text('{name}')")
        return card.count() > 0 and card.first.is_visible()

    def open_app(self, name: str):
        card = self.page.locator(f".odoo-app-card:has-text('{name}')").first
        card.click()
        self.page.wait_for_selector(".odoo-current-app-name", timeout=6000)

    def switch_role_via_pill(self, role: str):
        """Utilise les pilules de switch direct dans la topbar."""
        pill = self.page.locator(f".odoo-role-pill:has-text('{role}')")
        pill.click()

    def open_ai_copilot(self):
        self.ai_btn.click()

    def logout(self):
        self.profile_badge.click()
        btn = self.page.locator(".odoo-profile-menu button:has-text('Se déconnecter')")
        btn.wait_for(state="visible", timeout=5000)
        btn.click(force=True)
        self.page.wait_for_selector("#login-email", timeout=10000)
