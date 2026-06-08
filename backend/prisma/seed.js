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

  // Commercial 1
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

  // Commercial 2
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

  console.log('Creating historical visits...');
  const objets = ['PRISE_COMMANDE', 'SUIVI_CLIENT', 'RECOUVREMENT', 'VISIBILITE_MARQUE', 'IMPLANTATION_PRODUIT', 'NEGOCIATION', 'LIVRAISON', 'RELANCE', 'AUTRE'];
  
  // Set up dates for last 6 months (January 2026 to June 2026)
  const today = new Date();
  const monthsOffset = [5, 4, 3, 2, 1, 0]; // 5 months ago to current month
  const visits = [];

  // Create visits distributed over last 6 months
  for (let mIdx = 0; mIdx < monthsOffset.length; mIdx++) {
    const offset = monthsOffset[mIdx];
    const visitMonthDate = new Date(today.getFullYear(), today.getMonth() - offset, 15);
    
    // Create 5 visits per month
    for (let v = 0; v < 5; v++) {
      const isComm1 = v % 2 === 0;
      const commercial = isComm1 ? commercial1 : commercial2;
      const commClients = isComm1 ? [clients[0], clients[1], clients[2], clients[3], clients[4], clients[10]] : [clients[5], clients[6], clients[7], clients[8], clients[9], clients[11]];
      const client = commClients[v % commClients.length];
      
      const visitDate = new Date(visitMonthDate);
      visitDate.setDate(5 + v * 5); // Spread visits over the month

      const visit = await prisma.visite.create({
        data: {
          clientId: client.id,
          commercialId: commercial.id,
          dateDebut: visitDate,
          objet: objets[(mIdx + v) % objets.length],
          commentaire: `Rapport de suivi mensuel (${visitDate.toLocaleDateString()}) chez ${client.companyName}.`,
          statutCommande: v % 2 === 0 ? 'COMMANDE' : 'NON_COMMANDE',
          raisonNonCommande: v % 2 === 0 ? null : 'TROP_STOCK',
          problemesConstates: v % 5 === 0 ? 'LIVRAISON' : null,
          latitude: client.city === 'Casablanca' ? 33.5731 : (client.city === 'Marrakech' ? 31.6295 : 34.0331),
          longitude: client.city === 'Casablanca' ? -7.5898 : (client.city === 'Marrakech' ? -7.9811 : -5.0003),
          createdAt: visitDate,
        }
      });
      visits.push(visit);
    }
  }

  console.log('Creating historical orders/quotes...');
  
  // Define helper to create orders with specific date
  async function createOrder(client, commercial, visit, type, status, totalHT, items, date) {
    return prisma.commande.create({
      data: {
        clientId: client.id,
        commercialId: commercial.id,
        visiteId: visit ? visit.id : null,
        type,
        statut: status,
        totalHT,
        createdAt: date,
        updatedAt: date,
        lignes: {
          create: items.map(item => ({
            designation: item.designation,
            reference: item.reference,
            conditionnement: item.conditionnement,
            quantite: item.quantite,
            prixUnitaireHT: item.prix,
            remise: item.remise || 0,
            totalLigneHT: Math.round(item.quantite * item.prix * (1 - (item.remise || 0)/100) * 100) / 100,
            createdAt: date,
            updatedAt: date
          }))
        }
      }
    });
  }

  // Monthly items and revenue targets to simulate real business growth:
  // Jan 2026: ~2,800€
  // Feb 2026: ~3,400€
  // Mar 2026: ~4,200€
  // Apr 2026: ~4,900€
  // May 2026: ~5,800€
  // Jun 2026: ~6,500€
  
  const presets = [
    { designation: 'Boisson Cola 33cl', reference: 'COL33', conditionnement: 'Carton de 24', prix: 12.0 },
    { designation: 'Eau Pétillante 50cl', reference: 'EAU50', conditionnement: 'Carton de 12', prix: 12.0 },
    { designation: 'Jus d’Orange Bio 1L', reference: 'JUS1L', conditionnement: 'Carton de 6', prix: 15.0 },
    { designation: 'Bière Blonde Premium', reference: 'BIE33', conditionnement: 'Fût 30L', prix: 100.0 },
    { designation: 'Eau Plate 1.5L', reference: 'EAU15', conditionnement: 'Pack de 6', prix: 10.0 },
  ];

  for (let mIdx = 0; mIdx < monthsOffset.length; mIdx++) {
    const offset = monthsOffset[mIdx];
    const orderMonthDate = new Date(today.getFullYear(), today.getMonth() - offset, 15);
    
    // Targets per month to simulate climbing curve
    const baseTargetRevenue = [2800, 3400, 4200, 4900, 5800, 6500][mIdx];
    const portion1 = Math.round(baseTargetRevenue * 0.4);
    const portion2 = Math.round(baseTargetRevenue * 0.35);
    const portion3 = baseTargetRevenue - portion1 - portion2;
    
    const dates = [
      new Date(orderMonthDate.getFullYear(), orderMonthDate.getMonth(), 8),
      new Date(orderMonthDate.getFullYear(), orderMonthDate.getMonth(), 18),
      new Date(orderMonthDate.getFullYear(), orderMonthDate.getMonth(), 26)
    ];

    // Commande 1 (Commercial 1) - Validated
    await createOrder(
      clients[0],
      commercial1,
      visits.find(v => v.commercialId === commercial1.id && v.createdAt.getMonth() === orderMonthDate.getMonth()),
      'COMMANDE',
      'VALIDEE',
      portion1,
      [
        { designation: presets[3].designation, reference: presets[3].reference, conditionnement: presets[3].conditionnement, quantite: Math.floor(portion1 / 100), prix: presets[3].prix },
        { designation: presets[0].designation, reference: presets[0].reference, conditionnement: presets[0].conditionnement, quantite: Math.floor((portion1 % 100) / 12), prix: presets[0].prix }
      ],
      dates[0]
    );

    // Commande 2 (Commercial 2) - Validated
    await createOrder(
      clients[5],
      commercial2,
      visits.find(v => v.commercialId === commercial2.id && v.createdAt.getMonth() === orderMonthDate.getMonth()),
      'COMMANDE',
      'VALIDEE',
      portion2,
      [
        { designation: presets[2].designation, reference: presets[2].reference, conditionnement: presets[2].conditionnement, quantite: Math.floor(portion2 / 15), prix: presets[2].prix }
      ],
      dates[1]
    );

    // Commande 3 (Commercial 1 or 2) - Validated or Pending/Draft for current month
    const isCurrentMonth = offset === 0;
    const orderStatus = isCurrentMonth ? 'EN_ATTENTE' : 'VALIDEE';
    
    await createOrder(
      clients[10],
      commercial1,
      null,
      'COMMANDE',
      orderStatus,
      portion3,
      [
        { designation: presets[1].designation, reference: presets[1].reference, conditionnement: presets[1].conditionnement, quantite: Math.floor(portion3 / 12), prix: presets[1].prix }
      ],
      dates[2]
    );

    // Add 1 Quote/Devis per month as well
    await createOrder(
      clients[4],
      commercial2,
      null,
      'DEVIS',
      isCurrentMonth ? 'BROUILLON' : 'VALIDEE',
      500.0,
      [
        { designation: presets[4].designation, reference: presets[4].reference, conditionnement: presets[4].conditionnement, quantite: 50, prix: presets[4].prix }
      ],
      dates[1]
    );
  }

  console.log('Database seeded successfully with historical trends!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
