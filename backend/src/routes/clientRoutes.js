const express = require('express');
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

// All routes are protected by JWT authentication
router.use(authMiddleware);

// 1. GET /api/clients - Allowed for ADMIN, MANAGER, COMMERCIAL (filtered dynamically)
router.get('/', clientController.getClients);

// 2. GET /api/clients/cities - Helper endpoint for filter selectors
router.get('/cities', clientController.getCities);

// 3. GET /api/clients/:id - Fetch single client (access checks applied)
router.get('/:id', clientController.getClient);

// 4. POST /api/clients - Only ADMIN can create clients
router.post('/', roleMiddleware(['ADMIN']), clientController.create);

// 5. PUT /api/clients/:id - Allowed for ADMIN, MANAGER, COMMERCIAL (commercials/managers checked for ownership)
router.put('/:id', clientController.update);

// 6. DELETE /api/clients/:id - Only ADMIN can delete clients
router.delete('/:id', roleMiddleware(['ADMIN']), clientController.deleteClient);

module.exports = router;
