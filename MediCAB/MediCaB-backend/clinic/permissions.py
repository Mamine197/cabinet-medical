from rest_framework import permissions
from accounts.models import User


class RoleBasedClinicPermission(permissions.BasePermission):
    """
    Implémentation conforme au Tableau 4.3 du Cahier des Charges :
    - Médecin : Accès complet aux soins (patients, consultations, ordonnances, rdv).
    - Secrétaire : Accès aux patients (admin), rendez-vous, facturation, paiements, stocks.
                   REFUS STRICT (403) aux consultations et ordonnances médicales.
    - Administrateur : Accès administratif et supervision.
    """

    # Modules réservés strictement au personnel soignant (Médecin)
    DOCTOR_ONLY_MODULES = {"consultations", "prescriptions", "lignes-prescription", "dossiers-medicaux"}

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        module = view.kwargs.get("module")
        user_role = getattr(request.user, "role", None)
        is_staff = getattr(request.user, "is_staff", False)

        # Les administrateurs techniques ont accès de maintenance
        if is_staff or user_role == User.Role.ADMIN:
            return True

        # Contrôle pour les secrétaires
        if user_role == User.Role.SECRETARY:
            if module in self.DOCTOR_ONLY_MODULES:
                # Exigence CDC Tableau 4.3 : La secrétaire n'a pas accès aux données cliniques
                return False
            return True

        # Contrôle pour les médecins
        if user_role == User.Role.DOCTOR:
            return True

        return False
