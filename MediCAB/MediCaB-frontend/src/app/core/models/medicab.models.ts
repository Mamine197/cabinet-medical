/** Modèles TypeScript alignés sur les classes du diagramme UML MediCAB. */
export interface Utilisateur { id: string; nom: string; email: string; roleId: string; actif: boolean; }
export interface Role { id: string; nom: string; description?: string; permissionIds: string[]; }
export interface Permission { id: string; code: string; description: string; }
export interface Medecin { utilisateurId: string; specialite: string; numeroOrdre?: string; }
export interface Secretaire { utilisateurId: string; telephone?: string; }
export interface Patient { id: string; nom: string; email: string; telephone: string; age: number; sexe: string; derniereVisite: string; statut: string; couleur: string; }
export interface DossierMedical { id: string; patientId: string; antecedents: string; allergies: string; groupeSanguin?: string; }
export interface RendezVous { id: string; patientId: string; date: string; heure: string; motif: string; statut: string; medecinId?: string; }
export interface Consultation { id: string; rendezVousId?: string; patientId: string; date: string; motif: string; notes: string; statut: string; }
export interface DocumentMedical { id: string; patientId: string; type: string; date: string; contenu: string; }
export interface Ordonnance { id: string; consultationId: string; date: string; statut: string; }
export interface LignePrescription { id: string; ordonnanceId: string; medicamentId: string; posologie: string; duree: string; quantite: number; }
export interface BrouillonIA { id: string; type: string; contenu: string; dateCreation: string; }
export interface Facture { id: string; patientId: string; date: string; montant: number; statut: string; }
export interface LigneFacture { id: string; factureId: string; designation: string; quantite: number; prixUnitaire: number; }
export interface Paiement { id: string; factureId: string; date: string; montant: number; mode: string; }
export interface EvenementAudit { id: string; date: string; utilisateur: string; action: string; detail: string; }
export interface Fournisseur { id: string; nom: string; telephone: string; email: string; }
export interface BonCommande { id: string; fournisseurId: string; date: string; statut: string; }
export interface LigneCommande { id: string; bonCommandeId: string; articleId: string; quantite: number; prixUnitaire: number; }
export interface BonReception { id: string; bonCommandeId: string; date: string; statut: string; }
export interface FactureFournisseur { id: string; fournisseurId: string; date: string; montant: number; statut: string; }
export interface Article { id: string; nom: string; reference: string; quantiteStock: number; seuilAlerte: number; }
export interface Medicament extends Article { dosage: string; forme: string; }
export interface Lot { id: string; articleId: string; numero: string; dateExpiration: string; quantite: number; }
export interface MouvementStock { id: string; articleId: string; type: string; quantite: number; date: string; }
export interface Inventaire { id: string; date: string; statut: string; }
export interface OrganismeAssurance { id: string; nom: string; contact?: string; }
export interface CouvertureMedicale { id: string; patientId: string; organismeId: string; numeroAdherent: string; tauxCouverture: number; }
export interface FeuilleDeSoins { id: string; patientId: string; date: string; montant: number; statut: string; }
export interface DossierRemboursement { id: string; feuilleDeSoinsId: string; dateEnvoi: string; statut: string; montantRembourse?: number; }
