-- Script de réinitialisation et d'insertion de données de test marocaines pour SalesTrack
-- Ce script nettoie les anciennes tables et insère des données avec des villes et noms marocains.

SET FOREIGN_KEY_CHECKS = 0;

-- Suppression des anciennes données
TRUNCATE TABLE `ligne_commandes`;
TRUNCATE TABLE `photos`;
TRUNCATE TABLE `commandes`;
TRUNCATE TABLE `visites`;
TRUNCATE TABLE `clients`;
TRUNCATE TABLE `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insertion des Utilisateurs (Mots de passe : Admin1234!, Manager1234!, Commercial1234!)
INSERT INTO `users` (`id`, `email`, `password_hash`, `first_name`, `last_name`, `phone`, `role`, `equipe`, `manager_id`, `created_at`, `updated_at`) VALUES
(1, 'admin@salestrack.test', '$2b$10$bfpbqg7MpbBzBZRodfE3tOTm3wpAGHw28NclPBByvlGjP7n7Canzy', 'Youssef', 'Alami', '+212611223344', 'ADMIN', NULL, NULL, NOW(), NOW()),
(2, 'manager@salestrack.test', '$2b$10$HxzIpcfcFPTCusbnzGv8wut2HjXekpAHSIN1KwV/MtrKNCW8KrqkW', 'Khadija', 'Tazi', '+212622334455', 'MANAGER', 'Équipe Centre', NULL, NOW(), NOW()),
(3, 'commercial1@salestrack.test', '$2b$10$Y0gGjiFcpwEl90c6pTNRKeQDEtZ8qiuqFlyCWq95qfluJBoq36Xwq', 'Hamza', 'Zawak', '+212633445566', 'COMMERCIAL', 'Équipe Centre', 2, NOW(), NOW()),
(4, 'commercial2@salestrack.test', '$2b$10$Y0gGjiFcpwEl90c6pTNRKeQDEtZ8qiuqFlyCWq95qfluJBoq36Xwq', 'Amine', 'Idrissi', '+212644556677', 'COMMERCIAL', 'Équipe Centre', 2, NOW(), NOW());

-- 2. Insertion des Clients (12 clients basés au Maroc)
INSERT INTO `clients` (`id`, `code`, `company_name`, `phone`, `email`, `address`, `city`, `distribution_channel`, `category`, `status`, `assigned_to`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'CL001', 'Café Atlas', '0522123456', 'atlas@cafe.ma', '25 Boulevard d’Anfa', 'Casablanca', 'ON_TRADE', 'CAFE', 'ACTIVE', 3, 'Client très régulier, commandes de boissons hebdomadaires.', NOW(), NOW()),
(2, 'CL002', 'Hôtel La Mamounia', '0524400000', 'mamounia@hotel.ma', 'Avenue Bab Jdid', 'Marrakech', 'ON_TRADE', 'HOTEL', 'ACTIVE', 3, 'Hôtel de luxe, demande des produits premium uniquement.', NOW(), NOW()),
(3, 'CL003', 'Restaurant Al Fassia', '0524434060', 'alfassia@restaurant.ma', '55 Boulevard Mohamed V', 'Marrakech', 'ON_TRADE', 'RESTAURANT', 'ACTIVE', 3, 'Forte consommation de jus de fruits bio.', NOW(), NOW()),
(4, 'CL004', 'Épicerie Bab El Mansour', '0535501234', 'mansour@epicerie.ma', '12 Rue de Meknès', 'Fès', 'OFF_TRADE', 'GROCERY', 'ACTIVE', 3, NULL, NOW(), NOW()),
(5, 'CL005', 'Supermarché Marjane', '0522405060', 'marjane@marjane.ma', 'Route de Rabat', 'Casablanca', 'OFF_TRADE', 'SUPERMARKET', 'PROSPECT', 3, 'Grand compte en phase finale de négociation.', NOW(), NOW()),
(6, 'CL006', 'Café de la Poste', '0537701122', 'poste@cafe.ma', 'Avenue Mohammed V', 'Rabat', 'ON_TRADE', 'CAFE', 'ACTIVE', 4, 'Terrasse à forte affluence en été.', NOW(), NOW()),
(7, 'CL007', 'Riad Dar El Sadaka', '0524301020', 'sadaka@riad.ma', 'Bab Ghemat', 'Marrakech', 'ON_TRADE', 'HOTEL', 'ACTIVE', 4, NULL, NOW(), NOW()),
(8, 'CL008', 'Bistrot Tanger', '0539908877', 'tanger@bistrot.ma', '3 Boulevard Pasteur', 'Tanger', 'ON_TRADE', 'RESTAURANT', 'INACTIVE', 4, 'Activité suspendue temporairement pour travaux.', NOW(), NOW()),
(9, 'CL009', 'Alimentation Générale Al Nour', '0528801122', 'alnour@aliment.ma', '90 Avenue Hassan II', 'Agadir', 'OFF_TRADE', 'TRADITIONAL', 'ACTIVE', 4, NULL, NOW(), NOW()),
(10, 'CL010', 'Hypermarché Carrefour', '0522903040', 'carrefour@carrefour.ma', 'Sidi Maârouf', 'Casablanca', 'OFF_TRADE', 'SUPERMARKET', 'PROSPECT', 4, NULL, NOW(), NOW()),
(11, 'CL011', 'Hôtel Sofitel Jardin des Roses', '0537675600', 'sofitel@hotel.ma', 'Impasse Souissi', 'Rabat', 'ON_TRADE', 'HOTEL', 'ACTIVE', 3, NULL, NOW(), NOW()),
(12, 'CL012', 'Café Cappuccino', '0539324020', 'cappuccino@cafe.ma', 'Avenue Mohammed VI', 'Tanger', 'ON_TRADE', 'CAFE', 'ACTIVE', 4, NULL, NOW(), NOW());

-- 3. Insertion de 20 Visites de test (10 pour commercial 1 et 10 pour commercial 2)
INSERT INTO `visites` (`id`, `client_id`, `commercial_id`, `date_debut`, `objet`, `commentaire`, `statut_commande`, `raison_non_commande`, `problemes_constates`, `latitude`, `longitude`, `created_at`, `updated_at`) VALUES
(1, 1, 3, DATE_SUB(NOW(), INTERVAL 0 DAY), 'PRISE_COMMANDE', 'Visite chez Café Atlas. Commande de boissons gazeuses et eau.', 'COMMANDE', NULL, NULL, 33.5731, -7.5898, NOW(), NOW()),
(2, 2, 3, DATE_SUB(NOW(), INTERVAL 1 DAY), 'SUIVI_CLIENT', 'Visite à Hôtel La Mamounia pour le suivi de la livraison.', 'NON_COMMANDE', 'TROP_STOCK', NULL, 31.6295, -7.9811, NOW(), NOW()),
(3, 3, 3, DATE_SUB(NOW(), INTERVAL 2 DAY), 'RECOUVREMENT', 'Recouvrement de facture chez Restaurant Al Fassia effectué.', 'COMMANDE', NULL, NULL, 31.6353, -7.9892, NOW(), NOW()),
(4, 4, 3, DATE_SUB(NOW(), INTERVAL 3 DAY), 'VISIBILITE_MARQUE', 'Installation de PLV chez Épicerie Bab El Mansour.', 'NON_COMMANDE', 'STOCK_NON_ECOULE', NULL, 34.0331, -5.0003, NOW(), NOW()),
(5, 5, 3, DATE_SUB(NOW(), INTERVAL 4 DAY), 'IMPLANTATION_PRODUIT', 'Présentation des nouveautés chez Supermarché Marjane.', 'COMMANDE', NULL, NULL, 33.5892, -7.6014, NOW(), NOW()),
(6, 1, 3, DATE_SUB(NOW(), INTERVAL 5 DAY), 'NEGOCIATION', 'Négociation des tarifs annuels avec Café Atlas.', 'NON_COMMANDE', 'PRIX_ELEVE', NULL, 33.5731, -7.5898, NOW(), NOW()),
(7, 2, 3, DATE_SUB(NOW(), INTERVAL 6 DAY), 'LIVRAISON', 'Suivi de la livraison de la commande de juin à La Mamounia.', 'COMMANDE', NULL, NULL, 31.6295, -7.9811, NOW(), NOW()),
(8, 3, 3, DATE_SUB(NOW(), INTERVAL 7 DAY), 'RELANCE', 'Relance commerciale pour les produits de saison chez Restaurant Al Fassia.', 'NON_COMMANDE', 'CLIENT_ABSENT', NULL, 31.6353, -7.9892, NOW(), NOW()),
(9, 4, 3, DATE_SUB(NOW(), INTERVAL 8 DAY), 'AUTRE', 'Visite de courtoisie et écoute client chez Épicerie Bab El Mansour.', 'COMMANDE', NULL, NULL, 34.0331, -5.0003, NOW(), NOW()),
(10, 11, 3, DATE_SUB(NOW(), INTERVAL 9 DAY), 'PRISE_COMMANDE', 'Prise de commande auprès du responsable d\'achat de Sofitel.', 'NON_COMMANDE', 'TROP_STOCK', NULL, 33.9716, -6.8498, NOW(), NOW()),
(11, 6, 4, DATE_SUB(NOW(), INTERVAL 0 DAY), 'RECOUVREMENT', 'Recouvrement de créances auprès de Café de la Poste.', 'COMMANDE', NULL, NULL, 34.0150, -6.8327, NOW(), NOW()),
(12, 7, 4, DATE_SUB(NOW(), INTERVAL 1 DAY), 'VISIBILITE_MARQUE', 'Contrôle du linéaire et de la marque chez Riad Dar El Sadaka.', 'NON_COMMANDE', 'PRIX_ELEVE', NULL, 31.6300, -7.9700, NOW(), NOW()),
(13, 8, 4, DATE_SUB(NOW(), INTERVAL 2 DAY), 'IMPLANTATION_PRODUIT', 'Mise en place de la nouvelle gamme de boissons chez Bistrot Tanger.', 'NON_COMMANDE', 'CHANGEMENT_FOURNISSEUR', NULL, 35.7595, -5.8340, NOW(), NOW()),
(14, 9, 4, DATE_SUB(NOW(), INTERVAL 3 DAY), 'NEGOCIATION', 'Discussions sur le contrat de distribution avec Alimentation Al Nour.', 'COMMANDE', NULL, NULL, 30.4278, -9.5981, NOW(), NOW()),
(15, 10, 4, DATE_SUB(NOW(), INTERVAL 4 DAY), 'LIVRAISON', 'Supervision de la livraison hebdomadaire chez Hypermarché Carrefour.', 'NON_COMMANDE', 'PROBLEME_LIVRAISON', NULL, 33.5414, -7.6329, NOW(), NOW()),
(16, 6, 4, DATE_SUB(NOW(), INTERVAL 5 DAY), 'RELANCE', 'Relance téléphonique et physique chez Café de la Poste.', 'NON_COMMANDE', 'BAISSE_ACTIVITE', NULL, 34.0150, -6.8327, NOW(), NOW()),
(17, 7, 4, DATE_SUB(NOW(), INTERVAL 6 DAY), 'AUTRE', 'Ajustement de planning de visite chez Riad Dar El Sadaka.', 'COMMANDE', NULL, NULL, 31.6300, -7.9700, NOW(), NOW()),
(18, 8, 4, DATE_SUB(NOW(), INTERVAL 7 DAY), 'PRISE_COMMANDE', 'Prise de commande mensuelle chez Bistrot Tanger.', 'NON_COMMANDE', 'PRIX_ELEVE', NULL, 35.7595, -5.8340, NOW(), NOW()),
(19, 9, 4, DATE_SUB(NOW(), INTERVAL 8 DAY), 'SUIVI_CLIENT', 'Vérification du niveau des stocks chez Alimentation Al Nour.', 'NON_COMMANDE', 'STOCK_NON_ECOULE', NULL, 30.4278, -9.5981, NOW(), NOW()),
(20, 12, 4, DATE_SUB(NOW(), INTERVAL 9 DAY), 'RECOUVREMENT', 'Recouvrement du chèque de caution de Café Cappuccino.', 'COMMANDE', NULL, NULL, 35.7720, -5.8020, NOW(), NOW());

-- 4. Insertion de 5 Commandes/Devis
INSERT INTO `commandes` (`id`, `client_id`, `commercial_id`, `visite_id`, `type`, `statut`, `total_ht`, `created_at`, `updated_at`) VALUES
(1, 1, 3, 1, 'COMMANDE', 'VALIDEE', 120.0, NOW(), NOW()),
(2, 2, 3, 7, 'COMMANDE', 'EN_ATTENTE', 450.0, NOW(), NOW()),
(3, 3, 3, NULL, 'DEVIS', 'BROUILLON', 90.0, NOW(), NOW()),
(4, 6, 4, 11, 'COMMANDE', 'TRAITEE', 240.0, NOW(), NOW()),
(5, 7, 4, NULL, 'DEVIS', 'VALIDEE', 180.0, NOW(), NOW());

-- 5. Insertion des lignes de commandes correspondantes
INSERT INTO `ligne_commandes` (`id`, `commande_id`, `designation`, `reference`, `conditionnement`, `quantite`, `prix_unitaire_ht`, `remise`, `total_ligne_ht`, `created_at`, `updated_at`) VALUES
(1, 1, 'Boisson Cola 33cl', 'COL33', 'Carton de 24', 5, 12.0, 0.0, 60.0, NOW(), NOW()),
(2, 1, 'Eau Pétillante 50cl', 'EAU50', 'Carton de 12', 5, 12.0, 0.0, 60.0, NOW(), NOW()),
(3, 2, 'Jus d’Orange Bio 1L', 'JUS1L', 'Carton de 6', 10, 15.0, 0.0, 150.0, NOW(), NOW()),
(4, 2, 'Bière Blonde Premium', 'BIE33', 'Fût 30L', 3, 100.0, 0.0, 300.0, NOW(), NOW()),
(5, 3, 'Eau Plate 1.5L', 'EAU15', 'Pack de 6', 10, 10.0, 10.0, 90.0, NOW(), NOW()),
(6, 4, 'Boisson Cola 33cl', 'COL33', 'Carton de 24', 20, 12.0, 0.0, 240.0, NOW(), NOW()),
(7, 5, 'Jus de Pomme 1L', 'POM1L', 'Carton de 6', 12, 15.0, 0.0, 180.0, NOW(), NOW());

COMMIT;
