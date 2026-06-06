const dashboardService = require('../services/dashboardService');

/**
 * GET /api/dashboard/stats
 * Fetches dashboard KPI summaries and history based on authenticated user's role.
 */
async function getDashboardStats(req, res) {
  try {
    const stats = await dashboardService.getStats(req.user);
    
    return res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors du chargement des statistiques du tableau de bord.',
      code: 'SERVER_ERROR'
    });
  }
}

module.exports = {
  getDashboardStats
};
