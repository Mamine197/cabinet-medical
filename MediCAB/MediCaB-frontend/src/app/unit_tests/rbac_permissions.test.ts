import { describe, it, expect } from 'vitest';

export type UserRole = 'Administrateur' | 'Médecin' | 'Secrétaire';

export const ALL_APPS = [
  { key: 'dashboard', name: 'Tableaux de bord', roles: ['Administrateur', 'Médecin'] },
  { key: 'patients', name: 'Patients', roles: ['Administrateur', 'Médecin', 'Secrétaire'] },
  { key: 'appointments', name: 'Rendez-vous', roles: ['Administrateur', 'Médecin', 'Secrétaire'] },
  { key: 'consultations', name: 'Consultations', roles: ['Administrateur', 'Médecin'] },
  { key: 'dossiers', name: 'Dossiers médicaux', roles: ['Administrateur', 'Médecin'] },
  { key: 'prescriptions', name: 'Ordonnances', roles: ['Administrateur', 'Médecin'] },
  { key: 'medicaments', name: 'Médicaments', roles: ['Administrateur', 'Médecin'] },
  { key: 'billing', name: 'Facturation', roles: ['Administrateur', 'Secrétaire'] },
  { key: 'paiements', name: 'Paiements', roles: ['Administrateur', 'Secrétaire'] },
  { key: 'suppliers', name: 'Fournisseurs', roles: ['Administrateur', 'Secrétaire'] },
  { key: 'commandes', name: 'Commandes', roles: ['Administrateur', 'Secrétaire'] },
  { key: 'articles', name: 'Stock & Articles', roles: ['Administrateur', 'Secrétaire'] },
  { key: 'assistant', name: 'Assistant IA', roles: ['Administrateur', 'Médecin', 'Secrétaire'] },
  { key: 'audit', name: 'Journal d\'audit', roles: ['Administrateur'] },
  { key: 'users', name: 'Utilisateurs & rôles', roles: ['Administrateur'] },
];

export function getAuthorizedAppsForRole(role: UserRole) {
  return ALL_APPS.filter(app => app.roles.includes(role));
}

export function canAccessMedicalRecords(role: UserRole): boolean {
  return role === 'Administrateur' || role === 'Médecin';
}

describe('Matrice des Droits et Habilitations RBAC (Vitest Unit Tests)', () => {
  it('accorde les 15 applications à l\'Administrateur', () => {
    const apps = getAuthorizedAppsForRole('Administrateur');
    expect(apps.length).toBe(15);
    expect(apps.map(a => a.key)).toContain('users');
    expect(apps.map(a => a.key)).toContain('audit');
  });

  it('restreint le Médecin à ses applications cliniques et masque la gestion admin', () => {
    const apps = getAuthorizedAppsForRole('Médecin');
    expect(apps.length).toBe(8);
    const keys = apps.map(a => a.key);
    expect(keys).toContain('consultations');
    expect(keys).toContain('dossiers');
    expect(keys).not.toContain('users');
    expect(keys).not.toContain('audit');
    expect(keys).not.toContain('billing');
  });

  it('garantit le Secret Médical pour la Secrétaire (aucun dossier médical ni consultation)', () => {
    const apps = getAuthorizedAppsForRole('Secrétaire');
    const keys = apps.map(a => a.key);
    expect(keys).toContain('patients');
    expect(keys).toContain('appointments');
    expect(keys).toContain('billing');
    
    // Vérification stricte du secret médical
    expect(canAccessMedicalRecords('Secrétaire')).toBe(false);
    expect(keys).not.toContain('consultations');
    expect(keys).not.toContain('dossiers');
    expect(keys).not.toContain('prescriptions');
  });
});
