# MediCAB — Angular avec le design de la maquette originale

Cette version fusionne :
- les pages métier et les fonctions CRUD du projet `MediCAB-Angular-complet-auth-corrige-v2` ;
- l'identité visuelle de la maquette MediCAB d'origine (palette, typographies, sidebar, navigation, cartes, tableaux et modales) ;
- la connexion et l'inscription dans l'application Angular.

## Lancer le projet

Prérequis : Node.js 20.19+ ou 22.12+ et npm.

```bash
npm install
npm start
```

Puis ouvrir http://localhost:4200.

## Connexion de démonstration

- E-mail : `admin@medicab.ma`
- Mot de passe : `Admin123!`

Vous pouvez également créer un compte depuis l'écran Inscription.

## Fonctions incluses

- Tableau de bord et accès rapide ;
- Patients, rendez-vous, consultations, dossiers médicaux, documents et ordonnances ;
- Factures, lignes de facture et paiements ;
- Utilisateurs, médecins, secrétaires, rôles et permissions ;
- Fournisseurs, commandes, réceptions, articles, médicaments, lots, mouvements et inventaires ;
- Organismes d'assurance, couvertures, feuilles de soins et remboursements ;
- Journal d'activité, brouillons IA, assistant de rédaction et paramètres ;
- Ajout, modification, suppression avec confirmation, recherche, export JSON et réinitialisation des données locales.
- Icônes métier distinctes pour les modules, statuts visuels, alertes de stock et données de démonstration fictives.
- Champs relationnels avec listes de sélection alimentées par les enregistrements déjà saisis (patients, fournisseurs, articles, factures, etc.).

## Stockage et limites

Les données et comptes sont stockés dans `localStorage` du navigateur. L'authentification est une simulation pédagogique locale, pas un système de sécurité adapté à des données médicales réelles. L'assistant IA enregistre des brouillons ; il n'appelle aucun service d'IA et ne fournit aucun diagnostic. Quelques enregistrements fictifs sont préchargés pour illustrer les tableaux de bord et les listes. Les autres modules commencent vides et peuvent être alimentés depuis l’interface.

Les fichiers HTML/CSS/JS de la maquette originale sont conservés dans `public/maquette/` comme référence visuelle. L'interface active est rendue par les composants Angular.

## Fonctions front-end enrichies

Cette version conserve la charte graphique MediCAB et ajoute des interactions métier côté navigateur :

- agenda des rendez-vous avec vues jour/semaine/mois, navigation par date, création rapide et détection d'un créneau médecin déjà occupé ;
- fiche patient consultable depuis la liste, avec coordonnées, consultations et rendez-vous associés ;
- consultations enrichies avec constantes et observations ;
- factures avec remise, montant déjà payé et statut de règlement ;
- enregistrement des paiements avec contrôle du solde restant et mise à jour du statut de facture ;
- mouvements de stock qui mettent à jour les quantités et bloquent une sortie supérieure au stock disponible ;
- impression navigateur des factures et ordonnances (l'impression PDF dépend de la fonction « Enregistrer au format PDF » du navigateur) ;
- tableau de bord enrichi avec prochains rendez-vous, chiffre d'affaires, encaissements, solde et alertes ;
- rapports filtrables par période ;
- journalisation locale des créations, modifications et suppressions ;
- affichage des noms associés au lieu des seuls identifiants dans les tableaux.

## Limites à connaître

Les données et comptes sont stockés uniquement dans le `localStorage` du navigateur. Il n'y a ni serveur, ni base de données partagée, ni authentification sécurisée côté serveur, ni sauvegarde centralisée, ni contrôle d'accès fiable. Les documents imprimés sont des modèles de démonstration. N'utiliser que des données fictives et ne pas y enregistrer de données de santé réelles.
