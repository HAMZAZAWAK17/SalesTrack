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
      firstName: 'Youssef',
      lastName: 'Alami',
      phone: '+212611223344',
      role: 'ADMIN',
    },
  });

  // Manager
  const manager = await prisma.user.create({
    data: {
      email: 'manager@salestrack.test',
      passwordHash: managerPasswordHash,
      firstName: 'Khadija',
      lastName: 'Tazi',
      phone: '+212622334455',
      role: 'MANAGER',
      equipe: 'Équipe Centre',
    },
  });

  // Commercial 1 (rattaché au manager)
  const commercial1 = await prisma.user.create({
    data: {
      email: 'commercial1@salestrack.test',
      passwordHash: commercialPasswordHash,
      firstName: 'Hamza',
      lastName: 'Zawak',
      phone: '+212633445566',
      role: 'COMMERCIAL',
      equipe: 'Équipe Centre',
      managerId: manager.id,
    },
  });

  // Commercial 2 (rattaché au manager)
  const commercial2 = await prisma.user.create({
    data: {
      email: 'commercial2@salestrack.test',
      passwordHash: commercialPasswordHash,
      firstName: 'Amine',
      lastName: 'Idrissi',
      phone: '+212644556677',
      role: 'COMMERCIAL',
      equipe: 'Équipe Centre',
      managerId: manager.id,
    },
  });

  console.log('Creating clients...');
  const clientsData = [
    { code: 'CL001', companyName: 'Café Atlas', phone: '0522123456', email: 'atlas@cafe.ma', address: '25 Boulevard d’Anfa', city: 'Casablanca', distributionChannel: 'ON_TRADE', category: 'CAFE', status: 'ACTIVE', assignedTo: commercial1.id, notes: 'Client très régulier, commandes de boissons hebdomadaires.' },
    { code: 'CL002', companyName: 'Hôtel La Mamounia', phone: '0524400000', email: 'mamounia@hotel.ma', address: 'Avenue Bab Jdid', city: 'Marrakech', distributionChannel: 'ON_TRADE', category: 'HOTEL', status: 'ACTIVE', assignedTo: commercial1.id, notes: 'Hôtel de luxe, demande des produits premium uniquement.' },
    { code: 'CL003', companyName: 'Restaurant Al Fassia', phone: '0524434060', email: 'alfassia@restaurant.ma', address: '55 Boulevard Mohamed V', city: 'Marrakech', distributionChannel: 'ON_TRADE', category: 'RESTAURANT', status: 'ACTIVE', assignedTo: commercial1.id, notes: 'Forte consommation de jus de fruits bio.' },
    { code: 'CL004', companyName: 'Épicerie Bab El Mansour', phone: '0535501234', email: 'mansour@epicerie.ma', address: '12 Rue de Meknès', city: 'Fès', distributionChannel: 'OFF_TRADE', category: 'GROCERY', status: 'ACTIVE', assignedTo: commercial1.id },
    { code: 'CL005', companyName: 'Supermarché Marjane', phone: '0522405060', email: 'marjane@marjane.ma', address: 'Route de Rabat', city: 'Casablanca', distributionChannel: 'OFF_TRADE', category: 'SUPERMARKET', status: 'PROSPECT', assignedTo: commercial1.id, notes: 'Grand compte en phase finale de négociation.' },
    
    { code: 'CL006', companyName: 'Café de la Poste', phone: '0537701122', email: 'poste@cafe.ma', address: 'Avenue Mohammed V', city: 'Rabat', distributionChannel: 'ON_TRADE', category: 'CAFE', status: 'ACTIVE', assignedTo: commercial2.id, notes: 'Terrasse à forte affluence en été.' },
    { code: 'CL007', companyName: 'Riad Dar El Sadaka', phone: '0524301020', email: 'sadaka@riad.ma', address: 'Bab Ghemat', city: 'Marrakech', distributionChannel: 'ON_TRADE', category: 'HOTEL', status: 'ACTIVE', assignedTo: commercial2.id },
    { code: 'CL008', companyName: 'Bistrot Tanger', phone: '0539908877', email: 'tanger@bistrot.ma', address: '3 Boulevard Pasteur', city: 'Tanger', distributionChannel: 'ON_TRADE', category: 'RESTAURANT', status: 'INACTIVE', assignedTo: commercial2.id, notes: 'Activité suspendue temporairement pour travaux.' },
    { code: 'CL009', companyName: 'Alimentation Générale Al Nour', phone: '0528801122', email: 'alnour@aliment.ma', address: '90 Avenue Hassan II', city: 'Agadir', distributionChannel: 'OFF_TRADE', category: 'TRADITIONAL', status: 'ACTIVE', assignedTo: commercial2.id },
    { code: 'CL010', companyName: 'Hypermarché Carrefour', phone: '0522903040', email: 'carrefour@carrefour.ma', address: 'Sidi Maârouf', city: 'Casablanca', distributionChannel: 'OFF_TRADE', category: 'SUPERMARKET', status: 'PROSPECT', assignedTo: commercial2.id },
    { code: 'CL011', companyName: 'Hôtel Sofitel Jardin des Roses', phone: '0537675600', email: 'sofitel@hotel.ma', address: 'Impasse Souissi', city: 'Rabat', distributionChannel: 'ON_TRADE', category: 'HOTEL', status: 'ACTIVE', assignedTo: commercial1.id },
    { code: 'CL012', companyName: 'Café Cappuccino', phone: '0539324020', email: 'cappuccino@cafe.ma', address: 'Avenue Mohammed VI', city: 'Tanger', distributionChannel: 'ON_TRADE', category: 'CAFE', status: 'ACTIVE', assignedTo: commercial2.id },
  ];

  const clients = [];
  for (const cData of clientsData) {
    const client = await prisma.client.create({ data: cData });
    clients.push(client);
  }

  console.log('Creating visits...');
  const objets = ['PRISE_COMMANDE', 'SUIVI_CLIENT', 'RECOUVREMENT', 'VISIBILITE_MARQUE', 'IMPLANTATION_PRODUIT', 'NEGOCIATION', 'LIVRAISON', 'RELANCE', 'AUTRE'];
  
  const visits = [];
  
  // Commercial 1 visits (total 10)
  const comm1Clients = [clients[0], clients[1], clients[2], clients[3], clients[4], clients[10]];
  for (let i = 0; i < 10; i++) {
    const client = comm1Clients[i % comm1Clients.length];
    const visit = await prisma.visite.create({
      data: {
        clientId: client.id,
        commercialId: commercial1.id,
        dateDebut: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        objet: objets[i % objets.length],
        commentaire: `Visite de routine numéro ${i + 1} chez ${client.companyName}.`,
        statutCommande: i % 2 === 0 ? 'COMMANDE' : 'NON_COMMANDE',
        raisonNonCommande: i % 2 === 0 ? null : 'TROP_STOCK',
        problemesConstates: i % 4 === 0 ? 'STOCK' : null,
        latitude: client.city === 'Casablanca' ? 33.5731 : (client.city === 'Marrakech' ? 31.6295 : 34.0331),
        longitude: client.city === 'Casablanca' ? -7.5898 : (client.city === 'Marrakech' ? -7.9811 : -5.0003),
      },
    });
    visits.push(visit);
  }

  // Commercial 2 visits (total 10)
  const comm2Clients = [clients[5], clients[6], clients[7], clients[8], clients[9], clients[11]];
  for (let i = 0; i < 10; i++) {
    const client = comm2Clients[i % comm2Clients.length];
    const visit = await prisma.visite.create({
      data: {
        clientId: client.id,
        commercialId: commercial2.id,
        dateDebut: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        objet: objets[(i + 2) % objets.length],
        commentaire: `Visite et suivi chez ${client.companyName}.`,
        statutCommande: i % 3 === 0 ? 'COMMANDE' : 'NON_COMMANDE',
        raisonNonCommande: i % 3 === 0 ? null : 'PRIX_ELEVE',
        problemesConstates: null,
        latitude: client.city === 'Rabat' ? 34.0150 : (client.city === 'Marrakech' ? 31.6300 : 35.7595),
        longitude: client.city === 'Rabat' ? -6.8327 : (client.city === 'Marrakech' ? -7.9700 : -5.8340),
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
      visiteId: visits[1].id,
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
