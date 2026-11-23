# Couverture du diagramme UML

Chaque classe ci-dessous possède une page Angular CRUD générique dans le menu. Les champs de formulaire reprennent les attributs de l'interface TypeScript fournie.

| Domaine | Classes / pages |
|---|---|
| Comptes et autorisations | Utilisateur, Role, Permission, Medecin, Secretaire |
| Patients et dossier | Patient, DossierMedical |
| Parcours de soins | RendezVous, Consultation, DocumentMedical, Ordonnance, LignePrescription, BrouillonIA |
| Facturation | Facture, LigneFacture, Paiement |
| Traçabilité | EvenementAudit |
| Achats et fournisseurs | Fournisseur, BonCommande, LigneCommande, BonReception, FactureFournisseur |
| Stock et inventaire | Article, Medicament, Lot, MouvementStock, Inventaire |
| Assurance et CNSS | OrganismeAssurance, CouvertureMedicale, FeuilleDeSoins, DossierRemboursement |

**Total : 31 classes métier, 31 écrans de gestion + tableau de bord.**

**Précision :** la présence d'un écran par classe couvre les pages demandées, mais ne garantit pas une conformité fonctionnelle complète du système UML. Les associations, cardinalités, règles de gestion, authentification, droits, transactions de stock et workflows de remboursement restent à développer et tester. Toutes les données sont locales au navigateur.
