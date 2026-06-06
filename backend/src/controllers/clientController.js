const { z } = require('zod');
const clientService = require('../services/clientService');

// Zod schema for client creation
const createClientSchema = z.object({
  code: z.string().min(1, "Le code client est obligatoire."),
  companyName: z.string().min(1, "Le nom de l'entreprise est obligatoire."),
  phone: z.string().min(1, "Le numéro de téléphone est obligatoire."),
  email: z.string().min(1, "L'email est obligatoire.").email("Format d'email invalide."),
  address: z.string().min(1, "L'adresse est obligatoire."),
  city: z.string().min(1, "La ville est obligatoire."),
  distributionChannel: z.enum(['ON_TRADE', 'OFF_TRADE'], {
    errorMap: () => ({ message: "Canal invalide. Doit être ON_TRADE ou OFF_TRADE." }),
  }),
  category: z.enum(['HOTEL', 'RESTAURANT', 'CAFE', 'GROCERY', 'SUPERMARKET', 'TRADITIONAL', 'OTHER'], {
    errorMap: () => ({ message: "Catégorie invalide." }),
  }),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PROSPECT'], {
    errorMap: () => ({ message: "Statut invalide. Doit être ACTIVE, INACTIVE ou PROSPECT." }),
  }),
  assignedTo: z.any().transform((val) => Number(val)).refine((val) => !isNaN(val) && val > 0, {
    message: "Le commercial affecté est obligatoire et doit être un ID valide.",
  }),
  notes: z.string().optional().nullable(),
});

// Zod schema for client updates (all fields optional)
const updateClientSchema = z.object({
  code: z.string().min(1, "Le code client est obligatoire.").optional(),
  companyName: z.string().min(1, "Le nom de l'entreprise est obligatoire.").optional(),
  phone: z.string().min(1, "Le numéro de téléphone est obligatoire.").optional(),
  email: z.string().min(1, "L'email est obligatoire.").email("Format d'email invalide.").optional(),
  address: z.string().min(1, "L'adresse est obligatoire.").optional(),
  city: z.string().min(1, "La ville est obligatoire.").optional(),
  distributionChannel: z.enum(['ON_TRADE', 'OFF_TRADE']).optional(),
  category: z.enum(['HOTEL', 'RESTAURANT', 'CAFE', 'GROCERY', 'SUPERMARKET', 'TRADITIONAL', 'OTHER']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PROSPECT']).optional(),
  assignedTo: z.any().transform((val) => Number(val)).refine((val) => !isNaN(val) && val > 0).optional(),
  notes: z.string().optional().nullable(),
});

/**
 * GET /api/clients
 */
async function getClients(req, res) {
  try {
    const { name, code, city, distributionChannel, category, status, assignedTo, page, limit } = req.query;

    const result = await clientService.getAllClients({
      name,
      code,
      city,
      distributionChannel,
      category,
      status,
      assignedTo,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    }, req.user);

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('getClients controller error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur interne lors de la récupération des clients.',
      code: 'SERVER_ERROR'
    });
  }
}

/**
 * GET /api/clients/:id
 */
async function getClient(req, res) {
  try {
    const { id } = req.params;
    const client = await clientService.getClientById(id, req.user);

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client non trouvé.',
        code: 'NOT_FOUND'
      });
    }

    return res.json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error('getClient controller error:', error);
    
    if (error.statusCode === 403) {
      return res.status(403).json({
        success: false,
        error: error.message,
        code: 'FORBIDDEN'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Erreur interne lors de la récupération du client.',
      code: 'SERVER_ERROR'
    });
  }
}

/**
 * POST /api/clients
 */
async function create(req, res) {
  try {
    const validationResult = createClientSchema.safeParse(req.body);

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
        code: 'VALIDATION_ERROR'
      });
    }

    const newClient = await clientService.createClient(validationResult.data);

    return res.status(201).json({
      success: true,
      data: newClient
    });
  } catch (error) {
    console.error('create client controller error:', error);

    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: error.code || 'BAD_REQUEST',
        errors: error.code === 'CODE_ALREADY_EXISTS' ? { code: 'Ce code client est déjà utilisé.' } : undefined
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Erreur interne lors de la création du client.',
      code: 'SERVER_ERROR'
    });
  }
}

/**
 * PUT /api/clients/:id
 */
async function update(req, res) {
  try {
    const { id } = req.params;
    const validationResult = updateClientSchema.safeParse(req.body);

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
        code: 'VALIDATION_ERROR'
      });
    }

    const updatedClient = await clientService.updateClient(id, validationResult.data, req.user);

    return res.json({
      success: true,
      data: updatedClient
    });
  } catch (error) {
    console.error('update client controller error:', error);

    if (error.statusCode === 403) {
      return res.status(403).json({
        success: false,
        error: error.message,
        code: 'FORBIDDEN'
      });
    }

    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: error.message,
        code: 'NOT_FOUND'
      });
    }

    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: error.code || 'BAD_REQUEST',
        errors: error.code === 'CODE_ALREADY_EXISTS' ? { code: 'Ce code client est déjà utilisé.' } : undefined
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Erreur interne lors de la modification du client.',
      code: 'SERVER_ERROR'
    });
  }
}

/**
 * DELETE /api/clients/:id
 */
async function deleteClient(req, res) {
  try {
    const { id } = req.params;
    await clientService.deleteClient(id);

    return res.json({
      success: true,
      data: { message: 'Client supprimé avec succès.' }
    });
  } catch (error) {
    console.error('deleteClient controller error:', error);

    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: error.message,
        code: 'NOT_FOUND'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Erreur interne lors de la suppression du client.',
      code: 'SERVER_ERROR'
    });
  }
}

/**
 * GET /api/clients/cities
 */
async function getCities(req, res) {
  try {
    const cities = await clientService.getUniqueCities(req.user);
    return res.json({
      success: true,
      data: cities
    });
  } catch (error) {
    console.error('getCities controller error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur interne lors de la récupération des villes.',
      code: 'SERVER_ERROR'
    });
  }
}

module.exports = {
  getClients,
  getClient,
  create,
  update,
  deleteClient,
  getCities,
};
