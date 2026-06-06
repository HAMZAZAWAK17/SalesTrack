const prisma = require('../utils/db');

/**
 * Get all visits based on user role and query filters.
 */
async function getAllVisits({ clientId, userId, subject, status, date, page = 1, limit = 10 } = {}, currentUser) {
  const skip = (page - 1) * limit;
  const where = {};

  // 1. Role-Based Access Control Filtering
  if (currentUser.role === 'COMMERCIAL') {
    // Commercial only sees their own visits
    where.userId = currentUser.id;
  } else if (currentUser.role === 'MANAGER') {
    // Manager only sees visits of subordinates in their team
    where.commercial = { managerId: currentUser.id };
  }
  // Admin sees all

  // 2. Extra Filters
  if (clientId) {
    where.clientId = Number(clientId);
  }

  if (userId) {
    const parsedUserId = Number(userId);
    if (currentUser.role === 'ADMIN') {
      where.userId = parsedUserId;
    } else if (currentUser.role === 'MANAGER') {
      // Manager can filter by user only if they belong to their team
      where.userId = parsedUserId;
      where.commercial = { id: parsedUserId, managerId: currentUser.id };
    }
  }

  if (subject) {
    where.subject = subject;
  }

  if (status) {
    where.status = status;
  }

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    where.createdAt = {
      gte: startOfDay,
      lte: endOfDay
    };
  }

  // 3. Count total matching
  const total = await prisma.visit.count({ where });

  // 4. Fetch list
  const visits = await prisma.visit.findMany({
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
          role: true,
        }
      }
    }
  });

  return { visits, total, page: Number(page), limit: Number(limit) };
}

/**
 * Get visit details by ID with access control validation.
 */
async function getVisitById(id, currentUser) {
  const visit = await prisma.visit.findUnique({
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
      }
    }
  });

  if (!visit) return null;

  // Enforce access control
  if (currentUser.role === 'COMMERCIAL' && visit.userId !== currentUser.id) {
    const error = new Error('Accès refusé. Vous ne pouvez pas voir cette visite.');
    error.statusCode = 403;
    throw error;
  }

  if (currentUser.role === 'MANAGER') {
    const isOwner = visit.userId === currentUser.id;
    const isTeamMember = visit.commercial?.managerId === currentUser.id;
    if (!isOwner && !isTeamMember) {
      const error = new Error("Accès refusé. Cette visite n'a pas été enregistrée par un membre de votre équipe.");
      error.statusCode = 403;
      throw error;
    }
  }

  return visit;
}

/**
 * Create a new visit.
 */
async function createVisit(data, currentUser) {
  const { clientId, subject, comment, status, noOrderReason, latitude, longitude } = data;

  // Check conditional business rules:
  // Si statut = NO_ORDER -> noOrderReason obligatoire
  if (status === 'NO_ORDER' && (!noOrderReason || noOrderReason.trim() === '')) {
    const error = new Error('Le motif d\'absence de commande est obligatoire lorsque le statut est NO_ORDER.');
    error.statusCode = 400;
    throw error;
  }

  // Ensure client exists
  const client = await prisma.client.findUnique({
    where: { id: Number(clientId) }
  });

  if (!client) {
    const error = new Error('Client introuvable.');
    error.statusCode = 404;
    throw error;
  }

  // Check client access: Commercial can only register visits for their own clients
  if (currentUser.role === 'COMMERCIAL' && client.assignedTo !== currentUser.id) {
    const error = new Error('Accès refusé. Vous ne pouvez enregistrer des visites que pour vos propres clients.');
    error.statusCode = 403;
    throw error;
  }

  const finalNoOrderReason = status === 'ORDER_PLACED' ? null : noOrderReason;

  return prisma.visit.create({
    data: {
      clientId: Number(clientId),
      userId: currentUser.id,
      subject,
      comment: comment || null,
      status,
      noOrderReason: finalNoOrderReason,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
    },
    include: {
      client: true,
      commercial: {
        select: {
          firstName: true,
          lastName: true,
        }
      }
    }
  });
}

/**
 * Update an existing visit.
 */
async function updateVisit(id, data, currentUser) {
  const visit = await prisma.visit.findUnique({
    where: { id: Number(id) },
    include: {
      commercial: true
    }
  });

  if (!visit) {
    const error = new Error('Visite introuvable.');
    error.statusCode = 404;
    throw error;
  }

  // Check write access
  if (currentUser.role === 'COMMERCIAL' && visit.userId !== currentUser.id) {
    const error = new Error('Accès refusé. Vous ne pouvez modifier que vos propres visites.');
    error.statusCode = 403;
    throw error;
  }

  if (currentUser.role === 'MANAGER') {
    const isOwner = visit.userId === currentUser.id;
    const isTeamMember = visit.commercial?.managerId === currentUser.id;
    if (!isOwner && !isTeamMember) {
      const error = new Error("Accès refusé. Vous ne pouvez modifier que les visites des membres de votre équipe.");
      error.statusCode = 403;
      throw error;
    }
  }

  const { clientId, subject, comment, status, noOrderReason, latitude, longitude } = data;

  // Validate conditional fields if changing status
  const finalStatus = status || visit.status;
  const finalReason = finalStatus === 'ORDER_PLACED' ? null : (noOrderReason !== undefined ? noOrderReason : visit.noOrderReason);

  if (finalStatus === 'NO_ORDER' && (!finalReason || finalReason.trim() === '')) {
    const error = new Error('Le motif d\'absence de commande est obligatoire lorsque le statut est NO_ORDER.');
    error.statusCode = 400;
    throw error;
  }

  const updateData = {};
  if (clientId) updateData.clientId = Number(clientId);
  if (subject) updateData.subject = subject;
  if (comment !== undefined) updateData.comment = comment;
  if (status) updateData.status = status;
  updateData.noOrderReason = finalReason;
  if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(latitude) : null;
  if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude) : null;

  return prisma.visit.update({
    where: { id: Number(id) },
    data: updateData,
    include: {
      client: true,
      commercial: {
        select: {
          firstName: true,
          lastName: true,
        }
      }
    }
  });
}

/**
 * Delete a visit.
 */
async function deleteVisit(id, currentUser) {
  const visit = await prisma.visit.findUnique({
    where: { id: Number(id) },
    include: {
      commercial: true
    }
  });

  if (!visit) {
    const error = new Error('Visite introuvable.');
    error.statusCode = 404;
    throw error;
  }

  // Access validation: Commercial can only delete their own if Admin/Manager allows.
  // Prompt says: ADMIN (See, Create, Edit, Delete), MANAGER (See team), COMMERCIAL (See own).
  // This implies managers/admins are the ones with delete authorization. Let's block commercial deletion if they aren't admin/manager.
  if (currentUser.role === 'COMMERCIAL') {
    const error = new Error('Accès refusé. Seuls les administrateurs et les managers peuvent supprimer des rapports de visite.');
    error.statusCode = 403;
    throw error;
  }

  if (currentUser.role === 'MANAGER') {
    const isOwner = visit.userId === currentUser.id;
    const isTeamMember = visit.commercial?.managerId === currentUser.id;
    if (!isOwner && !isTeamMember) {
      const error = new Error("Accès refusé. Vous ne pouvez supprimer que les rapports des membres de votre équipe.");
      error.statusCode = 403;
      throw error;
    }
  }

  return prisma.visit.delete({
    where: { id: Number(id) }
  });
}

module.exports = {
  getAllVisits,
  getVisitById,
  createVisit,
  updateVisit,
  deleteVisit
};
