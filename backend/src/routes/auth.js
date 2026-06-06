const express = require('express');
const { login, refreshToken } = require('../controllers/auth.controller');

const router = express.Router();

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/refresh
router.post('/refresh', refreshToken);

module.exports = router;
