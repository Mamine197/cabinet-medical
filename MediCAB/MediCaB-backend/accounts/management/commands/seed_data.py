from datetime import date
from django.core.management.base import BaseCommand
from accounts.models import User, PermissionFeature, RolePermission, DoctorProfile, SecretaryProfile
from clinic.models import Patient, DossierMedical, RendezVous, Consultation, Prescription, LignePrescription, Facture, Paiement


class Command(BaseCommand):
    help = "Initialise les permissions, rôles et données cliniques conformes au CDC pour MediCAB"

    def handle(self, *args, **options):
        # 1. Permissions de base
        permissions_list = [
            ("manage_users", "Gestion des utilisateurs et rôles"),
            ("view_audit_logs", "Consultation du journal d'activité"),
            ("manage_patients", "Gestion des dossiers patients"),
            ("manage_appointments", "Prise et modification des rendez-vous"),
            ("manage_consultations", "Enregistrement des consultations et ordonnances"),
            ("manage_billing", "Émission de factures et encaissements"),
            ("manage_inventory", "Gestion du stock et médicaments"),
            ("manage_insurance", "Gestion des feuilles de soins et CNSS"),
        ]

        created_perms = {}
        for code, desc in permissions_list:
            perm, _ = PermissionFeature.objects.get_or_create(code=code, defaults={"description": desc})
            created_perms[code] = perm

        # 2. Associations Rôles - Permissions
        role_mapping = {
            User.Role.ADMIN: list(created_perms.values()),
            User.Role.DOCTOR: [
                created_perms["manage_patients"],
                created_perms["manage_appointments"],
                created_perms["manage_consultations"],
                created_perms["manage_inventory"],
            ],
            User.Role.SECRETARY: [
                created_perms["manage_patients"],
                created_perms["manage_appointments"],
                created_perms["manage_billing"],
                created_perms["manage_inventory"],
                created_perms["manage_insurance"],
            ],
        }

        for role, perms in role_mapping.items():
            for p in perms:
                RolePermission.objects.get_or_create(role=role, permission=p)

        # 3. Comptes utilisateurs
        admin = User.objects.filter(email="admin@medicab.ma").first()
        if not admin:
            admin = User.objects.create_superuser(
                email="admin@medicab.ma",
                password="adminpassword123",
                first_name="Anas",
                last_name="Boudil",
                role=User.Role.ADMIN,
                phone="06 11 22 33 44"
            )

        medecin = User.objects.filter(email="medecin@medicab.ma").first()
        if not medecin:
            medecin = User.objects.create_user(
                email="medecin@medicab.ma",
                password="medecinpassword123",
                first_name="Anas",
                last_name="Boudil",
                role=User.Role.DOCTOR,
                phone="06 55 66 77 88"
            )
            DoctorProfile.objects.get_or_create(user=medecin, defaults={"specialty": "Médecine générale", "registration_number": "MED-12345"})

        secretaire = User.objects.filter(email="secretaire@medicab.ma").first()
        if not secretaire:
            secretaire = User.objects.create_user(
                email="secretaire@medicab.ma",
                password="secretairepassword123",
                first_name="Fatima",
                last_name="Zahra",
                role=User.Role.SECRETARY,
                phone="06 99 88 77 66"
            )
            SecretaryProfile.objects.get_or_create(user=secretaire, defaults={"phone": "06 99 88 77 66"})

        # 4. Données cliniques de démonstration (Patients réels dans la BDD relationnelle)
        patients_demo = [
            {"id": "PAT-001", "nom": "Salma Benali", "email": "salma.benali@example.test", "telephone": "06 12 34 56 01", "age": 29, "sexe": "Femme", "derniereVisite": date(2026, 11, 2), "statut": "Actif", "adresse": "Casablanca, Maarif", "groupeSanguin": "O+"},
            {"id": "PAT-002", "nom": "Yassine Amrani", "email": "yassine.amrani@example.test", "telephone": "06 12 34 56 02", "age": 42, "sexe": "Homme", "derniereVisite": date(2026, 10, 22), "statut": "Actif", "adresse": "Rabat, Agdal", "groupeSanguin": "A+"},
            {"id": "PAT-003", "nom": "Lina Haddad", "email": "lina.haddad@example.test", "telephone": "06 12 34 56 03", "age": 35, "sexe": "Femme", "derniereVisite": date(2026, 10, 18), "statut": "À suivre", "adresse": "Casablanca, Gauthier", "groupeSanguin": "B+"},
            {"id": "PAT-004", "nom": "Omar Idrissi", "email": "omar.idrissi@example.test", "telephone": "06 12 34 56 04", "age": 51, "sexe": "Homme", "derniereVisite": date(2026, 10, 15), "statut": "Actif", "adresse": "Mohammedia", "groupeSanguin": "AB+"},
        ]

        for p_data in patients_demo:
            p, _ = Patient.objects.get_or_create(id=p_data["id"], defaults=p_data)
            DossierMedical.objects.get_or_create(
                patient=p,
                defaults={"antecedents": "Antécédents médicaux normaux", "allergies": "Aucune allergie connue", "groupeSanguin": p_data["groupeSanguin"]}
            )

        # 5. Rendez-vous de test
        p1 = Patient.objects.get(id="PAT-001")
        p2 = Patient.objects.get(id="PAT-002")
        p3 = Patient.objects.get(id="PAT-003")

        RendezVous.objects.get_or_create(
            id="RDV-001",
            defaults={"patient": p1, "date": date(2026, 11, 23), "heure": "09:30", "motif": "Consultation générale", "statut": "Confirmé", "medecin": medecin}
        )
        RendezVous.objects.get_or_create(
            id="RDV-002",
            defaults={"patient": p2, "date": date(2026, 11, 23), "heure": "11:00", "motif": "Contrôle tensionnel", "statut": "En attente", "medecin": medecin}
        )
        RendezVous.objects.get_or_create(
            id="RDV-003",
            defaults={"patient": p3, "date": date(2026, 11, 24), "heure": "14:30", "motif": "Suivi bilan sanguin", "statut": "Confirmé", "medecin": medecin}
        )

        # 6. Consultations et Ordonnances
        cons1, _ = Consultation.objects.get_or_create(
            id="CONS-001",
            defaults={
                "patient": p1, "medecin": medecin, "date": date(2026, 11, 2), "motif": "Syndrome grippal",
                "pressionArterielle": "12/8", "temperature": 38.2, "poids": 62, "taille": 168,
                "diagnostic": "Rhinopharyngite aiguë", "notes": "Repos recommandé, hydratation et traitement symptomatique.",
                "statut": "Terminée"
            }
        )

        presc1, _ = Prescription.objects.get_or_create(
            id="ORD-001",
            defaults={"consultation": cons1, "date": date(2026, 11, 2), "statut": "Émise"}
        )

        LignePrescription.objects.get_or_create(
            id="LIG-001",
            defaults={"ordonnance": presc1, "medicamentId": "Paracétamol 1g", "posologie": "1 comprimé 3 fois par jour", "duree": "5 jours", "quantite": 1}
        )

        # 7. Facturation et Paiements
        fac1, _ = Facture.objects.get_or_create(
            id="FAC-001",
            defaults={"patient": p1, "date": date(2026, 11, 2), "designation": "Consultation générale", "montant": 300.0, "remise": 0.0, "montantPaye": 300.0, "statut": "Payée"}
        )
        Paiement.objects.get_or_create(
            id="PAI-001",
            defaults={"facture": fac1, "date": date(2026, 11, 2), "montant": 300.0, "mode": "Espèces"}
        )

        Facture.objects.get_or_create(
            id="FAC-002",
            defaults={"patient": p2, "date": date(2026, 11, 23), "designation": "Consultation de suivi", "montant": 250.0, "remise": 0.0, "montantPaye": 0.0, "statut": "En attente"}
        )

        self.stdout.write(self.style.SUCCESS("✅ Données relationnelles du cabinet médical initialisées avec succès !"))
