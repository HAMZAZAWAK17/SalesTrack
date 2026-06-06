const express = require('express');
const multer = require('multer');
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// All routes are protected by JWT authentication
router.use(authMiddleware);

// 1. GET /api/clients - Allowed for ADMIN, MANAGER, COMMERCIAL (filtered dynamically)
router.get('/', clientController.getClients);

// Helper for filter cities
router.get('/cities', clientController.getCities);

// Export clients as CSV (filtered)
router.get('/export', clientController.exportClients);

// Import clients via CSV (Admin only)
router.post('/import', roleMiddleware(['ADMIN']), upload.single('file'), clientController.importClients);

// 3. GET /api/clients/:id - Fetch single client (access checks applied)
router.get('/:id', clientController.getClient);

// 4. POST /api/clients - Only ADMIN can create clients
router.post('/', roleMiddleware(['ADMIN']), clientController.create);

// 5. PUT /api/clients/:id - Allowed for ADMIN, MANAGER, COMMERCIAL (commercials/managers checked for ownership)
router.put('/:id', clientController.update);

// 6. DELETE /api/clients/:id - Only ADMIN can delete clients
router.delete('/:id', roleMiddleware(['ADMIN']), clientController.deleteClient);

module.exports = router;
