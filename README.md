# 🚀 SalesTrack

**SalesTrack** est une application web moderne de suivi et de gestion des équipes commerciales sur le terrain. Conçue spécifiquement pour répondre aux besoins de pilotage commercial (notamment dans le secteur de la distribution au Maroc), elle permet d'enregistrer des visites clients, de saisir des commandes et des devis, de collecter des photos terrain et de suivre les performances en temps réel via des tableaux de bord interactifs.

---

## 📌 Table des Matières

1. [📖 Guide d'Installation et d'Exécution](readme/installation_execution.md)
2. [🏗️ Architecture et Structure du Code](readme/architecture_code.md)
3. [🗄️ Modèle de Données et Base de Données](readme/database_model.md)
4. [🔌 Documentation de l'API REST](readme/api_endpoints.md)

---

## 🛠️ Technologies Utilisées

L'application repose sur une architecture robuste et moderne :

### Frontend
- **Framework** : React 18 + Vite
- **Styling** : TailwindCSS + Material UI (pour certains composants et icônes)
- **Gestion d'état & formulaires** : React Context, React Hook Form, Zod
- **Client HTTP** : Axios

### Backend
- **Serveur** : Node.js + Express
- **ORM** : Prisma Client
- **Base de Données** : MySQL (ou PostgreSQL/SQLite selon la configuration)
- **Authentification** : JWT (JSON Web Token) avec un cycle de vie sécurisé (Access Token 15 min, Refresh Token 7 jours)
- **Validation** : Zod
- **Sécurité** : Hachage bcryptjs pour les mots de passe, Middlewares de contrôle d'accès par rôles

---

## ⚡ Lancement Rapide (Docker)

La méthode la plus simple pour démarrer l'ensemble du projet (Base de données, Backend et Frontend) est d'utiliser Docker Compose :

```bash
# Lancer les conteneurs en arrière-plan
docker-compose up -d --build
```

Une fois démarré, l'application est accessible aux adresses suivantes :
- **Frontend** : [http://localhost:5173](http://localhost:5173)
- **Backend API** : [http://localhost:3001/api](http://localhost:3001/api)
- **Base de données MySQL** : `localhost:3306`

> [!NOTE]
> Le script de seed de la base de données est automatiquement exécuté lors du démarrage du conteneur backend ou peut être exécuté manuellement pour pré-remplir l'application avec des comptes de test et des données de démonstration.

---

## 👤 Comptes de Test (Seed)

Voici les identifiants configurés par défaut dans le script de seed :

| Rôle | Adresse E-mail | Mot de Passe | Description |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@salestrack.test` | `Admin1234!` | Accès complet, gestion des utilisateurs, import CSV, etc. |
| **MANAGER** | `manager@salestrack.test` | `Manager1234!` | Supervise les commerciaux qui lui sont rattachés. |
| **COMMERCIAL 1** | `commercial1@salestrack.test` | `Commercial1234!` | Rattaché au Manager. Gère ses propres clients et visites. |
| **COMMERCIAL 2** | `commercial2@salestrack.test` | `Commercial1234!` | Rattaché au Manager. Gère ses propres clients et visites. |

---

## 📂 Organisation des Dossiers de Documentation

Pour explorer en profondeur le fonctionnement de SalesTrack, veuillez consulter les fichiers dédiés dans le dossier `/readme` :

- **[installation_execution.md](readme/installation_execution.md)** : Guide d'installation complet (Docker et exécution locale manuelle étape par étape), variables d'environnement, et exécution des tests.
- **[architecture_code.md](readme/architecture_code.md)** : Analyse de la structure du code (Frontend et Backend), gestion de l'état global avec React, flux de sécurité/JWT, et séparation de la logique métier.
- **[database_model.md](readme/database_model.md)** : Modèles Prisma, relations entre entités (Utilisateurs, Clients, Visites, Commandes, Lignes de commande, Photos) et contraintes d'intégrité.
- **[api_endpoints.md](readme/api_endpoints.md)** : Liste exhaustive de toutes les routes de l'API backend avec les structures de requêtes/réponses et les règles de filtrage par rôles.
