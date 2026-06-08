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

function parseCSV(text) {
  const lines = [];
  let row = [""];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push('');
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      lines.push(row.map(val => val.trim()));
      row = [''];
    } else {
      row[row.length - 1] += char;
    }
  }
  if (row.length > 1 || row[0] !== '') {
    lines.push(row.map(val => val.trim()));
  }
  return lines;
}

async function exportClients(req, res) {
  try {
    const { name, code, city, distributionChannel, category, status, assignedTo } = req.query;

    const result = await clientService.getAllClients({
      name,
      code,
      city,
      distributionChannel,
      category,
      status,
      assignedTo,
      page: 1,
      limit: 100000
    }, req.user);

    const csvContent = convertClientsToCSV(result.clients);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="clients_export.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('exportClients controller error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur interne lors de l\'export des clients.',
      code: 'SERVER_ERROR'
    });
  }
}

function convertClientsToCSV(clients) {
  const headers = ['Code', 'Raison Sociale', 'Téléphone', 'Email', 'Adresse', 'Ville', 'Canal de Distribution', 'Catégorie', 'Statut', 'Commercial Nom', 'Commercial Email', 'Notes'];
  
  const getChannelLabel = (val) => {
    return val === 'ON_TRADE' ? 'On Trade' : (val === 'OFF_TRADE' ? 'Off Trade' : val);
  };
  
  const getCategoryLabel = (val) => {
    const map = {
      HOTEL: 'Hôtel',
      RESTAURANT: 'Restaurant',
      CAFE: 'Café',
      GROCERY: 'Épicerie',
      SUPERMARKET: 'Supermarché',
      TRADITIONAL: 'Traditionnel',
      OTHER: 'Autre'
    };
    return map[val] || val;
  };

  const getStatusLabel = (val) => {
    const map = {
      ACTIVE: 'Actif',
      INACTIVE: 'Inactif',
      PROSPECT: 'Prospect'
    };
    return map[val] || val;
  };

  const rows = clients.map(c => [
    c.code,
    c.companyName,
    c.phone,
    c.email,
    c.address,
    c.city,
    getChannelLabel(c.distributionChannel),
    getCategoryLabel(c.category),
    getStatusLabel(c.status),
    c.commercial ? `${c.commercial.firstName} ${c.commercial.lastName}` : '',
    c.commercial ? c.commercial.email : '',
    c.notes || ''
  ]);
  
  return [
    'sep=;',
    headers.join(';'),
    ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""').replace(/\n/g, ' ')}"`).join(';'))
  ].join('\n');
}

async function importClients(req, res) {
  const prisma = require('../utils/db');
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Aucun fichier CSV fourni.',
        code: 'BAD_REQUEST'
      });
    }

    const csvText = req.file.buffer.toString('utf-8');
    const parsedData = parseCSV(csvText);

    if (parsedData.length <= 1) {
      return res.status(400).json({
        success: false,
        error: 'Le fichier CSV est vide ou ne contient que des en-têtes.',
        code: 'BAD_REQUEST'
      });
    }

    const headers = parsedData[0];
    const rows = parsedData.slice(1);

    const headerMap = {
      code: ['code', 'code client', 'code_client'],
      companyName: ['companyname', 'company_name', 'raison sociale', 'raisonsociale', 'raison_sociale', 'nom'],
      phone: ['phone', 'telephone', 'téléphone', 'tel', 'tél'],
      email: ['email', 'e-mail', 'courriel'],
      address: ['address', 'adresse'],
      city: ['city', 'ville'],
      distributionChannel: ['distributionchannel', 'distribution_channel', 'canal', 'canal de distribution', 'canal_de_distribution'],
      category: ['category', 'categorie', 'catégorie'],
      status: ['status', 'statut'],
      assignedTo: ['assignedto', 'assigned_to', 'commercial', 'commercialid', 'commercial_id', 'commercialemail', 'commercial_email'],
      notes: ['notes', 'notes internes', 'notes_internes', 'commentaire', 'commentaires']
    };

    const columnIndices = {};
    headers.forEach((h, index) => {
      const normH = h.toLowerCase().trim();
      for (const [key, aliases] of Object.entries(headerMap)) {
        if (aliases.includes(normH)) {
          columnIndices[key] = index;
          break;
        }
      }
    });

    const requiredColumns = ['code', 'companyName', 'phone', 'email', 'address', 'city'];
    const missing = requiredColumns.filter(col => columnIndices[col] === undefined);
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `En-têtes manquants dans le CSV : ${missing.join(', ')}`,
        code: 'BAD_REQUEST'
      });
    }

    const errors = [];
    const clientsToInsert = [];
    const seenCodes = new Set();
    const userCache = {};

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.length === 1 && row[0] === '') continue;

      const rowNum = i + 2;
      const getValue = (key) => {
        const idx = columnIndices[key];
        return idx !== undefined && row[idx] !== undefined ? row[idx].trim() : '';
      };

      const codeVal = getValue('code');
      const companyNameVal = getValue('companyName');
      const phoneVal = getValue('phone');
      const emailVal = getValue('email');
      const addressVal = getValue('address');
      const cityVal = getValue('city');
      const channelVal = getValue('distributionChannel');
      const categoryVal = getValue('category');
      const statusVal = getValue('status');
      const assignedToVal = getValue('assignedTo');
      const notesVal = getValue('notes');

      const rowErrors = {};

      if (!codeVal) rowErrors.code = "Le code client est obligatoire.";
      if (!companyNameVal) rowErrors.companyName = "Le nom de l'entreprise est obligatoire.";
      if (!phoneVal) rowErrors.phone = "Le numéro de téléphone est obligatoire.";
      if (!emailVal) {
        rowErrors.email = "L'email est obligatoire.";
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(emailVal)) {
        rowErrors.email = "Format d'email invalide.";
      }
      if (!addressVal) rowErrors.address = "L'adresse est obligatoire.";
      if (!cityVal) rowErrors.city = "La ville est obligatoire.";

      let mappedChannel = 'ON_TRADE';
      if (channelVal) {
        const norm = channelVal.toUpperCase().replace(/\s/g, '_');
        if (norm === 'ON_TRADE' || norm === 'ON' || norm === 'CANAL_ON' || norm === 'ONTRADE') {
          mappedChannel = 'ON_TRADE';
        } else if (norm === 'OFF_TRADE' || norm === 'OFF' || norm === 'CANAL_OFF' || norm === 'OFFTRADE') {
          mappedChannel = 'OFF_TRADE';
        } else {
          rowErrors.distributionChannel = "Canal invalide (doit être ON_TRADE ou OFF_TRADE).";
        }
      }

      let mappedCategory = 'OTHER';
      if (categoryVal) {
        const norm = categoryVal.toUpperCase().replace(/\s/g, '_');
        const validCategories = {
          'HOTEL': 'HOTEL', 'HOTEL_REST_CAFE': 'HOTEL', 'CHR': 'HOTEL', 'HÔTEL': 'HOTEL',
          'RESTAURANT': 'RESTAURANT', 'REST': 'RESTAURANT',
          'CAFE': 'CAFE', 'CAFÉ': 'CAFE', 'BAR': 'CAFE',
          'GROCERY': 'GROCERY', 'ÉPICERIE': 'GROCERY', 'EPICERIE': 'GROCERY',
          'SUPERMARKET': 'SUPERMARKET', 'SUPERMARCHÉ': 'SUPERMARKET', 'GMS': 'SUPERMARKET',
          'TRADITIONAL': 'TRADITIONAL', 'TRADITIONNEL': 'TRADITIONAL',
          'OTHER': 'OTHER', 'AUTRE': 'OTHER'
        };
        if (validCategories[norm]) {
          mappedCategory = validCategories[norm];
        } else {
          rowErrors.category = "Catégorie invalide.";
        }
      }

      let mappedStatus = 'PROSPECT';
      if (statusVal) {
        const norm = statusVal.toUpperCase();
        if (norm === 'ACTIVE' || norm === 'ACTIF' || norm === 'ACTIVE') {
          mappedStatus = 'ACTIVE';
        } else if (norm === 'INACTIVE' || norm === 'INACTIF') {
          mappedStatus = 'INACTIVE';
        } else if (norm === 'PROSPECT') {
          mappedStatus = 'PROSPECT';
        } else {
          rowErrors.status = "Statut invalide (doit être ACTIVE, INACTIVE, PROSPECT).";
        }
      }

      if (codeVal) {
        if (seenCodes.has(codeVal)) {
          rowErrors.code = "Ce code client apparaît plusieurs fois dans le fichier.";
        } else {
          seenCodes.add(codeVal);
        }
      }

      let finalAssignedTo = null;
      if (!assignedToVal) {
        rowErrors.assignedTo = "L'affectation à un commercial est obligatoire.";
      } else {
        if (userCache[assignedToVal]) {
          finalAssignedTo = userCache[assignedToVal];
        } else {
          const parsedId = Number(assignedToVal);
          const isId = !isNaN(parsedId) && parsedId > 0;
          
          const foundUser = await prisma.user.findFirst({
            where: {
              OR: [
                { email: assignedToVal },
                { id: isId ? parsedId : -1 }
              ]
            }
          });

          if (!foundUser) {
            rowErrors.assignedTo = `Aucun utilisateur trouvé avec l'email ou l'ID '${assignedToVal}'.`;
          } else if (foundUser.role !== 'COMMERCIAL') {
            rowErrors.assignedTo = `L'utilisateur '${foundUser.firstName} ${foundUser.lastName}' n'a pas le rôle COMMERCIAL.`;
          } else {
            finalAssignedTo = foundUser.id;
            userCache[assignedToVal] = foundUser.id;
          }
        }
      }

      if (codeVal && !rowErrors.code) {
        const existingInDb = await prisma.client.findUnique({ where: { code: codeVal } });
        if (existingInDb) {
          rowErrors.code = "Ce code client est déjà utilisé dans la base de données.";
        }
      }

      if (Object.keys(rowErrors).length > 0) {
        errors.push({ row: rowNum, errors: rowErrors });
      } else {
        clientsToInsert.push({
          code: codeVal,
          companyName: companyNameVal,
          phone: phoneVal,
          email: emailVal,
          address: addressVal,
          city: cityVal,
          distributionChannel: mappedChannel,
          category: mappedCategory,
          status: mappedStatus,
          assignedTo: finalAssignedTo,
          notes: notesVal || null
        });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Erreurs de validation dans le fichier CSV.",
        errors: errors,
        code: 'VALIDATION_ERROR'
      });
    }

    const createdClients = await prisma.$transaction(
      clientsToInsert.map(client =>
        prisma.client.create({
          data: client
        })
      )
    );

    return res.status(201).json({
      success: true,
      data: {
        message: `${createdClients.length} clients importés avec succès.`,
        count: createdClients.length
      }
    });

  } catch (error) {
    console.error('importClients controller error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur interne lors de l\'import des clients.',
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
  exportClients,
  importClients
};
