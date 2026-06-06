const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Protected dashboard routes
router.use(authMiddleware);

router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;
