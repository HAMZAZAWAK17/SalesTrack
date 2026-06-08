const { z } = require('zod');
const visitService = require('../services/visitService');

// Zod schemas for input validation
const createVisitSchema = z.object({
  clientId: z.any().transform(val => Number(val)).refine(val => !isNaN(val) && val > 0, {
    message: "Le client est obligatoire."
  }),
  objet: z.enum([
    'PRISE_COMMANDE', 'SUIVI_CLIENT', 'RECOUVREMENT', 'VISIBILITE_MARQUE',
    'IMPLANTATION_PRODUIT', 'NEGOCIATION', 'LIVRAISON', 'RELANCE', 'AUTRE'
  ], {
    errorMap: () => ({ message: "Objet de visite invalide." })
  }),
  commentaire: z.string().optional().nullable(),
  statutCommande: z.enum(['COMMANDE', 'NON_COMMANDE'], {
    errorMap: () => ({ message: "Le statut doit être COMMANDE ou NON_COMMANDE." })
  }),
  raisonNonCommande: z.enum([
    'STOCK_NON_ECOULE', 'TROP_STOCK', 'BAISSE_ACTIVITE', 'CHANGEMENT_FOURNISSEUR',
    'PRIX_ELEVE', 'CLIENT_ABSENT', 'ATTENTE_VALIDATION', 'PROBLEME_LIVRAISON', 'AUTRE'
  ]).optional().nullable(),
  problemesConstates: z.string().optional().nullable(),
  latitude: z.any().transform(val => val ? Number(val) : null).optional().nullable(),
  longitude: z.any().transform(val => val ? Number(val) : null).optional().nullable(),
  photos: z.array(z.object({
    cheminFichier: z.string(),
    legende: z.string().optional().nullable(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
  })).optional()
});

const updateVisitSchema = z.object({
  clientId: z.any().transform(val => Number(val)).refine(val => !isNaN(val) && val > 0).optional(),
  objet: z.enum([
    'PRISE_COMMANDE', 'SUIVI_CLIENT', 'RECOUVREMENT', 'VISIBILITE_MARQUE',
    'IMPLANTATION_PRODUIT', 'NEGOCIATION', 'LIVRAISON', 'RELANCE', 'AUTRE'
  ]).optional(),
  commentaire: z.string().optional().nullable(),
  statutCommande: z.enum(['COMMANDE', 'NON_COMMANDE']).optional(),
  raisonNonCommande: z.enum([
    'STOCK_NON_ECOULE', 'TROP_STOCK', 'BAISSE_ACTIVITE', 'CHANGEMENT_FOURNISSEUR',
    'PRIX_ELEVE', 'CLIENT_ABSENT', 'ATTENTE_VALIDATION', 'PROBLEME_LIVRAISON', 'AUTRE'
  ]).optional().nullable(),
  problemesConstates: z.string().optional().nullable(),
  latitude: z.any().transform(val => val ? Number(val) : null).optional().nullable(),
  longitude: z.any().transform(val => val ? Number(val) : null).optional().nullable(),
  photos: z.array(z.object({
    cheminFichier: z.string(),
    legende: z.string().optional().nullable(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
  })).optional()
});

/**
 * GET /api/visites
 */
async function getVisits(req, res) {
  try {
    const { clientId, commercialId, subject, status, date, page, limit } = req.query;

    const result = await visitService.getAllVisits({
      clientId,
      commercialId,
      subject,
      status,
      date,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 25,
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
 * GET /api/visites/:id
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
 * POST /api/visites
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
 * PUT /api/visites/:id
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
 * DELETE /api/visites/:id
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

/**
 * POST /api/visites/upload
 */
async function uploadPhoto(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Aucune photo fournie ou format invalide.',
        code: 'BAD_REQUEST'
      });
    }

    return res.json({
      success: true,
      data: {
        cheminFichier: `/uploads/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('uploadPhoto controller error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur interne lors du téléchargement de l\'image.',
      code: 'SERVER_ERROR'
    });
  }
}

/**
 * POST /api/visites/cleanup-photos
 */
async function cleanupPhotos(req, res) {
  try {
    const result = await visitService.cleanupOldPhotos();
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('cleanupPhotos controller error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur interne lors du nettoyage des photos.',
      code: 'SERVER_ERROR'
    });
  }
}

/**
 * GET /api/visites/export
 */
async function exportVisits(req, res) {
  try {
    const { clientId, commercialId, subject, status, date } = req.query;

    // Fetch up to 10,000 matches for the export
    const result = await visitService.getAllVisits({
      clientId,
      commercialId,
      subject,
      status,
      date,
      page: 1,
      limit: 10000,
    }, req.user);

    const csvContent = convertVisitsToCSV(result.visits);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="visites_export.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('exportVisits controller error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur interne lors de l\'export des visites.',
      code: 'SERVER_ERROR'
    });
  }
}

function convertVisitsToCSV(visits) {
  const headers = ['ID Visite', 'Date & Heure', 'Code Client', 'Nom Client', 'Commercial', 'Objet de la Visite', 'Statut Commande', 'Raison de Non-Commande', 'Commentaire / Compte-rendu', 'Latitude', 'Longitude'];
  
  const getObjetLabel = (val) => {
    const map = {
      PRISE_COMMANDE: 'Prise de commande',
      SUIVI_CLIENT: 'Suivi client',
      RECOUVREMENT: 'Recouvrement',
      VISIBILITE_MARQUE: 'Visibilité marque',
      IMPLANTATION_PRODUIT: 'Implantation produit',
      NEGOCIATION: 'Négociation',
      LIVRAISON: 'Livraison',
      RELANCE: 'Relance',
      AUTRE: 'Autre'
    };
    return map[val] || val;
  };

  const getRaisonLabel = (val) => {
    const map = {
      STOCK_NON_ECOULE: 'Stock non écoulé',
      TROP_STOCK: 'Trop de stock',
      BAISSE_ACTIVITE: 'Baisse d\'activité',
      CHANGEMENT_FOURNISSEUR: 'Changement de fournisseur',
      PRIX_ELEVE: 'Prix trop élevé',
      CLIENT_ABSENT: 'Client absent',
      ATTENTE_VALIDATION: 'Attente validation manager',
      PROBLEME_LIVRAISON: 'Problème lors de la livraison précédente',
      AUTRE: 'Autre'
    };
    return map[val] || val;
  };

  const formatDate = (dateVal) => {
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + 
           date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const rows = visits.map(v => [
    v.id,
    formatDate(v.dateDebut),
    v.client?.code || '',
    v.client?.companyName || '',
    `${v.commercial?.firstName || ''} ${v.commercial?.lastName || ''}`,
    getObjetLabel(v.objet),
    v.statutCommande === 'COMMANDE' ? 'Commande prise' : 'Pas de commande',
    getRaisonLabel(v.raisonNonCommande),
    (v.commentaire || '').replace(/"/g, '""').replace(/\n/g, ' '),
    v.latitude || '',
    v.longitude || ''
  ]);
  
  return [
    'sep=;',
    headers.join(';'),
    ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""').replace(/\n/g, ' ')}"`).join(';'))
  ].join('\n');
}

module.exports = {
  getVisits,
  getVisit,
  create,
  update,
  deleteVisit,
  uploadPhoto,
  cleanupPhotos,
  exportVisits
};
