const prisma = require('../utils/db');

/**
 * Fetch all orders/quotes with dynamic role security filtering.
 */
async function getAllCommandes({ clientId, commercialId, type, status, page = 1, limit = 10 } = {}, currentUser) {
  const skip = (page - 1) * limit;
  const where = {};

  // 1. Role-based security checks
  if (currentUser.role === 'COMMERCIAL') {
    where.commercialId = currentUser.id;
  } else if (currentUser.role === 'MANAGER') {
    where.commercial = { managerId: currentUser.id };
  }
  // Admin: no restriction

  // 2. Extra query filters
  if (clientId) {
    where.clientId = Number(clientId);
  }

  if (commercialId) {
    const parsedCommId = Number(commercialId);
    if (currentUser.role === 'ADMIN') {
      where.commercialId = parsedCommId;
    } else if (currentUser.role === 'MANAGER') {
      where.commercialId = parsedCommId;
      where.commercial = { id: parsedCommId, managerId: currentUser.id };
    }
  }

  if (type) {
    where.type = type; // COMMANDE or DEVIS
  }

  if (status) {
    where.statut = status; // BROUILLON, EN_ATTENTE, VALIDEE, TRAITEE, ANNULEE
  }

  // 3. Count & query
  const total = await prisma.commande.count({ where });
  const commandes = await prisma.commande.findMany({
    where,
    skip: Number(skip),
    take: Number(limit),
    orderBy: { createdAt: 'desc' },
    include: {
      client: {
        select: {
          id: true,
          code: true,
          companyName: true,
          city: true,
        }
      },
      commercial: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        }
      },
      _count: {
        select: {
          lignes: true
        }
      }
    }
  });

  return { commandes, total, page: Number(page), limit: Number(limit) };
}

/**
 * Fetch a single order by ID with permissions check.
 */
async function getCommandeById(id, currentUser) {
  const commande = await prisma.commande.findUnique({
    where: { id: Number(id) },
    include: {
      client: true,
      commercial: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          managerId: true,
        }
      },
      visite: true,
      lignes: true
    }
  });

  if (!commande) return null;

  // Enforce access control
  if (currentUser.role === 'COMMERCIAL' && commande.commercialId !== currentUser.id) {
    const error = new Error('Accès refusé. Vous ne pouvez pas consulter cette commande.');
    error.statusCode = 403;
    throw error;
  }

  if (currentUser.role === 'MANAGER') {
    const isOwner = commande.commercialId === currentUser.id;
    const isTeamMember = commande.commercial?.managerId === currentUser.id;
    if (!isOwner && !isTeamMember) {
      const error = new Error("Accès refusé. Cette commande n'appartient pas à votre équipe.");
      error.statusCode = 403;
      throw error;
    }
  }

  return commande;
}

/**
 * Create a new order or devis.
 */
async function createCommande(data, currentUser) {
  const { clientId, visiteId, type, statut, lignes } = data;

  // Verify client
  const client = await prisma.client.findUnique({
    where: { id: Number(clientId) }
  });

  if (!client) {
    const error = new Error('Client introuvable.');
    error.statusCode = 404;
    throw error;
  }

  // Check client access
  if (currentUser.role === 'COMMERCIAL' && client.assignedTo !== currentUser.id) {
    const error = new Error('Accès refusé. Ce client ne vous est pas affecté.');
    error.statusCode = 403;
    throw error;
  }

  // Check visit if provided
  if (visiteId) {
    const visit = await prisma.visite.findUnique({
      where: { id: Number(visiteId) }
    });
    if (!visit) {
      const error = new Error('Visite introuvable.');
      error.statusCode = 404;
      throw error;
    }
  }

  // Recalculate each line item and the totalHT on the server!
  if (!lignes || !Array.isArray(lignes) || lignes.length === 0) {
    const error = new Error('Une commande doit contenir au moins une ligne d\'article.');
    error.statusCode = 400;
    throw error;
  }

  let totalHT = 0;
  const processedLignes = lignes.map((line) => {
    const quantite = Number(line.quantite);
    const prixUnitaireHT = Number(line.prixUnitaireHT);
    const remise = Number(line.remise || 0);

    if (isNaN(quantite) || quantite <= 0) {
      const error = new Error('La quantité doit être supérieure à 0.');
      error.statusCode = 400;
      throw error;
    }

    if (isNaN(prixUnitaireHT) || prixUnitaireHT < 0) {
      const error = new Error('Le prix unitaire doit être positif.');
      error.statusCode = 400;
      throw error;
    }

    if (isNaN(remise) || remise < 0 || remise > 100) {
      const error = new Error('La remise doit être comprise entre 0 et 100%.');
      error.statusCode = 400;
      throw error;
    }

    const totalLigneHT = quantite * prixUnitaireHT * (1 - remise / 100);
    // Round to 2 decimal places to avoid floating point issues
    const roundedLineTotal = Math.round(totalLigneHT * 100) / 100;
    totalHT += roundedLineTotal;

    return {
      designation: line.designation.trim(),
      reference: line.reference.trim(),
      conditionnement: line.conditionnement.trim(),
      quantite,
      prixUnitaireHT,
      remise,
      totalLigneHT: roundedLineTotal,
    };
  });

  // Create the Order in a transaction
  return prisma.$transaction(async (tx) => {
    const newOrder = await tx.commande.create({
      data: {
        clientId: Number(clientId),
        commercialId: currentUser.id,
        visiteId: visiteId ? Number(visiteId) : null,
        type,
        statut,
        totalHT: Math.round(totalHT * 100) / 100,
        lignes: {
          create: processedLignes
        }
      },
      include: {
        client: true,
        lignes: true
      }
    });

    // If a visit ID was supplied, make sure the visit record reflects that a command was taken
    if (visiteId) {
      await tx.visite.update({
        where: { id: Number(visiteId) },
        data: {
          statutCommande: 'COMMANDE',
          raisonNonCommande: null
        }
      });
    }

    return newOrder;
  });
}

/**
 * Update an existing order.
 */
async function updateCommande(id, data, currentUser) {
  const { type, statut, lignes } = data;

  const commande = await prisma.commande.findUnique({
    where: { id: Number(id) },
    include: {
      commercial: true,
      lignes: true
    }
  });

  if (!commande) {
    const error = new Error('Commande introuvable.');
    error.statusCode = 404;
    throw error;
  }

  // Access validation
  if (currentUser.role === 'COMMERCIAL' && commande.commercialId !== currentUser.id) {
    const error = new Error('Accès refusé. Vous ne pouvez modifier que vos propres commandes.');
    error.statusCode = 403;
    throw error;
  }

  if (currentUser.role === 'MANAGER') {
    const isOwner = commande.commercialId === currentUser.id;
    const isTeamMember = commande.commercial?.managerId === currentUser.id;
    if (!isOwner && !isTeamMember) {
      const error = new Error("Accès refusé. Vous ne pouvez modifier que les commandes de votre équipe.");
      error.statusCode = 403;
      throw error;
    }
  }

  // If order is already completed or processed, restrict modifications for commercial
  if (currentUser.role === 'COMMERCIAL' && ['VALIDEE', 'TRAITEE', 'ANNULEE'].includes(commande.statut)) {
    const error = new Error('Accès refusé. Vous ne pouvez plus modifier une commande validée, traitée ou annulée.');
    error.statusCode = 400;
    throw error;
  }

  const updateData = {};
  if (type) updateData.type = type;
  if (statut) updateData.statut = statut;

  return prisma.$transaction(async (tx) => {
    // If lines are supplied, clear old lines and rebuild, recalculating the total
    if (lignes && Array.isArray(lignes)) {
      if (lignes.length === 0) {
        const error = new Error('Une commande doit contenir au moins une ligne d\'article.');
        error.statusCode = 400;
        throw error;
      }

      // Delete old lines
      await tx.ligneCommande.deleteMany({
        where: { commandeId: Number(id) }
      });

      let totalHT = 0;
      const processedLignes = lignes.map((line) => {
        const quantite = Number(line.quantite);
        const prixUnitaireHT = Number(line.prixUnitaireHT);
        const remise = Number(line.remise || 0);

        const totalLigneHT = quantite * prixUnitaireHT * (1 - remise / 100);
        const roundedLineTotal = Math.round(totalLigneHT * 100) / 100;
        totalHT += roundedLineTotal;

        return {
          commandeId: Number(id),
          designation: line.designation.trim(),
          reference: line.reference.trim(),
          conditionnement: line.conditionnement.trim(),
          quantite,
          prixUnitaireHT,
          remise,
          totalLigneHT: roundedLineTotal,
        };
      });

      // Insert new lines
      await tx.ligneCommande.createMany({
        data: processedLignes
      });

      updateData.totalHT = Math.round(totalHT * 100) / 100;
    }

    return tx.commande.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        client: true,
        lignes: true
      }
    });
  });
}

/**
 * Delete a command (restricted to ADMIN, or COMMERCIAL if it is a draft/brouillon).
 */
async function deleteCommande(id, currentUser) {
  const commande = await prisma.commande.findUnique({
    where: { id: Number(id) },
    include: {
      commercial: true
    }
  });

  if (!commande) {
    const error = new Error('Commande introuvable.');
    error.statusCode = 404;
    throw error;
  }

  // Access validation
  if (currentUser.role === 'COMMERCIAL') {
    if (commande.commercialId !== currentUser.id) {
      const error = new Error('Accès refusé. Vous ne pouvez supprimer que vos propres commandes.');
      error.statusCode = 403;
      throw error;
    }
    if (commande.statut !== 'BROUILLON') {
      const error = new Error('Accès refusé. Vous ne pouvez supprimer que des commandes au statut Brouillon.');
      error.statusCode = 400;
      throw error;
    }
  } else if (currentUser.role === 'MANAGER') {
    const isTeamMember = commande.commercial?.managerId === currentUser.id;
    if (!isTeamMember && commande.commercialId !== currentUser.id) {
      const error = new Error('Accès refusé. Vous ne pouvez supprimer que des commandes de votre équipe.');
      error.statusCode = 403;
      throw error;
    }
  }

  return prisma.commande.delete({
    where: { id: Number(id) }
  });
}

module.exports = {
  getAllCommandes,
  getCommandeById,
  createCommande,
  updateCommande,
  deleteCommande
};
