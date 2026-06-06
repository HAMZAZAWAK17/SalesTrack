import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../../services/api';
import { LineChart } from '../../components/CustomCharts';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Container, Typography, CircularProgress, Alert } from '@mui/material';

// Icons
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import OfflinePinIcon from '@mui/icons-material/OfflinePin';
export default function CommercialDashboard() {
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
        console.error('Error loading commercial stats:', err);
        setError(err.message || 'Impossible de charger vos statistiques personnelles.');
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
          Chargement de votre espace commercial...
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

  const { kpis, salesTrend, clientStatus, recentClients, recentVisits } = stats || {};

  // Custom circular ring dimensions for target tracking
  const radius = 40;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(kpis?.targetProgress || 0, 100) / 100) * circumference;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Welcome banner */}
      <div className={`p-6 rounded-3xl border transition-premium relative overflow-hidden shadow-lg ${
        theme === 'dark'
          ? 'glass-panel border-slate-800/80 bg-gradient-to-br from-indigo-950/20 via-slate-950 to-purple-950/20'
          : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-slate-200 shadow-slate-100'
      }`}>
        <div className="absolute top-[-20%] right-[-10%] w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl"></div>
        <div className="relative z-10 space-y-1">
          <Typography variant="body2" className="text-indigo-400 font-extrabold uppercase tracking-widest leading-none">
            Ravi de vous revoir
          </Typography>
          <Typography variant="h4" className="font-extrabold tracking-tight">
            Espace Commercial
          </Typography>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mt-1">
            Gérez vos clients, enregistrez vos visites sur le terrain, préparez des devis et suivez l'atteinte de vos objectifs mensuels.
          </p>
        </div>
      </div>

      {/* 3 Mobile Quick-Tap Buttons Grid (Rule: Min 48px height, min 14px text size, icon + label) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tap 1: Nouvelle Visite */}
        <button
          onClick={() => navigate('/visits/create')}
          className="min-h-[64px] w-full p-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-2xl flex items-center justify-between shadow-lg shadow-indigo-600/15 transition-premium transform active:scale-98 hover:-translate-y-0.5 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <AddCircleIcon className="text-white w-6 h-6 shrink-0" />
            <span className="text-[15px] font-black tracking-wide font-sans">Nouvelle Visite</span>
          </div>
          <span className="text-xs font-black bg-white/15 px-2.5 py-1 rounded-lg">1 Tap &rarr;</span>
        </button>

        {/* Tap 2: Mes Commandes */}
        <button
          onClick={() => navigate('/orders')}
          className={`min-h-[64px] w-full p-4 rounded-2xl flex items-center justify-between border transition-premium transform active:scale-98 hover:-translate-y-0.5 cursor-pointer ${
            theme === 'dark'
              ? 'glass-card border-slate-800 hover:bg-slate-900/60 text-slate-100'
              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3">
            <AssignmentIcon className="text-purple-400 w-6 h-6 shrink-0" />
            <span className="text-[15px] font-black tracking-wide font-sans">Mes Commandes & Devis</span>
          </div>
          <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
            theme === 'dark' ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-600'
          }`}>
            {kpis?.validatedOrdersCount + kpis?.pipelineCount} docs
          </span>
        </button>

        {/* Tap 3: Mes Clients */}
        <button
          onClick={() => navigate('/clients')}
          className={`min-h-[64px] w-full p-4 rounded-2xl flex items-center justify-between border transition-premium transform active:scale-98 hover:-translate-y-0.5 cursor-pointer ${
            theme === 'dark'
              ? 'glass-card border-slate-800 hover:bg-slate-900/60 text-slate-100'
              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3">
            <PeopleIcon className="text-cyan-400 w-6 h-6 shrink-0" />
            <span className="text-[15px] font-black tracking-wide font-sans">Mes Clients</span>
          </div>
          <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
            theme === 'dark' ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-600'
          }`}>
            {kpis?.clientsCount} comptes
          </span>
        </button>
      </div>

      {/* Analytics: Target circle ring and basic numbers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Target Progress ring */}
        <div className={`p-5 rounded-2xl border shadow-lg flex items-center justify-between gap-4 ${
          theme === 'dark' ? 'glass-panel border-slate-850 bg-slate-900/10' : 'bg-white border-slate-200 shadow-slate-100'
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-550 tracking-wider">Objectif Mensuel</span>
            <div className="text-xl font-black text-slate-100">
              {kpis?.revenue.toLocaleString('fr-FR')} €
            </div>
            <p className="text-[10px] text-slate-500 font-bold">
              Objectif: {kpis?.monthlyTarget.toLocaleString('fr-FR')} € (HT)
            </p>
          </div>
          
          {/* SVG Progress circle */}
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                stroke="rgba(99,102,241,0.06)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke="#6366f1"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute text-xs font-black text-slate-100">
              {kpis?.targetProgress}%
            </span>
          </div>
        </div>

        {/* Personal KPIs details */}
        <div className={`p-5 rounded-2xl border shadow-lg flex items-center justify-between ${
          theme === 'dark' ? 'glass-panel border-slate-850 bg-slate-900/10' : 'bg-white border-slate-200 shadow-slate-100'
        }`}>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-550 tracking-wider">Taux de Conversion</span>
            <div className="text-xl font-black text-slate-100">
              {kpis?.conversionRate} %
            </div>
            <span className="text-[10px] text-slate-500 font-bold">
              Sur {kpis?.visitsCount} visites loggées
            </span>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <OfflinePinIcon />
          </div>
        </div>

        {/* Pipeline Value detail */}
        <div className={`p-5 rounded-2xl border shadow-lg flex items-center justify-between ${
          theme === 'dark' ? 'glass-panel border-slate-850 bg-slate-900/10' : 'bg-white border-slate-200 shadow-slate-100'
        }`}>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-550 tracking-wider">Opportunités Pipeline</span>
            <div className="text-xl font-black text-slate-100">
              {kpis?.pipelineValue.toLocaleString('fr-FR')} €
            </div>
            <span className="text-[10px] text-slate-550 font-bold">
              {kpis?.pipelineCount} devis/brouillons en attente
            </span>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <CurrencyExchangeIcon />
          </div>
        </div>
      </div>

      {/* Personal sales trend charts */}
      <div className={`p-5 rounded-2xl border shadow-lg flex flex-col justify-between ${
        theme === 'dark' ? 'glass-panel border-slate-850 bg-slate-900/10' : 'bg-white border-slate-200 shadow-slate-100'
      }`}>
        <div className="mb-4">
          <span className="text-xs font-black uppercase tracking-wider text-indigo-400">Croissance</span>
          <h2 className="text-lg font-bold text-slate-100">Mes Ventes Personnelles (HT)</h2>
          <p className="text-xs text-slate-500 mt-0.5">Évolution de votre CA mensuel validé.</p>
        </div>

        <div className="h-60 flex items-center justify-center">
          <LineChart data={salesTrend} height={220} />
        </div>
      </div>

      {/* Portefeuille: recent clients and recent visits lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent clients */}
        <div className={`p-5 rounded-2xl border shadow-lg ${
          theme === 'dark' ? 'glass-panel border-slate-850 bg-slate-900/10' : 'bg-white border-slate-200 shadow-slate-100'
        }`}>
          <div className="mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-purple-400">Portefeuille</span>
            <h2 className="text-lg font-bold text-slate-100">Clients Récents</h2>
            <p className="text-xs text-slate-500 mt-0.5">Les derniers comptes affectés à votre portefeuille.</p>
          </div>

          <div className="space-y-2.5">
            {recentClients.map(client => (
              <div
                key={client.id}
                onClick={() => navigate(`/clients/${client.id}`)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-premium hover:-translate-x-0.5 ${
                  theme === 'dark'
                    ? 'border-slate-850 bg-slate-950/45 hover:border-slate-800'
                    : 'border-slate-100 bg-slate-50 hover:bg-slate-100 shadow-sm'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-200 truncate">{client.companyName}</div>
                  <div className="text-[10px] font-extrabold text-slate-550 mt-0.5">{client.code} &bull; {client.city}</div>
                </div>
                
                <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                  client.status === 'ACTIVE'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                    : client.status === 'PROSPECT'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                    : 'bg-slate-500/15 text-slate-400 border border-slate-500/25'
                }`}>
                  {client.status}
                </span>
              </div>
            ))}
            {recentClients.length === 0 && (
              <div className="text-center py-6 text-slate-500 text-xs font-bold">
                Aucun client affecté.
              </div>
            )}
          </div>
        </div>

        {/* Recent visits logged */}
        <div className={`p-5 rounded-2xl border shadow-lg ${
          theme === 'dark' ? 'glass-panel border-slate-850 bg-slate-900/10' : 'bg-white border-slate-200 shadow-slate-100'
        }`}>
          <div className="mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400">Terrain</span>
            <h2 className="text-lg font-bold text-slate-100">Visites Récentes</h2>
            <p className="text-xs text-slate-500 mt-0.5">Historique de vos dernières fiches de visite terrain.</p>
          </div>

          <div className="space-y-2.5">
            {recentVisits.map(visit => (
              <div
                key={visit.id}
                onClick={() => navigate(`/visits/${visit.id}`)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-premium hover:-translate-x-0.5 ${
                  theme === 'dark'
                    ? 'border-slate-850 bg-slate-950/45 hover:border-slate-800'
                    : 'border-slate-100 bg-slate-50 hover:bg-slate-100 shadow-sm'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-200 truncate">{visit.client?.companyName}</div>
                  <div className="text-[10px] font-extrabold text-slate-550 mt-0.5">
                    {visit.objet} &bull; {new Date(visit.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </div>
                </div>

                <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                  visit.statutCommande === 'COMMANDE'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                    : 'bg-red-500/15 text-red-400 border border-red-500/25'
                }`}>
                  {visit.statutCommande === 'COMMANDE' ? 'Vente' : 'Suivi'}
                </span>
              </div>
            ))}
            {recentVisits.length === 0 && (
              <div className="text-center py-6 text-slate-500 text-xs font-bold">
                Aucune visite effectuée.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
