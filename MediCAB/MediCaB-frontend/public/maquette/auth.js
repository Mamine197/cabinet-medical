
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

function showMessage(element, message, type = "error") {
  if (!element) return;
  element.textContent = message;
  element.className = `message ${type}`;
}

if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const message = document.getElementById("loginMessage");

    if (!email || !password) {
      showMessage(message, "Veuillez remplir tous les champs.");
      return;
    }

    showMessage(
      message,
      "Interface prête : connectez ce formulaire à votre système d'authentification.",
      "success"
    );
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const fullname = document.getElementById("fullname").value.trim();
    const password = document.getElementById("password").value;
    const confirmation = document.getElementById("confirmPassword").value;
    const message = document.getElementById("registerMessage");

    if (fullname.length < 2) {
      showMessage(message, "Veuillez saisir votre nom complet.");
      return;
    }

    if (password.length < 8) {
      showMessage(message, "Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (password !== confirmation) {
      showMessage(message, "Les mots de passe ne correspondent pas.");
      return;
    }

    showMessage(
      message,
      "Formulaire validé ! Un backend est nécessaire pour créer votre compte.",
      "success"
    );
  });
}

const forgotLink = document.getElementById("forgotLink");

if (forgotLink) {
  forgotLink.addEventListener("click", function (event) {
    event.preventDefault();
    const message = document.getElementById("loginMessage");
    showMessage(
      message,
      "La récupération du mot de passe doit être configurée côté serveur."
    );
  });
}
