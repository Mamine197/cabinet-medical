from playwright.sync_api import Page, expect

class BasePage:
    def __init__(self, page: Page):
        self.page = page

    def navigate_to(self, url: str = "/"):
        self.page.goto(url, wait_until="domcontentloaded")

    def take_screenshot(self, path: str):
        self.page.screenshot(path=path)

    def get_toast_message(self, timeout: float = 3000) -> str:
        """Récupère le texte de notification toast s'il est affiché."""
        try:
            toast = self.page.locator(".toast, [role='alert'], .bg-slate-900, .fixed.bottom-4")
            toast.wait_for(state="visible", timeout=timeout)
            return toast.inner_text()
        except Exception:
            return ""
