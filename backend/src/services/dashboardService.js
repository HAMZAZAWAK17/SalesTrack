const prisma = require('../utils/db');

/**
 * Fetch role-based dashboard statistics.
 */
async function getStats(currentUser) {
  const role = currentUser.role;

  if (role === 'COMMERCIAL') {
    return getCommercialStats(currentUser.id);
  } else if (role === 'MANAGER') {
    return getManagerStats(currentUser.id);
  } else if (role === 'ADMIN') {
    return getAdminStats();
  } else {
    throw new Error('Rôle inconnu.');
  }
}

/**
 * Stats for Commercial role
 */
async function getCommercialStats(commercialId) {
  // 1. Core KPIs
  const clientsCount = await prisma.client.count({
    where: { assignedTo: commercialId }
  });

  const visitsCount = await prisma.visite.count({
    where: { commercialId }
  });

  // Calculate personal total revenue for validated orders
  const ordersAggregate = await prisma.commande.aggregate({
    where: {
      commercialId,
      type: 'COMMANDE',
      statut: 'VALIDEE'
    },
    _sum: {
      totalHT: true
    },
    _count: {
      id: true
    }
  });

  const revenue = ordersAggregate._sum.totalHT || 0;
  const validatedOrdersCount = ordersAggregate._count.id || 0;

  // Pipeline stats (draft or pending)
  const pipelineAggregate = await prisma.commande.aggregate({
    where: {
      commercialId,
      statut: { in: ['BROUILLON', 'EN_ATTENTE'] }
    },
    _sum: {
      totalHT: true
    },
    _count: {
      id: true
    }
  });
  
  const pipelineValue = pipelineAggregate._sum.totalHT || 0;
  const pipelineCount = pipelineAggregate._count.id || 0;

  // Conversion rate (visits with COMMANDE status vs total visits)
  const orderVisitsCount = await prisma.visite.count({
    where: {
      commercialId,
      statutCommande: 'COMMANDE'
    }
  });
  const conversionRate = visitsCount > 0 ? Math.round((orderVisitsCount / visitsCount) * 100) : 0;

  // Sales target metrics (static monthly target of €5,000 for demonstration)
  const monthlyTarget = 5000;
  const targetProgress = Math.min(Math.round((revenue / monthlyTarget) * 100), 100);

  // 2. Sales Trend (group last 6 months)
  // Since SQLite/MySQL dates differ, we retrieve order details and group them in JS
  const ordersHistory = await prisma.commande.findMany({
    where: {
      commercialId,
      type: 'COMMANDE',
      statut: 'VALIDEE'
    },
    select: {
      totalHT: true,
      createdAt: true
    },
    orderBy: { createdAt: 'asc' }
  });

  const salesTrend = groupSalesByMonth(ordersHistory);

  // 3. Client Status distribution
  const clientStatusCounts = await prisma.client.groupBy({
    by: ['status'],
    where: { assignedTo: commercialId },
    _count: { id: true }
  });

  // 4. Recent clients and visits
  const recentClients = await prisma.client.findMany({
    where: { assignedTo: commercialId },
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      code: true,
      companyName: true,
      city: true,
      status: true,
    }
  });

  const recentVisits = await prisma.visite.findMany({
    where: { commercialId },
    take: 5,
    orderBy: { dateDebut: 'desc' },
    include: {
      client: {
        select: { companyName: true }
      }
    }
  });

  return {
    kpis: {
      clientsCount,
      visitsCount,
      revenue,
      validatedOrdersCount,
      pipelineValue,
      pipelineCount,
      conversionRate,
      monthlyTarget,
      targetProgress
    },
    salesTrend,
    clientStatus: clientStatusCounts.map(c => ({ status: c.status, count: c._count.id })),
    recentClients,
    recentVisits,
  };
}

/**
 * Stats for Manager role
 */
async function getManagerStats(managerId) {
  // Find subordinations
  const teamMembers = await prisma.user.findMany({
    where: { managerId },
    select: { id: true, firstName: true, lastName: true, email: true }
  });

  const teamIds = teamMembers.map(m => m.id);

  if (teamIds.length === 0) {
    return {
      kpis: {
        teamRevenue: 0,
        teamClientsCount: 0,
        teamVisitsCount: 0,
        teamConversionRate: 0,
        teamSize: 0
      },
      commercialsPerformance: [],
      salesTrend: [],
      recentTeamActivities: []
    };
  }

  // Team KPIs
  const teamClientsCount = await prisma.client.count({
    where: { assignedTo: { in: teamIds } }
  });

  const teamVisitsCount = await prisma.visite.count({
    where: { commercialId: { in: teamIds } }
  });

  const teamOrdersAggregate = await prisma.commande.aggregate({
    where: {
      commercialId: { in: teamIds },
      type: 'COMMANDE',
      statut: 'VALIDEE'
    },
    _sum: { totalHT: true }
  });

  const teamRevenue = teamOrdersAggregate._sum.totalHT || 0;

  const teamOrderVisitsCount = await prisma.visite.count({
    where: {
      commercialId: { in: teamIds },
      statutCommande: 'COMMANDE'
    }
  });
  const teamConversionRate = teamVisitsCount > 0 ? Math.round((teamOrderVisitsCount / teamVisitsCount) * 100) : 0;

  // Subordinate specific performance grid (Alice vs Bob comparison)
  const commercialsPerformance = [];
  for (const member of teamMembers) {
    const commClients = await prisma.client.count({ where: { assignedTo: member.id } });
    const commVisits = await prisma.visite.count({ where: { commercialId: member.id } });
    const commOrders = await prisma.commande.aggregate({
      where: { commercialId: member.id, type: 'COMMANDE', statut: 'VALIDEE' },
      _sum: { totalHT: true },
      _count: { id: true }
    });

    const commOrderVisits = await prisma.visite.count({
      where: { commercialId: member.id, statutCommande: 'COMMANDE' }
    });

    commercialsPerformance.push({
      id: member.id,
      name: `${member.firstName} ${member.lastName}`,
      clientsCount: commClients,
      visitsCount: commVisits,
      ordersCount: commOrders._count.id || 0,
      revenue: commOrders._sum.totalHT || 0,
      conversionRate: commVisits > 0 ? Math.round((commOrderVisits / commVisits) * 100) : 0
    });
  }

  // Team Sales trend
  const teamOrdersHistory = await prisma.commande.findMany({
    where: {
      commercialId: { in: teamIds },
      type: 'COMMANDE',
      statut: 'VALIDEE'
    },
    select: {
      totalHT: true,
      createdAt: true
    },
    orderBy: { createdAt: 'asc' }
  });

  const salesTrend = groupSalesByMonth(teamOrdersHistory);

  // Recent team activities feed (mix of latest visits & orders)
  const recentVisits = await prisma.visite.findMany({
    where: { commercialId: { in: teamIds } },
    take: 5,
    orderBy: { dateDebut: 'desc' },
    include: {
      client: { select: { companyName: true } },
      commercial: { select: { firstName: true, lastName: true } }
    }
  });

  const recentOrders = await prisma.commande.findMany({
    where: { commercialId: { in: teamIds } },
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { companyName: true } },
      commercial: { select: { firstName: true, lastName: true } }
    }
  });

  const recentTeamActivities = [
    ...recentVisits.map(v => ({
      id: `visit-${v.id}`,
      type: 'VISIT',
      date: v.dateDebut,
      title: `Visite chez ${v.client.companyName}`,
      description: `Par ${v.commercial.firstName} ${v.commercial.lastName} (${v.objet}). Statut: ${v.statutCommande}`,
    })),
    ...recentOrders.map(o => ({
      id: `order-${o.id}`,
      type: 'ORDER',
      date: o.createdAt,
      title: `${o.type === 'COMMANDE' ? 'Commande' : 'Devis'} #${o.id} - ${o.totalHT} €`,
      description: `Pour ${o.client.companyName} par ${o.commercial.firstName} ${o.commercial.lastName}. Statut: ${o.statut}`,
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  return {
    kpis: {
      teamRevenue,
      teamClientsCount,
      teamVisitsCount,
      teamConversionRate,
      teamSize: teamMembers.length
    },
    commercialsPerformance,
    salesTrend,
    recentTeamActivities
  };
}

/**
 * Stats for Admin role
 */
async function getAdminStats() {
  // Core metrics
  const clientsCount = await prisma.client.count();
  const visitsCount = await prisma.visite.count();
  const usersCount = await prisma.user.count();

  const ordersAggregate = await prisma.commande.aggregate({
    where: {
      type: 'COMMANDE',
      statut: 'VALIDEE'
    },
    _sum: { totalHT: true },
    _count: { id: true }
  });

  const totalRevenue = ordersAggregate._sum.totalHT || 0;
  const validatedOrdersCount = ordersAggregate._count.id || 0;

  // Distribution of client categories
  const categoriesRaw = await prisma.client.groupBy({
    by: ['category'],
    _count: { id: true }
  });

  const clientCategories = categoriesRaw.map(c => ({
    category: c.category,
    count: c._count.id
  }));

  // Team revenue breakdown by commercial
  const commercials = await prisma.user.findMany({
    where: { role: 'COMMERCIAL' },
    select: { id: true, firstName: true, lastName: true, equipe: true }
  });

  const teamContributions = [];
  for (const comm of commercials) {
    const agg = await prisma.commande.aggregate({
      where: {
        commercialId: comm.id,
        type: 'COMMANDE',
        statut: 'VALIDEE'
      },
      _sum: { totalHT: true }
    });
    const revenue = agg._sum.totalHT || 0;
    if (revenue > 0) {
      teamContributions.push({
        commercial: `${comm.firstName} ${comm.lastName}`,
        team: comm.equipe || 'Aucune',
        revenue
      });
    }
  }

  // Global Sales trend
  const allOrdersHistory = await prisma.commande.findMany({
    where: {
      type: 'COMMANDE',
      statut: 'VALIDEE'
    },
    select: {
      totalHT: true,
      createdAt: true
    },
    orderBy: { createdAt: 'asc' }
  });

  const salesTrend = groupSalesByMonth(allOrdersHistory);

  // Global activity logs feed
  const recentVisits = await prisma.visite.findMany({
    take: 5,
    orderBy: { dateDebut: 'desc' },
    include: {
      client: { select: { companyName: true } },
      commercial: { select: { firstName: true, lastName: true } }
    }
  });

  const recentOrders = await prisma.commande.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { companyName: true } },
      commercial: { select: { firstName: true, lastName: true } }
    }
  });

  const activities = [
    ...recentVisits.map(v => ({
      id: `visit-${v.id}`,
      type: 'VISIT',
      date: v.dateDebut,
      title: `Visite loggée - ${v.client.companyName}`,
      description: `Commercial : ${v.commercial.firstName} ${v.commercial.lastName} | Type : ${v.objet}`,
    })),
    ...recentOrders.map(o => ({
      id: `order-${o.id}`,
      type: 'ORDER',
      date: o.createdAt,
      title: `Nouvelle Commande/Devis #${o.id} (${o.type})`,
      description: `Client : ${o.client.companyName} | Total : ${o.totalHT} € | Statut : ${o.statut}`,
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

  return {
    kpis: {
      totalRevenue,
      clientsCount,
      visitsCount,
      usersCount,
      validatedOrdersCount
    },
    clientCategories,
    teamContributions,
    salesTrend,
    activities
  };
}

/**
 * Group order histories by month (last 6 calendar months) in JS
 */
function groupSalesByMonth(orders) {
  const months = ['Janv', 'Févr', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
  
  // Set up an array of the last 6 months
  const result = [];
  const today = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    result.push({
      year: d.getFullYear(),
      monthIndex: d.getMonth(),
      label: `${months[d.getMonth()]} ${d.getFullYear()}`,
      sales: 0
    });
  }

  // Map each order into the months
  orders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    const orderYear = orderDate.getFullYear();
    const orderMonth = orderDate.getMonth();

    const targetMonth = result.find(r => r.year === orderYear && r.monthIndex === orderMonth);
    if (targetMonth) {
      targetMonth.sales += order.totalHT;
    }
  });

  // Clean elements and return formatting
  return result.map(r => ({
    label: r.label,
    sales: Math.round(r.sales * 100) / 100
  }));
}

module.exports = {
  getStats
};
