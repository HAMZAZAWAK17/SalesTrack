import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../../services/api';
import { LineChart } from '../../components/CustomCharts';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Container, Typography, CircularProgress, Alert, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

// Icons
import EqualizerIcon from '@mui/icons-material/Equalizer';
import PeopleIcon from '@mui/icons-material/People';
import StorefrontIcon from '@mui/icons-material/Storefront';
import MapIcon from '@mui/icons-material/Map';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { theme } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await api.getDashboardStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Error loading manager dashboard stats:', err);
        setError(err.message || 'Impossible de charger les statistiques de l\'équipe.');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <Box className="h-full w-full flex flex-col items-center justify-center py-20 gap-3">
        <CircularProgress size={50} />
        <Typography variant="body2" color="text.secondary">
          Chargement de l'espace manager...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container className="py-10">
        <Alert severity="error" variant="filled" sx={{ borderRadius: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  const { kpis, commercialsPerformance, salesTrend, recentTeamActivities } = stats || {};

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <Typography variant="h4" component="h1" className="font-extrabold tracking-tight">
          Supervision de l'Équipe
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mt-1">
          Suivi des performances des commerciaux et activités de votre équipe.
        </Typography>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI: Team Revenue */}
        <div className={`p-5 rounded-2xl border transition-premium hover:-translate-y-1 shadow-lg flex items-center justify-between ${
          theme === 'dark' ? 'glass-card border-slate-800/40 bg-slate-900/15' : 'bg-white border-slate-200 shadow-slate-100'
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Chiffre d'Affaires Équipe</span>
            <div className="text-xl font-black text-slate-100">
              {kpis?.teamRevenue.toLocaleString('fr-FR')} €
            </div>
            <span className="text-[10px] text-emerald-400 font-extrabold">Commandes validées</span>
          </div>
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <TrendingUpIcon />
          </div>
        </div>

        {/* KPI: Team Clients */}
        <div className={`p-5 rounded-2xl border transition-premium hover:-translate-y-1 shadow-lg flex items-center justify-between ${
          theme === 'dark' ? 'glass-card border-slate-800/40 bg-slate-900/15' : 'bg-white border-slate-200 shadow-slate-100'
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Clients Couverts</span>
            <div className="text-xl font-black text-slate-100">
              {kpis?.teamClientsCount}
            </div>
            <span className="text-[10px] text-indigo-400 hover:underline cursor-pointer" onClick={() => navigate('/clients')}>
              Consulter scope &rarr;
            </span>
          </div>
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
            <StorefrontIcon />
          </div>
        </div>

        {/* KPI: Team Visits */}
        <div className={`p-5 rounded-2xl border transition-premium hover:-translate-y-1 shadow-lg flex items-center justify-between ${
          theme === 'dark' ? 'glass-card border-slate-800/40 bg-slate-900/15' : 'bg-white border-slate-200 shadow-slate-100'
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Visites Effectuées</span>
            <div className="text-xl font-black text-slate-100">
              {kpis?.teamVisitsCount}
            </div>
            <span className="text-[10px] text-slate-500 font-bold hover:underline cursor-pointer" onClick={() => navigate('/visits')}>
              Rapports de visite
            </span>
          </div>
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
            <MapIcon />
          </div>
        </div>

        {/* KPI: Team Conversion Rate */}
        <div className={`p-5 rounded-2xl border transition-premium hover:-translate-y-1 shadow-lg flex items-center justify-between ${
          theme === 'dark' ? 'glass-card border-slate-800/40 bg-slate-900/15' : 'bg-white border-slate-200 shadow-slate-100'
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Taux de Conversion</span>
            <div className="text-xl font-black text-slate-100">
              {kpis?.teamConversionRate} %
            </div>
            <span className="text-[10px] text-slate-500 font-extrabold">Succès des visites</span>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <EqualizerIcon />
          </div>
        </div>

        {/* KPI: Team Size */}
        <div className={`p-5 rounded-2xl border transition-premium hover:-translate-y-1 shadow-lg flex items-center justify-between ${
          theme === 'dark' ? 'glass-card border-slate-800/40 bg-slate-900/15' : 'bg-white border-slate-200 shadow-slate-100'
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Commerciaux</span>
            <div className="text-xl font-black text-slate-100">
              {kpis?.teamSize}
            </div>
            <span className="text-[10px] text-slate-550 font-extrabold">Membres rattachés</span>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
            <PeopleIcon />
          </div>
        </div>
      </div>

      {/* Performance Grid comparing commercial agents */}
      <div className={`p-5 rounded-2xl border shadow-lg ${
        theme === 'dark' ? 'glass-panel border-slate-850 bg-slate-900/10' : 'bg-white border-slate-200 shadow-slate-100'
      }`}>
        <div className="mb-4">
          <span className="text-xs font-black uppercase tracking-wider text-purple-400">Force de vente</span>
          <h2 className="text-lg font-bold text-slate-100">Performance Individuelle des Commerciaux</h2>
          <p className="text-xs text-slate-500 mt-0.5">Comparaison directe de la productivité, des visites et du chiffre d'affaires généré.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${
                theme === 'dark' ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
              }`}>
                <th className="py-3 px-4">Nom du Commercial</th>
                <th className="py-3 px-4 text-center">Clients Affectés</th>
                <th className="py-3 px-4 text-center">Visites Loggées</th>
                <th className="py-3 px-4 text-center">Commandes Validées</th>
                <th className="py-3 px-4 text-center">Taux Conversion</th>
                <th className="py-3 px-4 text-right">Revenue Généré (HT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/15">
              {commercialsPerformance.map((comm) => (
                <tr
                  key={comm.id}
                  className={`transition-premium hover:bg-slate-900/30 ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0"></span>
                    {comm.name}
                  </td>
                  <td className="py-3.5 px-4 text-center font-extrabold">{comm.clientsCount}</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-cyan-400">{comm.visitsCount}</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-purple-400">{comm.ordersCount}</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-emerald-400">{comm.conversionRate} %</td>
                  <td className="py-3.5 px-4 text-right font-black text-slate-100">
                    {comm.revenue.toLocaleString('fr-FR')} €
                  </td>
                </tr>
              ))}
              {commercialsPerformance.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-slate-500 font-bold">
                    Aucun commercial rattaché à votre compte.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Sales history graph vs Team activities log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales trend */}
        <div className={`p-5 rounded-2xl border shadow-lg lg:col-span-2 flex flex-col justify-between ${
          theme === 'dark' ? 'glass-panel border-slate-850 bg-slate-900/10' : 'bg-white border-slate-200 shadow-slate-100'
        }`}>
          <div className="mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-400">Croissance</span>
            <h2 className="text-lg font-bold text-slate-100">Évolution Mensuelle Équipe (HT)</h2>
            <p className="text-xs text-slate-500 mt-0.5">Chiffre d'affaires consolidé de l'équipe sur les 6 derniers mois.</p>
          </div>

          <div className="h-64 flex items-center justify-center">
            <LineChart data={salesTrend} height={240} />
          </div>
        </div>

        {/* Team Activity log */}
        <div className={`p-5 rounded-2xl border shadow-lg ${
          theme === 'dark' ? 'glass-panel border-slate-850 bg-slate-900/10' : 'bg-white border-slate-200 shadow-slate-100'
        }`}>
          <div className="mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Activités</span>
            <h2 className="text-lg font-bold text-slate-100">Dernières Activités Équipe</h2>
            <p className="text-xs text-slate-500 mt-0.5">Flux en direct des visites et commandes effectuées par votre équipe.</p>
          </div>

          {/* Activities list */}
          <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
            {recentTeamActivities.map((act) => (
              <div
                key={act.id}
                className={`p-3 rounded-xl border flex gap-3 transition-premium items-start ${
                  theme === 'dark'
                    ? 'border-slate-850 bg-slate-950/45 hover:border-slate-800'
                    : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                  act.type === 'VISIT'
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {act.type === 'VISIT' ? 'V' : 'C'}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-200 truncate">{act.title}</span>
                    <span className="text-[9px] font-extrabold text-slate-500 shrink-0">
                      {new Date(act.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-450 mt-1 truncate">{act.description}</p>
                </div>
              </div>
            ))}
            {recentTeamActivities.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs font-bold">
                Aucune activité récente au sein de l'équipe.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
