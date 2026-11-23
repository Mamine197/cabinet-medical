import { Injectable } from '@angular/core';
import { Patient, RendezVous, Consultation, Facture } from '../models/medicab.models';

const initialPatients: Patient[] = [
 {id:'PAT-001',nom:'Sarah Benali',email:'sarah.benali@example.test',telephone:'06 00 00 00 01',age:28,sexe:'Femme',derniereVisite:'24/10/2026',statut:'Actif',couleur:'pink'},
 {id:'PAT-002',nom:'Youssef Amrani',email:'youssef.amrani@example.test',telephone:'06 00 00 00 02',age:42,sexe:'Homme',derniereVisite:'24/10/2026',statut:'Actif',couleur:'blue'},
 {id:'PAT-003',nom:'Lina Haddad',email:'lina.haddad@example.test',telephone:'06 00 00 00 03',age:35,sexe:'Femme',derniereVisite:'23/10/2026',statut:'Actif',couleur:'purple'},
 {id:'PAT-004',nom:'Omar Idrissi',email:'omar.idrissi@example.test',telephone:'06 00 00 00 04',age:51,sexe:'Homme',derniereVisite:'22/10/2026',statut:'À suivre',couleur:'green'},
 {id:'PAT-005',nom:'Nadia El Fassi',email:'nadia.elfassi@example.test',telephone:'06 00 00 00 05',age:31,sexe:'Femme',derniereVisite:'21/10/2026',statut:'Actif',couleur:'orange'},
 {id:'PAT-006',nom:'Adam Chraibi',email:'adam.chraibi@example.test',telephone:'06 00 00 00 06',age:24,sexe:'Homme',derniereVisite:'20/10/2026',statut:'Actif',couleur:'teal'}
];
const initialAppointments: RendezVous[] = [
 {id:'RDV-001',patientId:'PAT-001',date:'24/10/2026',heure:'09:00',motif:'Consultation générale',statut:'Confirmé'},
 {id:'RDV-002',patientId:'PAT-002',date:'24/10/2026',heure:'10:00',motif:'Suivi médical',statut:'En attente'},
 {id:'RDV-003',patientId:'PAT-003',date:'24/10/2026',heure:'11:30',motif:'Consultation générale',statut:'Confirmé'},
 {id:'RDV-004',patientId:'PAT-004',date:'24/10/2026',heure:'14:00',motif:'Contrôle',statut:'Confirmé'},
 {id:'RDV-005',patientId:'PAT-005',date:'24/10/2026',heure:'15:30',motif:'Suivi médical',statut:'En attente'}
];
const initialConsultations: Consultation[] = [
 {id:'CONS-001',patientId:'PAT-001',date:'24/10/2026',motif:'Consultation générale',notes:'Données fictives de démonstration',statut:'Terminée'},
 {id:'CONS-002',patientId:'PAT-002',date:'24/10/2026',motif:'Suivi médical',notes:'Données fictives de démonstration',statut:'En cours'},
 {id:'CONS-003',patientId:'PAT-003',date:'23/10/2026',motif:'Contrôle',notes:'Données fictives de démonstration',statut:'Terminée'}
];
const initialInvoices: Facture[] = [
 {id:'FAC-001',patientId:'PAT-001',date:'24/10/2026',montant:350,statut:'Payée'},
 {id:'FAC-002',patientId:'PAT-002',date:'24/10/2026',montant:250,statut:'En attente'},
 {id:'FAC-003',patientId:'PAT-003',date:'23/10/2026',montant:400,statut:'Payée'},
 {id:'FAC-004',patientId:'PAT-004',date:'22/10/2026',montant:300,statut:'En retard'}
];
@Injectable({providedIn:'root'})
export class LocalDataService {
 patients = this.load('medicab.patients', initialPatients);
 appointments = this.load('medicab.appointments', initialAppointments);
 consultations = this.load('medicab.consultations', initialConsultations);
 invoices = this.load('medicab.invoices', initialInvoices);
 private load<T>(key:string, fallback:T):T { try { const raw=localStorage.getItem(key); return raw ? JSON.parse(raw) as T : structuredClone(fallback); } catch { return structuredClone(fallback); } }
 private save<T>(key:string,value:T):void { localStorage.setItem(key,JSON.stringify(value)); }
 addPatient(p:Patient):void { this.patients=[p,...this.patients]; this.save('medicab.patients',this.patients); }
 addAppointment(a:RendezVous):void { this.appointments=[...this.appointments,a].sort((x,y)=>x.heure.localeCompare(y.heure)); this.save('medicab.appointments',this.appointments); }
 addConsultation(c:Consultation):void { this.consultations=[c,...this.consultations]; this.save('medicab.consultations',this.consultations); }
 addInvoice(f:Facture):void { this.invoices=[f,...this.invoices]; this.save('medicab.invoices',this.invoices); }
}
