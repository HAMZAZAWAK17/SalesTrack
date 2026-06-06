const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/db');

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Veuillez fournir un email et un mot de passe.',
        code: 'BAD_REQUEST'
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect.',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect.',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const secret = process.env.JWT_SECRET || 'super_secret_sales_track_token_key_123456!';
    
    // Generate JWT access token (15 mins)
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '15m' }
    );

    // Generate JWT refresh token (7 days)
    const refreshToken = jwt.sign(
      { userId: user.id },
      secret,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur lors de la connexion.',
      code: 'SERVER_ERROR'
    });
  }
}

async function refreshToken(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Refresh token requis.' });
    }

    const secret = process.env.JWT_SECRET || 'super_secret_sales_track_token_key_123456!';
    const decoded = jwt.verify(token, secret);

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Utilisateur non trouvé.' });
    }

    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { userId: user.id },
      secret,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    return res.status(403).json({ success: false, error: 'Token invalide ou expiré.' });
  }
}

module.exports = {
  login,
  refreshToken
};
