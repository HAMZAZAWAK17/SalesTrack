const { z } = require('zod');
const commandeService = require('../services/commandeService');

// Zod schemas for order creation
const createCommandeSchema = z.object({
  clientId: z.any().transform(val => Number(val)).refine(val => !isNaN(val) && val > 0, {
    message: "Le client est obligatoire."
  }),
  visiteId: z.any().transform(val => val ? Number(val) : null).optional().nullable(),
  type: z.enum(['COMMANDE', 'DEVIS'], {
    errorMap: () => ({ message: "Le type de document doit être COMMANDE ou DEVIS." })
  }),
  statut: z.enum(['BROUILLON', 'EN_ATTENTE', 'VALIDEE', 'TRAITEE', 'ANNULEE'], {
    errorMap: () => ({ message: "Le statut de document est invalide." })
  }),
  lignes: z.array(z.object({
    designation: z.string().min(1, "La désignation du produit est obligatoire."),
    reference: z.string().min(1, "La référence du produit est obligatoire."),
    conditionnement: z.string().min(1, "Le conditionnement est obligatoire."),
    quantite: z.any().transform(val => Number(val)).refine(val => !isNaN(val) && val > 0, {
      message: "La quantité doit être supérieure à 0."
    }),
    prixUnitaireHT: z.any().transform(val => Number(val)).refine(val => !isNaN(val) && val >= 0, {
      message: "Le prix unitaire HT doit être positif."
    }),
    remise: z.any().transform(val => val ? Number(val) : 0).refine(val => !isNaN(val) && val >= 0 && val <= 100, {
      message: "La remise doit être comprise entre 0 et 100%."
    }).optional().default(0),
  })).min(1, "Une commande doit contenir au moins un article.")
});

// Zod schemas for order updates (all fields optional)
const updateCommandeSchema = z.object({
  type: z.enum(['COMMANDE', 'DEVIS']).optional(),
  statut: z.enum(['BROUILLON', 'EN_ATTENTE', 'VALIDEE', 'TRAITEE', 'ANNULEE']).optional(),
  lignes: z.array(z.object({
    designation: z.string().min(1),
    reference: z.string().min(1),
    conditionnement: z.string().min(1),
    quantite: z.any().transform(val => Number(val)).refine(val => !isNaN(val) && val > 0),
    prixUnitaireHT: z.any().transform(val => Number(val)).refine(val => !isNaN(val) && val >= 0),
    remise: z.any().transform(val => val ? Number(val) : 0).refine(val => !isNaN(val) && val >= 0 && val <= 100).optional().default(0),
  })).optional()
});

/**
 * GET /api/commandes
 */
async function getCommandes(req, res) {
  try {
    const { clientId, commercialId, type, status, page, limit } = req.query;

    const result = await commandeService.getAllCommandes({
      clientId,
      commercialId,
      type,
      status,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    }, req.user);

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('getCommandes error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors du chargement des commandes.',
      code: 'SERVER_ERROR'
    });
  }
}

/**
 * GET /api/commandes/:id
 */
async function getCommande(req, res) {
  try {
    const { id } = req.params;
    const commande = await commandeService.getCommandeById(id, req.user);

    if (!commande) {
      return res.status(404).json({
        success: false,
        error: 'Commande non trouvée.',
        code: 'NOT_FOUND'
      });
    }

    return res.json({
      success: true,
      data: commande
    });
  } catch (error) {
    console.error('getCommande error:', error);
    if (error.statusCode === 403) {
      return res.status(403).json({
        success: false,
        error: error.message,
        code: 'FORBIDDEN'
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des détails de la commande.',
      code: 'SERVER_ERROR'
    });
  }
}

/**
 * POST /api/commandes
 */
async function create(req, res) {
  try {
    const validationResult = createCommandeSchema.safeParse(req.body);

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

    const newOrder = await commandeService.createCommande(validationResult.data, req.user);

    return res.status(201).json({
      success: true,
      data: newOrder
    });
  } catch (error) {
    console.error('create order error:', error);
    if (error.statusCode === 400 || error.statusCode === 403 || error.statusCode === 404) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.statusCode === 400 ? 'BAD_REQUEST' : error.statusCode === 403 ? 'FORBIDDEN' : 'NOT_FOUND'
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de la commande.',
      code: 'SERVER_ERROR'
    });
  }
}

/**
 * PUT /api/commandes/:id
 */
async function update(req, res) {
  try {
    const { id } = req.params;
    const validationResult = updateCommandeSchema.safeParse(req.body);

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

    const updatedOrder = await commandeService.updateCommande(id, validationResult.data, req.user);

    return res.json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    console.error('update order error:', error);
    if (error.statusCode === 400 || error.statusCode === 403 || error.statusCode === 404) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.statusCode === 400 ? 'BAD_REQUEST' : error.statusCode === 403 ? 'FORBIDDEN' : 'NOT_FOUND'
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour de la commande.',
      code: 'SERVER_ERROR'
    });
  }
}

/**
 * DELETE /api/commandes/:id
 */
async function deleteCommande(req, res) {
  try {
    const { id } = req.params;
    await commandeService.deleteCommande(id, req.user);

    return res.json({
      success: true,
      data: { message: 'Commande supprimée avec succès.' }
    });
  } catch (error) {
    console.error('deleteCommande error:', error);
    if (error.statusCode === 400 || error.statusCode === 403 || error.statusCode === 404) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.statusCode === 400 ? 'BAD_REQUEST' : error.statusCode === 403 ? 'FORBIDDEN' : 'NOT_FOUND'
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de la commande.',
      code: 'SERVER_ERROR'
    });
  }
}

module.exports = {
  getCommandes,
  getCommande,
  create,
  update,
  deleteCommande
};
