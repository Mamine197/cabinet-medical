import uuid
from django.conf import settings
from django.db import models


class Patient(models.Model):
    id = models.CharField(max_length=80, primary_key=True, default=uuid.uuid4, editable=False)
    nom = models.CharField("Nom complet", max_length=150)
    email = models.EmailField("E-mail", blank=True)
    telephone = models.CharField("Téléphone", max_length=30, blank=True)
    dateNaissance = models.DateField("Date de naissance", null=True, blank=True)
    age = models.IntegerField("Âge", null=True, blank=True)
    sexe = models.CharField("Sexe", max_length=20, blank=True)
    adresse = models.TextField("Adresse", blank=True)
    groupeSanguin = models.CharField("Groupe sanguin", max_length=10, blank=True)
    derniereVisite = models.DateField("Dernière visite", null=True, blank=True)
    statut = models.CharField("Statut", max_length=30, default="Actif")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["nom"]

    def __str__(self):
        return self.nom


class DossierMedical(models.Model):
    id = models.CharField(max_length=80, primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="dossiers_medicaux")
    antecedents = models.TextField("Antécédents", blank=True)
    allergies = models.TextField("Allergies", blank=True)
    groupeSanguin = models.CharField("Groupe sanguin", max_length=10, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Dossier {self.patient.nom}"


class RendezVous(models.Model):
    STATUT_CHOICES = [
        ("En attente", "En attente"),
        ("Confirmé", "Confirmé"),
        ("Annulé", "Annulé"),
        ("Terminé", "Terminé"),
    ]
    id = models.CharField(max_length=80, primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="rendez_vous")
    date = models.DateField("Date")
    heure = models.CharField("Heure", max_length=10)
    motif = models.CharField("Motif", max_length=255, blank=True)
    statut = models.CharField("Statut", max_length=30, choices=STATUT_CHOICES, default="En attente")
    medecin = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="rendez_vous_medecin"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-heure"]
        indexes = [models.Index(fields=["date", "heure"])]

    def __str__(self):
        return f"RDV {self.patient.nom} le {self.date} à {self.heure}"


class Consultation(models.Model):
    STATUT_CHOICES = [
        ("En cours", "En cours"),
        ("Terminée", "Terminée"),
        ("Annulée", "Annulée"),
    ]
    id = models.CharField(max_length=80, primary_key=True, default=uuid.uuid4, editable=False)
    rendezVous = models.ForeignKey(RendezVous, on_delete=models.SET_NULL, null=True, blank=True, related_name="consultations")
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="consultations")
    medecin = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="consultations_praticien"
    )
    date = models.DateField("Date", null=True, blank=True)
    motif = models.CharField("Motif", max_length=255, blank=True)
    pressionArterielle = models.CharField("Tension artérielle", max_length=30, blank=True)
    temperature = models.DecimalField("Température (°C)", max_digits=5, decimal_places=2, null=True, blank=True)
    poids = models.DecimalField("Poids (kg)", max_digits=5, decimal_places=2, null=True, blank=True)
    taille = models.DecimalField("Taille (cm)", max_digits=5, decimal_places=2, null=True, blank=True)
    diagnostic = models.TextField("Diagnostic", blank=True)
    notes = models.TextField("Notes médicales", blank=True)
    statut = models.CharField("Statut", max_length=30, choices=STATUT_CHOICES, default="En cours")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"Consultation {self.patient.nom} ({self.date})"


class Prescription(models.Model):
    STATUT_CHOICES = [
        ("Brouillon", "Brouillon"),
        ("Émise", "Émise"),
        ("Clôturée", "Clôturée"),
    ]
    id = models.CharField(max_length=80, primary_key=True, default=uuid.uuid4, editable=False)
    consultation = models.ForeignKey(Consultation, on_delete=models.CASCADE, related_name="prescriptions")
    date = models.DateField("Date", null=True, blank=True)
    statut = models.CharField("Statut", max_length=30, choices=STATUT_CHOICES, default="Brouillon")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Ordonnance {self.id} ({self.statut})"


class LignePrescription(models.Model):
    id = models.CharField(max_length=80, primary_key=True, default=uuid.uuid4, editable=False)
    ordonnance = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name="lignes")
    medicamentId = models.CharField("Médicament", max_length=150)
    posologie = models.CharField("Posologie", max_length=255, blank=True)
    duree = models.CharField("Durée", max_length=100, blank=True)
    quantite = models.IntegerField("Quantité", default=1)

    def __str__(self):
        return f"{self.medicamentId} - {self.posologie}"


class Facture(models.Model):
    STATUT_CHOICES = [
        ("En attente", "En attente"),
        ("Partiellement payée", "Partiellement payée"),
        ("Payée", "Payée"),
        ("En retard", "En retard"),
        ("Annulée", "Annulée"),
    ]
    id = models.CharField(max_length=80, primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="factures")
    date = models.DateField("Date", null=True, blank=True)
    designation = models.CharField("Prestation", max_length=255, default="Consultation médicale")
    montant = models.DecimalField("Montant TTC (DH)", max_digits=10, decimal_places=2, default=0.0)
    remise = models.DecimalField("Remise (DH)", max_digits=10, decimal_places=2, default=0.0)
    montantPaye = models.DecimalField("Montant déjà payé (DH)", max_digits=10, decimal_places=2, default=0.0)
    statut = models.CharField("Statut", max_length=30, choices=STATUT_CHOICES, default="En attente")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"Facture {self.id} - {self.patient.nom} ({self.montant} DH)"


class Paiement(models.Model):
    MODE_CHOICES = [
        ("Espèces", "Espèces"),
        ("Carte", "Carte"),
        ("Virement", "Virement"),
        ("Chèque", "Chèque"),
        ("Autre", "Autre"),
    ]
    id = models.CharField(max_length=80, primary_key=True, default=uuid.uuid4, editable=False)
    facture = models.ForeignKey(Facture, on_delete=models.CASCADE, related_name="paiements")
    date = models.DateField("Date", null=True, blank=True)
    montant = models.DecimalField("Montant (DH)", max_digits=10, decimal_places=2, default=0.0)
    mode = models.CharField("Mode de paiement", max_length=30, choices=MODE_CHOICES, default="Espèces")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"Paiement {self.montant} DH pour {self.facture_id}"


class ModuleRecord(models.Model):
    """Enregistrement générique pour les modules étendus (stocks, achats, assurances)."""
    id = models.CharField(max_length=80, primary_key=True, default=uuid.uuid4, editable=False)
    module = models.SlugField(max_length=80, db_index=True)
    data = models.JSONField(default=dict)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="clinic_records_created"
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="clinic_records_updated"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["module", "-created_at"])]

    def __str__(self):
        return f"{self.module}:{self.id}"
