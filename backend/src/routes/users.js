const express = require('express');
const { getManagers, createUser } = require('../controllers/users.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

// GET /api/users/managers - Anyone authenticated can view managers to assign them
router.get('/managers', authMiddleware, getManagers);

// POST /api/users - Only Admins and Managers can create new users
router.post('/', authMiddleware, roleMiddleware(['ADMIN', 'MANAGER']), createUser);

module.exports = router;
