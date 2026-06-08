# 📖 Guide d'Installation et d'Exécution

Ce guide détaille comment configurer, exécuter et tester l'application **SalesTrack** dans différents environnements (avec Docker ou en local sans conteneur).

---

## 📋 Prérequis

Pour exécuter ce projet, vous devez installer :
- **Node.js** (version 18 ou supérieure recommandée)
- **NPM** (inclus avec Node.js)
- **Docker & Docker Compose** (recommandé pour une installation rapide)
- **MySQL** ou **PostgreSQL** (si vous souhaitez exécuter la base de données localement sans Docker)

---

## ⚡ Option 1 : Déploiement ultra-rapide avec Docker Compose

L'environnement complet est entièrement conteneurisé. Docker gère la base de données MySQL, le backend Node.js (avec Prisma) et le frontend React (servi par Nginx).

### 1. Démarrage des conteneurs
Depuis la racine du projet (où se trouve le fichier `docker-compose.yml`), exécutez la commande suivante :
```bash
docker-compose up -d --build
```

### 2. Vérification de l'état des services
Vous pouvez inspecter les logs des services pour vérifier qu'ils ont démarré correctement :
```bash
# Voir les logs de tous les services
docker-compose logs -f

# Voir spécifiquement les logs du backend (pour suivre la connexion à la base et le seed)
docker-compose logs -f backend
```

### 3. Accès aux applications
- **Frontend** : [http://localhost:5173](http://localhost:5173) (Redirige le trafic API vers `http://localhost:3001/api`)
- **Backend API** : [http://localhost:3001/api](http://localhost:3001/api)
- **Santé du serveur (Healthcheck)** : [http://localhost:3001/health](http://localhost:3001/health)
- **Port MySQL** : `3306` (avec identifiant `root` et mot de passe `rootpassword`)

### 4. Réinitialiser la base de données ou ré-exécuter le Seed sous Docker
Le conteneur backend applique les schémas Prisma et exécute le seed au démarrage. Si vous avez besoin de ré-exécuter le seed manuellement dans le conteneur :
```bash
docker-compose exec backend npx prisma db seed
```

### 5. Arrêt des conteneurs
Pour arrêter l'environnement Docker sans perdre vos données :
```bash
docker-compose down
```
Pour supprimer également les volumes contenant les données MySQL et les photos stockées :
```bash
docker-compose down -v
```

---

## 🛠️ Option 2 : Exécution Locale Manuelle (Développement)

Si vous préférez exécuter le backend et le frontend manuellement sur votre machine de développement.

### Étape 1 : Configuration et Lancement de la Base de Données
Avoir un serveur MySQL local en cours d'exécution sur le port `3306`. Vous devez créer une base de données vide nommée `salestrack`.

### Étape 2 : Configuration et Lancement du Backend
1. **Accéder au dossier backend** :
   ```bash
   cd backend
   ```

2. **Créer le fichier de configuration des variables d'environnement** :
   Copiez le fichier `.env.example` pour créer votre `.env` :
   ```bash
   cp .env.example .env
   ```
   *Sur Windows (PowerShell) :*
   ```powershell
   Copy-Item .env.example .env
   ```

3. **Renseigner les variables d'environnement dans le fichier `backend/.env`** :
   ```env
   PORT=3001
   DATABASE_URL="mysql://username:password@localhost:3306/salestrack"
   JWT_SECRET="une_cle_secrete_tres_longue_et_securisee_12345!"
   ```
   *(Remplacez `username` et `password` par vos identifiants de connexion MySQL locaux).*

4. **Installer les dépendances** :
   ```bash
   npm install
   ```

5. **Générer le client Prisma et synchroniser la structure de la base de données** :
   ```bash
   # Générer le client Prisma pour JS
   npx prisma generate

   # Pousser le schéma de données dans la base MySQL locale
   npx prisma db push
   ```

6. **Peupler la base de données (Seed)** :
   ```bash
   npx prisma db seed
   ```
   *Cette commande exécute le script `backend/prisma/seed.js` et crée les utilisateurs ADMIN, MANAGER, COMMERCIAL ainsi que des données fictives de test.*

7. **Démarrer le serveur backend** :
   ```bash
   npm start
   ```
   Le serveur backend démarrera sur le port `3001`.

---

### Étape 3 : Configuration et Lancement du Frontend
1. **Accéder au dossier frontend** (ouvrir une autre fenêtre de terminal) :
   ```bash
   cd frontend
   ```

2. **Créer le fichier `.env` pour le frontend** :
   ```bash
   cp .env.example .env
   ```
   *Sur Windows (PowerShell) :*
   ```powershell
   Copy-Item .env.example .env
   ```
   Assurez-vous que l'URL pointe vers l'API du backend :
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

3. **Installer les dépendances** :
   ```bash
   npm install
   ```

4. **Démarrer le serveur de développement Vite** :
   ```bash
   npm run dev
   ```
   Le serveur démarrera généralement sur [http://localhost:5173](http://localhost:5173).

---

## 🧪 Exécution des Tests

Le backend contient une suite de tests unitaires/d'intégration de base dans le dossier `/backend/tests`.

Pour exécuter les tests du backend :
1. Accédez au dossier `backend` :
   ```bash
   cd backend
   ```
2. Lancez les tests avec la commande :
   ```bash
   npm test
   ```

---

## ⚙️ Variables d'Environnement Détaillées

### Backend (`/backend/.env`)
- `PORT` : Le port sur lequel le serveur Express écoute (par défaut `3001`).
- `DATABASE_URL` : URL de connexion de la base de données MySQL. Format : `mysql://<user>:<password>@<host>:<port>/<database_name>`.
- `JWT_SECRET` : Clé de chiffrement utilisée pour signer les tokens JWT d'authentification.

### Frontend (`/frontend/.env`)
- `VITE_API_URL` : L'URL de l'API backend utilisée par le client Axios du frontend (par défaut `http://localhost:3001/api`).
