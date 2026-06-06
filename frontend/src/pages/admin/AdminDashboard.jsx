import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../../services/api';
import { LineChart, DonutChart, HorizontalBarChart } from '../../components/CustomCharts';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Container, Typography, CircularProgress, Alert, Paper, Grid } from '@mui/material';

// Icons
import EuroIcon from '@mui/icons-material/Euro';
import PeopleIcon from '@mui/icons-material/People';
import StorefrontIcon from '@mui/icons-material/Storefront';
import MapIcon from '@mui/icons-material/Map';
import ShoppingBagIcon from '@mui/icons-material/ShoppingCart';
import LaunchIcon from '@mui/icons-material/Launch';

export default function AdminDashboard() {
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
        console.error('Error loading dashboard stats:', err);
        setError(err.message || 'Impossible de charger les données analytiques.');
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
          Chargement de la console d'administration...
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

  const { kpis, clientCategories, teamContributions, salesTrend, activities } = stats || {};

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <Typography variant="h4" component="h1" className="font-extrabold tracking-tight">
            Tableau de Bord Administrateur
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mt-1">
            Vue d'ensemble en temps réel et performances globales du système SalesTrack.
          </Typography>
        </div>
        
        {/* Quick Audit Action Button */}
        <button
          onClick={async () => {
            if (confirm('Lancer le nettoyage des photos de plus de 30 jours ?')) {
              try {
                const res = await api.cleanupPhotos();
                alert(`Nettoyage réussi. Fichiers supprimés : ${res.data.count}`);
              } catch (err) {
                alert(`Erreur: ${err.message}`);
              }
            }
          }}
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-premium cursor-pointer hover:bg-indigo-600/10 ${
            theme === 'dark' ? 'border-slate-800 text-indigo-400' : 'border-slate-200 text-indigo-600'
          }`}
        >
          Nettoyer les Photos (30j)
        </button>
      </Box>

      {/* Grid of KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI: Revenue */}
        <div className={`p-5 rounded-2xl border transition-premium hover:-translate-y-1 shadow-lg flex items-center justify-between ${
          theme === 'dark' ? 'glass-card border-slate-800/40 bg-slate-900/15' : 'bg-white border-slate-200 shadow-slate-100'
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Chiffre d'Affaires</span>
            <div className="text-xl font-black text-slate-100 dark:text-slate-105">
              {kpis?.totalRevenue.toLocaleString('fr-FR')} €
            </div>
            <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1">
              Commandes validées
            </span>
          </div>
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <EuroIcon />
          </div>
        </div>

        {/* KPI: Clients */}
        <div className={`p-5 rounded-2xl border transition-premium hover:-translate-y-1 shadow-lg flex items-center justify-between ${
          theme === 'dark' ? 'glass-card border-slate-800/40 bg-slate-900/15' : 'bg-white border-slate-200 shadow-slate-100'
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Portefeuille Clients</span>
            <div className="text-xl font-black text-slate-100">
              {kpis?.clientsCount}
            </div>
            <span className="text-[10px] text-indigo-450 font-bold hover:underline cursor-pointer" onClick={() => navigate('/clients')}>
              Voir la liste &rarr;
            </span>
          </div>
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
            <StorefrontIcon />
          </div>
        </div>

        {/* KPI: Visits */}
        <div className={`p-5 rounded-2xl border transition-premium hover:-translate-y-1 shadow-lg flex items-center justify-between ${
          theme === 'dark' ? 'glass-card border-slate-800/40 bg-slate-900/15' : 'bg-white border-slate-200 shadow-slate-100'
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Visites Loggées</span>
            <div className="text-xl font-black text-slate-100">
              {kpis?.visitsCount}
            </div>
            <span className="text-[10px] text-slate-500 font-extrabold">Total historique</span>
          </div>
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
            <MapIcon />
          </div>
        </div>

        {/* KPI: Orders Count */}
        <div className={`p-5 rounded-2xl border transition-premium hover:-translate-y-1 shadow-lg flex items-center justify-between ${
          theme === 'dark' ? 'glass-card border-slate-800/40 bg-slate-900/15' : 'bg-white border-slate-200 shadow-slate-100'
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Factures Validées</span>
            <div className="text-xl font-black text-slate-100">
              {kpis?.validatedOrdersCount}
            </div>
            <span className="text-[10px] text-slate-500 font-extrabold">Livraisons prêtes</span>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <ShoppingBagIcon />
          </div>
        </div>

        {/* KPI: Active Users */}
        <div className={`p-5 rounded-2xl border transition-premium hover:-translate-y-1 shadow-lg flex items-center justify-between ${
          theme === 'dark' ? 'glass-card border-slate-800/40 bg-slate-900/15' : 'bg-white border-slate-200 shadow-slate-100'
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Agents Actifs</span>
            <div className="text-xl font-black text-slate-100">
              {kpis?.usersCount}
            </div>
            <span className="text-[10px] text-indigo-450 font-bold hover:underline cursor-pointer" onClick={() => navigate('/users')}>
              Gérer l'équipe &rarr;
            </span>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
            <PeopleIcon />
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend chart card (span-2) */}
        <div className={`p-5 rounded-2xl border shadow-lg lg:col-span-2 flex flex-col justify-between ${
          theme === 'dark' ? 'glass-panel border-slate-850 bg-slate-900/10' : 'bg-white border-slate-200 shadow-slate-100'
        }`}>
          <div className="mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-400">Performances</span>
            <h2 className="text-lg font-bold text-slate-100 dark:text-slate-850">Historique des Ventes (HT)</h2>
            <p className="text-xs text-slate-500 mt-0.5">Évolution du chiffre d'affaires sur les 6 derniers mois calendaires.</p>
          </div>
          
          <div className="h-64 flex items-center justify-center">
            <LineChart data={salesTrend} height={240} />
          </div>
        </div>

        {/* Client categories donut card */}
        <div className={`p-5 rounded-2xl border shadow-lg flex flex-col justify-between ${
          theme === 'dark' ? 'glass-panel border-slate-850 bg-slate-900/10' : 'bg-white border-slate-200 shadow-slate-100'
        }`}>
          <div className="mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-purple-400">Portefeuille</span>
            <h2 className="text-lg font-bold text-slate-100">Typologie Clients</h2>
            <p className="text-xs text-slate-500 mt-0.5">Répartition du catalogue par catégorie d'établissement.</p>
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <DonutChart data={clientCategories} />
          </div>
        </div>
      </div>

      {/* Team performance vs Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commercial contributions bar chart */}
        <div className={`p-5 rounded-2xl border shadow-lg flex flex-col justify-between lg:col-span-1 ${
          theme === 'dark' ? 'glass-panel border-slate-850 bg-slate-900/10' : 'bg-white border-slate-200 shadow-slate-100'
        }`}>
          <div className="mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400">Classement</span>
            <h2 className="text-lg font-bold text-slate-100">Chiffre d'Affaires par Agent</h2>
            <p className="text-xs text-slate-500 mt-0.5">Classement des forces de vente par CA validé.</p>
          </div>
          
          <div className="flex-grow flex items-center justify-center">
            <HorizontalBarChart
              data={teamContributions.map(item => ({
                label: item.commercial,
                value: item.revenue,
                unit: '€'
              }))}
            />
          </div>
        </div>

        {/* System Activity feed */}
        <div className={`p-5 rounded-2xl border shadow-lg lg:col-span-2 ${
          theme === 'dark' ? 'glass-panel border-slate-850 bg-slate-900/10' : 'bg-white border-slate-200 shadow-slate-100'
        }`}>
          <div className="mb-4 flex justify-between items-center">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Système</span>
              <h2 className="text-lg font-bold text-slate-100">Journal d'Activité en Direct</h2>
              <p className="text-xs text-slate-500 mt-0.5">Flux combiné des dernières visites et ventes enregistrées.</p>
            </div>
            
            <span className="px-2.5 py-1 text-[10px] font-black uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-lg animate-pulse">
              Temps réel
            </span>
          </div>

          {/* Activities list */}
          <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
            {activities.map((act) => (
              <div
                key={act.id}
                className={`p-3.5 rounded-xl border flex gap-3 transition-premium items-start ${
                  theme === 'dark'
                    ? 'border-slate-850 bg-slate-950/45 hover:border-slate-800 hover:bg-slate-950/80'
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
                    <span className="text-xs font-black text-slate-200 truncate">{act.title}</span>
                    <span className="text-[9px] font-extrabold text-slate-550 shrink-0">
                      {new Date(act.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-450 mt-1 truncate">{act.description}</p>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-xs font-bold">
                Aucune activité enregistrée pour le moment.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
