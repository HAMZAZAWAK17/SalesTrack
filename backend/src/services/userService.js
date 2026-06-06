const prisma = require('../utils/db');
const bcrypt = require('bcryptjs');

/**
 * Fetch all users with optional name/email searches, role filters, and pagination.
 */
async function getAllUsers({ name, email, role, page = 1, limit = 10 }) {
  const skip = (page - 1) * limit;
  const where = {};

  if (role) {
    where.role = role;
  }

  if (email) {
    where.email = {
      contains: email.toLowerCase(),
    };
  }

  if (name) {
    where.OR = [
      { firstName: { contains: name } },
      { lastName: { contains: name } },
    ];
  }

  const total = await prisma.user.count({ where });

  const users = await prisma.user.findMany({
    where,
    skip: Number(skip),
    take: Number(limit),
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      equipe: true,
      managerId: true,
      createdAt: true,
      updatedAt: true,
      manager: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        }
      }
    }
  });

  return { users, total, page: Number(page), limit: Number(limit) };
}

/**
 * Fetch a single user by ID.
 */
async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      equipe: true,
      managerId: true,
      createdAt: true,
      updatedAt: true,
      manager: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        }
      }
    }
  });
}

/**
 * Fetch all users who have the role of MANAGER (used to populate selectors).
 */
async function getManagers() {
  return prisma.user.findMany({
    where: { role: 'MANAGER' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    }
  });
}

/**
 * Create a new user. Hash password and validate email uniqueness.
 */
async function createUser(data) {
  const { email, firstName, lastName, phone, password, role, equipe, managerId } = data;

  // Validate unique email
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });
  
  if (existingUser) {
    const error = new Error('Un utilisateur avec cet email existe déjà.');
    error.statusCode = 400;
    error.code = 'EMAIL_ALREADY_EXISTS';
    throw error;
  }

  // Hash password
  const passwordHash = bcrypt.hashSync(password, 10);

  const newUserData = {
    email: email.toLowerCase(),
    passwordHash,
    firstName,
    lastName,
    phone,
    role,
    equipe: (role === 'MANAGER' || role === 'COMMERCIAL') ? equipe : null,
    managerId: role === 'COMMERCIAL' ? Number(managerId) : null,
  };

  return prisma.user.create({
    data: newUserData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      equipe: true,
      managerId: true,
      createdAt: true,
    }
  });
}

/**
 * Update an existing user.
 */
async function updateUser(id, data) {
  const { email, firstName, lastName, phone, password, role, equipe, managerId } = data;

  const user = await prisma.user.findUnique({
    where: { id: Number(id) }
  });

  if (!user) {
    const error = new Error('Utilisateur non trouvé.');
    error.statusCode = 404;
    throw error;
  }

  // Validate unique email if it changed
  if (email && email.toLowerCase() !== user.email.toLowerCase()) {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    if (existingUser) {
      const error = new Error('Un utilisateur avec cet email existe déjà.');
      error.statusCode = 400;
      error.code = 'EMAIL_ALREADY_EXISTS';
      throw error;
    }
  }

  const updateData = {
    firstName,
    lastName,
    phone,
    role,
  };

  if (email) {
    updateData.email = email.toLowerCase();
  }

  if (password && password.trim() !== '') {
    updateData.passwordHash = bcrypt.hashSync(password, 10);
  }

  // Set equipe and managerId appropriately based on role
  if (role) {
    updateData.equipe = (role === 'MANAGER' || role === 'COMMERCIAL') ? equipe : null;
    updateData.managerId = role === 'COMMERCIAL' ? Number(managerId) : null;
  }

  return prisma.user.update({
    where: { id: Number(id) },
    data: updateData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      equipe: true,
      managerId: true,
      updatedAt: true,
    }
  });
}

/**
 * Delete a user by ID.
 */
async function deleteUser(id) {
  const user = await prisma.user.findUnique({
    where: { id: Number(id) }
  });

  if (!user) {
    const error = new Error('Utilisateur non trouvé.');
    error.statusCode = 404;
    throw error;
  }

  return prisma.user.delete({
    where: { id: Number(id) }
  });
}

module.exports = {
  getAllUsers,
  getUserById,
  getManagers,
  createUser,
  updateUser,
  deleteUser,
};
