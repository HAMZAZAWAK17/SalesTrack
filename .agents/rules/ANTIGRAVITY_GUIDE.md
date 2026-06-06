# Guide — Antigravity : Rules + Prompts pour SalesTrack

---

## 1. Où placer le fichier rules

Antigravity lit les rules depuis **`.agents/rules/`** à la racine de votre projet.

```bash
# Structure à créer dans votre projet
salestrack/
├── .agents/
│   └── rules/
│       └── salestrack.md   ← copiez le fichier ici
├── backend/
├── frontend/
└── ...
```

**Commande rapide :**
```bash
mkdir -p .agents/rules
cp salestrack.md .agents/rules/salestrack.md
```

---

## 2. Activer la rule dans Antigravity

Dans l'éditeur Antigravity :

1. Cliquez sur **`...`** en haut à droite du panel agent
2. Allez dans **Customizations → Rules**
3. Votre fichier `salestrack.md` apparaît automatiquement
4. Passez-le en mode **"Always On"** pour qu'il s'applique à chaque prompt

> Mode **Manual** = vous devez mentionner `@salestrack` dans le prompt.
> Mode **Always On** = appliqué automatiquement à tout.

---

## 3. Comment envoyer vos prompts

### Avec "Always On" (recommandé)
Écrivez directement votre demande, les règles sont automatiques :

```
Crée la route POST /api/visites avec validation Zod et middleware auth.
```

### Avec mode "Manual"
Mentionnez la rule avec `@` :

```
@salestrack Crée la route POST /api/visites avec validation Zod et middleware auth.
```

---

## 4. Templates de prompts prêts à l'emploi

Copiez-collez dans le chat Antigravity.

---

### Authentification

```
Implémente le module auth JWT pour SalesTrack :
- POST /api/auth/login : vérifie email + bcrypt, retourne access token (15 min) + refresh token (7 jours)
- POST /api/auth/refresh : renouvelle l'access token
- POST /api/auth/logout : invalide le refresh token
- auth.middleware.js : vérifie JWT sur toutes les routes protégées
- role.middleware.js : accepte un tableau de rôles autorisés, rejette 403 sinon
Stack : Express + Prisma + bcrypt + jsonwebtoken
```

---

### Module Clients

```
Implémente le module Clients :

Backend :
- GET /api/clients : liste filtrée par rôle (COMMERCIAL → ses clients, MANAGER → équipe, ADMIN → tous)
  Query params : ville, canal, categorie, statut, search
- GET /api/clients/:id : fiche + historique visites et commandes
- POST /api/clients : Admin et Manager uniquement
- PUT /api/clients/:id : Admin et Manager uniquement

Frontend :
- Page ClientsList : tableau avec recherche, filtres, bouton "Nouveau client" conditionnel au rôle
- Page ClientDetail : fiche + onglets Visites / Commandes
- Formulaire ClientForm réutilisable (création + modification)
```

---

### Module Visites

```
Implémente le module Visites :

Backend :
- POST /api/visites : crée une visite. La dateDebut est capturée CÔTÉ SERVEUR. 
  Valide : si statutCommande=NON_COMMANDE alors raisonNonCommande est requise.
  La visite est TOUJOURS enregistrable, aucune raison ne bloque.
- GET /api/visites : liste filtrée par rôle + query params (dateDebut, dateFin, commercialId, clientId)
- GET /api/visites/:id : détail
- PUT /api/visites/:id : modification si appartient au commercial connecté

Frontend :
- Page NouvelleVisite : formulaire mobile-first, validable en moins de 5 clics, boutons min 48px
- Page MesVisites : liste filtrée par période (aujourd'hui / semaine / mois)
- Depuis ClientDetail : bouton "Nouvelle visite" pré-rempli avec le client sélectionné
```

---

### Module Commandes / Devis

```
Implémente le module Commandes :

Backend :
- POST /api/commandes : crée commande ou devis avec ses lignes.
  Le totalHT est recalculé CÔTÉ SERVEUR : SUM(quantite × prixUnitaireHT × (1 - remise/100))
  Ne jamais faire confiance au total envoyé par le client.
- GET /api/commandes : liste filtrée par rôle
- GET /api/commandes/:id : détail avec lignes
- PUT /api/commandes/:id/statut : BROUILLON → EN_ATTENTE → VALIDEE → TRAITEE

Frontend :
- Formulaire commande : sélection client, ajout dynamique de lignes, total affiché en temps réel
- Page MesCommandes : liste avec statuts colorés, filtre COMMANDE / DEVIS
```

---

### Dashboard

```
Implémente le tableau de bord :

Backend - GET /api/dashboard/stats :
Retourne selon le rôle :
- COMMERCIAL : ses propres stats uniquement
- MANAGER : stats agrégées de son équipe + détail par commercial
- ADMIN : stats globales + détail par commercial

KPIs obligatoires :
- nombre_visites (filtre : aujourd_hui / semaine / mois)
- taux_transformation = (visites avec commande / total visites) × 100
- clients_visites vs clients_total (sur la période)
- nombre_commandes_en_cours

Frontend :
- Dashboard Commercial : 3 boutons en haut (Nouvelle visite, Mes commandes, Mes clients) + KPIs
- Dashboard Manager/Admin : vue globale + tableau par commercial
- Composant StatCard réutilisable (icône, valeur, label, tendance)
```

---

### Seed de données

```
Crée le script de seed pour SalesTrack.
Il doit créer :
- 4 utilisateurs : admin@salestrack.test (ADMIN), manager@salestrack.test (MANAGER),
  commercial1@salestrack.test et commercial2@salestrack.test (COMMERCIAL, rattachés au manager)
- Tous les mots de passe : hashés avec bcrypt depuis Admin1234! / Manager1234! / Commercial1234!
- 10 clients répartis entre commercial1 et commercial2
- 20 visites variées (commandes et non-commandes, raisons différentes)
- 5 commandes/devis à différents statuts
```

---

### Docker Compose

```
Génère docker-compose.yml pour lancer SalesTrack en une commande :
- Service db : PostgreSQL 15, volume persistant, variables depuis .env
- Service backend : build ./backend, dépend de db, port 3001, volume uploads
- Service frontend : build ./frontend, dépend de backend, port 3000
Génère aussi backend/.env.example et frontend/.env.example
```

---

## 5. Conseil : Planning Mode pour les gros modules

Pour les tâches complexes (ex: implémenter tout le module Clients de A à Z),
utilisez le **Planning Mode** d'Antigravity avant de lancer :

```
[Planning Mode]
Je veux implémenter le module Clients complet de SalesTrack 
(backend routes + controller + frontend pages + composants).
Décompose la tâche étape par étape avant de commencer.
```

L'agent planifie d'abord, vous validez, puis il exécute.
