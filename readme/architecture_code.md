# 🏗️ Architecture et Structure du Code

L'application **SalesTrack** est structurée de manière modulaire, suivant les meilleures pratiques de développement web moderne (Clean Architecture, séparation des responsabilités et contrôle d'accès rigoureux).

---

## 📂 Architecture Globale

```
SalesTrack/
├── docker-compose.yml       # Orchestration des conteneurs (MySQL, Backend, Frontend)
├── uploads/                 # Stockage local des photos de visite envoyées par le terrain
├── backend/                 # API REST (Node.js, Express, Prisma)
│   ├── prisma/              # Schéma de base de données et script de peuplement (seed)
│   └── src/                 # Code source backend
│       ├── controllers/     # Contrôleurs HTTP (gestion des requêtes/réponses)
│       ├── middlewares/     # Middlewares Express (authentification JWT, rôles)
│       ├── routes/          # Définition des routes de l'API par module
│       ├── services/        # Logique métier (calculs, requêtes complexes Prisma)
│       └── utils/           # Partage d'outils (client Prisma DB)
└── frontend/                # Application client (React, Vite, TailwindCSS)
    └── src/
        ├── components/      # Composants UI réutilisables (Navbar, Filtres, Formulaires)
        ├── contexts/        # Gestion d'état global (AuthContext)
        ├── pages/           # Pages de l'application (organisées par rôle et fonctionnalité)
        └── services/        # Centralisation des appels API (api.js, etc.)
```

---

## 🖥️ Fonctionnement du Backend (Express & Prisma)

Le backend adopte une architecture en **couches** afin de découpler la logique réseau de la logique métier et de l'accès aux données.

### 1. La couche Routes (`src/routes/`)
Chaque module de l'application possède son propre fichier de routes (ex: `visitRoutes.js`, `commandeRoutes.js`).
- Elles configurent les points d'accès HTTP (`GET`, `POST`, `PUT`, `DELETE`).
- Elles appliquent les middlewares de sécurité globale et de vérification des rôles.

### 2. La couche Middlewares (`src/middlewares/`)
- **`auth.middleware.js`** : Intercepte les requêtes, extrait le token JWT présent dans l'en-tête `Authorization: Bearer <token>`, valide sa signature et attache les informations de l'utilisateur décodé à la requête (`req.user`).
- **`role.middleware.js`** : Permet de restreindre des routes à certains rôles uniquement (ex: `roleMiddleware(['ADMIN'])`).

### 3. La couche Contrôleurs (`src/controllers/`)
Les contrôleurs récupèrent les données de la requête HTTP (paramètres d'URL, query strings, corps JSON) et délèguent le travail à la couche service. Ils renvoient des réponses HTTP uniformes :
- **Succès** : `{ success: true, data: { ... } }`
- **Échec** : `{ success: false, error: "Message d'erreur", code: "CODE_ERREUR" }`

### 4. La couche Services (`src/services/`)
Toute la logique métier réside ici. C'est dans cette couche que :
- L'intégrité des règles métier est vérifiée (ex: contrôle qu'une raison de non-commande est fournie si aucun achat n'a été fait).
- Les totaux financiers (comme le total HT d'une commande) sont recalculés côté serveur de manière sécurisée en interrogeant la base de données.
- Le cloisonnement des données par rôle est dynamiquement injecté dans les requêtes Prisma (voir règles ci-dessous).

---

## 🔒 Règles de Cloisonnement et de Sécurité

La sécurité des données est gérée au niveau de l'API. Chaque requête filtrera les données retournées en fonction de l'identité et du rôle de l'utilisateur connecté (`req.user`) :

### 1. Rôle COMMERCIAL
Le commercial ne peut voir et modifier que ses propres données :
- **Clients** : Uniquement ceux qui lui sont assignés (`assignedTo = user.id`).
- **Visites** : Uniquement celles qu'il a initiées (`commercialId = user.id`).
- **Commandes** : Uniquement celles qu'il a passées (`commercialId = user.id`).
- **Photos** : Uniquement ses propres photos (`commercialId = user.id`).

### 2. Rôle MANAGER
Le manager supervise une équipe de commerciaux :
- Il peut voir les données de tous les commerciaux pour lesquels `managerId = manager.id`.
- Il n'a pas accès aux données des autres équipes ou des autres managers.

### 3. Rôle ADMIN
L'administrateur a un accès absolu sur toutes les données du système. Il est le seul à pouvoir :
- Créer, modifier et supprimer des utilisateurs (commerciaux, managers).
- Créer ou supprimer des fiches clients.
- Importer des listes de clients via l'import de fichier CSV.

---

## 📱 Fonctionnement du Frontend (React 18 & Vite)

### 1. Centralisation des Appels API (`src/services/api.js`)
Pour respecter les règles d'architecture et éviter d'éparpiller des requêtes réseau dans les composants graphiques :
- Tous les appels HTTP vers le backend transitent par l'instance Axios configurée dans `api.js`.
- Cette instance utilise des **intercepteurs de requêtes** pour injecter automatiquement le token JWT actif.
- Elle possède également un **intercepteur de réponses** qui gère la détection des erreurs `401 Unauthorized` pour renouveler de façon transparente le token d'accès expiré à l'aide du Refresh Token.

### 2. Gestion de l'Authentification (`src/contexts/AuthContext.jsx`)
- Le composant `AuthProvider` maintient l'état de l'utilisateur connecté.
- Il expose les fonctions `login`, `logout` et vérifie la persistance de la session au rechargement de la page.
- Il permet de restreindre l'affichage de certains composants ou de bloquer l'accès à des routes frontend privées en fonction du rôle.

### 3. Cycle de Vie des Photos (Règle métier)
- Les photos prises sur le terrain par les commerciaux sont compressées à l'aide de canvas côté client avant leur téléversement (taille max 800px de large, qualité 0.7) afin d'économiser la bande passante et l'espace de stockage.
- Les fichiers sont envoyés via Multipart Form Data et stockés sur le serveur dans le dossier physique `/uploads`.
- Une suppression automatique est configurée côté serveur pour purger les fichiers photos de plus de 30 jours afin de préserver l'espace disque.
