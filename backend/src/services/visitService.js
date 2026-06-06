const prisma = require('../utils/db');
const fs = require('fs');
const path = require('path');

/**
 * Get all visits based on user role and query filters.
 */
async function getAllVisits({ clientId, commercialId, subject, status, date, page = 1, limit = 10 } = {}, currentUser) {
  const skip = (page - 1) * limit;
  const where = {};

  // 1. Role-Based Access Control Filtering
  if (currentUser.role === 'COMMERCIAL') {
    // Commercial only sees their own visits
    where.commercialId = currentUser.id;
  } else if (currentUser.role === 'MANAGER') {
    // Manager only sees visits of subordinates in their team
    where.commercial = { managerId: currentUser.id };
  }
  // Admin sees all

  // 2. Extra Filters
  if (clientId) {
    where.clientId = Number(clientId);
  }

  if (commercialId) {
    const parsedCommId = Number(commercialId);
    if (currentUser.role === 'ADMIN') {
      where.commercialId = parsedCommId;
    } else if (currentUser.role === 'MANAGER') {
      // Manager can filter by user only if they belong to their team
      where.commercialId = parsedCommId;
      where.commercial = { id: parsedCommId, managerId: currentUser.id };
    }
  }

  if (subject) {
    where.objet = subject;
  }

  if (status) {
    where.statutCommande = status;
  }

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    where.dateDebut = {
      gte: startOfDay,
      lte: endOfDay
    };
  }

  // 3. Count total matching
  const total = await prisma.visite.count({ where });

  // 4. Fetch list
  const visits = await prisma.visite.findMany({
    where,
    skip: Number(skip),
    take: Number(limit),
    orderBy: { dateDebut: 'desc' },
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
  const visit = await prisma.visite.findUnique({
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
      photos: true,
      commandes: true
    }
  });

  if (!visit) return null;

  // Enforce access control
  if (currentUser.role === 'COMMERCIAL' && visit.commercialId !== currentUser.id) {
    const error = new Error('Accès refusé. Vous ne pouvez pas voir cette visite.');
    error.statusCode = 403;
    throw error;
  }

  if (currentUser.role === 'MANAGER') {
    const isOwner = visit.commercialId === currentUser.id;
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
  const { clientId, objet, commentaire, statutCommande, raisonNonCommande, problemesConstates, latitude, longitude, photos } = data;

  // Check conditional business rules:
  if (statutCommande === 'NON_COMMANDE' && (!raisonNonCommande || raisonNonCommande.trim() === '')) {
    const error = new Error('Le motif d\'absence de commande est obligatoire lorsque le statut est NON_COMMANDE.');
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

  const finalNoOrderReason = statutCommande === 'COMMANDE' ? null : raisonNonCommande;

  // Save the visit
  const newVisite = await prisma.visite.create({
    data: {
      clientId: Number(clientId),
      commercialId: currentUser.id,
      objet,
      commentaire: commentaire || '',
      statutCommande,
      raisonNonCommande: finalNoOrderReason,
      problemesConstates: problemesConstates || null,
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

  // Sync uploaded photos if any
  if (photos && Array.isArray(photos) && photos.length > 0) {
    for (const photo of photos) {
      await prisma.photo.create({
        data: {
          visiteId: newVisite.id,
          commercialId: currentUser.id,
          clientId: Number(clientId),
          cheminFichier: photo.cheminFichier,
          legende: photo.legende || null,
          latitude: photo.latitude ? parseFloat(photo.latitude) : null,
          longitude: photo.longitude ? parseFloat(photo.longitude) : null,
        }
      });
    }
  }

  // Reload details to include photos
  return getVisitById(newVisite.id, currentUser);
}

/**
 * Update an existing visit.
 */
async function updateVisit(id, data, currentUser) {
  const visit = await prisma.visite.findUnique({
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
  if (currentUser.role === 'COMMERCIAL' && visit.commercialId !== currentUser.id) {
    const error = new Error('Accès refusé. Vous ne pouvez modifier que vos propres visites.');
    error.statusCode = 403;
    throw error;
  }

  if (currentUser.role === 'MANAGER') {
    const isOwner = visit.commercialId === currentUser.id;
    const isTeamMember = visit.commercial?.managerId === currentUser.id;
    if (!isOwner && !isTeamMember) {
      const error = new Error("Accès refusé. Vous ne pouvez modifier que les visites des membres de votre équipe.");
      error.statusCode = 403;
      throw error;
    }
  }

  const { clientId, objet, commentaire, statutCommande, raisonNonCommande, problemesConstates, latitude, longitude, photos } = data;

  // Validate conditional fields if changing status
  const finalStatus = statutCommande || visit.statutCommande;
  const finalReason = finalStatus === 'COMMANDE' ? null : (raisonNonCommande !== undefined ? raisonNonCommande : visit.raisonNonCommande);

  if (finalStatus === 'NON_COMMANDE' && (!finalReason || finalReason.trim() === '')) {
    const error = new Error('Le motif d\'absence de commande est obligatoire lorsque le statut est NON_COMMANDE.');
    error.statusCode = 400;
    throw error;
  }

  const updateData = {};
  if (clientId) updateData.clientId = Number(clientId);
  if (objet) updateData.objet = objet;
  if (commentaire !== undefined) updateData.commentaire = commentaire;
  if (statutCommande) updateData.statutCommande = statutCommande;
  updateData.raisonNonCommande = finalReason;
  if (problemesConstates !== undefined) updateData.problemesConstates = problemesConstates;
  if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(latitude) : null;
  if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude) : null;

  const updatedVisite = await prisma.visite.update({
    where: { id: Number(id) },
    data: updateData
  });

  // Sync uploaded photos if photos list is provided
  if (photos && Array.isArray(photos)) {
    const oldPhotos = await prisma.photo.findMany({ where: { visiteId: Number(id) } });
    const newPaths = photos.map(p => p.cheminFichier);

    // Remove photos that are not present in the new set
    for (const oldPhoto of oldPhotos) {
      if (!newPaths.includes(oldPhoto.cheminFichier)) {
        const filePath = path.join(__dirname, '../../', oldPhoto.cheminFichier);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.error(`Error deleting file: ${filePath}`, e);
          }
        }
        await prisma.photo.delete({ where: { id: oldPhoto.id } });
      }
    }

    // Insert or update remaining photos
    for (const photo of photos) {
      const exists = oldPhotos.find(op => op.cheminFichier === photo.cheminFichier);
      if (!exists) {
        await prisma.photo.create({
          data: {
            visiteId: Number(id),
            commercialId: updatedVisite.commercialId,
            clientId: updatedVisite.clientId,
            cheminFichier: photo.cheminFichier,
            legende: photo.legende || null,
            latitude: photo.latitude ? parseFloat(photo.latitude) : null,
            longitude: photo.longitude ? parseFloat(photo.longitude) : null,
          }
        });
      } else if (exists.legende !== photo.legende) {
        await prisma.photo.update({
          where: { id: exists.id },
          data: { legende: photo.legende || null }
        });
      }
    }
  }

  // Reload details
  return getVisitById(id, currentUser);
}

/**
 * Delete a visit.
 */
async function deleteVisit(id, currentUser) {
  const visit = await prisma.visite.findUnique({
    where: { id: Number(id) },
    include: {
      commercial: true,
      photos: true
    }
  });

  if (!visit) {
    const error = new Error('Visite introuvable.');
    error.statusCode = 404;
    throw error;
  }

  if (currentUser.role === 'COMMERCIAL') {
    const error = new Error('Accès refusé. Seuls les administrateurs et les managers peuvent supprimer des rapports de visite.');
    error.statusCode = 403;
    throw error;
  }

  if (currentUser.role === 'MANAGER') {
    const isOwner = visit.commercialId === currentUser.id;
    const isTeamMember = visit.commercial?.managerId === currentUser.id;
    if (!isOwner && !isTeamMember) {
      const error = new Error("Accès refusé. Vous ne pouvez supprimer que les rapports des membres de votre équipe.");
      error.statusCode = 403;
      throw error;
    }
  }

  // Delete all photos from filesystem
  if (visit.photos && visit.photos.length > 0) {
    for (const photo of visit.photos) {
      const filePath = path.join(__dirname, '../../', photo.cheminFichier);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error(`Error deleting file: ${filePath}`, e);
        }
      }
    }
  }

  return prisma.visite.delete({
    where: { id: Number(id) }
  });
}

/**
 * Deletes photos older than 30 days from filesystem and database.
 */
async function cleanupOldPhotos() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Find photos older than 30 days
  const oldPhotos = await prisma.photo.findMany({
    where: {
      createdAt: {
        lt: thirtyDaysAgo
      }
    }
  });

  let deletedCount = 0;
  for (const photo of oldPhotos) {
    const filePath = path.join(__dirname, '../../', photo.cheminFichier);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`Failed to delete file on disk: ${filePath}`, err);
      }
    }
    
    await prisma.photo.delete({
      where: { id: photo.id }
    });
    deletedCount++;
  }

  return { success: true, deletedCount };
}

module.exports = {
  getAllVisits,
  getVisitById,
  createVisit,
  updateVisit,
  deleteVisit,
  cleanupOldPhotos
};
