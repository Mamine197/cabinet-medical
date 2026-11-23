
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
  page: "dashboard",
  search: "",
  patients: [
    { id: "PAT-001", name: "Sarah Benali", initials: "SB", email: "sarah.benali@example.test", phone: "06 00 00 00 01", age: 28, gender: "Femme", date: "24/10/2026", status: "Actif", color: "pink" },
    { id: "PAT-002", name: "Youssef Amrani", initials: "YA", email: "youssef.amrani@example.test", phone: "06 00 00 00 02", age: 42, gender: "Homme", date: "24/10/2026", status: "Actif", color: "blue" },
    { id: "PAT-003", name: "Lina Haddad", initials: "LH", email: "lina.haddad@example.test", phone: "06 00 00 00 03", age: 35, gender: "Femme", date: "23/10/2026", status: "Actif", color: "purple" },
    { id: "PAT-004", name: "Omar Idrissi", initials: "OI", email: "omar.idrissi@example.test", phone: "06 00 00 00 04", age: 51, gender: "Homme", date: "22/10/2026", status: "À suivre", color: "green" },
    { id: "PAT-005", name: "Nadia El Fassi", initials: "NE", email: "nadia.elfassi@example.test", phone: "06 00 00 00 05", age: 31, gender: "Femme", date: "21/10/2026", status: "Actif", color: "orange" },
    { id: "PAT-006", name: "Adam Chraibi", initials: "AC", email: "adam.chraibi@example.test", phone: "06 00 00 00 06", age: 24, gender: "Homme", date: "20/10/2026", status: "Actif", color: "teal" }
  ],
  appointments: [
    { time: "09:00", patient: "Sarah Benali", type: "Consultation générale", status: "Confirmé" },
    { time: "10:00", patient: "Youssef Amrani", type: "Suivi médical", status: "En attente" },
    { time: "11:30", patient: "Lina Haddad", type: "Consultation générale", status: "Confirmé" },
    { time: "14:00", patient: "Omar Idrissi", type: "Contrôle", status: "Confirmé" },
    { time: "15:30", patient: "Nadia El Fassi", type: "Suivi médical", status: "En attente" }
  ],
  consultations: [
    { patient: "Sarah Benali", date: "24/10/2026", motif: "Consultation générale", doctor: "Dr. Martin", status: "Terminée" },
    { patient: "Youssef Amrani", date: "24/10/2026", motif: "Suivi médical", doctor: "Dr. Martin", status: "En cours" },
    { patient: "Lina Haddad", date: "23/10/2026", motif: "Contrôle", doctor: "Dr. Martin", status: "Terminée" }
  ],
  prescriptions: [
    { id: "ORD-001", patient: "Sarah Benali", date: "24/10/2026", type: "Ordonnance", status: "Brouillon" },
    { id: "ORD-002", patient: "Lina Haddad", date: "23/10/2026", type: "Compte rendu", status: "Validé" },
    { id: "ORD-003", patient: "Omar Idrissi", date: "22/10/2026", type: "Ordonnance", status: "Validé" }
  ],
  invoices: [
    { id: "FAC-001", patient: "Sarah Benali", date: "24/10/2026", amount: 350, status: "Payée" },
    { id: "FAC-002", patient: "Youssef Amrani", date: "24/10/2026", amount: 250, status: "En attente" },
    { id: "FAC-003", patient: "Lina Haddad", date: "23/10/2026", amount: 400, status: "Payée" },
    { id: "FAC-004", patient: "Omar Idrissi", date: "22/10/2026", amount: 300, status: "En retard" }
  ],
  users: [
    { name: "Dr. Martin", initials: "DM", email: "martin@example.test", role: "Médecin", status: "Actif", color: "purple" },
    { name: "Sofia Amrani", initials: "SA", email: "sofia@example.test", role: "Secrétaire", status: "Actif", color: "green" },
    { name: "Admin MediCAB", initials: "AM", email: "admin@example.test", role: "Administrateur", status: "Actif", color: "blue" }
  ],
  audit: [
    { time: "10:42", user: "Dr. Martin", action: "Consultation ouverte", detail: "Donnée de démonstration", status: "Consultation" },
    { time: "10:15", user: "Sofia Amrani", action: "Rendez-vous créé", detail: "Donnée de démonstration", status: "Agenda" },
    { time: "09:50", user: "Dr. Martin", action: "Document consulté", detail: "Donnée de démonstration", status: "Document" },
    { time: "09:12", user: "Admin MediCAB", action: "Connexion réussie", detail: "Session de démonstration", status: "Sécurité" }
  ]
};

const pageTitles = {
  dashboard: "Tableau de bord",
  patients: "Patients",
  appointments: "Rendez-vous",
  consultations: "Consultations",
  prescriptions: "Ordonnances & documents",
  billing: "Facturation",
  assistant: "Assistant IA",
  users: "Utilisateurs & rôles",
  audit: "Journal d'activité",
  settings: "Paramètres"
};

const initials = name => name.split(/\s+/).slice(0, 2).map(part => part[0] || "").join("").toUpperCase();
const money = amount => new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD", maximumFractionDigits: 0 }).format(amount);
const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));
const today = () => new Date().toISOString().slice(0, 10);

function statusClass(status) {
  const s = String(status).toLowerCase();
  if (["actif", "confirmé", "confirmée", "payée", "validé", "terminée"].includes(s)) return "success";
  if (["en attente", "brouillon", "à suivre", "en cours"].includes(s)) return "warning";
  if (["en retard", "annulé", "annulée", "inactif"].includes(s)) return "danger";
  if (["médecin", "administrateur"].includes(s)) return "info";
  return "neutral";
}

function badge(status) {
  return `<span class="status ${statusClass(status)}">${esc(status)}</span>`;
}

function avatar(name, color = "blue", small = false) {
  return `<span class="avatar avatar-${color} ${small ? "avatar-small" : ""}">${esc(initials(name))}</span>`;
}

function heading(title, subtitle, buttonText = "", action = "") {
  return `<div class="page-heading"><div><span class="eyebrow">ESPACE MEDICAB</span><h1>${title}</h1><p>${subtitle}</p></div>
    <div class="heading-actions">${buttonText ? `<button class="btn btn-primary" data-action="${action}"><i class="fa-solid fa-plus"></i>${buttonText}</button>` : ""}</div></div>`;
}

function stat(label, value, icon, color, change, foot) {
  return `<article class="card stat-card"><div class="stat-top"><span class="stat-icon ${color}"><i class="fa-solid ${icon}"></i></span><span class="stat-change ${change.startsWith("—") ? "neutral" : ""}">${change}</span></div><div class="stat-label">${label}</div><div class="stat-value">${value}</div><div class="stat-foot">${foot}</div></article>`;
}

function cardHeading(title, subtitle, action = "") {
  return `<div class="card-heading"><div><h2>${title}</h2><p>${subtitle}</p></div>${action ? `<button class="text-link" data-action="${action}">Voir tout <i class="fa-solid fa-arrow-right"></i></button>` : ""}</div>`;
}

function tableCard(title, subtitle, columns, rows, options = {}) {
  const searchId = options.searchId || "";
  const search = searchId ? `<div class="table-toolbar"><label class="search-box"><i class="fa-solid fa-magnifying-glass"></i><input data-table-search="${searchId}" placeholder="Rechercher..." aria-label="Rechercher dans le tableau"></label><span class="stat-foot">${rows.length} résultat(s)</span></div>` : "";
  return `<section class="card table-card">
    <div class="card-heading"><div><h2>${title}</h2><p>${subtitle}</p></div>${options.action ? `<button class="btn btn-light btn-sm" data-action="${options.action}"><i class="fa-solid fa-plus"></i> Ajouter</button>` : ""}</div>
    ${search}
    <div class="table-wrap"><table><thead><tr>${columns.map(c => `<th>${c}</th>`).join("")}</tr></thead><tbody>${rows.length ? rows.join("") : `<tr><td colspan="${columns.length}"><div class="empty-state"><i class="fa-regular fa-folder-open"></i><b>Aucun résultat</b>Essayez une autre recherche.</div></td></tr>`}</tbody></table></div>
    <div class="table-bottom"><span>${rows.length} ligne(s) affichée(s)</span><div class="pagination"><button aria-label="Page précédente" disabled><i class="fa-solid fa-chevron-left"></i></button><button class="active">1</button><button disabled>2</button><button aria-label="Page suivante" disabled><i class="fa-solid fa-chevron-right"></i></button></div></div>
  </section>`;
}

function patientRow(p) {
  return `<tr data-search-row="${esc([p.name, p.id, p.email, p.phone].join(" ").toLowerCase())}">
    <td><div class="person-cell">${avatar(p.name, p.color, true)}<div><b>${esc(p.name)}</b><small>${esc(p.id)}</small></div></div></td>
    <td>${esc(p.age)} ans · ${esc(p.gender)}</td><td>${esc(p.phone)}</td><td>${esc(p.date)}</td><td>${badge(p.status)}</td>
    <td><div class="action-group"><button class="action-mini" data-action="view-patient" data-id="${esc(p.id)}" title="Consulter"><i class="fa-regular fa-eye"></i></button><button class="action-mini" data-action="edit-patient" data-id="${esc(p.id)}" title="Modifier"><i class="fa-regular fa-pen-to-square"></i></button></div></td>
  </tr>`;
}

function appointmentRow(a, i) {
  return `<tr data-search-row="${esc((a.patient + " " + a.type + " " + a.time).toLowerCase())}">
    <td><b>${esc(a.time)}</b></td><td><div class="person-cell">${avatar(a.patient, ["blue","green","pink","orange","purple"][i % 5], true)}<div><b>${esc(a.patient)}</b><small>Patient</small></div></div></td>
    <td>${esc(a.type)}</td><td>${badge(a.status)}</td><td><button class="action-mini" data-action="edit-appointment" data-id="${i}" title="Modifier"><i class="fa-regular fa-pen-to-square"></i></button></td>
  </tr>`;
}

function dashboardPage() {
  const bars = [45, 65, 53, 80, 61, 92, 69, 76, 56, 85, 72, 98];
  const chart = bars.map((height, i) => `<div class="chart-col"><div class="bars"><div class="bar pale" style="height:${Math.max(8, height * .62)}%"></div><div class="bar blue" style="height:${height}%"></div></div><small>${["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"][i]}</small></div>`).join("");
  const schedule = state.appointments.slice(0, 4).map((a, i) => `<div class="schedule-item"><span class="schedule-time">${a.time}</span><span class="schedule-line ${i === 1 ? "green" : i === 3 ? "orange" : ""}"></span><div class="schedule-info"><b>${esc(a.patient)}</b><small>${esc(a.type)}</small></div></div>`).join("");
  return `${heading("Bonjour, Dr. Martin ", "Voici le résumé de l'activité de votre cabinet pour aujourd'hui.", "Nouveau rendez-vous", "add-appointment")}
    <div class="hero-banner"><div><span class="eyebrow" style="color:#d9e4ff">SAMEDI 24 OCTOBRE 2026</span><h2>Votre cabinet, en un coup d'œil.</h2><p>Retrouvez les rendez-vous, les dossiers et les indicateurs essentiels de votre activité.</p></div><button class="btn" data-page="appointments"><i class="fa-regular fa-calendar"></i> Consulter l'agenda</button></div>
    <div class="grid stats-grid">
      ${stat("Patients enregistrés", state.patients.length + 122, "fa-users", "blue", "+8,2%", "par rapport au mois dernier")}
      ${stat("Rendez-vous aujourd'hui", state.appointments.length + 7, "fa-calendar-check", "green", "+12,5%", "rendez-vous planifiés")}
      ${stat("Consultations réalisées", 24, "fa-stethoscope", "orange", "+4,6%", "sur la période sélectionnée")}
      ${stat("Recettes du mois", money(18450), "fa-wallet", "purple", "+9,4%", "paiements de démonstration")}
    </div>
    <div class="quick-actions">
      <button class="quick-action" data-action="add-patient"><span class="stat-icon blue"><i class="fa-solid fa-user-plus"></i></span><span><b>Nouveau patient</b><small>Créer un dossier</small></span></button>
      <button class="quick-action" data-action="add-appointment"><span class="stat-icon green"><i class="fa-solid fa-calendar-plus"></i></span><span><b>Planifier un RDV</b><small>Gérer l'agenda</small></span></button>
      <button class="quick-action" data-action="add-consultation"><span class="stat-icon orange"><i class="fa-solid fa-notes-medical"></i></span><span><b>Consultation</b><small>Saisir une note</small></span></button>
      <button class="quick-action" data-page="assistant"><span class="stat-icon purple"><i class="fa-solid fa-wand-magic-sparkles"></i></span><span><b>Assistant IA</b><small>Préparer un brouillon</small></span></button>
    </div>
    <div class="grid two-col">
      <section class="card">${cardHeading("Vue d'ensemble", "Activité mensuelle · Illustration de démonstration")}
        <div class="chart-area"><div class="chart-y"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><div class="chart">${chart}</div></div>
        <div class="legend"><span><i class="dot"></i> Consultations</span><span><i class="dot pale"></i> Rendez-vous</span></div>
      </section>
      <section class="card">${cardHeading("Agenda du jour", "Vos prochains rendez-vous", "appointments")}
        <div class="schedule">${schedule}</div>
        <button class="btn btn-light" style="width:100%;margin-top:12px" data-page="appointments">Ouvrir l'agenda <i class="fa-solid fa-arrow-right"></i></button>
      </section>
    </div>
    ${tableCard("Patients récents", "Derniers dossiers de démonstration", ["PATIENT", "ÂGE / SEXE", "TÉLÉPHONE", "DERNIÈRE VISITE", "STATUT", ""], state.patients.slice(0,4).map(patientRow), {action:"add-patient"})}`;
}

function patientsPage() {
  return `${heading("Gestion des patients", "Consultez et gérez les informations administratives des dossiers patients.", "Nouveau patient", "add-patient")}
    <div class="grid stats-grid">
      ${stat("Total des patients", state.patients.length, "fa-users", "blue", "Dossiers", "données fictives")}
      ${stat("Dossiers actifs", state.patients.filter(p => p.status === "Actif").length, "fa-user-check", "green", "Actifs", "dans la maquette")}
      ${stat("À suivre", state.patients.filter(p => p.status === "À suivre").length, "fa-clipboard-check", "orange", "Suivi", "éléments à vérifier")}
      ${stat("Nouveaux dossiers", "06", "fa-user-plus", "purple", "Récents", "dans ce prototype")}
    </div>
    ${tableCard("Répertoire des patients", "Informations administratives fictives", ["PATIENT", "ÂGE / SEXE", "TÉLÉPHONE", "DERNIÈRE VISITE", "STATUT", "ACTIONS"], state.patients.map(patientRow), {action:"add-patient",searchId:"patients"})}
    <div class="notice-box" style="margin-top:18px"><i class="fa-solid fa-shield-halved"></i><div><b>Confidentialité des dossiers</b>Cette maquette ne contient que des exemples fictifs. En production, les accès aux données médicales devront être contrôlés côté serveur.</div></div>`;
}

function appointmentsPage() {
  const days = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
  const cal = days.map(d => `<div class="calendar-day-name">${d}</div>`).join("") +
    Array.from({length:35}, (_, i) => {
      const n = i - 2;
      const current = n >= 1 && n <= 31;
      const value = current ? n : (n < 1 ? 31 + n : n - 31);
      return `<button class="calendar-day ${current ? "" : "muted"} ${value === 24 && current ? "today" : ""} ${[3,8,12,17,20,24,28].includes(value) && current ? "has-event" : ""}" data-action="select-day" data-day="${value}">${value}</button>`;
    }).join("");
  return `${heading("Gestion des rendez-vous", "Planifiez et visualisez les rendez-vous du cabinet.", "Nouveau rendez-vous", "add-appointment")}
    <div class="grid stats-grid">
      ${stat("Rendez-vous du jour", state.appointments.length, "fa-calendar-day", "blue", "Aujourd'hui", "planning fictif")}
      ${stat("Confirmés", state.appointments.filter(a => a.status === "Confirmé").length, "fa-circle-check", "green", "Confirmés", "dans la liste")}
      ${stat("En attente", state.appointments.filter(a => a.status === "En attente").length, "fa-clock", "orange", "À confirmer", "dans la liste")}
      ${stat("Créneaux libres", "08", "fa-calendar-plus", "purple", "Disponibles", "exemple de planning")}
    </div>
    <div class="appointment-layout"><section class="card"><div class="calendar-top"><div><span class="eyebrow">CALENDRIER</span><h2>Octobre 2026</h2></div><div class="heading-actions"><button class="icon-btn" id="prevMonth" aria-label="Mois précédent"><i class="fa-solid fa-chevron-left"></i></button><button class="icon-btn" id="nextMonth" aria-label="Mois suivant"><i class="fa-solid fa-chevron-right"></i></button></div></div><div class="calendar-grid">${cal}</div><div class="divider"></div><small>Sélectionnez un jour pour créer un rendez-vous. Le calendrier est une maquette interactive.</small></section>
    <section class="card">${cardHeading("Planning journalier", "Rendez-vous de démonstration")}
      <div class="schedule">${state.appointments.map((a,i)=>`<div class="schedule-item"><span class="schedule-time">${a.time}</span><span class="schedule-line ${i%2?"green":""}"></span><div class="schedule-info"><b>${esc(a.patient)}</b><small>${esc(a.type)}</small><div style="margin-top:7px">${badge(a.status)}</div></div></div>`).join("")}</div>
    </section></div>
    <div style="margin-top:20px">${tableCard("Liste des rendez-vous", "Suivi des créneaux enregistrés", ["HEURE", "PATIENT", "MOTIF", "STATUT", "ACTIONS"], state.appointments.map(appointmentRow), {action:"add-appointment",searchId:"appointments"})}</div>`;
}

function consultationsPage() {
  const rows = state.consultations.map((c,i)=>`<tr data-search-row="${esc((c.patient+" "+c.motif+" "+c.date).toLowerCase())}"><td><div class="person-cell">${avatar(c.patient, ["blue","green","pink"][i%3],true)}<div><b>${esc(c.patient)}</b><small>Dossier patient</small></div></div></td><td>${esc(c.date)}</td><td>${esc(c.motif)}</td><td>${esc(c.doctor)}</td><td>${badge(c.status)}</td><td><button class="action-mini" data-action="view-consultation" data-id="${i}" title="Consulter"><i class="fa-regular fa-eye"></i></button></td></tr>`);
  return `${heading("Consultations", "Organisez les notes et le suivi des consultations.", "Nouvelle consultation", "add-consultation")}
    <div class="grid stats-grid">
      ${stat("Consultations totales", state.consultations.length, "fa-stethoscope", "blue", "Enregistrées", "données fictives")}
      ${stat("Terminées", state.consultations.filter(c=>c.status==="Terminée").length, "fa-circle-check", "green", "Terminées", "dans cette liste")}
      ${stat("En cours", state.consultations.filter(c=>c.status==="En cours").length, "fa-clock", "orange", "En cours", "dans cette liste")}
      ${stat("Documents", state.prescriptions.length, "fa-file-lines", "purple", "Associés", "à la démonstration")}
    </div>
    ${tableCard("Historique des consultations", "Les données cliniques réelles ne doivent pas être utilisées dans ce prototype.", ["PATIENT", "DATE", "MOTIF", "PRATICIEN", "STATUT", "ACTIONS"], rows, {action:"add-consultation",searchId:"consultations"})}
    <div class="notice-box" style="margin-top:18px"><i class="fa-solid fa-user-doctor"></i><div><b>Validation professionnelle</b>Les notes et documents cliniques doivent être rédigés ou validés par un professionnel autorisé.</div></div>`;
}

function prescriptionsPage() {
  const rows = state.prescriptions.map((p,i)=>`<tr data-search-row="${esc((p.id+" "+p.patient+" "+p.type).toLowerCase())}"><td><b>${esc(p.id)}</b></td><td>${esc(p.patient)}</td><td>${esc(p.date)}</td><td>${esc(p.type)}</td><td>${badge(p.status)}</td><td><button class="action-mini" data-action="view-document" data-id="${i}" title="Voir le document"><i class="fa-regular fa-eye"></i></button></td></tr>`);
  return `${heading("Ordonnances & documents", "Préparez les documents et suivez leur état de validation.", "Nouveau document", "add-prescription")}
    <div class="grid stats-grid">
      ${stat("Documents", state.prescriptions.length, "fa-file-lines", "blue", "Total", "dans la maquette")}
      ${stat("Ordonnances", state.prescriptions.filter(p=>p.type==="Ordonnance").length, "fa-file-prescription", "green", "Documents", "de démonstration")}
      ${stat("Brouillons", state.prescriptions.filter(p=>p.status==="Brouillon").length, "fa-pen-to-square", "orange", "À valider", "par le médecin")}
      ${stat("Validés", state.prescriptions.filter(p=>p.status==="Validé").length, "fa-circle-check", "purple", "Validés", "exemples fictifs")}
    </div>
    <div class="grid two-col">
      <section class="card">${cardHeading("Documents récents", "Exemples de documents")}
        ${state.prescriptions.map(p=>`<div class="document-card" style="margin-bottom:10px"><span class="document-icon"><i class="fa-solid fa-file-pdf"></i></span><div class="document-info"><b>${esc(p.type)} · ${esc(p.id)}</b><small>${esc(p.patient)} · ${esc(p.date)}</small></div>${badge(p.status)}</div>`).join("")}
      </section>
      <section class="card">${cardHeading("Cycle de validation", "Étapes du document")}
        <div class="schedule">
          <div class="schedule-item"><span class="schedule-time">01</span><span class="schedule-line"></span><div class="schedule-info"><b>Préparation</b><small>Saisie du contenu et des informations nécessaires.</small></div></div>
          <div class="schedule-item"><span class="schedule-time">02</span><span class="schedule-line green"></span><div class="schedule-info"><b>Vérification</b><small>Contrôle des informations par le professionnel autorisé.</small></div></div>
          <div class="schedule-item"><span class="schedule-time">03</span><span class="schedule-line orange"></span><div class="schedule-info"><b>Validation</b><small>Finalisation explicite et traçable du document.</small></div></div>
        </div>
      </section>
    </div>
    <div style="margin-top:20px">${tableCard("Registre des documents", "Documents fictifs uniquement", ["RÉFÉRENCE", "PATIENT", "DATE", "TYPE", "STATUT", "ACTIONS"], rows, {action:"add-prescription",searchId:"prescriptions"})}</div>`;
}

function billingPage() {
  const rows = state.invoices.map((f,i)=>`<tr data-search-row="${esc((f.id+" "+f.patient+" "+f.status).toLowerCase())}"><td><b>${esc(f.id)}</b></td><td>${esc(f.patient)}</td><td>${esc(f.date)}</td><td><b>${money(f.amount)}</b></td><td>${badge(f.status)}</td><td><button class="action-mini" data-action="view-invoice" data-id="${i}" title="Consulter"><i class="fa-regular fa-eye"></i></button></td></tr>`);
  const paid = state.invoices.filter(f=>f.status==="Payée").reduce((s,f)=>s+f.amount,0);
  const pending = state.invoices.filter(f=>f.status!=="Payée").reduce((s,f)=>s+f.amount,0);
  return `${heading("Facturation & paiements", "Suivez les factures et les paiements du cabinet.", "Nouvelle facture", "add-invoice")}
    <div class="grid stats-grid">
      ${stat("Montant facturé", money(state.invoices.reduce((s,f)=>s+f.amount,0)), "fa-file-invoice-dollar", "blue", "Total", "exemple de facturation")}
      ${stat("Montant payé", money(paid), "fa-circle-check", "green", "Réglé", "données fictives")}
      ${stat("En attente", money(pending), "fa-clock", "orange", "À suivre", "montants non réglés")}
      ${stat("Factures", state.invoices.length, "fa-receipt", "purple", "Émises", "dans le prototype")}
    </div>
    ${tableCard("Registre des factures", "Montants de démonstration en dirhams marocains", ["RÉFÉRENCE", "PATIENT", "DATE", "MONTANT", "STATUT", "ACTIONS"], rows, {action:"add-invoice",searchId:"billing"})}
    <div class="notice-box" style="margin-top:18px"><i class="fa-solid fa-circle-info"></i><div><b>Facturation de démonstration</b>Aucun paiement réel n'est effectué. Les intégrations de paiement et la conformité réglementaire restent à implémenter.</div></div>`;
}

function assistantPage() {
  return `${heading("Assistant IA", "Préparez un brouillon structuré à partir de notes fictives.", "", "")}
    <div class="ai-panel"><div>
      <div class="ai-hero"><span class="stat-icon purple"><i class="fa-solid fa-wand-magic-sparkles"></i></span><span class="eyebrow">ASSISTANCE À LA RÉDACTION</span><h2>Transformez vos notes en brouillon structuré.</h2><p>L'assistant de la maquette illustre un flux de rédaction. Il ne se connecte pas à un modèle IA réel et ne réalise ni diagnostic ni prescription.</p></div>
      <section class="card"><div class="card-heading"><div><h2>Notes de départ</h2><p>Utilisez uniquement un scénario fictif.</p></div></div>
        <div class="field"><label for="aiNotes">Notes de démonstration</label><textarea id="aiNotes" placeholder="Exemple : patient fictif, motif de consultation, observations fournies..."></textarea><span class="hint">Ne saisissez aucune donnée de santé réelle ou identifiante.</span></div>
        <button class="btn btn-primary" id="generateDraft" style="margin-top:15px"><i class="fa-solid fa-wand-magic-sparkles"></i> Préparer un brouillon</button>
      </section>
    </div><div>
      <section class="card"><div class="card-heading"><div><h2>Brouillon généré</h2><p>Résultat simulé, à relire intégralement.</p></div><span class="status warning">Non validé</span></div>
        <div class="ai-output" id="aiOutput">Le brouillon apparaîtra ici après avoir saisi des notes fictives et cliqué sur le bouton de génération.</div>
        <button class="btn btn-light" id="copyDraft"><i class="fa-regular fa-copy"></i> Copier le brouillon</button>
        <div class="ai-notice"><i class="fa-solid fa-triangle-exclamation"></i> Ce contenu est une simulation. Toute utilisation clinique nécessite un système validé, une vérification humaine et le respect des exigences applicables.</div>
      </section>
      <section class="card" style="margin-top:18px">${cardHeading("Principes de sécurité", "Conformément à l'orientation du cahier des charges")}
        ${["Accès contrôlé au service IA","Réponse structurée et vérifiable","Validation humaine avant finalisation","Minimisation des données transmises","Journalisation maîtrisée"].map(t=>`<div class="setting-row"><span style="font-size:11px">${esc(t)}</span><i class="fa-solid fa-circle-check" style="color:var(--green)"></i></div>`).join("")}
      </section>
    </div></div>`;
}

function usersPage() {
  const rows = state.users.map((u,i)=>`<tr data-search-row="${esc((u.name+" "+u.email+" "+u.role).toLowerCase())}"><td><div class="person-cell">${avatar(u.name,u.color,true)}<div><b>${esc(u.name)}</b><small>${esc(u.email)}</small></div></div></td><td>${badge(u.role)}</td><td>${badge(u.status)}</td><td><button class="action-mini" data-action="edit-user" data-id="${i}" title="Modifier"><i class="fa-regular fa-pen-to-square"></i></button></td></tr>`);
  return `${heading("Utilisateurs & rôles", "Gérez les comptes et préparez les autorisations de la plateforme.", "Nouvel utilisateur", "add-user")}
    <div class="grid stats-grid">
      ${stat("Comptes", state.users.length, "fa-users", "blue", "Total", "dans la maquette")}
      ${stat("Médecins", state.users.filter(u=>u.role==="Médecin").length, "fa-user-doctor", "green", "Rôle", "exemples fictifs")}
      ${stat("Secrétaires", state.users.filter(u=>u.role==="Secrétaire").length, "fa-user-tie", "orange", "Rôle", "exemples fictifs")}
      ${stat("Administrateurs", state.users.filter(u=>u.role==="Administrateur").length, "fa-user-shield", "purple", "Rôle", "exemples fictifs")}
    </div>
    ${tableCard("Comptes de la plateforme", "Les rôles présentés ne constituent pas une sécurité effective.", ["UTILISATEUR", "RÔLE", "STATUT", "ACTIONS"], rows, {action:"add-user",searchId:"users"})}
    <div class="notice-box" style="margin-top:18px"><i class="fa-solid fa-lock"></i><div><b>Contrôle d'accès</b>Les rôles et autorisations doivent être vérifiés côté backend sur chaque ressource sensible. Masquer un bouton côté navigateur ne protège pas les données.</div></div>`;
}

function auditPage() {
  const rows = state.audit.map(a=>`<tr data-search-row="${esc((a.user+" "+a.action+" "+a.status).toLowerCase())}"><td><b>${esc(a.time)}</b></td><td>${esc(a.user)}</td><td>${esc(a.action)}</td><td>${esc(a.detail)}</td><td>${badge(a.status)}</td></tr>`);
  return `${heading("Journal d'activité", "Consultez un exemple de journalisation des événements de la plateforme.", "", "")}
    <div class="grid stats-grid">
      ${stat("Événements", state.audit.length, "fa-clock-rotate-left", "blue", "Journal", "événements simulés")}
      ${stat("Connexions", 1, "fa-right-to-bracket", "green", "Exemple", "données fictives")}
      ${stat("Actions métier", 3, "fa-list-check", "orange", "Exemple", "actions simulées")}
      ${stat("Alertes", 0, "fa-shield-halved", "purple", "Aucune", "dans la maquette")}
    </div>
    ${tableCard("Événements récents", "Ne pas enregistrer inutilement le contenu des notes cliniques.", ["HEURE", "UTILISATEUR", "ACTION", "DÉTAIL", "CATÉGORIE"], rows, {searchId:"audit"})}
    <div class="notice-box" style="margin-top:18px"><i class="fa-solid fa-shield-halved"></i><div><b>Journalisation responsable</b>En production, les journaux devront être protégés, accessibles selon autorisation et limités aux informations nécessaires à la traçabilité.</div></div>`;
}

function settingsPage() {
  const rows = [
    ["Notifications de rendez-vous","Préparer l'affichage des alertes de rendez-vous.",true],
    ["Alertes de facturation","Afficher les rappels de factures non réglées.",true],
    ["Assistant de rédaction","Afficher le module de démonstration IA.",false],
    ["Mode compact","Réduire l'espacement de l'interface.",false]
  ];
  return `${heading("Paramètres", "Personnalisez les préférences d'affichage de la maquette.", "", "")}
    <div class="grid two-col"><section class="card">${cardHeading("Profil du cabinet", "Informations de démonstration")}
      <div class="form-grid">
        <div class="field full"><label>Nom du cabinet</label><input value="Cabinet Médical MediCAB"></div>
        <div class="field"><label>Praticien référent</label><input value="Dr. Martin"></div>
        <div class="field"><label>Spécialité</label><input value="Médecine générale"></div>
        <div class="field"><label>Téléphone</label><input value="05 00 00 00 00"></div>
        <div class="field"><label>Devise</label><select><option>MAD — Dirham marocain</option><option>EUR — Euro</option></select></div>
      </div><button class="btn btn-primary" data-action="save-settings" style="margin-top:18px"><i class="fa-solid fa-check"></i> Enregistrer les préférences</button>
    </section><section class="card">${cardHeading("Préférences", "Options locales du prototype")}
      ${rows.map((r,i)=>`<div class="setting-row"><div><b>${r[0]}</b><p>${r[1]}</p></div><button class="toggle ${r[2]?"on":""}" role="switch" aria-checked="${r[2]}" data-action="toggle-setting" aria-label="${r[0]}"></button></div>`).join("")}
    </section></div>
    <section class="card" style="margin-top:18px">${cardHeading("Informations techniques", "Architecture cible du projet")}
      <div class="setting-row"><div><b>Frontend</b><p>Cette maquette utilise HTML, CSS et JavaScript natifs.</p></div><span class="status info">Prototype</span></div>
      <div class="setting-row"><div><b>API métier prévue</b><p>Django REST Framework avec authentification et autorisations côté serveur.</p></div><span class="status neutral">À intégrer</span></div>
      <div class="setting-row"><div><b>Base de données prévue</b><p>PostgreSQL pour les données métier et les relations.</p></div><span class="status neutral">À intégrer</span></div>
      <div class="setting-row"><div><b>Service IA prévu</b><p>FastAPI et Ollama, avec validation humaine des brouillons.</p></div><span class="status neutral">À intégrer</span></div>
    </section>`;
}

const renderers = {
  dashboard: dashboardPage,
  patients: patientsPage,
  appointments: appointmentsPage,
  consultations: consultationsPage,
  prescriptions: prescriptionsPage,
  billing: billingPage,
  assistant: assistantPage,
  users: usersPage,
  audit: auditPage,
  settings: settingsPage
};

function navigate(page) {
  if (!renderers[page]) return;
  state.page = page;
  state.search = "";
  $("#breadcrumbTitle").textContent = pageTitles[page];
  $("#globalSearch").value = "";
  $$(".nav-link").forEach(btn => btn.classList.toggle("active", btn.dataset.page === page));
  $("#pageContent").innerHTML = renderers[page]();
  $("#pageContent").style.animation = "none";
  void $("#pageContent").offsetWidth;
  $("#pageContent").style.animation = "";
  $("#sidebar").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toast(title, message = "Action effectuée dans la maquette.", error = false) {
  const node = document.createElement("div");
  node.className = `toast ${error ? "error" : ""}`;
  node.innerHTML = `<i class="fa-solid ${error ? "fa-circle-exclamation" : "fa-circle-check"}"></i><div><b>${esc(title)}</b><small>${esc(message)}</small></div>`;
  $("#toastContainer").appendChild(node);
  setTimeout(() => node.remove(), 3600);
}

function openModal(title, fields, onSubmit) {
  $("#modalTitle").textContent = title;
  $("#modalFields").innerHTML = fields.map(f => {
    const options = f.options
      ? `<select id="field-${f.name}" name="${f.name}" ${f.required === false ? "" : "required"}>${f.options.map(o => `<option value="${esc(o.value)}">${esc(o.label)}</option>`).join("")}</select>`
      : f.type === "textarea"
        ? `<textarea id="field-${f.name}" name="${f.name}" placeholder="${esc(f.placeholder || "")}" ${f.required === false ? "" : "required"}></textarea>`
        : `<input id="field-${f.name}" name="${f.name}" type="${f.type || "text"}" placeholder="${esc(f.placeholder || "")}" ${f.required === false ? "" : "required"} ${f.min !== undefined ? `min="${f.min}"` : ""}>`;
    return `<div class="field ${f.full ? "full" : ""}"><label for="field-${f.name}">${esc(f.label)}</label>${options}</div>`;
  }).join("");
  $("#modalBackdrop").classList.add("open");
  $("#modalBackdrop").setAttribute("aria-hidden", "false");
  const form = $("#modalForm");
  form.onsubmit = event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form).entries());
    onSubmit(values);
    closeModal();
  };
  setTimeout(() => $("#modalFields input, #modalFields select, #modalFields textarea")?.focus(), 50);
}

function closeModal() {
  $("#modalBackdrop").classList.remove("open");
  $("#modalBackdrop").setAttribute("aria-hidden", "true");
}

const patientOptions = () => state.patients.map(p => ({value:p.name,label:p.name}));

function addPatient() {
  openModal("Ajouter un patient", [
    {name:"name",label:"Nom complet",placeholder:"Ex. Amine Exemple"},
    {name:"email",label:"Adresse e-mail",type:"email",placeholder:"patient@example.test"},
    {name:"phone",label:"Téléphone",placeholder:"06 00 00 00 00"},
    {name:"age",label:"Âge",type:"number",min:0},
    {name:"gender",label:"Sexe",options:[{value:"Femme",label:"Femme"},{value:"Homme",label:"Homme"},{value:"Non renseigné",label:"Non renseigné"}]},
    {name:"status",label:"Statut",options:[{value:"Actif",label:"Actif"},{value:"À suivre",label:"À suivre"}]}
  ], v => {
    const name = v.name.trim();
    if (!name) return toast("Nom obligatoire", "Saisissez un nom.", true);
    state.patients.unshift({id:`PAT-${String(state.patients.length+1).padStart(3,"0")}`,name,initials:initials(name),email:v.email,phone:v.phone,age:Number(v.age)||0,gender:v.gender,date:"24/10/2026",status:v.status,color:["blue","green","purple","orange","pink"][state.patients.length%5]});
    navigate("patients");
    toast("Patient ajouté", "Le patient a été ajouté aux données locales du prototype.");
  });
}

function addAppointment(editIndex = null) {
  const old = editIndex !== null ? state.appointments[editIndex] : null;
  openModal(old ? "Modifier le rendez-vous" : "Nouveau rendez-vous", [
    {name:"patient",label:"Patient",options:patientOptions()},
    {name:"date",label:"Date",type:"date"},
    {name:"time",label:"Heure",type:"time"},
    {name:"type",label:"Motif",options:[{value:"Consultation générale",label:"Consultation générale"},{value:"Suivi médical",label:"Suivi médical"},{value:"Contrôle",label:"Contrôle"},{value:"Autre",label:"Autre"}]},
    {name:"status",label:"Statut",options:[{value:"Confirmé",label:"Confirmé"},{value:"En attente",label:"En attente"}]}
  ], v => {
    const appointment = {patient:v.patient,time:v.time||"09:00",type:v.type,status:v.status,date:v.date};
    if (old) state.appointments[editIndex] = appointment;
    else state.appointments.push(appointment);
    navigate("appointments");
    toast(old ? "Rendez-vous modifié" : "Rendez-vous ajouté", "Modification locale de démonstration.");
  });
  if (old) {
    const form = $("#modalForm");
    form.elements.patient.value = old.patient;
    form.elements.type.value = old.type;
    form.elements.status.value = old.status;
    form.elements.time.value = old.time;
  }
}

function addConsultation() {
  openModal("Nouvelle consultation", [
    {name:"patient",label:"Patient",options:patientOptions()},
    {name:"date",label:"Date",type:"date"},
    {name:"motif",label:"Motif",placeholder:"Motif de démonstration"},
    {name:"notes",label:"Notes fictives",type:"textarea",full:true,placeholder:"Utilisez un scénario entièrement fictif."}
  ], v => {
    state.consultations.unshift({patient:v.patient,date:v.date||"24/10/2026",motif:v.motif,doctor:"Dr. Martin",status:"En cours",notes:v.notes});
    navigate("consultations");
    toast("Consultation créée", "Donnée de démonstration ajoutée localement.");
  });
}

function addPrescription() {
  openModal("Nouveau document", [
    {name:"patient",label:"Patient",options:patientOptions()},
    {name:"type",label:"Type de document",options:[{value:"Ordonnance",label:"Ordonnance"},{value:"Compte rendu",label:"Compte rendu"},{value:"Autre document",label:"Autre document"}]},
    {name:"status",label:"État initial",options:[{value:"Brouillon",label:"Brouillon"},{value:"Validé",label:"Validé"}]},
    {name:"notes",label:"Notes de démonstration",type:"textarea",full:true,placeholder:"Contenu fictif, sans données médicales réelles."}
  ], v => {
    state.prescriptions.unshift({id:`ORD-${String(state.prescriptions.length+1).padStart(3,"0")}`,patient:v.patient,date:"24/10/2026",type:v.type,status:v.status,notes:v.notes});
    navigate("prescriptions");
    toast("Document ajouté", "Le document est enregistré localement dans la maquette.");
  });
}

function addInvoice() {
  openModal("Créer une facture fictive", [
    {name:"patient",label:"Patient",options:patientOptions()},
    {name:"amount",label:"Montant (MAD)",type:"number",min:0},
    {name:"status",label:"Statut",options:[{value:"En attente",label:"En attente"},{value:"Payée",label:"Payée"},{value:"En retard",label:"En retard"}]}
  ], v => {
    state.invoices.unshift({id:`FAC-${String(state.invoices.length+1).padStart(3,"0")}`,patient:v.patient,date:"24/10/2026",amount:Number(v.amount)||0,status:v.status});
    navigate("billing");
    toast("Facture créée", "Aucun paiement réel n'a été effectué.");
  });
}

function addUser(editIndex = null) {
  const old = editIndex !== null ? state.users[editIndex] : null;
  openModal(old ? "Modifier un utilisateur" : "Ajouter un utilisateur", [
    {name:"name",label:"Nom complet",placeholder:"Nom de démonstration"},
    {name:"email",label:"Adresse e-mail",type:"email",placeholder:"utilisateur@example.test"},
    {name:"role",label:"Rôle",options:[{value:"Médecin",label:"Médecin"},{value:"Secrétaire",label:"Secrétaire"},{value:"Administrateur",label:"Administrateur"}]},
    {name:"status",label:"Statut",options:[{value:"Actif",label:"Actif"},{value:"Inactif",label:"Inactif"}]}
  ], v => {
    const user = {name:v.name,initials:initials(v.name),email:v.email,role:v.role,status:v.status,color:"blue"};
    if (old) state.users[editIndex] = user;
    else state.users.push(user);
    navigate("users");
    toast("Utilisateur enregistré", "Modification locale uniquement, sans compte réel créé.");
  });
  if (old) {
    $("#modalForm").elements.name.value = old.name;
    $("#modalForm").elements.email.value = old.email;
    $("#modalForm").elements.role.value = old.role;
    $("#modalForm").elements.status.value = old.status;
  }
}

function handleAction(action, el) {
  switch (action) {
    case "add-patient": addPatient(); break;
    case "add-appointment": addAppointment(); break;
    case "add-consultation": addConsultation(); break;
    case "add-prescription": addPrescription(); break;
    case "add-invoice": addInvoice(); break;
    case "add-user": addUser(); break;
    case "edit-user": addUser(Number(el.dataset.id)); break;
    case "edit-appointment": addAppointment(Number(el.dataset.id)); break;
    case "view-patient": {
      const p = state.patients.find(p => p.id === el.dataset.id);
      if (p) toast(p.name, `${p.email} · ${p.phone} · Informations fictives`);
      break;
    }
    case "edit-patient": {
      const p = state.patients.find(p => p.id === el.dataset.id);
      if (!p) break;
      openModal("Modifier le patient", [
        {name:"name",label:"Nom complet"},
        {name:"email",label:"E-mail",type:"email"},
        {name:"phone",label:"Téléphone"},
        {name:"age",label:"Âge",type:"number",min:0},
        {name:"gender",label:"Sexe",options:[{value:"Femme",label:"Femme"},{value:"Homme",label:"Homme"},{value:"Non renseigné",label:"Non renseigné"}]},
        {name:"status",label:"Statut",options:[{value:"Actif",label:"Actif"},{value:"À suivre",label:"À suivre"}]}
      ], v => {
        Object.assign(p, v, {age:Number(v.age)||0, initials:initials(v.name)});
        navigate("patients");
        toast("Dossier modifié", "Les données ont été modifiées localement.");
      });
      Object.entries(p).forEach(([key,value]) => {
        const field = $("#modalForm").elements[key];
        if (field && ["name","email","phone","age","gender","status"].includes(key)) field.value = value;
      });
      break;
    }
    case "view-consultation": {
      const c = state.consultations[Number(el.dataset.id)];
      if (c) toast(c.patient, `${c.date} · ${c.motif} · ${c.status}`);
      break;
    }
    case "view-document": {
      const d = state.prescriptions[Number(el.dataset.id)];
      if (d) toast(d.id, `${d.type} · ${d.patient} · ${d.status}`);
      break;
    }
    case "view-invoice": {
      const f = state.invoices[Number(el.dataset.id)];
      if (f) toast(f.id, `${f.patient} · ${money(f.amount)} · ${f.status}`);
      break;
    }
    case "select-day": {
      const day = el.dataset.day;
      addAppointment();
      const dateField = $("#modalForm").elements.date;
      if (dateField) dateField.value = `2026-10-${String(day).padStart(2,"0")}`;
      break;
    }
    case "toggle-setting":
      el.classList.toggle("on");
      el.setAttribute("aria-checked", el.classList.contains("on") ? "true" : "false");
      toast("Préférence modifiée", "État local du prototype uniquement.");
      break;
    case "save-settings":
      toast("Préférences enregistrées", "Les paramètres sont illustratifs et ne sont pas conservés après rechargement.");
      break;
    default: break;
  }
}

document.addEventListener("click", event => {
  const pageButton = event.target.closest("[data-page]");
  if (pageButton) {
    event.preventDefault();
    navigate(pageButton.dataset.page);
    return;
  }
  const actionButton = event.target.closest("[data-action]");
  if (actionButton) handleAction(actionButton.dataset.action, actionButton);
});

$("#closeModal").addEventListener("click", closeModal);
$("#cancelModal").addEventListener("click", closeModal);
$("#modalBackdrop").addEventListener("click", event => {
  if (event.target === $("#modalBackdrop")) closeModal();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    $("#globalSearch").focus();
  }
});

$("#menuToggle").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
$("#notificationBtn").addEventListener("click", () => toast("Notifications", "Aucune nouvelle notification dans cette démonstration."));
$("#helpBtn").addEventListener("click", () => toast("Guide MediCAB", "Utilisez le menu latéral pour parcourir les maquettes et les boutons pour tester les formulaires."));

function filterRows(query) {
  const q = query.trim().toLowerCase();
  $$("#pageContent tbody tr[data-search-row]").forEach(row => {
    row.hidden = !row.dataset.searchRow.includes(q);
  });
}
$("#globalSearch").addEventListener("input", event => filterRows(event.target.value));
document.addEventListener("input", event => {
  if (event.target.matches("[data-table-search]")) filterRows(event.target.value);
});

$("#pageContent").addEventListener("click", event => {
  if (event.target.closest("#prevMonth")) toast("Calendrier", "La navigation mensuelle complète sera ajoutée dans une version ultérieure.");
  if (event.target.closest("#nextMonth")) toast("Calendrier", "La navigation mensuelle complète sera ajoutée dans une version ultérieure.");
  if (event.target.closest("#generateDraft")) {
    const notes = $("#aiNotes").value.trim();
    if (!notes) return toast("Notes manquantes", "Saisissez un scénario fictif avant de préparer le brouillon.", true);
    $("#aiOutput").textContent = [
      "BROUILLON DE DÉMONSTRATION — NON VALIDÉ",
      "",
      "Contexte fourni :",
      notes,
      "",
      "Points à vérifier par le professionnel :",
      "• Exactitude et complétude des informations fournies.",
      "• Ambiguïtés et informations manquantes.",
      "• Cohérence et validation du document avant toute utilisation.",
      "",
      "Aucune conclusion médicale n'a été générée. Cette simulation ne remplace pas un service IA réel."
    ].join("\n");
    toast("Brouillon préparé", "Simulation locale : aucune IA réelle n'a été appelée.");
  }
  if (event.target.closest("#copyDraft")) {
    const output = $("#aiOutput");
    if (!output || output.textContent.includes("apparaîtra ici")) return toast("Rien à copier", "Préparez d'abord un brouillon.", true);
    navigator.clipboard?.writeText(output.textContent)
      .then(() => toast("Copié", "Le brouillon a été copié."))
      .catch(() => toast("Copie indisponible", "Sélectionnez le texte du brouillon pour le copier.", true));
  }
});

navigate("dashboard");
