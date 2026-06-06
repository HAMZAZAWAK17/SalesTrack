---
trigger: always_on
---

# SalesTrack Rules

## Stack

- Frontend: React 18 + Vite + TailwindCSS
- Backend: Node.js + Express
- ORM: Prisma
- Base de données: PostgreSQL (SQLite en dev)
- Auth: JWT (access 15 min, refresh 7 jours)
- Stockage fichiers: filesystem local `/uploads`
- Aucun service payant autorisé

## Structure obligatoire

```
backend/src/
  routes/      ← un fichier par module
  controllers/ ← logique métier séparée
  middlewares/ ← auth.middleware.js, role.middleware.js
  models/
  utils/
frontend/src/
  pages/
  components/
  hooks/
  contexts/    ← AuthContext
  services/    ← api.js (tous les appels API ici)
```

## Modèle de données

```
User: id, email, passwordHash, firstName, lastName, phone
  role: ADMIN | MANAGER | COMMERCIAL
  managerId → User (nullable)

Client: id, code (unique), raisonSociale, contactPrincipal, telephone, email
  adresse, ville, secteur
  canal: ON_TRADE | OFF_TRADE
  categorie: CHR | HOTEL | RESTAURANT | CAFE | EPICERIE | GMS | TRADITIONNEL | AUTRE
  statut: ACTIF | INACTIF | PROSPECT
  commercialId → User
  latitude, longitude (nullable)
  notesInternes

Visite: id, clientId, commercialId
  dateDebut ← capturée CÔTÉ SERVEUR uniquement
  objet: PRISE_COMMANDE | SUIVI_CLIENT | RECOUVREMENT | VISIBILITE_MARQUE |
         IMPLANTATION_PRODUIT | NEGOCIATION | LIVRAISON | RELANCE | AUTRE
  commentaire
  statutCommande: COMMANDE | NON_COMMANDE
  raisonNonCommande (nullable): STOCK_NON_ECOULE | TROP_STOCK | BAISSE_ACTIVITE |
    CHANGEMENT_FOURNISSEUR | PRIX_ELEVE | CLIENT_ABSENT | ATTENTE_VALIDATION |
    PROBLEME_LIVRAISON | AUTRE
  problemesConstates (nullable): LIVRAISON | FACTURATION | STOCK | QUALITE | AUTRE
  latitude, longitude (nullable)

Commande: id, clientId, commercialId, visiteId (nullable)
  type: COMMANDE | DEVIS
  statut: BROUILLON | EN_ATTENTE | VALIDEE | TRAITEE | ANNULEE
  totalHT ← recalculé côté serveur uniquement

LigneCommande: id, commandeId, designation, reference, conditionnement
  quantite, prixUnitaireHT, remise (% défaut 0)
  totalLigneHT = quantite × prixUnitaireHT × (1 - remise/100)

Photo: id, visiteId, commercialId, clientId
  cheminFichier, legende (nullable), latitude, longitude (nullable)
  createdAt ← suppression auto à 30 jours
```

## Sécurité — règles absolues

- Toutes les routes (sauf POST /auth/login) protégées par middleware JWT
- Filtrage par rôle TOUJOURS côté serveur :
  - COMMERCIAL → uniquement ses propres données (ses clients, ses visites, ses commandes)
  - MANAGER → uniquement les données des commerciaux avec managerId = Manager.id
  - ADMIN → toutes les données
- Mots de passe : bcrypt uniquement, 10 rounds minimum
- Inputs validés avec Zod sur toutes les routes POST/PUT
- Secrets dans .env uniquement — jamais committés
- Format de réponse uniforme :
  `{ success: true, data: {...} }` ou `{ success: false, error: "...", code: "..." }`

## Règles métier critiques

- `dateDebut` d'une visite : capturée côté SERVEUR à la réception — jamais envoyée par le client
- Si `statutCommande = NON_COMMANDE` → `raisonNonCommande` obligatoire
- Si `statutCommande = COMMANDE` → `raisonNonCommande` doit être null
- Une visite est TOUJOURS enregistrable, aucune raison ne bloque
- `totalHT` commande : recalculé côté serveur (jamais faire confiance au total client)
- Photos : compression côté client avant upload (max 800px, qualité 0.7), suppression auto à 30 jours

## UX mobile-first

- 3 boutons accessibles en 1 tap depuis l'accueil Commercial : "Nouvelle visite", "Mes commandes", "Mes clients"
- Boutons : hauteur min 48px, texte min 14px
- Formulaire de visite : validable en moins de 5 clics
- Icônes toujours accompagnées d'un label texte

## Qualité code

- Appels API frontend exclusivement dans `services/api.js` — jamais directement dans un composant
- Pas de logique métier dans un composant React — utiliser hooks ou services
- Si une logique est réutilisée 2 fois → helper ou hook dédié
- Pas de console.log, pas d'imports inutilisés, pas de code mort
- Nommage : camelCase JS, snake_case SQL

## Comptes de test (seed obligatoire)

```
admin@salestrack.test     / Admin1234!       → rôle ADMIN
manager@salestrack.test   / Manager1234!     → rôle MANAGER
commercial1@salestrack.test / Commercial1234! → rôle COMMERCIAL, rattaché au manager
commercial2@salestrack.test / Commercial1234! → rôle COMMERCIAL, rattaché au manager
```

Seed doit aussi créer : 10+ clients répartis entre commerciaux, 20+ visites, 5+ commandes/devis.

## Interdits

- Aucun service payant
- Pas de .env commité — fournir .env.example
- Pas de total commande calculé côté client uniquement
- Pas de route sans middleware auth
- Pas de données d'un utilisateur exposées à un autre
