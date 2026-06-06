const { z } = require('zod');
const visitService = require('../services/visitService');

// Zod schemas for input validation
const createVisitSchema = z.object({
  clientId: z.any().transform(val => Number(val)).refine(val => !isNaN(val) && val > 0, {
    message: "Le client est obligatoire."
  }),
  subject: z.enum([
    'ORDER', 'CUSTOMER_FOLLOW_UP', 'COLLECTION', 'BRAND_VISIBILITY',
    'PRODUCT_PLACEMENT', 'NEGOTIATION', 'DELIVERY', 'RELAUNCH', 'OTHER'
  ], {
    errorMap: () => ({ message: "Objet de visite invalide." })
  }),
  comment: z.string().optional().nullable(),
  status: z.enum(['ORDER_PLACED', 'NO_ORDER'], {
    errorMap: () => ({ message: "Le statut doit être ORDER_PLACED ou NO_ORDER." })
  }),
  noOrderReason: z.enum([
    'STOCK_NOT_SOLD', 'OVERSTOCK', 'LOW_ACTIVITY', 'SUPPLIER_CHANGE',
    'PRICE_TOO_HIGH', 'CUSTOMER_ABSENT', 'WAITING_FOR_APPROVAL', 'DELIVERY_ISSUE', 'OTHER'
  ]).optional().nullable(),
  latitude: z.any().transform(val => val ? Number(val) : null).optional().nullable(),
  longitude: z.any().transform(val => val ? Number(val) : null).optional().nullable()
});

const updateVisitSchema = z.object({
  clientId: z.any().transform(val => Number(val)).refine(val => !isNaN(val) && val > 0).optional(),
  subject: z.enum([
    'ORDER', 'CUSTOMER_FOLLOW_UP', 'COLLECTION', 'BRAND_VISIBILITY',
    'PRODUCT_PLACEMENT', 'NEGOTIATION', 'DELIVERY', 'RELAUNCH', 'OTHER'
  ]).optional(),
  comment: z.string().optional().nullable(),
  status: z.enum(['ORDER_PLACED', 'NO_ORDER']).optional(),
  noOrderReason: z.enum([
    'STOCK_NOT_SOLD', 'OVERSTOCK', 'LOW_ACTIVITY', 'SUPPLIER_CHANGE',
    'PRICE_TOO_HIGH', 'CUSTOMER_ABSENT', 'WAITING_FOR_APPROVAL', 'DELIVERY_ISSUE', 'OTHER'
  ]).optional().nullable(),
  latitude: z.any().transform(val => val ? Number(val) : null).optional().nullable(),
  longitude: z.any().transform(val => val ? Number(val) : null).optional().nullable()
});

/**
 * GET /api/visits
 */
async function getVisits(req, res) {
  try {
    const { clientId, userId, subject, status, date, page, limit } = req.query;

    const result = await visitService.getAllVisits({
      clientId,
      userId,
      subject,
      status,
      date,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    }, req.user);

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('getVisits controller error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur interne lors de la récupération des visites.',
      code: 'SERVER_ERROR'
    });
  }
}

/**
 * GET /api/visits/:id
 */
async function getVisit(req, res) {
  try {
    const { id } = req.params;
    const visit = await visitService.getVisitById(id, req.user);

    if (!visit) {
      return res.status(404).json({
        success: false,
        error: 'Visite non trouvée.',
        code: 'NOT_FOUND'
      });
    }

    return res.json({
      success: true,
      data: visit
    });
  } catch (error) {
    console.error('getVisit controller error:', error);
    if (error.statusCode === 403) {
      return res.status(403).json({
        success: false,
        error: error.message,
        code: 'FORBIDDEN'
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Erreur interne lors du chargement de la visite.',
      code: 'SERVER_ERROR'
    });
  }
}

/**
 * POST /api/visits
 */
async function create(req, res) {
  try {
    const validationResult = createVisitSchema.safeParse(req.body);

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

    const newVisit = await visitService.createVisit(validationResult.data, req.user);

    return res.status(201).json({
      success: true,
      data: newVisit
    });
  } catch (error) {
    console.error('create visit controller error:', error);

    if (error.statusCode === 400 || error.statusCode === 403 || error.statusCode === 404) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.statusCode === 400 ? 'BAD_REQUEST' : error.statusCode === 403 ? 'FORBIDDEN' : 'NOT_FOUND'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Erreur interne lors de la création de la visite.',
      code: 'SERVER_ERROR'
    });
  }
}

/**
 * PUT /api/visits/:id
 */
async function update(req, res) {
  try {
    const { id } = req.params;
    const validationResult = updateVisitSchema.safeParse(req.body);

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

    const updatedVisit = await visitService.updateVisit(id, validationResult.data, req.user);

    return res.json({
      success: true,
      data: updatedVisit
    });
  } catch (error) {
    console.error('update visit controller error:', error);

    if (error.statusCode === 400 || error.statusCode === 403 || error.statusCode === 404) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.statusCode === 400 ? 'BAD_REQUEST' : error.statusCode === 403 ? 'FORBIDDEN' : 'NOT_FOUND'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Erreur interne lors de la modification de la visite.',
      code: 'SERVER_ERROR'
    });
  }
}

/**
 * DELETE /api/visits/:id
 */
async function deleteVisit(req, res) {
  try {
    const { id } = req.params;
    await visitService.deleteVisit(id, req.user);

    return res.json({
      success: true,
      data: { message: 'Rapport de visite supprimé avec succès.' }
    });
  } catch (error) {
    console.error('deleteVisit controller error:', error);
    if (error.statusCode === 403 || error.statusCode === 404) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.statusCode === 403 ? 'FORBIDDEN' : 'NOT_FOUND'
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Erreur interne lors de la suppression de la visite.',
      code: 'SERVER_ERROR'
    });
  }
}

module.exports = {
  getVisits,
  getVisit,
  create,
  update,
  deleteVisit
};
