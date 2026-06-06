-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : sam. 06 juin 2026 à 13:16
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `salestrack`
--

-- --------------------------------------------------------

--
-- Structure de la table `clients`
--

CREATE TABLE `clients` (
  `id` int(11) NOT NULL,
  `code` varchar(191) NOT NULL,
  `company_name` varchar(191) NOT NULL,
  `phone` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `address` varchar(191) NOT NULL,
  `city` varchar(191) NOT NULL,
  `distribution_channel` varchar(191) NOT NULL,
  `category` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL,
  `assigned_to` int(11) NOT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `clients`
--

INSERT INTO `clients` (`id`, `code`, `company_name`, `phone`, `email`, `address`, `city`, `distribution_channel`, `category`, `status`, `assigned_to`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'CL001', 'Café de la Gare', '0142345678', 'gare@cafe.com', '1 Rue de la Gare', 'Lille', 'ON_TRADE', 'CAFE', 'ACTIVE', 3, NULL, '2026-06-06 11:14:40.618', '2026-06-06 11:14:40.618'),
(2, 'CL002', 'Hôtel Le Bristol', '0143456789', 'bristol@hotel.com', '45 Rue de la Paix', 'Lille', 'ON_TRADE', 'HOTEL', 'ACTIVE', 3, NULL, '2026-06-06 11:14:40.624', '2026-06-06 11:14:40.624'),
(3, 'CL003', 'Restaurant L’Aura', '0144567890', 'laura@resto.com', '12 Avenue Foch', 'Lille', 'ON_TRADE', 'RESTAURANT', 'ACTIVE', 3, NULL, '2026-06-06 11:14:40.634', '2026-06-06 11:14:40.634'),
(4, 'CL004', 'Épicerie fine Bon Goût', '0145678901', 'bongout@epicerie.com', '88 Rue Royale', 'Lille', 'OFF_TRADE', 'GROCERY', 'ACTIVE', 3, NULL, '2026-06-06 11:14:40.639', '2026-06-06 11:14:40.639'),
(5, 'CL005', 'Supermarché Auchan', '0146789012', 'auchan@gms.com', 'ZAC du Moulin', 'Lille', 'OFF_TRADE', 'SUPERMARKET', 'PROSPECT', 3, NULL, '2026-06-06 11:14:40.644', '2026-06-06 11:14:40.644'),
(6, 'CL006', 'Bar de la Marine', '0147890123', 'marine@bar.com', 'Quai du Port', 'Roubaix', 'ON_TRADE', 'CAFE', 'ACTIVE', 4, NULL, '2026-06-06 11:14:40.650', '2026-06-06 11:14:40.650'),
(7, 'CL007', 'Hôtel Splendid', '0148901234', 'splendid@hotel.com', '15 Boulevard Carnot', 'Roubaix', 'ON_TRADE', 'HOTEL', 'ACTIVE', 4, NULL, '2026-06-06 11:14:40.655', '2026-06-06 11:14:40.655'),
(8, 'CL008', 'Bistrot du Nord', '0149012345', 'nord@bistrot.com', '67 Rue Jean Jaurès', 'Roubaix', 'ON_TRADE', 'RESTAURANT', 'INACTIVE', 4, NULL, '2026-06-06 11:14:40.661', '2026-06-06 11:14:40.661'),
(9, 'CL009', 'Alimentation Générale', '0150123456', 'kamel@aliment.com', '110 Rue de Paris', 'Roubaix', 'OFF_TRADE', 'TRADITIONAL', 'ACTIVE', 4, NULL, '2026-06-06 11:14:40.665', '2026-06-06 11:14:40.665'),
(10, 'CL010', 'GMS Carrefour', '0151234567', 'carrefour@gms.com', 'Avenue Kennedy', 'Roubaix', 'OFF_TRADE', 'SUPERMARKET', 'PROSPECT', 4, NULL, '2026-06-06 11:14:40.675', '2026-06-06 11:14:40.675');

-- --------------------------------------------------------

--
-- Structure de la table `commandes`
--

CREATE TABLE `commandes` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `commercial_id` int(11) NOT NULL,
  `visite_id` int(11) DEFAULT NULL,
  `type` varchar(191) NOT NULL,
  `statut` varchar(191) NOT NULL,
  `total_ht` double NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `commandes`
--

INSERT INTO `commandes` (`id`, `client_id`, `commercial_id`, `visite_id`, `type`, `statut`, `total_ht`, `created_at`, `updated_at`) VALUES
(1, 1, 3, 1, 'COMMANDE', 'VALIDEE', 120, '2026-06-06 11:14:40.784', '2026-06-06 11:14:40.784'),
(2, 2, 3, 3, 'COMMANDE', 'EN_ATTENTE', 450, '2026-06-06 11:14:40.791', '2026-06-06 11:14:40.791'),
(3, 3, 3, NULL, 'DEVIS', 'BROUILLON', 90, '2026-06-06 11:14:40.803', '2026-06-06 11:14:40.803'),
(4, 6, 4, 11, 'COMMANDE', 'TRAITEE', 240, '2026-06-06 11:14:40.808', '2026-06-06 11:14:40.808'),
(5, 7, 4, NULL, 'DEVIS', 'VALIDEE', 180, '2026-06-06 11:14:40.812', '2026-06-06 11:14:40.812');

-- --------------------------------------------------------

--
-- Structure de la table `ligne_commandes`
--

CREATE TABLE `ligne_commandes` (
  `id` int(11) NOT NULL,
  `commande_id` int(11) NOT NULL,
  `designation` varchar(191) NOT NULL,
  `reference` varchar(191) NOT NULL,
  `conditionnement` varchar(191) NOT NULL,
  `quantite` int(11) NOT NULL,
  `prix_unitaire_ht` double NOT NULL,
  `remise` double NOT NULL DEFAULT 0,
  `total_ligne_ht` double NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `ligne_commandes`
--

INSERT INTO `ligne_commandes` (`id`, `commande_id`, `designation`, `reference`, `conditionnement`, `quantite`, `prix_unitaire_ht`, `remise`, `total_ligne_ht`, `created_at`, `updated_at`) VALUES
(1, 1, 'Boisson Cola 33cl', 'COL33', 'Carton de 24', 5, 12, 0, 60, '2026-06-06 11:14:40.784', '2026-06-06 11:14:40.784'),
(2, 1, 'Eau Pétillante 50cl', 'EAU50', 'Carton de 12', 5, 12, 0, 60, '2026-06-06 11:14:40.784', '2026-06-06 11:14:40.784'),
(3, 2, 'Jus d’Orange Bio 1L', 'JUS1L', 'Carton de 6', 10, 15, 0, 150, '2026-06-06 11:14:40.791', '2026-06-06 11:14:40.791'),
(4, 2, 'Bière Blonde Premium', 'BIE33', 'Fût 30L', 3, 100, 0, 300, '2026-06-06 11:14:40.791', '2026-06-06 11:14:40.791'),
(5, 3, 'Eau Plate 1.5L', 'EAU15', 'Pack de 6', 10, 10, 10, 90, '2026-06-06 11:14:40.803', '2026-06-06 11:14:40.803'),
(6, 4, 'Boisson Cola 33cl', 'COL33', 'Carton de 24', 20, 12, 0, 240, '2026-06-06 11:14:40.808', '2026-06-06 11:14:40.808'),
(7, 5, 'Jus de Pomme 1L', 'POM1L', 'Carton de 6', 12, 15, 0, 180, '2026-06-06 11:14:40.812', '2026-06-06 11:14:40.812');

-- --------------------------------------------------------

--
-- Structure de la table `photos`
--

CREATE TABLE `photos` (
  `id` int(11) NOT NULL,
  `visite_id` int(11) NOT NULL,
  `commercial_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `chemin_fichier` varchar(191) NOT NULL,
  `legende` varchar(191) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password_hash` varchar(191) NOT NULL,
  `first_name` varchar(191) NOT NULL,
  `last_name` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `role` varchar(191) NOT NULL,
  `equipe` varchar(191) DEFAULT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `first_name`, `last_name`, `phone`, `role`, `equipe`, `manager_id`, `created_at`, `updated_at`) VALUES
(1, 'admin@salestrack.test', '$2b$10$bfpbqg7MpbBzBZRodfE3tOTm3wpAGHw28NclPBByvlGjP7n7Canzy', 'Jean', 'Admin', '+33611223344', 'ADMIN', NULL, NULL, '2026-06-06 11:14:40.583', '2026-06-06 11:14:40.583'),
(2, 'manager@salestrack.test', '$2b$10$HxzIpcfcFPTCusbnzGv8wut2HjXekpAHSIN1KwV/MtrKNCW8KrqkW', 'Marc', 'Manager', '+33622334455', 'MANAGER', 'Équipe Nord', NULL, '2026-06-06 11:14:40.597', '2026-06-06 11:14:40.597'),
(3, 'commercial1@salestrack.test', '$2b$10$Y0gGjiFcpwEl90c6pTNRKeQDEtZ8qiuqFlyCWq95qfluJBoq36Xwq', 'Alice', 'Commerciale', '+33633445566', 'COMMERCIAL', 'Équipe Nord', 2, '2026-06-06 11:14:40.607', '2026-06-06 11:14:40.607'),
(4, 'commercial2@salestrack.test', '$2b$10$Y0gGjiFcpwEl90c6pTNRKeQDEtZ8qiuqFlyCWq95qfluJBoq36Xwq', 'Bob', 'Commercial', '+33644556677', 'COMMERCIAL', 'Équipe Nord', 2, '2026-06-06 11:14:40.613', '2026-06-06 11:14:40.613');

-- --------------------------------------------------------

--
-- Structure de la table `visites`
--

CREATE TABLE `visites` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `commercial_id` int(11) NOT NULL,
  `date_debut` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `objet` varchar(191) NOT NULL,
  `commentaire` varchar(191) NOT NULL,
  `statut_commande` varchar(191) NOT NULL,
  `raison_non_commande` varchar(191) DEFAULT NULL,
  `problemes_constates` varchar(191) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `visites`
--

INSERT INTO `visites` (`id`, `client_id`, `commercial_id`, `date_debut`, `objet`, `commentaire`, `statut_commande`, `raison_non_commande`, `problemes_constates`, `latitude`, `longitude`, `created_at`, `updated_at`) VALUES
(1, 1, 3, '2026-06-06 11:14:40.678', 'PRISE_COMMANDE', 'Visite de routine numéro 1 chez undefined.', 'COMMANDE', NULL, 'STOCK', NULL, NULL, '2026-06-06 11:14:40.680', '2026-06-06 11:14:40.680'),
(2, 2, 3, '2026-06-05 11:14:40.683', 'SUIVI_CLIENT', 'Visite de routine numéro 2 chez undefined.', 'NON_COMMANDE', 'TROP_STOCK', NULL, NULL, NULL, '2026-06-06 11:14:40.684', '2026-06-06 11:14:40.684'),
(3, 3, 3, '2026-06-04 11:14:40.691', 'RECOUVREMENT', 'Visite de routine numéro 3 chez undefined.', 'COMMANDE', NULL, NULL, NULL, NULL, '2026-06-06 11:14:40.693', '2026-06-06 11:14:40.693'),
(4, 4, 3, '2026-06-03 11:14:40.696', 'VISIBILITE_MARQUE', 'Visite de routine numéro 4 chez undefined.', 'NON_COMMANDE', 'TROP_STOCK', NULL, NULL, NULL, '2026-06-06 11:14:40.697', '2026-06-06 11:14:40.697'),
(5, 5, 3, '2026-06-02 11:14:40.699', 'IMPLANTATION_PRODUIT', 'Visite de routine numéro 5 chez undefined.', 'COMMANDE', NULL, 'STOCK', NULL, NULL, '2026-06-06 11:14:40.701', '2026-06-06 11:14:40.701'),
(6, 1, 3, '2026-06-01 11:14:40.705', 'NEGOCIATION', 'Visite de routine numéro 6 chez undefined.', 'NON_COMMANDE', 'TROP_STOCK', NULL, NULL, NULL, '2026-06-06 11:14:40.707', '2026-06-06 11:14:40.707'),
(7, 2, 3, '2026-05-31 11:14:40.709', 'LIVRAISON', 'Visite de routine numéro 7 chez undefined.', 'COMMANDE', NULL, NULL, NULL, NULL, '2026-06-06 11:14:40.710', '2026-06-06 11:14:40.710'),
(8, 3, 3, '2026-05-30 11:14:40.713', 'RELANCE', 'Visite de routine numéro 8 chez undefined.', 'NON_COMMANDE', 'TROP_STOCK', NULL, NULL, NULL, '2026-06-06 11:14:40.715', '2026-06-06 11:14:40.715'),
(9, 4, 3, '2026-05-29 11:14:40.718', 'AUTRE', 'Visite de routine numéro 9 chez undefined.', 'COMMANDE', NULL, 'STOCK', NULL, NULL, '2026-06-06 11:14:40.720', '2026-06-06 11:14:40.720'),
(10, 5, 3, '2026-05-28 11:14:40.722', 'PRISE_COMMANDE', 'Visite de routine numéro 10 chez undefined.', 'NON_COMMANDE', 'TROP_STOCK', NULL, NULL, NULL, '2026-06-06 11:14:40.724', '2026-06-06 11:14:40.724'),
(11, 6, 4, '2026-06-06 11:14:40.726', 'RECOUVREMENT', 'Visite et contact avec undefined.', 'COMMANDE', NULL, NULL, NULL, NULL, '2026-06-06 11:14:40.727', '2026-06-06 11:14:40.727'),
(12, 7, 4, '2026-06-05 11:14:40.729', 'VISIBILITE_MARQUE', 'Visite et contact avec undefined.', 'NON_COMMANDE', 'PRIX_ELEVE', NULL, NULL, NULL, '2026-06-06 11:14:40.731', '2026-06-06 11:14:40.731'),
(13, 8, 4, '2026-06-04 11:14:40.739', 'IMPLANTATION_PRODUIT', 'Visite et contact avec undefined.', 'NON_COMMANDE', 'PRIX_ELEVE', NULL, NULL, NULL, '2026-06-06 11:14:40.741', '2026-06-06 11:14:40.741'),
(14, 9, 4, '2026-06-03 11:14:40.745', 'NEGOCIATION', 'Visite et contact avec undefined.', 'COMMANDE', NULL, NULL, NULL, NULL, '2026-06-06 11:14:40.747', '2026-06-06 11:14:40.747'),
(15, 10, 4, '2026-06-02 11:14:40.751', 'LIVRAISON', 'Visite et contact avec undefined.', 'NON_COMMANDE', 'PRIX_ELEVE', NULL, NULL, NULL, '2026-06-06 11:14:40.753', '2026-06-06 11:14:40.753'),
(16, 6, 4, '2026-06-01 11:14:40.755', 'RELANCE', 'Visite et contact avec undefined.', 'NON_COMMANDE', 'PRIX_ELEVE', NULL, NULL, NULL, '2026-06-06 11:14:40.756', '2026-06-06 11:14:40.756'),
(17, 7, 4, '2026-05-31 11:14:40.762', 'AUTRE', 'Visite et contact avec undefined.', 'COMMANDE', NULL, NULL, NULL, NULL, '2026-06-06 11:14:40.763', '2026-06-06 11:14:40.763'),
(18, 8, 4, '2026-05-30 11:14:40.768', 'PRISE_COMMANDE', 'Visite et contact avec undefined.', 'NON_COMMANDE', 'PRIX_ELEVE', NULL, NULL, NULL, '2026-06-06 11:14:40.769', '2026-06-06 11:14:40.769'),
(19, 9, 4, '2026-05-29 11:14:40.771', 'SUIVI_CLIENT', 'Visite et contact avec undefined.', 'NON_COMMANDE', 'PRIX_ELEVE', NULL, NULL, NULL, '2026-06-06 11:14:40.773', '2026-06-06 11:14:40.773'),
(20, 10, 4, '2026-05-28 11:14:40.776', 'RECOUVREMENT', 'Visite et contact avec undefined.', 'COMMANDE', NULL, NULL, NULL, NULL, '2026-06-06 11:14:40.777', '2026-06-06 11:14:40.777');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clients_code_key` (`code`),
  ADD KEY `clients_assigned_to_fkey` (`assigned_to`);

--
-- Index pour la table `commandes`
--
ALTER TABLE `commandes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `commandes_client_id_fkey` (`client_id`),
  ADD KEY `commandes_commercial_id_fkey` (`commercial_id`),
  ADD KEY `commandes_visite_id_fkey` (`visite_id`);

--
-- Index pour la table `ligne_commandes`
--
ALTER TABLE `ligne_commandes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ligne_commandes_commande_id_fkey` (`commande_id`);

--
-- Index pour la table `photos`
--
ALTER TABLE `photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `photos_visite_id_fkey` (`visite_id`),
  ADD KEY `photos_commercial_id_fkey` (`commercial_id`),
  ADD KEY `photos_client_id_fkey` (`client_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD KEY `users_manager_id_fkey` (`manager_id`);

--
-- Index pour la table `visites`
--
ALTER TABLE `visites`
  ADD PRIMARY KEY (`id`),
  ADD KEY `visites_client_id_fkey` (`client_id`),
  ADD KEY `visites_commercial_id_fkey` (`commercial_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `commandes`
--
ALTER TABLE `commandes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `ligne_commandes`
--
ALTER TABLE `ligne_commandes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `photos`
--
ALTER TABLE `photos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `visites`
--
ALTER TABLE `visites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `clients`
--
ALTER TABLE `clients`
  ADD CONSTRAINT `clients_assigned_to_fkey` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `commandes`
--
ALTER TABLE `commandes`
  ADD CONSTRAINT `commandes_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `commandes_commercial_id_fkey` FOREIGN KEY (`commercial_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `commandes_visite_id_fkey` FOREIGN KEY (`visite_id`) REFERENCES `visites` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `ligne_commandes`
--
ALTER TABLE `ligne_commandes`
  ADD CONSTRAINT `ligne_commandes_commande_id_fkey` FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `photos`
--
ALTER TABLE `photos`
  ADD CONSTRAINT `photos_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `photos_commercial_id_fkey` FOREIGN KEY (`commercial_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `photos_visite_id_fkey` FOREIGN KEY (`visite_id`) REFERENCES `visites` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_manager_id_fkey` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `visites`
--
ALTER TABLE `visites`
  ADD CONSTRAINT `visites_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `visites_commercial_id_fkey` FOREIGN KEY (`commercial_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
