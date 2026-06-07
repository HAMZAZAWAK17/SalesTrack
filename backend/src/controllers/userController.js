const { z } = require('zod');
const userService = require('../services/userService');

// Zod schema for creating a user
const createUserSchema = z.object({
  email: z.string().min(1, "L'email est obligatoire.").email("Format d'email invalide."),
  firstName: z.string().min(1, "Le prénom est obligatoire."),
  lastName: z.string().min(1, "Le nom est obligatoire."),
  phone: z.string().min(1, "Le téléphone est obligatoire."),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
  role: z.enum(['ADMIN', 'MANAGER', 'COMMERCIAL'], {
    errorMap: () => ({ message: 'Rôle invalide. Doit être ADMIN, MANAGER ou COMMERCIAL.' }),
  }),
  equipe: z.string().optional().nullable(),
  managerId: z.any().optional().nullable(),
}).superRefine((data, ctx) => {
  // Team (equipe) is required for MANAGER and COMMERCIAL roles
  if (data.role === 'MANAGER' || data.role === 'COMMERCIAL') {
    if (!data.equipe || data.equipe.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "L'équipe est obligatoire pour les managers et les commerciaux.",
        path: ['equipe'],
      });
    }
  }
  // Manager dropdown is required ONLY for COMMERCIAL role
  if (data.role === 'COMMERCIAL') {
    if (!data.managerId || data.managerId === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Le manager est obligatoire pour un commercial.',
        path: ['managerId'],
      });
    }
  }
});

// Zod schema for updating a user (password is optional, but if entered it must be min 8 chars)
const updateUserSchema = z.object({
  email: z.string().min(1, "L'email est obligatoire.").email("Format d'email invalide.").optional(),
  firstName: z.string().min(1, "Le prénom est obligatoire.").optional(),
  lastName: z.string().min(1, "Le nom est obligatoire.").optional(),
  phone: z.string().min(1, "Le téléphone est obligatoire.").optional(),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères.").optional().or(z.literal('')),
  role: z.enum(['ADMIN', 'MANAGER', 'COMMERCIAL']).optional(),
  equipe: z.string().optional().nullable(),
  managerId: z.any().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.role === 'MANAGER' || data.role === 'COMMERCIAL') {
    if (!data.equipe || data.equipe.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "L'équipe est obligatoire pour les managers et les commerciaux.",
        path: ['equipe'],
      });
    }
  }
  if (data.role === 'COMMERCIAL') {
    if (!data.managerId || data.managerId === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Le manager est obligatoire pour un commercial.',
        path: ['managerId'],
      });
    }
  }
});

/**
 * GET /api/users
 */
async function getUsers(req, res) {
  try {
    const { name, email, role, page, limit } = req.query;
    
    const result = await userService.getAllUsers({
      name,
      email,
      role,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('getUsers controller error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur lors de la récupération des utilisateurs.',
      code: 'SERVER_ERROR',
    });
  }
}

/**
 * GET /api/users/:id
 */
async function getUser(req, res) {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé.',
        code: 'NOT_FOUND',
      });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('getUser controller error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur lors de la récupération de l\'utilisateur.',
      code: 'SERVER_ERROR',
    });
  }
}

/**
 * POST /api/users
 */
async function create(req, res) {
  try {
    const validationResult = createUserSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const formattedErrors = {};
      validationResult.error.errors.forEach((err) => {
        const path = err.path.join('.');
        formattedErrors[path] = err.message;
      });

      return res.status(400).json({
        success: false,
        error: 'Erreur de validation des données.',
        errors: formattedErrors,
        code: 'VALIDATION_ERROR',
      });
    }

    const newUser = await userService.createUser(validationResult.data);
    
    return res.status(201).json({
      success: true,
      data: newUser,
    });
  } catch (error) {
    console.error('create controller error:', error);
    
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: error.code || 'BAD_REQUEST',
        errors: error.code === 'EMAIL_ALREADY_EXISTS' ? { email: 'Cet email est déjà utilisé.' } : undefined,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur lors de la création de l\'utilisateur.',
      code: 'SERVER_ERROR',
    });
  }
}

/**
 * PUT /api/users/:id
 */
async function update(req, res) {
  try {
    const { id } = req.params;
    const validationResult = updateUserSchema.safeParse(req.body);

    if (!validationResult.success) {
      const formattedErrors = {};
      validationResult.error.errors.forEach((err) => {
        const path = err.path.join('.');
        formattedErrors[path] = err.message;
      });

      return res.status(400).json({
        success: false,
        error: 'Erreur de validation des données.',
        errors: formattedErrors,
        code: 'VALIDATION_ERROR',
      });
    }

    const updatedUser = await userService.updateUser(id, validationResult.data);

    return res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error('update controller error:', error);

    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: error.message,
        code: 'NOT_FOUND',
      });
    }
    
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: error.code || 'BAD_REQUEST',
        errors: error.code === 'EMAIL_ALREADY_EXISTS' ? { email: 'Cet email est déjà utilisé.' } : undefined,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur lors de la mise à jour de l\'utilisateur.',
      code: 'SERVER_ERROR',
    });
  }
}

/**
 * DELETE /api/users/:id
 */
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);

    return res.json({
      success: true,
      data: { message: 'Utilisateur supprimé avec succès.' },
    });
  } catch (error) {
    console.error('deleteUser controller error:', error);

    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: error.message,
        code: 'NOT_FOUND',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur lors de la suppression de l\'utilisateur.',
      code: 'SERVER_ERROR',
    });
  }
}

/**
 * GET /api/users/managers
 */
async function getManagersList(req, res) {
  try {
    const managers = await userService.getManagers();
    return res.json({
      success: true,
      data: managers,
    });
  } catch (error) {
    console.error('getManagersList controller error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur lors de la récupération des managers.',
      code: 'SERVER_ERROR',
    });
  }
}

/**
 * GET /api/users/profile
 */
async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const user = await userService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Profil non trouvé.',
        code: 'NOT_FOUND',
      });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('getProfile controller error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur lors de la récupération du profil.',
      code: 'SERVER_ERROR',
    });
  }
}

/**
 * PUT /api/users/profile
 */
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    
    // Validate profile updates: only allow editing name, email, phone and password.
    const profileUpdateSchema = z.object({
      email: z.string().min(1, "L'email est obligatoire.").email("Format d'email invalide.").optional(),
      firstName: z.string().min(1, "Le prénom est obligatoire.").optional(),
      lastName: z.string().min(1, "Le nom est obligatoire.").optional(),
      phone: z.string().min(1, "Le téléphone est obligatoire.").optional(),
      password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères.").optional().or(z.literal('')),
    });

    const validationResult = profileUpdateSchema.safeParse(req.body);

    if (!validationResult.success) {
      const formattedErrors = {};
      validationResult.error.errors.forEach((err) => {
        formattedErrors[err.path.join('.')] = err.message;
      });

      return res.status(400).json({
        success: false,
        error: 'Erreur de validation des données.',
        errors: formattedErrors,
        code: 'VALIDATION_ERROR',
      });
    }

    // Call service to update user profile
    const updatedUser = await userService.updateUser(userId, validationResult.data);

    return res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error('updateProfile controller error:', error);

    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: error.message,
        code: 'NOT_FOUND',
      });
    }
    
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: error.code || 'BAD_REQUEST',
        errors: error.code === 'EMAIL_ALREADY_EXISTS' ? { email: 'Cet email est déjà utilisé.' } : undefined,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur lors de la mise à jour du profil.',
      code: 'SERVER_ERROR',
    });
  }
}

module.exports = {
  getUsers,
  getUser,
  create,
  update,
  deleteUser,
  getManagersList,
  getProfile,
  updateProfile,
};

