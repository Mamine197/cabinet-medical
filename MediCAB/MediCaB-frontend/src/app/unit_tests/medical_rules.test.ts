import { describe, it, expect } from 'vitest';

/**
 * Fonctions de règles métier extraites pour validation unitaire Vitest
 */
export function calculateAMO(prestationTNR: number, montantFacture: number, isALD: boolean = false) {
  const tnr = prestationTNR;
  const tauxCouverture = isALD ? 1.0 : 0.70;
  const partAMO = Math.round(tnr * tauxCouverture * 100) / 100;
  const depassement = Math.max(0, montantFacture - tnr);
  const ticketModerateurTNR = isALD ? 0 : Math.round((tnr - partAMO) * 100) / 100;
  const resteACharge = Math.round((ticketModerateurTNR + depassement) * 100) / 100;

  return {
    tnr,
    partAMO,
    depassement,
    resteACharge
  };
}

export function detectAppointmentCollision(
  newStart: string,
  newDoctorId: string,
  existingAppointments: Array<{ date: string; heure: string; doctorId: string }>
): boolean {
  return existingAppointments.some(
    app => app.date + ' ' + app.heure === newStart && app.doctorId === newDoctorId
  );
}

export function calculateNoShowRisk(delaiJours: number, previousCancellations: number): { score: number; niveau: string } {
  let score = 10 + (delaiJours * 5.5) + (previousCancellations * 15);
  score = Math.min(95, Math.max(5, score));
  let niveau = 'Faible';
  if (score >= 60) niveau = 'Élevé';
  else if (score >= 35) niveau = 'Moyen';
  return { score: Math.round(score), niveau };
}

describe('Règles Métier Médicales & CNSS (Vitest Unit Tests)', () => {
  it('calcule correctement le remboursement AMO pour une consultation standard (70%)', () => {
    // Consultation généraliste TNR = 150 DH, Facturé 250 DH
    const res = calculateAMO(150, 250, false);
    expect(res.tnr).toBe(150);
    expect(res.partAMO).toBe(105); // 70% de 150
    expect(res.depassement).toBe(100); // 250 - 150
    expect(res.resteACharge).toBe(145); // 45 (30% ticket) + 100 (dépassement)
  });

  it('prend en charge à 100% sans ticket modérateur pour une Affection Longue Durée (ALD)', () => {
    // Consultation spécialisée TNR = 250 DH, Facturé 250 DH, ALD = true
    const res = calculateAMO(250, 250, true);
    expect(res.partAMO).toBe(250);
    expect(res.depassement).toBe(0);
    expect(res.resteACharge).toBe(0);
  });

  it('détecte correctement une collision de rendez-vous pour le même médecin', () => {
    const existing = [
      { date: '2026-11-25', heure: '10:00', doctorId: 'doc_1' },
      { date: '2026-11-25', heure: '11:00', doctorId: 'doc_2' }
    ];

    // Même créneau, même médecin -> Collision !
    expect(detectAppointmentCollision('2026-11-25 10:00', 'doc_1', existing)).toBe(true);

    // Même créneau, mais médecin différent -> Pas de collision
    expect(detectAppointmentCollision('2026-11-25 10:00', 'doc_2', existing)).toBe(false);

    // Même médecin, créneau libre -> Pas de collision
    expect(detectAppointmentCollision('2026-11-25 14:00', 'doc_1', existing)).toBe(false);
  });

  it('évalue avec précision le risque de No-Show', () => {
    // Prise de RDV à J-1 sans annulation -> Risque Faible
    const lowRisk = calculateNoShowRisk(1, 0);
    expect(lowRisk.niveau).toBe('Faible');

    // Prise de RDV à J-10 avec 2 annulations -> Risque Élevé
    const highRisk = calculateNoShowRisk(10, 2);
    expect(highRisk.niveau).toBe('Élevé');
    expect(highRisk.score).toBeGreaterThanOrEqual(60);
  });
});
