const { z } = require('zod');
const bcrypt = require('bcryptjs');
const prisma = require('../utils/db');

// Zod validation schema for creating a user
const createUserSchema = z.object({
  email: z.string().min(1, 'L\'email est obligatoire').email('Format d\'email invalide'),
  firstName: z.string().min(1, 'Le prénom est obligatoire'),
  lastName: z.string().min(1, 'Le nom est obligatoire'),
  phone: z.string().min(1, 'Le téléphone est obligatoire'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  role: z.enum(['ADMIN', 'MANAGER', 'COMMERCIAL'], {
    errorMap: () => ({ message: 'Rôle invalide. Doit être ADMIN, MANAGER ou COMMERCIAL.' })
  }),
  equipe: z.string().optional().nullable(),
  managerId: z.number().optional().nullable(),
}).superRefine((data, ctx) => {
  // If role is MANAGER or COMMERCIAL, team (equipe) is required
  if (data.role === 'MANAGER' || data.role === 'COMMERCIAL') {
    if (!data.equipe || data.equipe.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'L\'équipe est obligatoire pour les managers et les commerciaux.',
        path: ['equipe']
      });
    }
  }
  // If role is COMMERCIAL, managerId is required
  if (data.role === 'COMMERCIAL') {
    if (!data.managerId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Le manager est obligatoire pour un commercial.',
        path: ['managerId']
      });
    }
  }
});

// GET /api/users/managers
async function getManagers(req, res) {
  try {
    const managers = await prisma.user.findMany({
      where: { role: 'MANAGER' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    return res.json({
      success: true,
      data: managers
    });
  } catch (error) {
    console.error('Error fetching managers:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur lors de la récupération des managers.',
      code: 'SERVER_ERROR'
    });
  }
}

// POST /api/users
async function createUser(req, res) {
  try {
    // Validate request body with Zod
    const validationResult = createUserSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      // Format Zod errors
      const formattedErrors = {};
      validationResult.error.errors.forEach((err) => {
        const path = err.path.join('.');
        formattedErrors[path] = err.message;
      });

      return res.status(400).json({
        success: false,
        error: 'Erreur de validation des données.',
        errors: formattedErrors,
        code: 'VALIDATION_ERROR'
      });
    }

    const { email, firstName, lastName, phone, password, role, equipe, managerId } = validationResult.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Un utilisateur avec cette adresse email existe déjà.',
        code: 'EMAIL_ALREADY_EXISTS',
        errors: { email: 'Cet email est déjà utilisé.' }
      });
    }

    // Hash password (10 rounds min)
    const passwordHash = bcrypt.hashSync(password, 10);

    // Build user create data
    const userData = {
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      phone,
      role,
      equipe: (role === 'MANAGER' || role === 'COMMERCIAL') ? equipe : null,
      managerId: role === 'COMMERCIAL' ? managerId : null,
    };

    // Create user in DB
    const newUser = await prisma.user.create({
      data: userData,
    });

    // Exclude password hash from response
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    return res.status(210).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur lors de la création de l\'utilisateur.',
      code: 'SERVER_ERROR'
    });
  }
}

module.exports = {
  getManagers,
  createUser,
};
