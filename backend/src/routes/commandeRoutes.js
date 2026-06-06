const express = require('express');
const commandeController = require('../controllers/commandeController');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// All order routes are protected by JWT authentication
router.use(authMiddleware);

router.get('/', commandeController.getCommandes);
router.get('/export', commandeController.exportCommandes);
router.get('/:id', commandeController.getCommande);
router.post('/', commandeController.create);
router.put('/:id', commandeController.update);
router.delete('/:id', commandeController.deleteCommande);

module.exports = router;
