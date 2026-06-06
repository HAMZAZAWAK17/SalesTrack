const jwt = require('jsonwebtoken');
const prisma = require('../utils/db');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token d\'authentification manquant ou invalide.',
        code: 'UNAUTHORIZED'
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'super_secret_sales_track_token_key_123456!';
    
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'Token invalide ou expiré.',
        code: 'TOKEN_INVALID'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur introuvable.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur lors de l\'authentification.',
      code: 'SERVER_ERROR'
    });
  }
}

module.exports = authMiddleware;
