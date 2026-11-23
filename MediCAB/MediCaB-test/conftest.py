import pytest
from playwright.sync_api import Page
from pages.login_page import LoginPage
from pages.dashboard_page import DashboardPage

BASE_URL = "http://127.0.0.1:4200"

@pytest.fixture(scope="session")
def base_url():
    return BASE_URL

@pytest.fixture(scope="session")
def admin_creds():
    return {
        "email": "admin@medicab.ma",
        "password": "adminpassword123",
        "name": "Anas Boudil",
        "role": "Administrateur"
    }

@pytest.fixture(scope="session")
def doctor_creds():
    return {
        "email": "medecin@medicab.ma",
        "password": "medecinpassword123",
        "name": "Dr. Karim Tazi",
        "role": "Médecin"
    }

@pytest.fixture(scope="session")
def secretary_creds():
    return {
        "email": "secretaire@medicab.ma",
        "password": "secretairepassword123",
        "name": "Fatima Zahra",
        "role": "Secrétaire"
    }

@pytest.fixture
def login_page(page: Page) -> LoginPage:
    login_p = LoginPage(page)
    login_p.navigate_to(BASE_URL)
    return login_p

@pytest.fixture
def admin_page(page: Page, admin_creds) -> DashboardPage:
    login_p = LoginPage(page)
    login_p.navigate_to(BASE_URL)
    login_p.login(admin_creds["email"], admin_creds["password"])
    page.wait_for_selector(".odoo-home-container", timeout=8000)
    return DashboardPage(page)

@pytest.fixture
def doctor_page(page: Page, doctor_creds) -> DashboardPage:
    login_p = LoginPage(page)
    login_p.navigate_to(BASE_URL)
    login_p.login(doctor_creds["email"], doctor_creds["password"])
    page.wait_for_selector(".odoo-home-container", timeout=8000)
    return DashboardPage(page)

@pytest.fixture
def secretary_page(page: Page, secretary_creds) -> DashboardPage:
    login_p = LoginPage(page)
    login_p.navigate_to(BASE_URL)
    login_p.login(secretary_creds["email"], secretary_creds["password"])
    page.wait_for_selector(".odoo-home-container", timeout=8000)
    return DashboardPage(page)
