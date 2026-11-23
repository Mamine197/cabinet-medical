import { describe, it, expect } from 'vitest';

export interface PatientInput {
  nom: string;
  prenom: string;
  cin: string;
  telephone: string;
  email: string;
  date_naissance: string;
}

export function validatePatient(p: Partial<PatientInput>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!p.nom || p.nom.trim().length < 2) errors.push('Le nom doit comporter au moins 2 caractères.');
  if (!p.prenom || p.prenom.trim().length < 2) errors.push('Le prénom doit comporter au moins 2 caractères.');
  if (!p.telephone || !/^[0-9+\s-]{8,15}$/.test(p.telephone)) errors.push('Numéro de téléphone invalide.');
  if (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) errors.push('Format e-mail invalide.');
  return { valid: errors.length === 0, errors };
}

export function formatPatientFullName(nom: string, prenom: string): string {
  return `${nom.toUpperCase()} ${prenom.charAt(0).toUpperCase() + prenom.slice(1).toLowerCase()}`;
}

describe('Validation des Données Patients (Vitest Unit Tests)', () => {
  it('valide un patient avec toutes les données conformes', () => {
    const valid = validatePatient({
      nom: 'Benali',
      prenom: 'Salma',
      cin: 'AB123456',
      telephone: '0612345678',
      email: 'salma@example.com',
      date_naissance: '1995-04-12'
    });
    expect(valid.valid).toBe(true);
    expect(valid.errors).toHaveLength(0);
  });

  it('rejette un patient avec téléphone erroné ou nom trop court', () => {
    const invalid = validatePatient({
      nom: 'A',
      prenom: 'Salma',
      telephone: 'invalid-phone',
      email: 'bad-email-format'
    });
    expect(invalid.valid).toBe(false);
    expect(invalid.errors.length).toBeGreaterThanOrEqual(3);
  });

  it('formate correctement le nom complet d\'un patient pour l\'affichage médical', () => {
    expect(formatPatientFullName('benali', 'salma')).toBe('BENALI Salma');
    expect(formatPatientFullName('idrissi', 'OMAR')).toBe('IDRISSI Omar');
  });
});
