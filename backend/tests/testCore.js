const prisma = require('../src/utils/db');
const visitService = require('../src/services/visitService');
const clientService = require('../src/services/clientService');
const commandeService = require('../src/services/commandeService');

async function runTests() {
  console.log('--- STARTING SALESTRACK AUTOMATED TESTS ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ SUCCESS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAILED: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Fetch reference users from database (seeded accounts)
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@salestrack.test' } });
    const managerUser = await prisma.user.findUnique({ where: { email: 'manager@salestrack.test' } });
    const commercial1 = await prisma.user.findUnique({ where: { email: 'commercial1@salestrack.test' } });
    const commercial2 = await prisma.user.findUnique({ where: { email: 'commercial2@salestrack.test' } });

    if (!adminUser || !managerUser || !commercial1 || !commercial2) {
      throw new Error('Les comptes de test obligatoires (admin, manager, commercial) ne sont pas présents en base. Veuillez lancer le seed d\'abord.');
    }

    // 2. Fetch clients to test assignment
    const clientComm1 = await prisma.client.findFirst({ where: { assignedTo: commercial1.id } });
    const clientComm2 = await prisma.client.findFirst({ where: { assignedTo: commercial2.id } });

    assert(clientComm1 !== null, "Un client pour Commercial 1 existe");
    assert(clientComm2 !== null, "Un client pour Commercial 2 existe");

    // Test 1: Visite validation logic (statutCommande = NON_COMMANDE requires raisonNonCommande)
    try {
      await visitService.createVisit({
        clientId: clientComm1.id,
        objet: 'PRISE_COMMANDE',
        commentaire: 'Test validation',
        statutCommande: 'NON_COMMANDE',
        raisonNonCommande: null, // should trigger error
      }, commercial1);
      assert(false, "La création d'une visite NON_COMMANDE sans raison doit échouer");
    } catch (err) {
      assert(err.message.includes('raisonNonCommande') || err.message.includes('motif'), "Visite NON_COMMANDE sans raison rejette correctement");
    }

    // Test 2: Visite validation logic (statutCommande = COMMANDE clears raisonNonCommande)
    const validVisit = await visitService.createVisit({
      clientId: clientComm1.id,
      objet: 'PRISE_COMMANDE',
      commentaire: 'Test valid creation',
      statutCommande: 'COMMANDE',
      raisonNonCommande: 'TROP_STOCK', // should be reset to null side-effects-wise
      latitude: 48.8566,
      longitude: 2.3522,
    }, commercial1);

    assert(validVisit.statutCommande === 'COMMANDE', "Statut commande est COMMANDE");
    assert(validVisit.raisonNonCommande === null, "La raison de non-commande est automatiquement nulle pour COMMANDE");
    assert(validVisit.latitude === 48.8566, "Coordonnées GPS Latitude correctement sauvegardées");
    assert(validVisit.longitude === 2.3522, "Coordonnées GPS Longitude correctement sauvegardées");

    // Test 3: Role-based filtering (COMMERCIAL sees only own)
    const visitsComm1 = await visitService.getAllVisits({}, commercial1);
    const hasOtherCommVisits = visitsComm1.visits.some(v => v.commercialId !== commercial1.id);
    assert(!hasOtherCommVisits, "Un commercial ne peut voir que ses propres rapports de visites");

    // Test 4: Role-based filtering (MANAGER sees team)
    const visitsManager = await visitService.getAllVisits({}, managerUser);
    const hasOnlyTeamVisits = visitsManager.visits.every(v => v.commercialId === commercial1.id || v.commercialId === commercial2.id);
    assert(hasOnlyTeamVisits, "Un manager voit uniquement les visites des commerciaux rattachés (Alice & Bob)");

    // Test 5: Role-based filtering (ADMIN sees all)
    const visitsAdmin = await visitService.getAllVisits({}, adminUser);
    assert(visitsAdmin.total >= visitsManager.total, "Admin voit toutes les visites");

    // Test 6: Commande total HT recalculation (never trust client total)
    const newOrder = await commandeService.createCommande({
      clientId: clientComm1.id,
      visiteId: validVisit.id,
      type: 'COMMANDE',
      statut: 'BROUILLON',
      lignes: [
        { designation: 'Produit A', reference: 'REF-A', conditionnement: 'Bouteille', quantite: 10, prixUnitaireHT: 15.0, remise: 10 }, // 10 * 15 * 0.9 = 135
        { designation: 'Produit B', reference: 'REF-B', conditionnement: 'Canette', quantite: 2, prixUnitaireHT: 50.0, remise: 0 } // 2 * 50 = 100
      ] // Expected Total HT = 235
    }, commercial1);

    assert(newOrder.totalHT === 235, `Calcul du totalHT recalculé côté serveur correct: ${newOrder.totalHT} € (attendu: 235 €)`);

    // Clean up created test data
    await prisma.ligneCommande.deleteMany({ where: { commandeId: newOrder.id } });
    await prisma.commande.delete({ where: { id: newOrder.id } });
    await prisma.visite.delete({ where: { id: validVisit.id } });

    console.log(`\n--- TESTS COMPLETED. PASSED: ${passed}, FAILED: ${failed} ---`);
    if (failed > 0) process.exit(1);
    else process.exit(0);

  } catch (error) {
    console.error('Erreur fatale lors de l\'exécution des tests:', error);
    process.exit(1);
  }
}

runTests();
