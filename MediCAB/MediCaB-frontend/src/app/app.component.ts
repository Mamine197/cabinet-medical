import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';

type FieldKind = 'text'|'number'|'date'|'email'|'tel'|'password'|'textarea'|'select'|'boolean';

interface FieldDef {
  key: string;
  label: string;
  type: FieldKind;
  options?: string[];
  required?: boolean;
}

interface ModuleDef {
  key: string;
  title: string;
  group: string;
  description: string;
  fields: FieldDef[];
}

type RecordData = Record<string, string|number|boolean>;
type UserRole = 'Administrateur'|'Médecin'|'Secrétaire';

interface LocalAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html'
})
export class AppComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly authService = inject(AuthService);
  private readonly iconCache = new Map<string, SafeHtml>();

  authMode: 'login'|'register' = 'login';
  isAuthenticated = false;
  authBusy = false;
  authError = '';
  authNotice = '';
  currentUser: LocalAccount|null = null;
  get isAdmin(): boolean {
    return this.isAuthenticated &&
           this.currentUser?.role === 'Administrateur';
  }
  get isDoctor(): boolean {
    return this.isAuthenticated &&
           this.currentUser?.role === 'Médecin';
  }
  get isSecretary(): boolean {
    return this.isAuthenticated &&
           this.currentUser?.role === 'Secrétaire';
  }

  // Odoo Interface State
  appSearch = '';
  viewMode: 'kanban' | 'list' = 'kanban';
  discussOpen = false;
  activitiesOpen = false;
  aiDrawerOpen = false;
  companyDropdownOpen = false;
  profileDropdownOpen = false;
  companyName = 'Cabinet Médical';
  private readonly odooIconCache = new Map<string, SafeHtml>();

  discussMessages = [
    { sender: 'Dr. Anas Boudil', time: '10:42', text: 'Bonjour Fatima, la patiente Salma Benali est-elle installée ?', avatar: 'AB', role: 'Médecin' },
    { sender: 'Fatima Zahra', time: '10:44', text: 'Bonjour Docteur, oui elle patiente en salle d’attente. Sa fiche et ses constantes sont prêtes.', avatar: 'FZ', role: 'Secrétaire' },
    { sender: 'Dr. Anas Boudil', time: '10:45', text: 'Parfait, faites-la entrer en salle de consultation. Merci !', avatar: 'AB', role: 'Médecin' },
    { sender: 'Système MediCAB', time: '11:00', text: 'Nouvelle consultation et ordonnance enregistrées avec succès.', avatar: 'MC', role: 'Système' }
  ];
  newDiscussMessage = '';

  authForm = {
    name: '',
    email: '',
    phone: '',
    role: 'Médecin' as UserRole,
    password: '',
    confirmPassword: ''
  };

  usersLoading = false;
  adminDataLoading = false;
  auditLoading = false;

  activeKey = 'dashboard';
  search = '';
  modalOpen = false;
  editingId = '';
  form: RecordData = {};
  toast = '';
  menuOpen = false;
  assistantText = '';
  selectedPatient: RecordData|null = null;

  calendarDate = new Date().toISOString().slice(0, 10);
  calendarMode: 'day'|'week'|'month' = 'week';

  reportStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).toISOString().slice(0, 10);

  reportEnd = new Date().toISOString().slice(0, 10);

  readonly modules: ModuleDef[] = [
    {
      key: 'users',
      title: 'Utilisateurs & rôles',
      group: 'Administration',
      description: 'Comptes des personnes autorisées à utiliser MediCAB.',
              fields: [
        {key: 'nom', label: 'Nom complet', type: 'text', required: true},
        {key: 'email', label: 'Adresse e-mail', type: 'email', required: true},
        {key: 'telephone', label: 'Téléphone', type: 'tel'},
        {key: 'role', label: 'Rôle', type: 'select', options: ['Médecin', 'Secrétaire'], required: true},
        {key: 'password', label: 'Mot de passe', type: 'password'},
        {key: 'actif', label: 'Compte actif', type: 'boolean'}
      ]
    },
    {
      key: 'roles',
      title: 'Rôles',
      group: 'Administration',
      description: 'Rôles et attribution des permissions.',
      fields: [
        {key: 'nom', label: 'Nom du rôle', type: 'text', required: true},
        {key: 'description', label: 'Description', type: 'textarea'},
        {key: 'permissionIds', label: 'Identifiants des permissions', type: 'text'}
      ]
    },
    {
      key: 'permissions',
      title: 'Permissions',
      group: 'Administration',
      description: 'Droits fonctionnels du système.',
      fields: [
        {key: 'code', label: 'Code', type: 'text', required: true},
        {key: 'description', label: 'Description', type: 'textarea'}
      ]
    },
    {
      key: 'medecins',
      title: 'Médecins',
      group: 'Administration',
      description: 'Informations professionnelles des médecins.',
      fields: [
        {key: 'utilisateurId', label: 'ID utilisateur', type: 'select', required: true},
        {key: 'specialite', label: 'Spécialité', type: 'text', required: true},
        {key: 'numeroOrdre', label: 'Numéro d’ordre', type: 'text'}
      ]
    },
    {
      key: 'secretaires',
      title: 'Secrétaires',
      group: 'Administration',
      description: 'Informations des secrétaires du cabinet.',
      fields: [
        {key: 'utilisateurId', label: 'ID utilisateur', type: 'select', required: true},
        {key: 'telephone', label: 'Téléphone', type: 'tel'}
      ]
    },
    {
      key: 'patients',
      title: 'Patients',
      group: 'Patients & soins',
      description: 'Données administratives et coordonnées des patients.',
      fields: [
        {key: 'nom', label: 'Nom complet', type: 'text', required: true},
        {key: 'email', label: 'E-mail', type: 'email'},
        {key: 'telephone', label: 'Téléphone', type: 'tel'},
        {key: 'dateNaissance', label: 'Date de naissance', type: 'date'},
        {key: 'age', label: 'Âge', type: 'number'},
        {key: 'sexe', label: 'Sexe', type: 'select', options: ['Femme', 'Homme', 'Autre']},
        {key: 'adresse', label: 'Adresse', type: 'textarea'},
        {key: 'groupeSanguin', label: 'Groupe sanguin', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']},
        {key: 'derniereVisite', label: 'Dernière visite', type: 'date'},
        {key: 'statut', label: 'Statut', type: 'select', options: ['Actif', 'À suivre', 'Inactif']}
      ]
    },
    {
      key: 'dossiers-medicaux',
      title: 'Dossiers médicaux',
      group: 'Patients & soins',
      description: 'Antécédents, allergies et informations médicales.',
      fields: [
        {key: 'patientId', label: 'ID patient', type: 'select', required: true},
        {key: 'antecedents', label: 'Antécédents', type: 'textarea'},
        {key: 'allergies', label: 'Allergies', type: 'textarea'},
        {key: 'groupeSanguin', label: 'Groupe sanguin', type: 'text'}
      ]
    },
    {
      key: 'appointments',
      title: 'Rendez-vous',
      group: 'Patients & soins',
      description: 'Planification et suivi des rendez-vous.',
      fields: [
        {key: 'patientId', label: 'ID patient', type: 'select', required: true},
        {key: 'date', label: 'Date', type: 'date', required: true},
        {key: 'heure', label: 'Heure', type: 'text'},
        {key: 'motif', label: 'Motif', type: 'text'},
        {key: 'statut', label: 'Statut', type: 'select', options: ['En attente', 'Confirmé', 'Annulé', 'Terminé']},
        {key: 'medecinId', label: 'ID médecin', type: 'select'}
      ]
    },
    {
      key: 'consultations',
      title: 'Consultations',
      group: 'Patients & soins',
      description: 'Comptes rendus, constantes et suivi des consultations.',
      fields: [
        {key: 'rendezVousId', label: 'ID rendez-vous', type: 'select'},
        {key: 'patientId', label: 'ID patient', type: 'select', required: true},
        {key: 'date', label: 'Date', type: 'date'},
        {key: 'motif', label: 'Motif', type: 'text'},
        {key: 'pressionArterielle', label: 'Tension artérielle', type: 'text'},
        {key: 'temperature', label: 'Température (°C)', type: 'number'},
        {key: 'poids', label: 'Poids (kg)', type: 'number'},
        {key: 'taille', label: 'Taille (cm)', type: 'number'},
        {key: 'diagnostic', label: 'Diagnostic / observation', type: 'textarea'},
        {key: 'notes', label: 'Notes médicales', type: 'textarea'},
        {key: 'statut', label: 'Statut', type: 'select', options: ['En cours', 'Terminée', 'Annulée']}
      ]
    },
    {
      key: 'documents-medicaux',
      title: 'Documents médicaux',
      group: 'Patients & soins',
      description: 'Documents associés au dossier d’un patient.',
      fields: [
        {key: 'patientId', label: 'ID patient', type: 'select', required: true},
        {key: 'type', label: 'Type de document', type: 'text'},
        {key: 'date', label: 'Date', type: 'date'},
        {key: 'contenu', label: 'Contenu / référence', type: 'textarea'}
      ]
    },
    {
      key: 'prescriptions',
      title: 'Ordonnances & documents',
      group: 'Patients & soins',
      description: 'Ordonnances émises à la suite des consultations.',
      fields: [
        {key: 'consultationId', label: 'ID consultation', type: 'select', required: true},
        {key: 'date', label: 'Date', type: 'date'},
        {key: 'statut', label: 'Statut', type: 'select', options: ['Brouillon', 'Émise', 'Clôturée']}
      ]
    },
    {
      key: 'lignes-prescription',
      title: 'Lignes de prescription',
      group: 'Patients & soins',
      description: 'Médicaments et posologies d’une ordonnance.',
      fields: [
        {key: 'ordonnanceId', label: 'ID ordonnance', type: 'select', required: true},
        {key: 'medicamentId', label: 'ID médicament', type: 'select', required: true},
        {key: 'posologie', label: 'Posologie', type: 'text'},
        {key: 'duree', label: 'Durée', type: 'text'},
        {key: 'quantite', label: 'Quantité', type: 'number'}
      ]
    },
    {
      key: 'brouillons-ia',
      title: 'Brouillons IA',
      group: 'Patients & soins',
      description: 'Contenus proposés par l’assistant, à vérifier par un professionnel.',
      fields: [
        {key: 'type', label: 'Type', type: 'text'},
        {key: 'contenu', label: 'Contenu', type: 'textarea'},
        {key: 'dateCreation', label: 'Date de création', type: 'date'}
      ]
    },
    {
      key: 'billing',
      title: 'Facturation',
      group: 'Finance',
      description: 'Factures patients, montants et suivi du règlement.',
      fields: [
        {key: 'patientId', label: 'ID patient', type: 'select', required: true},
        {key: 'date', label: 'Date', type: 'date'},
        {key: 'designation', label: 'Prestation', type: 'text'},
        {key: 'montant', label: 'Montant TTC (DH)', type: 'number', required: true},
        {key: 'remise', label: 'Remise (DH)', type: 'number'},
        {key: 'montantPaye', label: 'Montant déjà payé (DH)', type: 'number'},
        {key: 'statut', label: 'Statut', type: 'select', options: ['En attente', 'Partiellement payée', 'Payée', 'En retard', 'Annulée']}
      ]
    },
    {
      key: 'lignes-facture',
      title: 'Lignes de facture',
      group: 'Finance',
      description: 'Détail des prestations facturées.',
      fields: [
        {key: 'factureId', label: 'ID facture', type: 'select', required: true},
        {key: 'designation', label: 'Désignation', type: 'text'},
        {key: 'quantite', label: 'Quantité', type: 'number'},
        {key: 'prixUnitaire', label: 'Prix unitaire (DH)', type: 'number'}
      ]
    },
    {
      key: 'paiements',
      title: 'Paiements',
      group: 'Finance',
      description: 'Encaissements associés aux factures.',
      fields: [
        {key: 'factureId', label: 'ID facture', type: 'select', required: true},
        {key: 'date', label: 'Date', type: 'date'},
        {key: 'montant', label: 'Montant (DH)', type: 'number'},
        {key: 'mode', label: 'Mode de paiement', type: 'select', options: ['Espèces', 'Carte', 'Virement', 'Chèque', 'Autre']}
      ]
    },
    {
      key: 'audit',
      title: 'Journal d’activité',
      group: 'Administration',
      description: 'Historique des actions réalisées dans l’application.',
      fields: [
        {key: 'date', label: 'Date', type: 'text'},
        {key: 'utilisateur', label: 'Utilisateur', type: 'text'},
        {key: 'action', label: 'Action', type: 'text'},
        {key: 'detail', label: 'Détail', type: 'textarea'}
      ]
    },
    {
      key: 'fournisseurs',
      title: 'Fournisseurs',
      group: 'Achats & stock',
      description: 'Répertoire des fournisseurs.',
      fields: [
        {key: 'nom', label: 'Nom', type: 'text', required: true},
        {key: 'telephone', label: 'Téléphone', type: 'tel'},
        {key: 'email', label: 'E-mail', type: 'email'}
      ]
    },
    {
      key: 'bons-commande',
      title: 'Bons de commande',
      group: 'Achats & stock',
      description: 'Commandes passées auprès des fournisseurs.',
      fields: [
        {key: 'fournisseurId', label: 'ID fournisseur', type: 'select', required: true},
        {key: 'date', label: 'Date', type: 'date'},
        {key: 'statut', label: 'Statut', type: 'select', options: ['Brouillon', 'Envoyé', 'Partiellement reçu', 'Reçu', 'Annulé']}
      ]
    },
    {
      key: 'lignes-commande',
      title: 'Lignes de commande',
      group: 'Achats & stock',
      description: 'Articles, quantités et prix commandés.',
      fields: [
        {key: 'bonCommandeId', label: 'ID bon de commande', type: 'select', required: true},
        {key: 'articleId', label: 'ID article', type: 'select', required: true},
        {key: 'quantite', label: 'Quantité', type: 'number'},
        {key: 'prixUnitaire', label: 'Prix unitaire (DH)', type: 'number'}
      ]
    },
    {
      key: 'bons-reception',
      title: 'Bons de réception',
      group: 'Achats & stock',
      description: 'Réception des commandes fournisseurs.',
      fields: [
        {key: 'bonCommandeId', label: 'ID bon de commande', type: 'select', required: true},
        {key: 'date', label: 'Date', type: 'date'},
        {key: 'statut', label: 'Statut', type: 'select', options: ['En attente', 'Partiel', 'Complet', 'Litige']}
      ]
    },
    {
      key: 'factures-fournisseurs',
      title: 'Factures fournisseurs',
      group: 'Achats & stock',
      description: 'Factures reçues des fournisseurs.',
      fields: [
        {key: 'fournisseurId', label: 'ID fournisseur', type: 'select', required: true},
        {key: 'date', label: 'Date', type: 'date'},
        {key: 'montant', label: 'Montant (DH)', type: 'number'},
        {key: 'statut', label: 'Statut', type: 'select', options: ['À payer', 'Payée', 'En retard']}
      ]
    },
    {
      key: 'articles',
      title: 'Articles',
      group: 'Achats & stock',
      description: 'Catalogue des articles et niveaux de stock.',
      fields: [
        {key: 'nom', label: 'Nom', type: 'text', required: true},
        {key: 'reference', label: 'Référence', type: 'text'},
        {key: 'quantiteStock', label: 'Quantité en stock', type: 'number'},
        {key: 'seuilAlerte', label: 'Seuil d’alerte', type: 'number'}
      ]
    },
    {
      key: 'medicaments',
      title: 'Médicaments',
      group: 'Achats & stock',
      description: 'Catalogue des médicaments.',
      fields: [
        {key: 'nom', label: 'Nom', type: 'text', required: true},
        {key: 'reference', label: 'Référence', type: 'text'},
        {key: 'quantiteStock', label: 'Quantité en stock', type: 'number'},
        {key: 'seuilAlerte', label: 'Seuil d’alerte', type: 'number'},
        {key: 'dosage', label: 'Dosage', type: 'text'},
        {key: 'forme', label: 'Forme', type: 'text'}
      ]
    },
    {
      key: 'lots',
      title: 'Lots',
      group: 'Achats & stock',
      description: 'Suivi des lots et dates d’expiration.',
      fields: [
        {key: 'articleId', label: 'ID article', type: 'select', required: true},
        {key: 'numero', label: 'Numéro de lot', type: 'text'},
        {key: 'dateExpiration', label: 'Date d’expiration', type: 'date'},
        {key: 'quantite', label: 'Quantité', type: 'number'}
      ]
    },
    {
      key: 'mouvements-stock',
      title: 'Mouvements de stock',
      group: 'Achats & stock',
      description: 'Entrées, sorties et ajustements de stock.',
      fields: [
        {key: 'articleId', label: 'ID article', type: 'select', required: true},
        {key: 'type', label: 'Type de mouvement', type: 'select', options: ['Entrée', 'Sortie', 'Ajustement']},
        {key: 'quantite', label: 'Quantité', type: 'number'},
        {key: 'date', label: 'Date', type: 'date'}
      ]
    },
    {
      key: 'inventaires',
      title: 'Inventaires',
      group: 'Achats & stock',
      description: 'Sessions de vérification des stocks.',
      fields: [
        {key: 'date', label: 'Date', type: 'date'},
        {key: 'statut', label: 'Statut', type: 'select', options: ['En cours', 'Validé', 'Clôturé']}
      ]
    },
    {
      key: 'organismes-assurance',
      title: 'Organismes d’assurance',
      group: 'Assurance & CNSS',
      description: 'Organismes de couverture et mutuelles.',
      fields: [
        {key: 'nom', label: 'Nom', type: 'text', required: true},
        {key: 'contact', label: 'Contact', type: 'text'}
      ]
    },
    {
      key: 'couvertures-medicales',
      title: 'Couvertures médicales',
      group: 'Assurance & CNSS',
      description: 'Adhésions et taux de couverture des patients.',
      fields: [
        {key: 'patientId', label: 'ID patient', type: 'select', required: true},
        {key: 'organismeId', label: 'ID organisme', type: 'select', required: true},
        {key: 'numeroAdherent', label: 'Numéro adhérent', type: 'text'},
        {key: 'tauxCouverture', label: 'Taux de couverture (%)', type: 'number'}
      ]
    },
    {
      key: 'feuilles-soins',
      title: 'Feuilles de soins',
      group: 'Assurance & CNSS',
      description: 'Déclarations de soins destinées aux organismes.',
      fields: [
        {key: 'patientId', label: 'ID patient', type: 'select', required: true},
        {key: 'date', label: 'Date', type: 'date'},
        {key: 'montant', label: 'Montant (DH)', type: 'number'},
        {key: 'statut', label: 'Statut', type: 'select', options: ['À transmettre', 'Transmise', 'Acceptée', 'Refusée']}
      ]
    },
    {
      key: 'dossiers-remboursement',
      title: 'Dossiers de remboursement',
      group: 'Assurance & CNSS',
      description: 'Suivi des remboursements des feuilles de soins.',
      fields: [
        {key: 'feuilleDeSoinsId', label: 'ID feuille de soins', type: 'select', required: true},
        {key: 'dateEnvoi', label: 'Date d’envoi', type: 'date'},
        {key: 'statut', label: 'Statut', type: 'select', options: ['Préparé', 'Envoyé', 'En cours', 'Remboursé', 'Rejeté']},
        {key: 'montantRembourse', label: 'Montant remboursé (DH)', type: 'number'}
      ]
    }
  ];

  private readonly demoData: Record<string, RecordData[]> = {
    patients: [
      {id: 'PAT-001', nom: 'Salma Benali', email: 'salma.benali@example.test', telephone: '06 12 34 56 01', age: 29, sexe: 'Femme', derniereVisite: '2026-10-24', statut: 'Actif'},
      {id: 'PAT-002', nom: 'Yassine Amrani', email: 'yassine.amrani@example.test', telephone: '06 12 34 56 02', age: 42, sexe: 'Homme', derniereVisite: '2026-10-22', statut: 'Actif'},
      {id: 'PAT-003', nom: 'Lina Haddad', email: 'lina.haddad@example.test', telephone: '06 12 34 56 03', age: 35, sexe: 'Femme', derniereVisite: '2026-10-18', statut: 'À suivre'}
    ],
    appointments: [
      {id: 'RDV-001', patientId: 'PAT-001', date: '2026-11-02', heure: '09:00', motif: 'Consultation générale', statut: 'Confirmé'},
      {id: 'RDV-002', patientId: 'PAT-002', date: '2026-11-02', heure: '10:30', motif: 'Suivi médical', statut: 'En attente'},
      {id: 'RDV-003', patientId: 'PAT-003', date: '2026-11-03', heure: '14:00', motif: 'Contrôle', statut: 'Confirmé'}
    ],
    consultations: [
      {id: 'CONS-001', patientId: 'PAT-001', date: '2026-10-24', motif: 'Consultation générale', notes: 'Exemple de compte rendu fictif.', statut: 'Terminée'},
      {id: 'CONS-002', patientId: 'PAT-002', date: '2026-10-22', motif: 'Suivi médical', notes: 'Exemple de note de suivi.', statut: 'En cours'}
    ],
    billing: [
      {id: 'FAC-001', patientId: 'PAT-001', date: '2026-10-24', montant: 350, statut: 'Payée'},
      {id: 'FAC-002', patientId: 'PAT-002', date: '2026-10-22', montant: 250, statut: 'En attente'}
    ],
    fournisseurs: [
      {id: 'FOU-001', nom: 'Pharma Distribution', telephone: '05 22 00 00 01', email: 'contact@pharma.example.test'}
    ],
    articles: [
      {id: 'ART-001', nom: 'Gants médicaux', reference: 'GM-100', quantiteStock: 120, seuilAlerte: 30},
      {id: 'ART-002', nom: 'Compresses stériles', reference: 'CS-200', quantiteStock: 18, seuilAlerte: 25}
    ],
    medicaments: [
      {id: 'MED-001', nom: 'Paracétamol', reference: 'MED-PARA', dosage: '500 mg', forme: 'Comprimé', quantiteStock: 80, seuilAlerte: 20}
    ],
    'organismes-assurance': [
      {id: 'ASS-001', nom: 'CNSS', contact: 'Centre de gestion'},
      {id: 'ASS-002', nom: 'Mutuelle de démonstration', contact: 'Service adhérents'}
    ]
  };

  private records: Record<string, RecordData[]> = {};

  constructor() {
    for (const m of this.modules) {
      this.records[m.key] = m.key === 'users'
        ? []
        : this.read(m.key, this.demoData[m.key] ?? []);
    }
    this.restoreSession();
  }

  // AUTHENTIFICATION ET SESSION
  private restoreSession(): void {
    if (!this.authService.getToken()) {
      this.isAuthenticated = false;
      this.currentUser = null;
      return;
    }

    this.authService.getCurrentUser().subscribe({
     next: (user) => {
  this.currentUser = this.mapCurrentUser(user);
  this.isAuthenticated = true;

  this.loadBusinessData();

  if (this.currentUser.role === 'Administrateur') {
    this.loadUsers();
    this.loadAdminData();
  }
},
      error: () => {
        this.authService.clearToken();
        this.currentUser = null;
        this.isAuthenticated = false;
      }
    });
  }

     private mapCurrentUser(user: any): LocalAccount {
    return {
      id: String(user.id),
      name: user.name || `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim(),
      email: user.email,
      phone: user.phone ?? '',
      role: user.role as UserRole,
      createdAt: user.date_joined ?? ''
    };
  }

  private mapUserRecord(user: any): RecordData {
    return {
      id: String(user.id),
      nom: user.name || `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim(),
      email: user.email ?? '',
      telephone: user.phone ?? '',
      role: user.role ?? '',
      actif: Boolean(user.is_active),
      createdAt: user.date_joined ?? ''
    };
  }

  setAuthMode(mode: 'login'|'register'): void {
    this.authMode = mode;
    this.authError = '';
    this.authNotice = '';
    this.authForm = {
      name: '',
      email: '',
      phone: '',
      role: 'Médecin',
      password: '',
      confirmPassword: ''
    };
  }

  login(): void {
    this.authError = '';
    this.authNotice = '';
    const email = this.authForm.email.trim().toLowerCase();

    if (!email || !this.authForm.password) {
      this.authError = 'Saisissez votre adresse e-mail et votre mot de passe.';
      return;
    }

    this.authBusy = true;
    this.authService.login(email, this.authForm.password).subscribe({
      next: (response: any) => {
        this.currentUser = this.mapCurrentUser(response.user);
        this.isAuthenticated = true;
        this.activeKey = 'dashboard';
        this.authBusy = false;
        this.loadBusinessData();
        if (this.currentUser.role === 'Administrateur') {
          this.loadUsers();
          this.loadAdminData();
        }
      },
      error: (error) => {
        this.authBusy = false;
        this.authError =
          error?.error?.detail ||
          error?.error?.non_field_errors?.[0] ||
          'Adresse e-mail ou mot de passe incorrect.';
      }
    });
  }

  register(): void {
    this.authError = '';
    this.authNotice = '';
    const name = this.authForm.name.trim();
    const email = this.authForm.email.trim().toLowerCase();

    if (!name || !email || !this.authForm.password || !this.authForm.confirmPassword) {
      this.authError = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.authError = 'Veuillez saisir une adresse e-mail valide.';
      return;
    }
    if (this.authForm.password.length < 8) {
      this.authError = 'Le mot de passe doit contenir au moins 8 caractères.';
      return;
    }
    if (this.authForm.password !== this.authForm.confirmPassword) {
      this.authError = 'Les deux mots de passe ne correspondent pas.';
      return;
    }

    const nameParts = name.split(/\s+/);
    const first_name = nameParts.shift() ?? '';
    const last_name = nameParts.join(' ');
    if (!last_name) {
      this.authError = 'Veuillez saisir le prénom et le nom.';
      return;
    }

    this.authBusy = true;
    this.authService.register({
      email,
      password: this.authForm.password,
      first_name,
      last_name,
      phone: this.authForm.phone.trim(),
      role: this.authForm.role
    }).subscribe({
      next: (response: any) => {
        this.currentUser = this.mapCurrentUser(response.user);
        this.isAuthenticated = true;
        this.activeKey = 'dashboard';
        this.authBusy = false;
        this.loadBusinessData();
        if (this.currentUser.role === 'Administrateur') {
          this.loadUsers();
          this.loadAdminData();
        }
        this.toast = 'Compte créé avec succès.';
      },
      error: (error) => {
        this.authBusy = false;
        const details = error?.error;
        this.authError =
          details?.email?.[0] ||
          details?.password?.[0] ||
          details?.role?.[0] ||
          details?.non_field_errors?.[0] ||
          'La création du compte a échoué.';
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.finishLogout(),
      error: () => {
        this.authService.clearToken();
        this.finishLogout();
      }
    });
  }

  private finishLogout(): void {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.setAuthMode('login');
    this.activeKey = 'dashboard';
    this.modalOpen = false;
    this.records['users'] = [];
    this.records['roles'] = [];
    this.records['permissions'] = [];
    this.records['medecins'] = [];
    this.records['secretaires'] = [];
  }

  // UTILISATEURS DJANGO
  loadUsers(): void {
    if (!this.authService.getToken()) return;
    this.usersLoading = true;
    this.authService.getUsers().subscribe({
      next: (response: any) => {
        const users = this.toList(response);
        this.records['users'] = users.map((user: any) => this.mapUserRecord(user));
        this.usersLoading = false;
      },
      error: (error) => {
        this.usersLoading = false;
        this.toast = error?.status === 403
          ? 'Accès refusé : seuls les administrateurs peuvent gérer les utilisateurs.'
          : 'Impossible de charger les utilisateurs depuis Django.';
        console.error('Erreur chargement utilisateurs:', error);
      }
    });
  }

  // JOURNAL D'ACTIVITÉ DEPUIS DJANGO / MYSQL
  loadAuditLogs(): void {
    if (!this.authService.getToken()) return;

    this.auditLoading = true;
    this.authService.getAuditLogs().subscribe({
      next: (response: any) => {
        const logs = this.toList(response);
        this.records['audit'] = logs.map((log: any) => ({
          id: String(log.id),
          date: log.created_at
            ? new Date(log.created_at).toLocaleString('fr-FR')
            : '',
          utilisateur: log.user_email ?? 'Utilisateur inconnu',
          action: this.auditActionLabel(log.action),
          detail: `${log.module ?? 'Application'} · ${log.description ?? ''}`
        }));
        this.auditLoading = false;
      },
      error: (error) => {
        this.auditLoading = false;
        this.toast = error?.status === 403
          ? 'Accès refusé : seuls les administrateurs peuvent consulter le journal.'
          : 'Impossible de charger le journal depuis Django.';
        console.error('Erreur chargement journal :', error);
      }
    });
  }

  private auditActionLabel(action: string): string {
    const labels: Record<string, string> = {
      LOGIN: 'Connexion',
      LOGOUT: 'Déconnexion',
      CREATE: 'Création',
      UPDATE: 'Modification',
      DELETE: 'Suppression'
    };
    return labels[action] ?? action;
  }

  // ROLES, PERMISSIONS, MEDECINS ET SECRETAIRES
  private toList(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.results)) return response.results;
    return [];
  }

  private loadRoles(): void {
    this.authService.getRoles().subscribe({
      next: (response: any[]) => {
        const roles = Array.isArray(response) ? response : [];
        this.records['roles'] = roles.map((role: any) => ({
          id: String(role.value),
          nom: role.label,
          description: 'Rôle défini dans Django.',
          permissionIds: ''
        }));
        this.loadRolePermissions();
      },
      error: (error) => {
        console.error('Erreur chargement rôles:', error);
        this.toast = 'Impossible de charger les rôles depuis Django.';
      }
    });
  }

  private loadPermissions(): void {
    this.authService.getPermissions().subscribe({
      next: (response: any) => {
        const permissions = this.toList(response);
        this.records['permissions'] = permissions.map((permission: any) => ({
          id: String(permission.id),
          code: permission.code ?? '',
          description: permission.description ?? ''
        }));
      },
      error: (error) => {
        console.error('Erreur chargement permissions:', error);
        this.toast = 'Impossible de charger les permissions depuis Django.';
      }
    });
  }

  private loadRolePermissions(): void {
    this.authService.getRolePermissions().subscribe({
      next: (response: any) => {
        const associations = this.toList(response);
        this.records['roles'] = (this.records['roles'] ?? []).map(role => {
          const permissionIds = associations
            .filter((association: any) => String(association.role) === String(role['id']))
            .map((association: any) => String(association.permission));
          return {...role, permissionIds: permissionIds.join(', ')};
        });
      },
      error: (error) => {
        console.error('Erreur chargement associations rôles-permissions:', error);
        this.toast = 'Impossible de charger les permissions des rôles.';
      }
    });
  }

  private loadDoctors(): void {
    this.authService.getUsers('Médecin').subscribe({
      next: (response: any) => {
        const users = this.toList(response);
        this.records['medecins'] = users.map((user: any) => ({
          id: String(user.id),
          utilisateurId: String(user.id),
          nom: user.name || `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim(),
          email: user.email ?? '',
          telephone: user.phone ?? '',
          specialite: user.specialty ?? '',
          numeroOrdre: user.registration_number ?? ''
        }));
      },
      error: (error) => {
        console.error('Erreur chargement médecins:', error);
        this.toast = 'Impossible de charger les médecins depuis Django.';
      }
    });
  }

  private loadSecretaries(): void {
    this.authService.getUsers('Secrétaire').subscribe({
      next: (response: any) => {
        const users = this.toList(response);
        this.records['secretaires'] = users.map((user: any) => ({
          id: String(user.id),
          utilisateurId: String(user.id),
          nom: user.name || `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim(),
          email: user.email ?? '',
          telephone: user.phone ?? ''
        }));
      },
      error: (error) => {
        console.error('Erreur chargement secrétaires:', error);
        this.toast = 'Impossible de charger les secrétaires depuis Django.';
      }
    });
  }

  private loadAdminData(): void {
    if (!this.authService.getToken()) return;
    this.adminDataLoading = true;
    this.loadRoles();
    this.loadPermissions();
    this.loadDoctors();
    this.loadSecretaries();
    this.adminDataLoading = false;
  }
  private loadBusinessData(): void {
  const modules = [
    'patients',
    'dossiers-medicaux',
    'appointments',
    'consultations',
    'documents-medicaux',
    'prescriptions',
    'lignes-prescription',
    'brouillons-ia',
    'billing',
    'lignes-facture',
    'paiements',
    'fournisseurs',
    'bons-commande',
    'lignes-commande',
    'bons-reception',
    'factures-fournisseurs',
    'articles',
    'medicaments',
    'lots',
    'mouvements-stock',
    'inventaires',
    'organismes-assurance',
    'couvertures-medicales',
    'feuilles-soins',
    'dossiers-remboursement'
  ];

  for (const key of modules) {
    this.authService.getModuleRecords(key).subscribe({
      next: (data: any) => {
        this.records[key] = this.toList(data) as RecordData[];
        this.persist(key, this.records[key]);
      },
      error: (error) => {
        console.error(`Erreur de chargement du module ${key}:`, error);
        this.toast = `Impossible de charger les données : ${key}.`;
      }
    });
  }
}

  // NAVIGATION
  get userInitials(): string {
    return (this.currentUser?.name ?? 'M')
      .split(/\s+/).slice(0, 2).map(v => v[0] ?? '').join('').toUpperCase();
  }

  get activeModule(): ModuleDef|undefined {
    return this.modules.find(m => m.key === this.activeKey);
  }

  get activeRecords(): RecordData[] {
    const rows = this.records[this.activeKey] ?? [];
    const q = this.search.trim().toLocaleLowerCase('fr');
    return q
      ? rows.filter(r => Object.values(r).some(v => String(v).toLocaleLowerCase('fr').includes(q)))
      : rows;
  }

 get groups(): string[] {
  const visibleModules = this.isAdmin
    ? this.modules.filter(m => m.group === 'Administration')
    : this.modules.filter(m => m.group !== 'Administration');

  return [...new Set(visibleModules.map(m => m.group))];
}

readonly primaryKeys = [
  'patients',
  'appointments',
  'consultations',
  'prescriptions',
  'billing'
];


  get primaryModules(): ModuleDef[] {
  if (this.isAdmin) return [];

  return this.primaryKeys
    .map(k => this.modules.find(m => m.key === k))
    .filter((m): m is ModuleDef => !!m);
}

 modulesIn(group: string): ModuleDef[] {
  return this.modules.filter(m =>
    m.group === group &&
    (this.isAdmin
      ? m.group === 'Administration'
      : m.group !== 'Administration') &&
    !this.primaryKeys.includes(m.key)
  );
}

  get pageTitle(): string {
    if (this.activeKey === 'dashboard') return 'Tableau de bord';
    if (this.activeKey === 'assistant') return 'Assistant IA';
    if (this.activeKey === 'parametres') return 'Paramètres';
    if (this.activeKey === 'rapports') return 'Rapports & statistiques';
    if (this.activeKey === 'discussion') return 'Discussion';
    return this.activeModule?.title ?? 'MediCAB';
  }

  closeAllPopups(): void {
    this.discussOpen = false;
    this.activitiesOpen = false;
    this.aiDrawerOpen = false;
    this.companyDropdownOpen = false;
    this.profileDropdownOpen = false;
  }

  openLauncher(): void {
    this.closeAllPopups();
    this.activeKey = 'dashboard';
    this.appSearch = '';
  }

  toggleDiscuss(): void {
    const st = this.discussOpen;
    this.closeAllPopups();
    this.discussOpen = !st;
  }

  toggleActivities(): void {
    const st = this.activitiesOpen;
    this.closeAllPopups();
    this.activitiesOpen = !st;
  }

  toggleAiDrawer(): void {
    const st = this.aiDrawerOpen;
    this.closeAllPopups();
    this.aiDrawerOpen = !st;
  }

  toggleCompanyDropdown(): void {
    const st = this.companyDropdownOpen;
    this.closeAllPopups();
    this.companyDropdownOpen = !st;
  }

  toggleProfileDropdown(): void {
    const st = this.profileDropdownOpen;
    this.closeAllPopups();
    this.profileDropdownOpen = !st;
  }

  activeChannel = '#secrétariat-médecins';
  channels = [
    { id: '#secrétariat-médecins', name: '#secrétariat-médecins', unread: 3 },
    { id: '#général', name: '#général', unread: 0 },
    { id: '#urgences', name: '#urgences', unread: 0 },
    { id: '#administration', name: '#administration', unread: 1 }
  ];
  directContacts = [
    { name: 'Dr. Anas Boudil', role: 'Médecin', initials: 'AB', online: true },
    { name: 'Fatima Zahra', role: 'Secrétaire', initials: 'FZ', online: true },
    { name: 'Dr. Anas Boudil (Admin)', role: 'Administrateur', initials: 'AB', online: true }
  ];

  sendDiscussMessage(quickText?: string): void {
    const text = (quickText || this.newDiscussMessage).trim();
    if (!text) return;
    this.discussMessages.push({
      sender: this.currentUser?.name ?? 'Dr. Anas Boudil',
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      text,
      avatar: this.userInitials || 'AB',
      role: this.currentUser?.role ?? 'Administrateur'
    });
    if (!quickText) {
      this.newDiscussMessage = '';
    }
  }

  switchRole(role: UserRole): void {
    this.closeAllPopups();
    if (role === 'Administrateur') {
      this.currentUser = {
        id: 'USR-ADMIN',
        name: 'Dr. Anas Boudil',
        email: 'admin@medicab.ma',
        phone: '06 11 22 33 44',
        role: 'Administrateur',
        createdAt: '2026-01-01'
      };
      this.isAuthenticated = true;
      this.loadUsers();
      this.loadAdminData();
    } else if (role === 'Médecin') {
      this.currentUser = {
        id: 'USR-MED',
        name: 'Dr. Anas Boudil',
        email: 'medecin@medicab.ma',
        phone: '06 55 66 77 88',
        role: 'Médecin',
        createdAt: '2026-01-01'
      };
      this.isAuthenticated = true;
      this.loadBusinessData();
    } else {
      this.currentUser = {
        id: 'USR-SEC',
        name: 'Fatima Zahra',
        email: 'secretaire@medicab.ma',
        phone: '06 99 88 77 66',
        role: 'Secrétaire',
        createdAt: '2026-01-01'
      };
      this.isAuthenticated = true;
      this.loadBusinessData();
    }
    this.activeKey = 'dashboard';
    this.appSearch = '';
    this.notify(`Espace Odoo basculé en mode : ${role}`);
  }

  loginAsDemo(role: UserRole): void {
    this.switchRole(role);
  }

  get currentOdooApps(): { key: string; name: string; category: string; description: string; badge?: number|string; badgeType?: string }[] {
    const role = this.currentUser?.role ?? 'Administrateur';
    if (role === 'Administrateur') {
      return [
        { key: 'users', name: 'Utilisateurs', category: 'Administration', description: 'Gestion des comptes et des accès', badge: this.count('users') },
        { key: 'roles', name: 'Rôles', category: 'Administration', description: 'Rôles et autorisations', badge: this.count('roles') },
        { key: 'permissions', name: 'Permissions', category: 'Administration', description: 'Droits de sécurité du système', badge: this.count('permissions') },
        { key: 'medecins', name: 'Médecins', category: 'Cabinet', description: 'Annuaire des praticiens', badge: this.count('medecins') },
        { key: 'secretaires', name: 'Secrétaires', category: 'Cabinet', description: 'Personnel d’accueil', badge: this.count('secretaires') },
        { key: 'audit', name: 'Journal d’activité', category: 'Sécurité', description: 'Historique des actions et logs', badge: this.count('audit') },
        { key: 'rapports', name: 'Tableaux de bord', category: 'Pilotage', description: 'Statistiques & indicateurs clés' },
        { key: 'discussion', name: 'Discussion', category: 'Communication', description: 'Messagerie interne du cabinet', badge: 3, badgeType: 'danger' },
        { key: 'export', name: 'Sauvegardes', category: 'Système', description: 'Export JSON des données' },
        { key: 'parametres', name: 'Paramètres', category: 'Système', description: 'Configuration globale' }
      ];
    } else if (role === 'Médecin') {
      return [
        { key: 'patients', name: 'Patients', category: 'Soins', description: 'Dossiers et antécédents médicaux', badge: this.count('patients') },
        { key: 'appointments', name: 'Rendez-vous', category: 'Planning', description: 'Agenda et consultations', badge: this.count('appointments'), badgeType: 'info' },
        { key: 'consultations', name: 'Consultations', category: 'Clinique', description: 'Examens, diagnostics & constantes', badge: this.count('consultations') },
        { key: 'prescriptions', name: 'Ordonnances', category: 'Prescriptions', description: 'Ordonnances & documents émis', badge: this.count('prescriptions') },
        { key: 'dossiers-medicaux', name: 'Dossiers médicaux', category: 'Soins', description: 'Antécédents & allergies', badge: this.count('dossiers-medicaux') },
        { key: 'documents-medicaux', name: 'Documents', category: 'Soins', description: 'Comptes rendus & pièces jointes', badge: this.count('documents-medicaux') },
        { key: 'lignes-prescription', name: 'Médicaments', category: 'Pharmacie', description: 'Posologies et traitements', badge: this.count('lignes-prescription') },
        { key: 'assistant', name: 'Assistant IA', category: 'IA Médicale', description: 'Aide à la rédaction et brouillons', badge: 'AI', badgeType: 'ai' },
        { key: 'rapports', name: 'Statistiques', category: 'Pilotage', description: 'Synthèse d’activité médicale' },
        { key: 'discussion', name: 'Discussion', category: 'Communication', description: 'Échanges cabinet et secrétariat', badge: 3, badgeType: 'danger' },
        { key: 'parametres', name: 'Paramètres', category: 'Configuration', description: 'Préférences praticien' }
      ];
    } else {
      return [
        { key: 'patients', name: 'Patients', category: 'Accueil', description: 'Enregistrement et coordonnées', badge: this.count('patients') },
        { key: 'appointments', name: 'Rendez-vous', category: 'Planning', description: 'Planning et prise de rendez-vous', badge: this.count('appointments') },
        { key: 'billing', name: 'Facturation', category: 'Finance', description: 'Factures patients & encaissements', badge: this.count('billing') },
        { key: 'paiements', name: 'Paiements', category: 'Finance', description: 'Règlements & journal de caisse', badge: this.count('paiements') },
        { key: 'fournisseurs', name: 'Fournisseurs', category: 'Achats', description: 'Annuaire des partenaires', badge: this.count('fournisseurs') },
        { key: 'bons-commande', name: 'Bons de commande', category: 'Achats', description: 'Commandes de fournitures', badge: this.count('bons-commande') },
        { key: 'bons-reception', name: 'Bons de réception', category: 'Logistique', description: 'Suivi des réceptions', badge: this.count('bons-reception') },
        { key: 'articles', name: 'Inventaire', category: 'Stock', description: 'Consommables & niveaux de stock', badge: this.count('articles') },
        { key: 'organismes-assurance', name: 'Assurances', category: 'Tiers', description: 'Organismes & CNSS', badge: this.count('organismes-assurance') },
        { key: 'discussion', name: 'Discussion', category: 'Communication', description: 'Liaison médecins et secrétariat', badge: 3, badgeType: 'danger' },
        { key: 'parametres', name: 'Paramètres', category: 'Configuration', description: 'Préférences secrétariat' }
      ];
    }
  }

  get filteredOdooApps(): { key: string; name: string; category: string; description: string; badge?: number|string; badgeType?: string }[] {
    const q = this.appSearch.trim().toLowerCase();
    if (!q) return this.currentOdooApps;
    return this.currentOdooApps.filter(app =>
      app.name.toLowerCase().includes(q) ||
      app.category.toLowerCase().includes(q) ||
      app.description.toLowerCase().includes(q)
    );
  }

  cardTitle(row: RecordData, moduleKey: string): string {
    switch (moduleKey) {
      case 'patients': return String(row['nom'] || 'Patient');
      case 'appointments': return this.patientName(row['patientId']);
      case 'consultations': return this.patientName(row['patientId']);
      case 'billing': return `${this.patientName(row['patientId'])} · ${row['montant'] ?? 0} DH`;
      case 'prescriptions': return `Ordonnance ${row['id']}`;
      case 'users': return String(row['nom'] || row['name'] || 'Utilisateur');
      case 'roles': return String(row['nom'] || 'Rôle');
      case 'medecins': return `Dr. ${row['utilisateurId'] || row['id']}`;
      case 'secretaires': return `Secrétaire ${row['utilisateurId'] || row['id']}`;
      case 'fournisseurs': return String(row['nom'] || 'Fournisseur');
      case 'articles': return String(row['nom'] || 'Article');
      default: return String(row['nom'] || row['designation'] || row['code'] || row['id'] || 'Élément');
    }
  }

  cardSubtitle(row: RecordData, moduleKey: string): string {
    switch (moduleKey) {
      case 'patients': return String(row['telephone'] || row['email'] || 'Dossier patient');
      case 'appointments': return `${row['date'] || ''} à ${row['heure'] || '--:--'} · ${row['motif'] || ''}`;
      case 'consultations': return `${row['date'] || ''} · ${row['motif'] || 'Consultation'}`;
      case 'billing': return `Statut : ${row['statut'] || 'Non payé'} · Le ${row['date'] || ''}`;
      case 'users': return `${row['role'] || ''} · ${row['email'] || ''}`;
      case 'articles': return `Réf : ${row['reference'] || '--'} · Stock : ${row['quantiteStock'] ?? 0}`;
      default: return String(row['description'] || row['detail'] || row['type'] || row['statut'] || '');
    }
  }

  go(key: string): void {
    this.closeAllPopups();
    if (key === 'dashboard') {
      this.activeKey = 'dashboard';
      this.search = '';
      this.appSearch = '';
      return;
    }
    if (key === 'discussion') {
      this.activeKey = 'discussion';
      this.search = '';
      this.appSearch = '';
      return;
    }
    if (key === 'export') {
      this.exportData();
      return;
    }
    if (key === 'assistant' && !this.isDoctor) {
      this.toast = 'L’Assistant IA clinique est réservé aux praticiens.';
      return;
    }

    const module = this.modules.find(m => m.key === key);

    if (this.isAdmin && module && module.group !== 'Administration' && key !== 'parametres' && key !== 'rapports') {
      this.toast = 'Ce module est réservé aux utilisateurs métier.';
      return;
    }

    if (!this.isAdmin && module?.group === 'Administration') {
      this.toast = 'Accès réservé à l’Administrateur.';
      return;
    }

    this.activeKey = key;
    this.search = '';
    this.modalOpen = false;
    this.menuOpen = false;

    if (!this.isAdmin) return;

    switch (key) {
      case 'users':
        this.loadUsers();
        break;
      case 'roles':
        this.loadRoles();
        break;
      case 'permissions':
        this.loadPermissions();
        break;
      case 'medecins':
        this.loadDoctors();
        break;
      case 'secretaires':
        this.loadSecretaries();
        break;
      case 'audit':
        this.loadAuditLogs();
        break;
    }
  }

  odooIcon(key: string): SafeHtml {
    const cached = this.odooIconCache.get(key);
    if (cached) return cached;
    const svg = this.buildOdooIcon(key);
    const safe = this.sanitizer.bypassSecurityTrustHtml(svg);
    this.odooIconCache.set(key, safe);
    return safe;
  }

  private buildOdooIcon(key: string): string {
    switch (key) {
      case 'appointments':
        return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="10" width="48" height="46" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
          <path d="M8 20C8 14.4772 12.4772 10 18 10H46C51.5228 10 56 14.4772 56 20V23H8V20Z" fill="#E24A4A"/>
          <rect x="18" y="6" width="4" height="8" rx="2" fill="#CBD5E1"/>
          <rect x="42" y="6" width="4" height="8" rx="2" fill="#CBD5E1"/>
          <text x="32" y="44" font-family="'Manrope', sans-serif" font-weight="800" font-size="20" fill="#2C3E50" text-anchor="middle">31</text>
          <circle cx="47" cy="47" r="11" fill="#10B981" stroke="#FFFFFF" stroke-width="2.5"/>
          <path d="M42 47.5L45.5 51L52 44.5" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;

      case 'patients':
        return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="12" width="48" height="42" rx="10" fill="url(#patGrad)"/>
          <path d="M22 12V8C22 6.89543 22.8954 6 24 6H40C41.1046 6 42 6.89543 42 8V12H22Z" fill="#008784"/>
          <rect x="14" y="18" width="36" height="30" rx="6" fill="#FFFFFF" fill-opacity="0.95"/>
          <path d="M32 24V38M25 31H39" stroke="#00A09D" stroke-width="3" stroke-linecap="round"/>
          <path d="M19 40H25L28 35L33 44L37 38L40 40H45" stroke="#E11D48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <defs>
            <linearGradient id="patGrad" x1="8" y1="12" x2="56" y2="54" gradientUnits="userSpaceOnUse">
              <stop stop-color="#00B4B0"/>
              <stop offset="1" stop-color="#007976"/>
            </linearGradient>
          </defs>
        </svg>`;

      case 'consultations':
        return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="44" height="46" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5"/>
          <rect x="22" y="6" width="20" height="7" rx="3.5" fill="#714B67"/>
          <circle cx="32" cy="9.5" r="2" fill="#FFFFFF"/>
          <line x1="18" y1="22" x2="36" y2="22" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="18" y1="28" x2="42" y2="28" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round"/>
          <line x1="18" y1="34" x2="34" y2="34" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round"/>
          <circle cx="43" cy="43" r="13" fill="#FFF1F2"/>
          <path d="M35 37V42C35 46.4183 38.5817 50 43 50C47.4183 50 51 46.4183 51 42V37" stroke="#E11D48" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="43" cy="46" r="3" fill="#E11D48"/>
        </svg>`;

      case 'prescriptions':
        return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="8" width="44" height="48" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
          <path d="M10 8H42L54 20V56H10V8Z" fill="#F1F5F9"/>
          <path d="M42 8V20H54" fill="#E2E8F0"/>
          <text x="18" y="28" font-family="'Manrope', serif" font-weight="800" font-size="16" fill="#714B67">℞</text>
          <line x1="18" y1="36" x2="38" y2="36" stroke="#94A3B8" stroke-width="1.8" stroke-linecap="round"/>
          <line x1="18" y1="41" x2="32" y2="41" stroke="#CBD5E1" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M22 49C26 44 29 52 35 46C38 43 43 45 47 47" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round"/>
        </svg>`;

      case 'billing':
        return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="8" width="48" height="48" rx="12" fill="url(#billGrad)"/>
          <circle cx="24" cy="24" r="5" fill="#FFFFFF"/>
          <circle cx="40" cy="40" r="5" fill="#FFFFFF"/>
          <line x1="42" y1="20" x2="22" y2="44" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round"/>
          <defs>
            <linearGradient id="billGrad" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop stop-color="#8B5CF6"/>
              <stop offset="1" stop-color="#5B21B6"/>
            </linearGradient>
          </defs>
        </svg>`;

      case 'paiements':
        return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="14" width="48" height="36" rx="8" fill="url(#payGrad)"/>
          <rect x="8" y="22" width="48" height="7" fill="#047857"/>
          <rect x="15" y="35" width="10" height="7" rx="2" fill="#FBBF24"/>
          <circle cx="42" cy="38" r="4" fill="#F472B6" fill-opacity="0.8"/>
          <circle cx="47" cy="38" r="4" fill="#FB923C" fill-opacity="0.8"/>
          <defs>
            <linearGradient id="payGrad" x1="8" y1="14" x2="56" y2="50" gradientUnits="userSpaceOnUse">
              <stop stop-color="#10B981"/>
              <stop offset="1" stop-color="#059669"/>
            </linearGradient>
          </defs>
        </svg>`;

      case 'fournisseurs':
        return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="12" width="48" height="40" rx="10" fill="#00A09D"/>
          <path d="M8 26H56V42C56 47.5228 51.5228 52 46 52H18C12.4772 52 8 47.5228 8 42V26Z" fill="#714B67"/>
          <rect x="16" y="20" width="32" height="4" rx="2" fill="#FFFFFF" fill-opacity="0.8"/>
          <rect x="16" y="32" width="20" height="4" rx="2" fill="#FFFFFF" fill-opacity="0.8"/>
          <rect x="16" y="40" width="14" height="3" rx="1.5" fill="#FFFFFF" fill-opacity="0.6"/>
        </svg>`;

      case 'articles':
        return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 7L53 19L32 31L11 19L32 7Z" fill="#F59E0B"/>
          <path d="M11 19L32 31V57L11 45V19Z" fill="#714B67"/>
          <path d="M53 19L32 31V57L53 45V19Z" fill="#9333EA"/>
        </svg>`;

      case 'bons-commande':
        return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="8" width="44" height="48" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5"/>
          <rect x="22" y="6" width="20" height="6" rx="3" fill="#00A09D"/>
          <path d="M18 24H46M18 32H40M18 40H32" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round"/>
          <circle cx="44" cy="44" r="12" fill="#00A09D"/>
          <path d="M39 44L42.5 47.5L49 41" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;

      case 'bons-reception':
        return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 9L52 20L32 31L12 20L32 9Z" fill="#38BDF8"/>
          <path d="M12 20L32 31V55L12 44V20Z" fill="#0284C7"/>
          <path d="M52 20L32 31V55L52 44V20Z" fill="#0369A1"/>
          <circle cx="32" cy="32" r="11" fill="#10B981" stroke="#FFFFFF" stroke-width="2"/>
          <path d="M28 32L31 35L36 29" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;

      case 'organismes-assurance':
        return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 8L50 15V32C50 43.5 42 52.5 32 56C22 52.5 14 43.5 14 32V15L32 8Z" fill="url(#assGrad)"/>
          <path d="M32 20V40M22 30H42" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round"/>
          <defs>
            <linearGradient id="assGrad" x1="14" y1="8" x2="50" y2="56" gradientUnits="userSpaceOnUse">
              <stop stop-color="#2563EB"/>
              <stop offset="1" stop-color="#059669"/>
            </linearGradient>
          </defs>
        </svg>`;

      case 'users':
        return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="22" cy="22" r="7" fill="#F59E0B"/>
          <circle cx="42" cy="22" r="7" fill="#00A09D"/>
          <circle cx="32" cy="32" r="8" fill="#714B67"/>
          <path d="M12 44C12 39 16 36 22 36C25 36 27 37 29 39C25 41 23 45 23 50H12V44Z" fill="#F59E0B"/>
          <path d="M52 44C52 39 48 36 42 36C39 36 37 37 35 39C39 41 41 45 41 50H52V44Z" fill="#00A09D"/>
          <path d="M20 52C20 45.3726 25.3726 40 32 40C38.6274 40 44 45.3726 44 52V54H20V52Z" fill="#714B67"/>
        </svg>`;

      case 'roles':
        return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 8L48 15V32C48 42 41 50 32 54C23 50 16 42 16 32V15L32 8Z" fill="#4338CA"/>
          <circle cx="32" cy="26" r="6" fill="#F43F5E"/>
          <path d="M26 40C26 36.6863 28.6863 34 32 34C35.3137 34 38 36.6863 38 40V42H26V40Z" fill="#F43F5E"/>
        </svg>`;

      case 'permissions':
        return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="18" y="24" width="28" height="26" rx="6" fill="#F59E0B"/>
          <path d="M24 24V18C24 13.5817 27.5817 10 32 10C36.4183 10 40 13.5817 40 18V24" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round"/>
          <circle cx="32" cy="35" r="3.5" fill="#FFFFFF"/>
          <path d="M32 38.5V43" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
        </svg>`;

      case 'medecins':
        return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="22" r="10" fill="#0284C7"/>
          <path d="M16 48C16 39.1634 23.1634 32 32 32C40.8366 32 48 39.1634 48 48V52H16V48Z" fill="#E2E8F0"/>
          <path d="M26 32L32 40L38 32" stroke="#00A09D" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="32" cy="44" r="3" fill="#00A09D"/>
        </svg>`;

      case 'secretaires':
        return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="22" r="10" fill="#EC4899"/>
          <path d="M22 22C22 16.4772 26.4772 12 32 12C37.5228 12 42 16.4772 42 22V26H40" stroke="#714B67" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M16 48C16 39.1634 23.1634 32 32 32C40.8366 32 48 39.1634 48 48V52H16V48Z" fill="#714B67"/>
        </svg>`;

      case 'audit':
        return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="44" height="44" rx="10" fill="#1E40AF"/>
          <circle cx="32" cy="32" r="14" fill="#FFFFFF"/>
          <path d="M32 24V32L37 36" stroke="#1E40AF" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="32" cy="32" r="2" fill="#1E40AF"/>
        </svg>`;

      case 'assistant':
        return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 6C32 20.3594 43.6406 32 58 32C43.6406 32 32 43.6406 32 58C32 43.6406 20.3594 32 6 32C20.3594 32 32 20.3594 32 6Z" fill="url(#aiGrad)"/>
          <path d="M47 11C47 15.5 50.5 19 55 19C50.5 19 47 22.5 47 27C47 22.5 43.5 19 39 19C43.5 19 47 15.5 47 11Z" fill="#FBBF24"/>
          <defs>
            <linearGradient id="aiGrad" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
              <stop stop-color="#F43F5E"/>
              <stop offset="0.5" stop-color="#8B5CF6"/>
              <stop offset="1" stop-color="#06B6D4"/>
            </linearGradient>
          </defs>
        </svg>`;

      case 'rapports':
        return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="19" height="19" rx="5" fill="#EC4899"/>
          <rect x="35" y="10" width="19" height="19" rx="5" fill="#00A09D"/>
          <rect x="10" y="35" width="19" height="19" rx="5" fill="#3B82F6"/>
          <rect x="35" y="35" width="19" height="19" rx="5" fill="#F59E0B"/>
          <rect x="15" y="19" width="9" height="3" rx="1.5" fill="#FFFFFF"/>
          <rect x="40" y="15" width="9" height="9" rx="2" fill="#FFFFFF"/>
          <circle cx="19.5" cy="44.5" r="4.5" fill="#FFFFFF"/>
          <path d="M40 46L43 49L49 43" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;

      case 'parametres':
        return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 10L49 20V40L32 50L15 40V20L32 10Z" fill="#F97316"/>
          <path d="M32 17L43 23.5V36.5L32 43L21 36.5V23.5L32 17Z" fill="#FFFFFF"/>
          <circle cx="32" cy="30" r="7" fill="#714B67"/>
        </svg>`;

      case 'discussion':
        return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="30" r="22" fill="#F97316"/>
          <path d="M32 52L20 48L14 38C16 46 23 52 32 52Z" fill="#EA580C"/>
          <ellipse cx="25" cy="30" rx="3" ry="3" fill="#FFFFFF"/>
          <ellipse cx="32" cy="30" rx="3" ry="3" fill="#FFFFFF"/>
          <ellipse cx="39" cy="30" rx="3" ry="3" fill="#FFFFFF"/>
        </svg>`;

      case 'documents-medicaux':
        return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="14" y="8" width="36" height="48" rx="6" fill="#00A09D"/>
          <rect x="10" y="14" width="36" height="44" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
          <path d="M34 14V34L40 30L46 34V14H34Z" fill="#714B67"/>
          <line x1="16" y1="26" x2="28" y2="26" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>
          <line x1="16" y1="33" x2="28" y2="33" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round"/>
          <line x1="16" y1="40" x2="38" y2="40" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round"/>
        </svg>`;

      case 'dossiers-medicaux':
        return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="16" width="48" height="38" rx="8" fill="#3B82F6"/>
          <path d="M18 16V10C18 8.89543 18.8954 8 20 8H36C37.1046 8 38 8.89543 38 10V16H18Z" fill="#1D4ED8"/>
          <rect x="14" y="22" width="36" height="26" rx="6" fill="#FFFFFF" fill-opacity="0.9"/>
          <path d="M32 28V42M25 35H39" stroke="#3B82F6" stroke-width="2.5" stroke-linecap="round"/>
        </svg>`;

      case 'lignes-prescription':
        return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="rotate(-45 32 32)">
            <rect x="20" y="14" width="24" height="18" rx="12" fill="#F59E0B"/>
            <rect x="20" y="32" width="24" height="18" rx="12" fill="#00A09D"/>
            <line x1="20" y1="32" x2="44" y2="32" stroke="#FFFFFF" stroke-width="2"/>
          </g>
        </svg>`;

      case 'export':
        return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="44" height="44" rx="12" fill="url(#expGrad)"/>
          <path d="M32 20V36M32 36L25 29M32 36L39 29" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M22 42H42" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
          <defs>
            <linearGradient id="expGrad" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
              <stop stop-color="#10B981"/>
              <stop offset="1" stop-color="#059669"/>
            </linearGradient>
          </defs>
        </svg>`;

      default:
        return `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="44" height="44" rx="10" fill="#714B67"/>
          <circle cx="32" cy="32" r="10" fill="#FFFFFF"/>
        </svg>`;
    }
  }

  track(_: number, m: ModuleDef): string {
    return m.key;
  }

  // ICONES
  iconFor(key: string): SafeHtml {
    const cached = this.iconCache.get(key);
    if (cached) return cached;
    const safe = this.sanitizer.bypassSecurityTrustHtml(this.buildIcon(key));
    this.iconCache.set(key, safe);
    return safe;
  }

  private buildIcon(key: string): string {
    const paths: Record<string, string> = {
      dashboard: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
      users: '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
      roles: '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="m17 11 2 2 4-4"/>',
      permissions: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
      medecins: '<path d="M8 3v5a4 4 0 0 0 8 0V3"/><path d="M6 3h4M14 3h4M12 12v3a4 4 0 0 0 8 0v-1"/><circle cx="20" cy="12" r="1"/>',
      secretaires: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 3v4h6V3M8 12h8M8 16h5"/>',
      patients: '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 8v6M17 11h6"/>',
      'dossiers-medicaux': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
      appointments: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18l-7 5-3-2-2 2"/>',
      consultations: '<path d="M11 2v6a4 4 0 0 0 8 0V2"/><path d="M8 2H5v6a6 6 0 0 0 12 0M15 22v-3a4 4 0 0 1 4-4h1"/><circle cx="21" cy="15" r="1"/>',
      'documents-medicaux': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
      prescriptions: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 14h8M12 10v8"/>',
      'lignes-prescription': '<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>',
      'brouillons-ia': '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z"/><path d="m19 14 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z"/>',
      billing: '<path d="M4 3h16v18l-3-2-3 2-2-2-3 2-2-2-3 2V3Z"/><path d="M8 8h8M8 12h8M8 16h4"/>',
      'lignes-facture': '<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>',
      paiements: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M7 15h3"/>',
      audit: '<path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
      fournisseurs: '<path d="M3 21V7l9-4 9 4v14"/><path d="M9 21v-6h6v6M7 9h2M15 9h2"/>',
      'bons-commande': '<path d="M6 2h9l5 5v15H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
      'lignes-commande': '<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>',
      'bons-reception': '<path d="M21 8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
      'factures-fournisseurs': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
      articles: '<path d="M4 4h16v16H4z"/><path d="M9 4v16M15 4v16M4 10h16"/>',
      medicaments: '<path d="m10 14 4-4"/><path d="M7 17a5 5 0 0 1 0-7l3-3a5 5 0 0 1 7 7l-3 3a5 5 0 0 1-7 0Z"/>',
      lots: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9M15 9v12"/>',
      'mouvements-stock': '<path d="M7 7h14l-4-4M17 17H3l4 4"/>',
      inventaires: '<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>',
      'organismes-assurance': '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="M12 8v8M8 12h8"/>',
      'couvertures-medicales': '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="M9 12h6M12 9v6"/>',
      'feuilles-soins': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M12 9v8"/>',
      'dossiers-remboursement': '<path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5M12 8v4l3 2"/>',
      assistant: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z"/><path d="m19 14 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z"/>',
      parametres: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.5.9L16 21h-8l-.3-2.1a8 8 0 0 1-1.5-.9l-1.7.6-1.4-2.4 1.4-1.1a8 8 0 0 1 0-1.8l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.5-.9L8 3h8l.3 2.1a8 8 0 0 1 1.5.9l1.7-.6 1.4 2.4-1.4 1.1a8 8 0 0 1 0 1.8l1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.5.9L16 21"/>'
    };
    const content = paths[key] ?? '<path d="M12 3v18M3 12h18"/>';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${content}</svg>`;
  }

  // PERMISSIONS : CREATION ET MODIFICATION
  private savePermission(): void {
    const code = String(this.form['code'] ?? '').trim();
    const description = String(this.form['description'] ?? '').trim();
    if (!code) {
      this.toast = 'Le code de la permission est obligatoire.';
      return;
    }
    const data = {code, description};
    this.authBusy = true;
    const request = this.editingId
      ? this.authService.updatePermission(this.editingId, data)
      : this.authService.createPermission(data);
    request.subscribe({
      next: () => {
        const action = this.editingId ? 'Modification' : 'Création';
        this.authBusy = false;
        this.modalOpen = false;
        this.toast = this.editingId
          ? 'Permission modifiée avec succès.'
          : 'Permission créée avec succès.';
        this.recordAction(action, 'Permission · ' + code);
        this.loadPermissions();
        this.loadRolePermissions();
      },
      error: (error) => {
        this.authBusy = false;
        this.toast =
          error?.error?.code?.[0] ||
          error?.error?.detail ||
          'Impossible d’enregistrer cette permission.';
        console.error('Erreur enregistrement permission:', error);
      }
    });
  }

  // TABLEAUX ET DONNEES
  lowStockCount(): number {
    return (this.records['articles'] ?? []).filter(r =>
      Number(r['quantiteStock'] ?? 0) <= Number(r['seuilAlerte'] ?? 0)
    ).length;
  }

  optionsFor(field: FieldDef): {value: string; label: string}[] {
    const linked: Record<string, string> = {
      patientId: 'patients',
      rendezVousId: 'appointments',
      medecinId: 'medecins',
      utilisateurId: 'users',
      fournisseurId: 'fournisseurs',
      articleId: 'articles',
      bonCommandeId: 'bons-commande',
      factureId: 'billing',
      ordonnanceId: 'prescriptions',
      consultationId: 'consultations',
      medicamentId: 'medicaments',
      organismeId: 'organismes-assurance',
      feuilleDeSoinsId: 'feuilles-soins',
      roleId: 'roles'
    };
    const sourceKey = linked[field.key];
    if (sourceKey) {
      return (this.records[sourceKey] ?? []).map(row => {
        const value = String(row['id'] ?? '');
        const label = String(row['nom'] ?? row['designation'] ?? row['type'] ?? row['id'] ?? '');
        return {value, label: `${value} · ${label}`};
      });
    }
    return (field.options ?? []).map(value => ({value, label: value}));
  }

  statusClass(value: unknown): string {
    const s = String(value ?? '').toLocaleLowerCase('fr');
    if (['payée', 'confirmé', 'terminée', 'acceptée', 'remboursé', 'reçu', 'actif', 'validé', 'complet'].some(v => s.includes(v))) return 'status-positive';
    if (['attente', 'brouillon', 'cours', 'partiel', 'à suivre', 'transmise', 'préparé'].some(v => s.includes(v))) return 'status-pending';
    if (['retard', 'annulé', 'refusé', 'rejeté', 'inactif', 'litige'].some(v => s.includes(v))) return 'status-negative';
    return 'status-neutral';
  }

  notify(message: string): void {
    this.toast = message;
  }

  // ASSISTANT IA
  saveAssistantDraft(): void {
    const contenu = this.assistantText.trim();
    if (!contenu) {
      this.toast = 'Saisissez un contenu avant d’enregistrer le brouillon.';
      return;
    }
    const data = {
      type: 'Note préparée',
      contenu,
      dateCreation: new Date().toISOString().slice(0, 10)
    };
    this.authService.createModuleRecord('brouillons-ia', data).subscribe({
      next: (created: any) => {
        this.records['brouillons-ia'] = [created, ...(this.records['brouillons-ia'] ?? [])];
        this.persist('brouillons-ia', this.records['brouillons-ia']);
        this.assistantText = '';
        this.toast = 'Brouillon enregistré dans Django et MySQL.';
        this.recordAction('Création', 'Brouillons IA · Note préparée');
      },
      error: (error) => {
        console.error('Erreur enregistrement brouillon :', error);
        this.toast = error?.error?.detail || 'Impossible d’enregistrer le brouillon dans Django.';
      }
    });
  }

  // PATIENTS
  patientName(id: unknown): string {
    const p = (this.records['patients'] ?? []).find(x => String(x['id']) === String(id));
    return String(p?.['nom'] ?? id ?? 'Patient inconnu');
  }

  patientAppointments(id: unknown): RecordData[] {
    return (this.records['appointments'] ?? [])
      .filter(x => String(x['patientId']) === String(id))
      .sort((a, b) => String(b['date']).localeCompare(String(a['date'])));
  }

  patientConsultations(id: unknown): RecordData[] {
    return (this.records['consultations'] ?? [])
      .filter(x => String(x['patientId']) === String(id))
      .sort((a, b) => String(b['date']).localeCompare(String(a['date'])));
  }

  openPatient(row: RecordData): void { this.selectedPatient = row; }
  closePatient(): void { this.selectedPatient = null; }
  patientInitial(row: RecordData): string { return String(row['nom'] ?? 'P').charAt(0).toUpperCase(); }

  // CALENDRIER
  appointmentsFor(date: string): RecordData[] {
    return (this.records['appointments'] ?? [])
      .filter(r => String(r['date']) === date)
      .sort((a, b) => String(a['heure'] ?? '').localeCompare(String(b['heure'] ?? '')));
  }

  shiftCalendar(delta: number): void {
    const d = new Date(this.calendarDate + 'T12:00:00');
    d.setDate(d.getDate() + delta);
    this.calendarDate = d.toISOString().slice(0, 10);
  }

  goToday(): void { this.calendarDate = new Date().toISOString().slice(0, 10); }

  get calendarDays(): {date: string; label: string}[] {
    const base = new Date(this.calendarDate + 'T12:00:00');
    const start = new Date(base);
    if (this.calendarMode === 'week') {
      start.setDate(base.getDate() - ((base.getDay() + 6) % 7));
    } else if (this.calendarMode === 'month') {
      start.setDate(1);
    }
    const total = this.calendarMode === 'day'
      ? 1
      : this.calendarMode === 'week'
        ? 7
        : new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
    return Array.from({length: total}, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      return {
        date: iso,
        label: d.toLocaleDateString('fr-FR', {weekday: 'short', day: '2-digit', month: 'short'})
      };
    });
  }

  get upcomingAppointments(): RecordData[] {
    const today = new Date().toISOString().slice(0, 10);
    return (this.records['appointments'] ?? [])
      .filter(r => String(r['date']) >= today && r['statut'] !== 'Annulé')
      .sort((a, b) => (String(a['date']) + String(a['heure'])).localeCompare(String(b['date']) + String(b['heure'])))
      .slice(0, 6);
  }

  // FINANCE ET RAPPORTS
  get totalRevenue(): number {
    return (this.records['billing'] ?? []).reduce((s, r) => s + Number(r['montant'] ?? 0), 0);
  }

  get totalCollected(): number {
    return (this.records['paiements'] ?? []).reduce((s, r) => s + Number(r['montant'] ?? 0), 0)
      + (this.records['billing'] ?? []).reduce((s, r) => s + Number(r['montantPaye'] ?? 0), 0);
  }

  get unpaidTotal(): number { return Math.max(0, this.totalRevenue - this.totalCollected); }

  get reportInvoices(): RecordData[] {
    return (this.records['billing'] ?? []).filter(r =>
      String(r['date'] ?? '') >= this.reportStart && String(r['date'] ?? '') <= this.reportEnd
    );
  }

  get reportRevenue(): number {
    return this.reportInvoices.reduce((s, r) => s + Number(r['montant'] ?? 0), 0);
  }

  get reportAppointments(): number {
    return (this.records['appointments'] ?? []).filter(r =>
      String(r['date'] ?? '') >= this.reportStart && String(r['date'] ?? '') <= this.reportEnd
    ).length;
  }

  // IMPRESSION
  printDocument(kind: 'invoice'|'prescription', row: RecordData): void {
    const patientId = kind === 'invoice'
      ? row['patientId']
      : (this.records['consultations'] ?? []).find(c => String(c['id']) === String(row['consultationId']))?.['patientId'];
    const patient = this.patientName(patientId);
    const title = kind === 'invoice' ? 'Facture' : 'Ordonnance';
    const lines = kind === 'invoice'
      ? `<p>Prestation : ${this.escapeHtml(String(row['designation'] ?? 'Consultation'))}</p>
         <p>Montant : ${Number(row['montant'] ?? 0).toFixed(2)} DH</p>
         <p>Déjà payé : ${Number(row['montantPaye'] ?? 0).toFixed(2)} DH</p>`
      : (this.records['lignes-prescription'] ?? [])
          .filter(x => String(x['ordonnanceId']) === String(row['id']))
          .map(x => `<p>${this.escapeHtml(this.display(x['medicamentId']))}
            — ${this.escapeHtml(String(x['posologie'] ?? ''))}
            (${this.escapeHtml(String(x['duree'] ?? ''))})</p>`)
          .join('') || '<p>Aucun médicament renseigné.</p>';
    const w = window.open('', '_blank', 'width=800,height=700');
    if (!w) {
      this.notify('Autorisez les fenêtres pop-up pour imprimer.');
      return;
    }
    w.document.write(`
      <!doctype html>
      <html lang="fr">
      <meta charset="utf-8">
      <title>${title} MediCAB</title>
      <style>
        body{font:15px Arial;padding:40px;color:#17243b}
        h1{color:#315fe8}
        hr{border:0;border-top:1px solid #ddd;margin:24px 0}
        .muted{color:#68758a}
      </style>
      <h1>MediCAB</h1>
      <p class="muted">Medical Management</p>
      <hr>
      <h2>${title}</h2>
      <p>Patient : ${this.escapeHtml(patient)}</p>
      <p>Date : ${this.escapeHtml(String(row['date'] ?? new Date().toISOString().slice(0, 10)))}</p>
      ${lines}
      <hr>
      <p>Document généré depuis le prototype MediCAB.</p>
      <script>window.onload=()=>window.print()<\/script>
      </html>
    `);
    w.document.close();
  }

  private escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, c =>
      ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c] ?? c)
    );
  }

  // JOURNAL D'ACTIVITÉ
  recordAction(action: string, detail: string): void {
    const actionCodes: Record<string, string> = {
      'Création': 'CREATE',
      'Modification': 'UPDATE',
      'Suppression': 'DELETE'
    };
    const parts = detail.split(' · ');
    const data = {
      action: actionCodes[action] ?? action,
      module: parts[0] || 'Application',
      description: parts.slice(1).join(' · ') || detail
    };

    this.authService.createAuditLog(data).subscribe({
      next: () => {
        if (this.activeKey === 'audit') this.loadAuditLogs();
      },
      error: (error) => {
        console.error('Erreur enregistrement activité :', error);
        this.toast = 'L’action est effectuée, mais son journal n’a pas pu être enregistré.';
      }
    });
  }

  count(key: string): number {
    return (this.records[key] ?? []).length;
  }

  // CREATION ET MODIFICATION DES MODULES
  createPatient(): void {
    this.go('patients');
    this.openCreate();
  }

  openCreate(): void {
    this.editingId = '';
    this.form = {};
    for (const f of this.activeModule?.fields ?? []) {
      this.form[f.key] =
        f.type === 'boolean' ? true
          : f.type === 'number' ? 0
            : f.key === 'date' && this.activeKey === 'appointments' ? this.calendarDate
              : f.key === 'heure' ? '09:00'
                : f.type === 'select' ? (f.options?.[0] ?? '')
                  : '';
    }
    this.modalOpen = true;
  }

  openEdit(row: RecordData): void {
    this.editingId = String(row['id'] ?? '');
    this.form = {...row};
    this.modalOpen = true;
  }

  save(): void {
    const m = this.activeModule;
    if (!m) return;
    if (m.key === 'users') { this.saveUser(); return; }
    if (m.key === 'permissions') { this.savePermission(); return; }
    if (m.key === 'roles') {
      this.toast = 'Les rôles sont définis dans Django. Leur création nécessite une modification du modèle backend.';
      return;
    }
    if (m.key === 'medecins' || m.key === 'secretaires') {
      this.toast = 'Les profils professionnels sont gérés à partir des comptes utilisateurs Django.';
      return;
    }
    if (m.key === 'audit') {
      this.toast = 'Le journal d’activité est alimenté automatiquement par Django.';
      return;
    }

    for (const f of m.fields) {
      if (f.required && !String(this.form[f.key] ?? '').trim()) {
        this.toast = `Le champ « ${f.label} » est obligatoire.`;
        return;
      }
    }

    if (m.key === 'appointments') {
      const conflict = (this.records['appointments'] ?? []).some(r =>
        String(r['id']) !== this.editingId &&
        r['date'] === this.form['date'] &&
        r['heure'] === this.form['heure'] &&
        (!this.form['medecinId'] || r['medecinId'] === this.form['medecinId']) &&
        r['statut'] !== 'Annulé'
      );
      if (conflict) {
        this.toast = 'Ce créneau est déjà réservé pour ce médecin.';
        return;
      }
    }

    if (m.key === 'paiements') {
      const invoice = (this.records['billing'] ?? []).find(r => String(r['id']) === String(this.form['factureId']));
      if (invoice) {
        const already = (this.records['paiements'] ?? [])
          .filter(r => String(r['factureId']) === String(this.form['factureId']) && String(r['id']) !== this.editingId)
          .reduce((sum, r) => sum + Number(r['montant'] ?? 0), 0)
          + Number(invoice['montantPaye'] ?? 0);
        const due = Math.max(0, Number(invoice['montant'] ?? 0) - Number(invoice['remise'] ?? 0) - already);
        if (Number(this.form['montant'] ?? 0) > due) {
          this.toast = `Le paiement dépasse le solde restant (${due.toFixed(2)} DH).`;
          return;
        }
      }
    }

    if (m.key === 'mouvements-stock' && String(this.form['type'] ?? '').toLocaleLowerCase('fr').includes('sortie')) {
      const article = (this.records['articles'] ?? []).find(r => String(r['id']) === String(this.form['articleId']));
      let available = Number(article?.['quantiteStock'] ?? 0);
      const oldMovement = (this.records['mouvements-stock'] ?? []).find(r => String(r['id']) === this.editingId);
      if (oldMovement && String(oldMovement['articleId']) === String(this.form['articleId']) && oldMovement['stockBefore'] !== undefined) {
        const oldQty = Math.abs(Number(oldMovement['quantite'] ?? 0));
        const oldType = String(oldMovement['type'] ?? '').toLocaleLowerCase('fr');
        available = oldType.includes('entrée') ? available - oldQty : oldType.includes('sortie') ? available + oldQty : Number(oldMovement['stockBefore']);
      }
      if (article && Number(this.form['quantite'] ?? 0) > available) {
        this.toast = 'Stock insuffisant pour cette sortie.';
        return;
      }
    }

    const wasEditing = Boolean(this.editingId);
    const oldRow = wasEditing
      ? (this.records[m.key] ?? []).find(r => String(r['id']) === this.editingId)
      : undefined;
    const payload: RecordData = {...this.form};
    delete payload['id'];

    // Les mouvements conservent le stock précédent pour permettre une annulation fiable.
    if (m.key === 'mouvements-stock') {
      const oldArticle = oldRow
        ? (this.records['articles'] ?? []).find(a => String(a['id']) === String(oldRow['articleId']))
        : undefined;
      if (oldArticle && oldRow?.['stockBefore'] !== undefined) {
        oldArticle['quantiteStock'] = Number(oldRow['stockBefore']);
      }
      const targetArticle = (this.records['articles'] ?? []).find(a => String(a['id']) === String(payload['articleId']));
      payload['stockBefore'] = Number(targetArticle?.['quantiteStock'] ?? 0);
    }

    this.authBusy = true;
    const request = wasEditing
      ? this.authService.updateModuleRecord(m.key, this.editingId, payload)
      : this.authService.createModuleRecord(m.key, payload);

    request.subscribe({
      next: (response: any) => {
        const saved: RecordData = {...response};
        if (!saved['id'] && wasEditing) saved['id'] = this.editingId;
        const current = [...(this.records[m.key] ?? [])];
        if (wasEditing) {
          const index = current.findIndex(r => String(r['id']) === this.editingId);
          if (index >= 0) current[index] = saved;
          else current.unshift(saved);
        } else {
          current.unshift(saved);
        }
        this.persist(m.key, current);

        this.authBusy = false;
        this.modalOpen = false;
        this.editingId = '';
        this.toast = wasEditing
          ? 'Modification enregistrée dans Django et MySQL.'
          : 'Enregistrement créé dans Django et MySQL.';

        if (m.key === 'paiements') {
          const newInvoiceId = String(saved['factureId'] ?? payload['factureId'] ?? '');
          this.recalculateInvoice(newInvoiceId);
          const previousInvoiceId = String(oldRow?.['factureId'] ?? '');
          if (wasEditing && previousInvoiceId && previousInvoiceId !== newInvoiceId) {
            this.recalculateInvoice(previousInvoiceId);
          }
        }
        if (m.key === 'mouvements-stock') {
          const previousArticleId = String(oldRow?.['articleId'] ?? '');
          const currentArticleId = String(saved['articleId'] ?? payload['articleId'] ?? '');
          if (wasEditing && previousArticleId && previousArticleId !== currentArticleId) {
            const previousArticle = (this.records['articles'] ?? []).find(a => String(a['id']) === previousArticleId);
            if (previousArticle) {
              this.updateRelatedRecord('articles', previousArticle, 'Le mouvement a été modifié, mais le stock de l’ancien article doit être vérifié.');
            }
          }
          this.applyStockMovement(saved);
        }

        if (m.key === 'appointments' && saved['patientId']) {
          const patient = (this.records['patients'] ?? []).find(p => String(p['id']) === String(saved['patientId']));
          if (patient) {
            patient['derniereVisite'] = String(saved['date'] ?? patient['derniereVisite'] ?? '');
            this.updateRelatedRecord('patients', patient, 'La date de dernière visite du patient n’a pas pu être synchronisée.');
          }
        }

        this.recordAction(wasEditing ? 'Modification' : 'Création', m.title + ' · ' + String(saved['nom'] ?? saved['motif'] ?? saved['id'] ?? ''));
      },
      error: (error) => {
        this.authBusy = false;
        console.error(`Erreur d’enregistrement du module ${m.key} :`, error);
        this.toast = error?.error?.detail || error?.error?.message || `Impossible d’enregistrer ${m.title} dans Django.`;
        // Réinitialise les données métier depuis le serveur après un échec potentiel.
        this.authService.getModuleRecords(m.key).subscribe({
          next: (data: any) => { this.records[m.key] = this.toList(data) as RecordData[]; },
          error: () => undefined
        });
        if (m.key === 'mouvements-stock') {
          this.authService.getModuleRecords('articles').subscribe({
            next: (data: any) => { this.records['articles'] = this.toList(data) as RecordData[]; },
            error: () => undefined
          });
        }
      }
    });
  }

  /** Synchronise une modification d’un enregistrement lié avec l’API Django. */
  private updateRelatedRecord(moduleKey: string, row: RecordData, warning: string): void {
    const id = String(row['id'] ?? '');
    if (!id) return;
    const payload: RecordData = {...row};
    delete payload['id'];
    this.authService.updateModuleRecord(moduleKey, id, payload).subscribe({
      next: (updated: any) => {
        const rows = [...(this.records[moduleKey] ?? [])];
        const index = rows.findIndex(item => String(item['id']) === id);
        if (index >= 0) rows[index] = {...updated};
        this.persist(moduleKey, rows);
      },
      error: (error) => {
        console.error(`Erreur de synchronisation ${moduleKey}:`, error);
        this.toast = warning;
      }
    });
  }

  // ENREGISTREMENT UTILISATEUR DJANGO
  private saveUser(): void {
    const email = String(this.form['email'] ?? '').trim().toLowerCase();
    const fullName = String(this.form['nom'] ?? '').trim();
    const role = String(this.form['role'] ?? '');
    const password = String(this.form['password'] ?? '');
    const phone = String(this.form['telephone'] ?? '').trim();
    const parts = fullName.split(/\s+/);
    const first_name = parts.shift() ?? '';
    const last_name = parts.join(' ');

    if (!fullName || !email || !role) {
      this.toast = 'Veuillez remplir le nom, l’adresse e-mail et le rôle.';
      return;
    }
    if (!last_name) {
      this.toast = 'Veuillez saisir le prénom et le nom.';
      return;
    }
    if (!this.editingId && password.length < 8) {
      this.toast = 'Le mot de passe doit contenir au moins 8 caractères.';
      return;
    }
    if (this.editingId && password && password.length < 8) {
      this.toast = 'Le nouveau mot de passe doit contenir au moins 8 caractères.';
      return;
    }

    const data: any = {email, first_name, last_name, phone, role, is_active: Boolean(this.form['actif'])};
    if (password) data.password = password;
    this.authBusy = true;
    const request = this.editingId
      ? this.authService.updateUser(this.editingId, data)
      : this.authService.createUser({...data, password});

    request.subscribe({
      next: () => {
        const action = this.editingId ? 'Modification' : 'Création';
        this.authBusy = false;
        this.modalOpen = false;
        this.toast = this.editingId ? 'Utilisateur modifié avec succès.' : 'Utilisateur ajouté avec succès.';
        this.recordAction(action, 'Utilisateur · ' + fullName);
        this.loadUsers();
        this.loadDoctors();
        this.loadSecretaries();
      },
      error: (error) => {
        this.authBusy = false;
        const details = error?.error;
        this.toast =
          details?.email?.[0] ||
          details?.password?.[0] ||
          details?.role?.[0] ||
          details?.detail ||
          'Échec de l’enregistrement de l’utilisateur.';
        console.error('Erreur enregistrement utilisateur:', error);
      }
    });
  }

  // SUPPRESSION
  remove(row: RecordData): void {
    const m = this.activeModule;
    if (!m || !confirm('Supprimer cet enregistrement ?')) return;

    if (m.key === 'users') {
      this.authService.deleteUser(String(row['id'])).subscribe({
        next: () => {
          this.recordAction('Suppression', 'Utilisateur · ' + String(row['nom'] ?? row['id']));
          this.toast = 'Utilisateur supprimé avec succès.';
          this.loadUsers(); this.loadDoctors(); this.loadSecretaries();
        },
        error: (error) => { this.toast = error?.error?.detail || 'Impossible de supprimer cet utilisateur.'; }
      });
      return;
    }
    if (m.key === 'permissions') {
      this.authService.deletePermission(String(row['id'])).subscribe({
        next: () => {
          this.recordAction('Suppression', 'Permission · ' + String(row['code'] ?? row['id']));
          this.toast = 'Permission supprimée avec succès.';
          this.loadPermissions(); this.loadRolePermissions();
        },
        error: (error) => { this.toast = error?.error?.detail || 'Impossible de supprimer cette permission.'; }
      });
      return;
    }
    if (m.key === 'roles' || m.key === 'medecins' || m.key === 'secretaires' || m.key === 'audit') {
      this.toast = 'Ce module est géré par les fonctions d’administration Django et ne peut pas être supprimé ici.';
      return;
    }

    const id = String(row['id'] ?? '');
    if (!id) { this.toast = 'Identifiant absent : suppression impossible.'; return; }

    this.authService.deleteModuleRecord(m.key, id).subscribe({
      next: () => {
        this.persist(m.key, (this.records[m.key] ?? []).filter(r => String(r['id']) !== id));
        if (m.key === 'mouvements-stock') {
          const article = (this.records['articles'] ?? []).find(a => String(a['id']) === String(row['articleId']));
          if (article && row['stockBefore'] !== undefined) {
            article['quantiteStock'] = Number(row['stockBefore']);
            this.updateRelatedRecord('articles', article, 'Mouvement supprimé, mais le stock de l’article doit être vérifié.');
          }
        }
        if (m.key === 'paiements') this.recalculateInvoice(String(row['factureId'] ?? ''));
        this.recordAction('Suppression', m.title + ' · ' + id);
        this.toast = 'Enregistrement supprimé de Django et MySQL.';
      },
      error: (error) => {
        console.error(`Erreur suppression ${m.key}:`, error);
        this.toast = error?.error?.detail || `Impossible de supprimer cet enregistrement de ${m.title}.`;
      }
    });
  }

  // FACTURES ET PAIEMENTS
  recalculateInvoice(invoiceId: string): void {
    const invoice = (this.records['billing'] ?? []).find(r => String(r['id']) === invoiceId);
    if (!invoice) return;
    const paid = (this.records['paiements'] ?? [])
      .filter(p => String(p['factureId']) === invoiceId)
      .reduce((sum, p) => sum + Number(p['montant'] ?? 0), 0)
      + Number(invoice['montantPaye'] ?? 0);
    const total = Number(invoice['montant'] ?? 0) - Number(invoice['remise'] ?? 0);
    invoice['statut'] = paid >= total ? 'Payée' : paid > 0 ? 'Partiellement payée' : 'En attente';
    this.updateRelatedRecord('billing', invoice, 'Paiement enregistré, mais le statut de la facture n’a pas pu être synchronisé.');
  }

  // GESTION DU STOCK
  applyStockMovement(data: RecordData): void {
    const article = (this.records['articles'] ?? []).find(a => String(a['id']) === String(data['articleId']));
    if (!article) return;
    const qty = Math.abs(Number(data['quantite'] ?? 0));
    const movement = String(data['type'] ?? '').toLocaleLowerCase('fr');
    const next = movement.includes('ajustement')
      ? qty
      : Number(article['quantiteStock'] ?? 0) + (movement.includes('entrée') ? qty : -qty);
    article['quantiteStock'] = Math.max(0, next);
    this.updateRelatedRecord('articles', article, 'Mouvement enregistré, mais le stock de l’article n’a pas pu être synchronisé.');
  }

  // EXPORTATION ET REINITIALISATION
  exportData(): void {
    const blob = new Blob([JSON.stringify(this.records, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'medicab-donnees-locales.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  reset(): void {
    if (!confirm('Effacer toutes les données locales de démonstration ?')) return;
    for (const m of this.modules) {
      localStorage.removeItem('medicab.module.' + m.key);
      this.records[m.key] = [];
    }
    this.toast = 'Données locales réinitialisées.';
  }

  totalRecords(): number {
    return Object.values(this.records).reduce((sum, rows) => sum + rows.length, 0);
  }

  display(value: unknown): string {
    return value === undefined || value === null || value === ''
      ? '—'
      : typeof value === 'boolean' ? (value ? 'Oui' : 'Non') : String(value);
  }

  displayField(field: FieldDef, row: RecordData): string {
    const linked: Record<string, string> = {
      patientId: 'patients',
      utilisateurId: 'users',
      fournisseurId: 'fournisseurs',
      articleId: 'articles',
      bonCommandeId: 'bons-commande',
      factureId: 'billing',
      ordonnanceId: 'prescriptions',
      consultationId: 'consultations',
      medicamentId: 'medicaments',
      organismeId: 'organismes-assurance',
      feuilleDeSoinsId: 'feuilles-soins',
      roleId: 'roles',
      rendezVousId: 'appointments',
      medecinId: 'medecins'
    };
    const key = linked[field.key];
    if (!key || !row[field.key]) return this.display(row[field.key]);
    const found = (this.records[key] ?? []).find(r => String(r['id']) === String(row[field.key]));
    return found
      ? `${this.display(found['nom'] ?? found['name'] ?? found['designation'] ?? found['id'])}`
      : this.display(row[field.key]);
  }

  // STOCKAGE LOCAL
  private read(key: string, fallback: RecordData[] = []): RecordData[] {
    try {
      const raw = localStorage.getItem('medicab.module.' + key);
      if (raw !== null) return JSON.parse(raw) as RecordData[];
      if (fallback.length) {
        localStorage.setItem('medicab.module.' + key, JSON.stringify(fallback));
      }
      return structuredClone(fallback);
    } catch {
      return structuredClone(fallback);
    }
  }

  private persist(key: string, rows: RecordData[]): void {
    this.records[key] = rows;
    localStorage.setItem('medicab.module.' + key, JSON.stringify(rows));
  }
}
