const prisma = require('../utils/db');

/**
 * Fetch all clients with pagination, searching, and filtering.
 * Auto-filters based on the role of the logged-in user.
 */
async function getAllClients({
  name = '',
  code = '',
  city = '',
  distributionChannel = '',
  category = '',
  status = '',
  assignedTo = '',
  page = 1,
  limit = 10
}, currentUser) {
  const skip = (page - 1) * limit;
  const where = {};

  // 1. Role-based security filtering
  if (currentUser.role === 'COMMERCIAL') {
    where.assignedTo = currentUser.id;
  } else if (currentUser.role === 'MANAGER') {
    where.OR = [
      { assignedTo: currentUser.id },
      { commercial: { managerId: currentUser.id } }
    ];
  }

  // 2. Input search & filters
  if (code && code.trim() !== '') {
    where.code = {
      contains: code.trim(),
    };
  }

  if (name && name.trim() !== '') {
    where.companyName = {
      contains: name.trim(),
    };
  }

  if (city && city.trim() !== '') {
    where.city = city.trim();
  }

  if (distributionChannel && distributionChannel.trim() !== '') {
    where.distributionChannel = distributionChannel.trim();
  }

  if (category && category.trim() !== '') {
    where.category = category.trim();
  }

  if (status && status.trim() !== '') {
    where.status = status.trim();
  }

  if (assignedTo && assignedTo.trim() !== '') {
    const parsedAssigned = Number(assignedTo);
    if (currentUser.role === 'ADMIN') {
      where.assignedTo = parsedAssigned;
    } else if (currentUser.role === 'MANAGER') {
      // A manager can only filter for a commercial if they are the manager
      where.assignedTo = parsedAssigned;
      where.commercial = { managerId: currentUser.id };
    }
  }

  // 3. Count total matching rows
  const total = await prisma.client.count({ where });

  // 4. Query data
  const clients = await prisma.client.findMany({
    where,
    skip: Number(skip),
    take: Number(limit),
    orderBy: { companyName: 'asc' },
    include: {
      commercial: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          equipe: true,
        }
      }
    }
  });

  return { clients, total, page: Number(page), limit: Number(limit) };
}

/**
 * Fetch a single client by ID. Ensures user has permissions to view this client.
 */
async function getClientById(id, currentUser) {
  const client = await prisma.client.findUnique({
    where: { id: Number(id) },
    include: {
      commercial: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          equipe: true,
          managerId: true,
        }
      },
      _count: {
        select: {
          visites: true,
          commandes: true,
        }
      }
    }
  });

  if (!client) return null;

  // Enforce access control checks
  if (currentUser.role === 'COMMERCIAL' && client.assignedTo !== currentUser.id) {
    const error = new Error('Accès refusé. Ce client ne vous est pas affecté.');
    error.statusCode = 403;
    throw error;
  }

  if (currentUser.role === 'MANAGER') {
    const isAssigned = client.assignedTo === currentUser.id;
    const isTeamMember = client.commercial?.managerId === currentUser.id;
    if (!isAssigned && !isTeamMember) {
      const error = new Error("Accès refusé. Ce client n'appartient pas aux commerciaux de votre équipe.");
      error.statusCode = 403;
      throw error;
    }
  }

  return client;
}

/**
 * Create a new client (restricted to ADMIN role).
 */
async function createClient(data) {
  const { code, companyName, phone, email, address, city, distributionChannel, category, status, assignedTo, notes } = data;

  // Validate unique client code
  const existingClient = await prisma.client.findUnique({
    where: { code: code.trim() }
  });

  if (existingClient) {
    const error = new Error('Un client avec ce code existe déjà.');
    error.statusCode = 400;
    error.code = 'CODE_ALREADY_EXISTS';
    throw error;
  }

  return prisma.client.create({
    data: {
      code: code.trim(),
      companyName: companyName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      distributionChannel,
      category,
      status,
      assignedTo: Number(assignedTo),
      notes: notes ? notes.trim() : null,
    },
    include: {
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
 * Update an existing client.
 */
async function updateClient(id, data, currentUser) {
  const client = await prisma.client.findUnique({
    where: { id: Number(id) },
    include: {
      commercial: {
        select: { managerId: true }
      }
    }
  });

  if (!client) {
    const error = new Error('Client non trouvé.');
    error.statusCode = 404;
    throw error;
  }

  // Access check
  if (currentUser.role === 'COMMERCIAL' && client.assignedTo !== currentUser.id) {
    const error = new Error('Accès refusé. Vous ne pouvez modifier que vos propres clients.');
    error.statusCode = 403;
    throw error;
  }

  if (currentUser.role === 'MANAGER') {
    const isAssigned = client.assignedTo === currentUser.id;
    const isTeamMember = client.commercial?.managerId === currentUser.id;
    if (!isAssigned && !isTeamMember) {
      const error = new Error("Accès refusé. Vous ne pouvez modifier que les clients de votre équipe.");
      error.statusCode = 403;
      throw error;
    }
  }

  const { code, companyName, phone, email, address, city, distributionChannel, category, status, assignedTo, notes } = data;

  // Check unique code if changed
  if (code && code.trim() !== client.code) {
    const existingClient = await prisma.client.findUnique({
      where: { code: code.trim() }
    });
    if (existingClient) {
      const error = new Error('Un client avec ce code existe déjà.');
      error.statusCode = 400;
      error.code = 'CODE_ALREADY_EXISTS';
      throw error;
    }
  }

  const updateData = {};
  if (companyName) updateData.companyName = companyName.trim();
  if (phone) updateData.phone = phone.trim();
  if (email) updateData.email = email.trim();
  if (address) updateData.address = address.trim();
  if (city) updateData.city = city.trim();
  if (distributionChannel) updateData.distributionChannel = distributionChannel;
  if (category) updateData.category = category;
  if (status) updateData.status = status;
  if (notes !== undefined) updateData.notes = notes ? notes.trim() : null;

  // AssignedTo can only be updated by Admin
  if (assignedTo && currentUser.role === 'ADMIN') {
    updateData.assignedTo = Number(assignedTo);
  }

  // Code can only be updated by Admin
  if (code && currentUser.role === 'ADMIN') {
    updateData.code = code.trim();
  }

  return prisma.client.update({
    where: { id: Number(id) },
    data: updateData,
    include: {
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
 * Delete a client by ID (restricted to ADMIN).
 */
async function deleteClient(id) {
  const client = await prisma.client.findUnique({
    where: { id: Number(id) }
  });

  if (!client) {
    const error = new Error('Client non trouvé.');
    error.statusCode = 404;
    throw error;
  }

  return prisma.client.delete({
    where: { id: Number(id) }
  });
}

/**
 * Get list of unique cities represented in database (helper for filter populating)
 */
async function getUniqueCities(currentUser) {
  const where = {};
  if (currentUser.role === 'COMMERCIAL') {
    where.assignedTo = currentUser.id;
  } else if (currentUser.role === 'MANAGER') {
    where.OR = [
      { assignedTo: currentUser.id },
      { commercial: { managerId: currentUser.id } }
    ];
  }

  const result = await prisma.client.findMany({
    where,
    select: { city: true },
    distinct: ['city'],
    orderBy: { city: 'asc' }
  });

  return result.map(c => c.city);
}

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getUniqueCities,
};
