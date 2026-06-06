const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.ligneCommande.deleteMany({});
  await prisma.commande.deleteMany({});
  await prisma.photo.deleteMany({});
  await prisma.visite.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Creating users...');
  // Hashed passwords (10 rounds)
  const adminPasswordHash = bcrypt.hashSync('Admin1234!', 10);
  const managerPasswordHash = bcrypt.hashSync('Manager1234!', 10);
  const commercialPasswordHash = bcrypt.hashSync('Commercial1234!', 10);

  // Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@salestrack.test',
      passwordHash: adminPasswordHash,
      firstName: 'Jean',
      lastName: 'Admin',
      phone: '+33611223344',
      role: 'ADMIN',
    },
  });

  // Manager
  const manager = await prisma.user.create({
    data: {
      email: 'manager@salestrack.test',
      passwordHash: managerPasswordHash,
      firstName: 'Marc',
      lastName: 'Manager',
      phone: '+33622334455',
      role: 'MANAGER',
      equipe: 'Équipe Nord',
    },
  });

  // Commercial 1 (rattaché au manager)
  const commercial1 = await prisma.user.create({
    data: {
      email: 'commercial1@salestrack.test',
      passwordHash: commercialPasswordHash,
      firstName: 'Alice',
      lastName: 'Commerciale',
      phone: '+33633445566',
      role: 'COMMERCIAL',
      equipe: 'Équipe Nord',
      managerId: manager.id,
    },
  });

  // Commercial 2 (rattaché au manager)
  const commercial2 = await prisma.user.create({
    data: {
      email: 'commercial2@salestrack.test',
      passwordHash: commercialPasswordHash,
      firstName: 'Bob',
      lastName: 'Commercial',
      phone: '+33644556677',
      role: 'COMMERCIAL',
      equipe: 'Équipe Nord',
      managerId: manager.id,
    },
  });

  console.log('Creating clients...');
  const clientsData = [
    { code: 'CL001', raisonSociale: 'Café de la Gare', contactPrincipal: 'Pierre Dupont', telephone: '0142345678', email: 'gare@cafe.com', adresse: '1 Rue de la Gare', ville: 'Lille', secteur: 'Centre', canal: 'ON_TRADE', categorie: 'CAFE', statut: 'ACTIF', commercialId: commercial1.id },
    { code: 'CL002', raisonSociale: 'Hôtel Le Bristol', contactPrincipal: 'Sophie Martin', telephone: '0143456789', email: 'bristol@hotel.com', adresse: '45 Rue de la Paix', ville: 'Lille', secteur: 'Centre', canal: 'ON_TRADE', categorie: 'HOTEL', statut: 'ACTIF', commercialId: commercial1.id },
    { code: 'CL003', raisonSociale: 'Restaurant L’Aura', contactPrincipal: 'Luc Durand', telephone: '0144567890', email: 'laura@resto.com', adresse: '12 Avenue Foch', ville: 'Lille', secteur: 'Nord', canal: 'ON_TRADE', categorie: 'RESTAURANT', statut: 'ACTIF', commercialId: commercial1.id },
    { code: 'CL004', raisonSociale: 'Épicerie fine Bon Goût', contactPrincipal: 'Marie Leroy', telephone: '0145678901', email: 'bongout@epicerie.com', adresse: '88 Rue Royale', ville: 'Lille', secteur: 'Vieux Lille', canal: 'OFF_TRADE', categorie: 'EPICERIE', statut: 'ACTIF', commercialId: commercial1.id },
    { code: 'CL005', raisonSociale: 'Supermarché Auchan', contactPrincipal: 'Jean Petit', telephone: '0146789012', email: 'auchan@gms.com', adresse: 'ZAC du Moulin', ville: 'Lille', secteur: 'Sud', canal: 'OFF_TRADE', categorie: 'GMS', statut: 'PROSPECT', commercialId: commercial1.id },
    
    { code: 'CL006', raisonSociale: 'Bar de la Marine', contactPrincipal: 'Francois Simon', telephone: '0147890123', email: 'marine@bar.com', adresse: 'Quai du Port', ville: 'Roubaix', secteur: 'Port', canal: 'ON_TRADE', categorie: 'CAFE', statut: 'ACTIF', commercialId: commercial2.id },
    { code: 'CL007', raisonSociale: 'Hôtel Splendid', contactPrincipal: 'Nathalie Dubois', telephone: '0148901234', email: 'splendid@hotel.com', adresse: '15 Boulevard Carnot', ville: 'Roubaix', secteur: 'Centre', canal: 'ON_TRADE', categorie: 'HOTEL', statut: 'ACTIF', commercialId: commercial2.id },
    { code: 'CL008', raisonSociale: 'Bistrot du Nord', contactPrincipal: 'Thomas Bernard', telephone: '0149012345', email: 'nord@bistrot.com', adresse: '67 Rue Jean Jaurès', ville: 'Roubaix', secteur: 'Est', canal: 'ON_TRADE', categorie: 'RESTAURANT', statut: 'INACTIF', commercialId: commercial2.id },
    { code: 'CL009', raisonSociale: 'Alimentation Générale', contactPrincipal: 'Kamel Benz', telephone: '0150123456', email: 'kamel@aliment.com', adresse: '110 Rue de Paris', ville: 'Roubaix', secteur: 'Ouest', canal: 'OFF_TRADE', categorie: 'TRADITIONNEL', statut: 'ACTIF', commercialId: commercial2.id },
    { code: 'CL010', raisonSociale: 'GMS Carrefour', contactPrincipal: 'Alexandre Legrand', telephone: '0151234567', email: 'carrefour@gms.com', adresse: 'Avenue Kennedy', ville: 'Roubaix', secteur: 'Nord', canal: 'OFF_TRADE', categorie: 'GMS', statut: 'PROSPECT', commercialId: commercial2.id },
  ];

  const clients = [];
  for (const cData of clientsData) {
    const client = await prisma.client.create({ data: cData });
    clients.push(client);
  }

  console.log('Creating visits...');
  const objets = ['PRISE_COMMANDE', 'SUIVI_CLIENT', 'RECOUVREMENT', 'VISIBILITE_MARQUE', 'IMPLANTATION_PRODUIT', 'NEGOCIATION', 'LIVRAISON', 'RELANCE', 'AUTRE'];
  
  // Create 20 visits (10 for commercial1, 10 for commercial2)
  const visits = [];
  
  // Commercial 1 visits
  for (let i = 0; i < 10; i++) {
    const client = clients[i % 5]; // First 5 clients belong to commercial1
    const visit = await prisma.visite.create({
      data: {
        clientId: client.id,
        commercialId: commercial1.id,
        dateDebut: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // sequential days in the past
        objet: objets[i % objets.length],
        commentaire: `Visite de routine numéro ${i + 1} chez ${client.raisonSociale}.`,
        statutCommande: i % 2 === 0 ? 'COMMANDE' : 'NON_COMMANDE',
        raisonNonCommande: i % 2 === 0 ? null : 'TROP_STOCK',
        problemesConstates: i % 4 === 0 ? 'STOCK' : null,
      },
    });
    visits.push(visit);
  }

  // Commercial 2 visits
  for (let i = 0; i < 10; i++) {
    const client = clients[5 + (i % 5)]; // Next 5 clients belong to commercial2
    const visit = await prisma.visite.create({
      data: {
        clientId: client.id,
        commercialId: commercial2.id,
        dateDebut: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        objet: objets[(i + 2) % objets.length],
        commentaire: `Visite et contact avec ${client.contactPrincipal}.`,
        statutCommande: i % 3 === 0 ? 'COMMANDE' : 'NON_COMMANDE',
        raisonNonCommande: i % 3 === 0 ? null : 'PRIX_ELEVE',
        problemesConstates: null,
      },
    });
    visits.push(visit);
  }

  console.log('Creating orders/quotes...');
  // 5 orders/quotes
  const order1 = await prisma.commande.create({
    data: {
      clientId: clients[0].id,
      commercialId: commercial1.id,
      visiteId: visits[0].id,
      type: 'COMMANDE',
      statut: 'VALIDEE',
      totalHT: 120.0,
      lignes: {
        create: [
          { designation: 'Boisson Cola 33cl', reference: 'COL33', conditionnement: 'Carton de 24', quantite: 5, prixUnitaireHT: 12.0, remise: 0, totalLigneHT: 60.0 },
          { designation: 'Eau Pétillante 50cl', reference: 'EAU50', conditionnement: 'Carton de 12', quantite: 5, prixUnitaireHT: 12.0, remise: 0, totalLigneHT: 60.0 },
        ],
      },
    },
  });

  const order2 = await prisma.commande.create({
    data: {
      clientId: clients[1].id,
      commercialId: commercial1.id,
      visiteId: visits[2].id,
      type: 'COMMANDE',
      statut: 'EN_ATTENTE',
      totalHT: 450.0,
      lignes: {
        create: [
          { designation: 'Jus d’Orange Bio 1L', reference: 'JUS1L', conditionnement: 'Carton de 6', quantite: 10, prixUnitaireHT: 15.0, remise: 0, totalLigneHT: 150.0 },
          { designation: 'Bière Blonde Premium', reference: 'BIE33', conditionnement: 'Fût 30L', quantite: 3, prixUnitaireHT: 100.0, remise: 0, totalLigneHT: 300.0 },
        ],
      },
    },
  });

  const order3 = await prisma.commande.create({
    data: {
      clientId: clients[2].id,
      commercialId: commercial1.id,
      type: 'DEVIS',
      statut: 'BROUILLON',
      totalHT: 90.0,
      lignes: {
        create: [
          { designation: 'Eau Plate 1.5L', reference: 'EAU15', conditionnement: 'Pack de 6', quantite: 10, prixUnitaireHT: 10.0, remise: 10, totalLigneHT: 90.0 },
        ],
      },
    },
  });

  const order4 = await prisma.commande.create({
    data: {
      clientId: clients[5].id,
      commercialId: commercial2.id,
      visiteId: visits[10].id,
      type: 'COMMANDE',
      statut: 'TRAITEE',
      totalHT: 240.0,
      lignes: {
        create: [
          { designation: 'Boisson Cola 33cl', reference: 'COL33', conditionnement: 'Carton de 24', quantite: 20, prixUnitaireHT: 12.0, remise: 0, totalLigneHT: 240.0 },
        ],
      },
    },
  });

  const order5 = await prisma.commande.create({
    data: {
      clientId: clients[6].id,
      commercialId: commercial2.id,
      type: 'DEVIS',
      statut: 'VALIDEE',
      totalHT: 180.0,
      lignes: {
        create: [
          { designation: 'Jus de Pomme 1L', reference: 'POM1L', conditionnement: 'Carton de 6', quantite: 12, prixUnitaireHT: 15.0, remise: 0, totalLigneHT: 180.0 },
        ],
      },
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
