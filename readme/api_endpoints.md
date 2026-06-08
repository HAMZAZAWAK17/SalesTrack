# 🔌 Documentation de l'API REST

Toutes les requêtes de l'API SalesTrack s'effectuent sur le préfixe `/api` (ex: `http://localhost:3001/api`).
Toutes les routes (à l'exception de la connexion) requièrent l'envoi d'un token JWT valide dans les en-têtes :
`Authorization: Bearer <votre_token_jwt>`

---

## 🔑 Authentification (`/api/auth`)

### 1. Authentification de l'utilisateur (Connexion)
- **URL** : `POST /login`
- **Authentification requise** : Non
- **Corps de la requête (JSON)** :
  ```json
  {
    "email": "commercial1@salestrack.test",
    "password": "Commercial1234!"
  }
  ```
- **Réponse de succès (200 OK)** :
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": 3,
        "email": "commercial1@salestrack.test",
        "firstName": "Hamza",
        "lastName": "Zawak",
        "role": "COMMERCIAL",
        "equipe": "Équipe Centre"
      },
      "token": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
  ```

### 2. Renouvellement du Token (Refresh Token)
- **URL** : `POST /refresh`
- **Authentification requise** : Non
- **Corps de la requête (JSON)** :
  ```json
  {
    "refreshToken": "eyJhbGciOi..."
  }
  ```
- **Réponse de succès (200 OK)** :
  ```json
  {
    "success": true,
    "data": {
      "token": "nouvel_access_token_ici",
      "refreshToken": "nouveau_refresh_token_ici"
    }
  }
  ```

---

## 👥 Utilisateurs (`/api/users`)

| Méthode & Route | Rôle requis | Description |
| :--- | :--- | :--- |
| `GET /api/users/managers` | Tous | Renvoie la liste simplifiée des managers (pour assignation). |
| `GET /api/users/profile` | Tous | Renvoie les détails du profil de l'utilisateur actuellement connecté. |
| `PUT /api/users/profile` | Tous | Met à jour les informations du profil de l'utilisateur connecté. |
| `GET /api/users` | `ADMIN` | Liste l'ensemble des utilisateurs du système. |
| `GET /api/users/:id` | `ADMIN` | Détail d'un utilisateur spécifique. |
| `POST /api/users` | `ADMIN` | Crée un nouvel utilisateur (avec rôle commercial, manager ou admin). |
| `PUT /api/users/:id` | `ADMIN` | Modifie les données d'un utilisateur. |
| `DELETE /api/users/:id` | `ADMIN` | Supprime un utilisateur du système. |

---

## 🏢 Clients (`/api/clients`)

### 1. Lister les clients
- **URL** : `GET /api/clients`
- **Paramètres de requête acceptés (Query parameters)** :
  - `search` (recherche par code, raison sociale, ville, etc.)
  - `status` (`ACTIVE`, `INACTIVE`, `PROSPECT`)
  - `category` (`HOTEL`, `CAFE`, etc.)
  - `city` (filtrage par ville)
- **Comportement par rôle (Cloisonnement)** :
  - `COMMERCIAL` : Reçoit uniquement les clients qui lui sont assignés.
  - `MANAGER` : Reçoit les clients assignés aux commerciaux de son équipe.
  - `ADMIN` : Reçoit l'intégralité des clients.

### 2. Autres routes
| Méthode & Route | Rôle requis | Description |
| :--- | :--- | :--- |
| `GET /api/clients/cities` | Tous | Récupère la liste de toutes les villes dans lesquelles se trouvent des clients. |
| `GET /api/clients/export` | Tous | Exporte les clients sous forme de fichier CSV (respecte le cloisonnement). |
| `POST /api/clients/import` | `ADMIN` | Importe des clients en masse via un fichier CSV multipart. |
| `GET /api/clients/:id` | Tous | Récupère les informations d'un client si l'accès est autorisé. |
| `POST /api/clients` | `ADMIN` | Crée un nouveau client. |
| `PUT /api/clients/:id` | Tous | Met à jour un client (Autorisé pour ADMIN, ou commercial attitré / manager). |
| `DELETE /api/clients/:id` | `ADMIN` | Supprime un client. |

---

## 🚗 Visites (`/api/visites`)

### 1. Créer une visite
- **URL** : `POST /api/visites`
- **Corps de la requête (JSON)** :
  ```json
  {
    "clientId": 1,
    "objet": "PRISE_COMMANDE",
    "commentaire": "Présentation des nouveaux produits.",
    "statutCommande": "NON_COMMANDE",
    "raisonNonCommande": "TROP_STOCK",
    "problemesConstates": null,
    "latitude": 33.5731,
    "longitude": -7.5898
  }
  ```
  *(Note : `dateDebut` n'est pas envoyé, elle est capturée à la date/heure actuelle côté serveur).*

### 2. Télécharger une photo pour une visite
- **URL** : `POST /api/visites/upload`
- **Type de contenu** : `multipart/form-data`
- **Paramètres** :
  - `photo` : Fichier image.
- **Réponse (200 OK)** :
  ```json
  {
    "success": true,
    "data": {
      "cheminFichier": "/uploads/photo-1700123456789.png"
    }
  }
  ```

### 3. Autres routes
| Méthode & Route | Rôle requis | Description |
| :--- | :--- | :--- |
| `GET /api/visites` | Tous | Liste les visites en fonction du cloisonnement par rôle. |
| `GET /api/visites/export` | Tous | Exporte la liste des visites filtrée au format CSV. |
| `GET /api/visites/:id` | Tous | Détail d'une visite. |
| `PUT /api/visites/:id` | Tous | Permet de modifier une visite existante. |
| `DELETE /api/visites/:id` | Tous (selon droits)| Supprime une visite. |
| `POST /api/visites/cleanup-photos` | Tous | Déclenche manuellement la suppression des photos de plus de 30 jours. |

---

## 📦 Commandes (`/api/commandes`)

### 1. Créer une commande
- **URL** : `POST /api/commandes`
- **Corps de la requête (JSON)** :
  ```json
  {
    "clientId": 1,
    "visiteId": 2,
    "type": "COMMANDE",
    "statut": "EN_ATTENTE",
    "lignes": [
      {
        "designation": "Boisson Cola 33cl",
        "reference": "COL33",
        "conditionnement": "Carton de 24",
        "quantite": 10,
        "prixUnitaireHT": 12.0,
        "remise": 5
      }
    ]
  }
  ```
- **Calculs automatiques du serveur** :
  - `totalLigneHT` = `10 * 12.0 * (1 - 0.05)` = `114.0`
  - `totalHT` = somme des lignes = `114.0` (enregistré dans la table Commande).

### 2. Autres routes
| Méthode & Route | Rôle requis | Description |
| :--- | :--- | :--- |
| `GET /api/commandes` | Tous | Liste les commandes filtrées selon le cloisonnement de rôles. |
| `GET /api/commandes/export` | Tous | Exporte les commandes au format CSV. |
| `GET /api/commandes/:id` | Tous | Détail d'une commande avec toutes ses lignes de commande associées. |
| `PUT /api/commandes/:id` | Tous | Modifie une commande (met à jour et recalcule les montants). |
| `DELETE /api/commandes/:id` | Tous | Supprime une commande (avec suppression cascade de ses lignes). |

---

## 📊 Tableaux de bord (`/api/dashboard`)

### 1. Statistiques consolidées
- **URL** : `GET /api/dashboard/stats`
- **Description** : Retourne des données agrégées pour l'affichage de graphiques et indicateurs de performance.
- **Comportement par rôle (Cloisonnement)** :
  - `COMMERCIAL` : Statistiques personnelles (son chiffre d'affaires, ses visites, son taux de conversion).
  - `MANAGER` : Statistiques agrégées de toute son équipe de commerciaux.
  - `ADMIN` : Statistiques globales de l'entreprise.
