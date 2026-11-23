from playwright.sync_api import Page, expect
from pages.base_page import BasePage

class LoginPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)
        self.email_input = page.locator("#login-email")
        self.password_input = page.locator("#login-password")
        self.submit_button = page.locator("button.auth-submit")
        self.error_alert = page.locator(".auth-error[role='alert']")

    def login(self, email: str, password: str):
        self.email_input.fill(email)
        self.password_input.fill(password)
        self.submit_button.click()

    def expect_error(self, message: str = ""):
        expect(self.error_alert).to_be_visible()
        if message:
            expect(self.error_alert).to_contain_text(message)

    def is_on_login_page(self) -> bool:
        return self.email_input.is_visible()
