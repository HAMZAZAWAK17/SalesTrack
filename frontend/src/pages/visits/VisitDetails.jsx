import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Container, Typography, CircularProgress, Alert, Paper, Grid, Divider, Button } from '@mui/material';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MapIcon from '@mui/icons-material/Map';
import ShoppingBagIcon from '@mui/icons-material/ShoppingCart';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import LabelIcon from '@mui/icons-material/Label';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

export default function VisitDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useAuth();
  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadVisit() {
      try {
        setLoading(true);
        const res = await api.getVisitById(id);
        if (res.success) {
          setVisit(res.data);
        }
      } catch (err) {
        console.error('Error loading visit details:', err);
        setError(err.message || 'Erreur lors de la récupération des détails.');
      } finally {
        setLoading(false);
      }
    }
    loadVisit();
  }, [id]);

  if (loading) {
    return (
      <Box className="h-full w-full flex flex-col items-center justify-center py-20 gap-3">
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Chargement du rapport de visite...
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

  const { client, commercial, dateDebut, objet, commentaire, statutCommande, raisonNonCommande, problemesConstates, latitude, longitude, photos, commandes } = visit || {};

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header back */}
      <Box className="flex items-center gap-3">
        <button
          onClick={() => navigate('/visits')}
          className={`p-2.5 rounded-xl border transition-premium flex items-center justify-center cursor-pointer ${
            theme === 'dark' ? 'border-slate-800 hover:bg-slate-900 text-slate-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600 shadow-sm'
          }`}
        >
          <ArrowBackIcon fontSize="small" />
        </button>
        <div>
          <Typography variant="h5" component="h1" className="font-extrabold tracking-tight">
            Détails de la Visite
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Rapport de visite n°{id} chez {client?.companyName}.
          </Typography>
        </div>
      </Box>

      {/* Grid panels */}
      <Grid container spacing={3}>
        {/* Left Side: Core metadata card */}
        <Grid item xs={12} md={7} className="space-y-6">
          <Paper className={`p-6 rounded-2xl border space-y-5 shadow-xl ${
            theme === 'dark' ? 'glass-panel border-slate-800/80 bg-slate-950/20' : 'bg-white border-slate-200'
          }`}>
            {/* Object, Date, Commercial */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded ${
                  theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-650'
                }`}>
                  {objet}
                </span>

                <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded ${
                  statutCommande === 'COMMANDE'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                    : 'bg-red-500/15 text-red-400 border border-red-500/25'
                }`}>
                  {statutCommande === 'COMMANDE' ? 'Commande prise' : 'Pas de commande'}
                </span>
              </div>

              <Divider className="opacity-10" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-sans">
                {/* Date */}
                <div className="flex items-start gap-3">
                  <CalendarMonthIcon className="text-slate-400 w-5 h-5 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-550 block">Date & Heure</span>
                    <span className="font-bold text-slate-250">
                      {new Date(dateDebut).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                {/* Commercial */}
                <div className="flex items-start gap-3">
                  <PersonIcon className="text-slate-400 w-5 h-5 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-550 block">Rédigé par</span>
                    <span className="font-bold text-slate-250">
                      {commercial?.firstName} {commercial?.lastName}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Divider className="opacity-10" />

            {/* Comment Body */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-550 tracking-wider block">Compte-rendu de la visite</span>
              <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                {commentaire}
              </p>
            </div>

            {/* Conditional Non-Order details */}
            {statutCommande === 'NON_COMMANDE' && raisonNonCommande && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                theme === 'dark' ? 'border-red-900/30 bg-red-950/5 text-red-300' : 'border-red-100 bg-red-50/50 text-red-800'
              }`}>
                <LabelIcon className="w-5 h-5 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="font-black uppercase tracking-wider block text-[10px] text-red-400">Raison de non-commande</span>
                  <p className="font-bold mt-1 text-[13px]">{raisonNonCommande}</p>
                </div>
              </div>
            )}

            {/* Problems observed */}
            {problemesConstates && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                theme === 'dark' ? 'border-yellow-900/30 bg-yellow-950/5 text-yellow-350' : 'border-yellow-100 bg-yellow-50/50 text-yellow-800'
              }`}>
                <ReportProblemIcon className="w-5 h-5 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="font-black uppercase tracking-wider block text-[10px] text-yellow-400">Difficultés ou problèmes constatés</span>
                  <p className="font-bold mt-1 text-[13px]">Secteurs impactés : {problemesConstates.split(',').join(', ')}</p>
                </div>
              </div>
            )}
          </Paper>

          {/* Quick Command Placement Shortcut */}
          {statutCommande === 'COMMANDE' && (
            <Paper className={`p-5 rounded-2xl border shadow-xl flex items-center justify-between gap-4 ${
              theme === 'dark' ? 'glass-panel border-emerald-900/20 bg-emerald-950/5' : 'bg-emerald-50/20 border-emerald-100'
            }`}>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-200">Facturation de la visite</h4>
                <p className="text-xs text-slate-500">
                  {commandes && commandes.length > 0
                    ? `Une commande (#${commandes[0].id}) est déjà rattachée à ce rapport.`
                    : 'Aucun bon de commande n\'est encore saisi pour cette visite.'}
                </p>
              </div>

              {(!commandes || commandes.length === 0) && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ShoppingBagIcon />}
                  onClick={() => navigate(`/orders/create?clientId=${client?.id}&visiteId=${id}`)}
                  sx={{
                    borderRadius: 2.5,
                    textTransform: 'none',
                    fontWeight: 'extrabold',
                    minHeight: 40,
                    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)',
                  }}
                >
                  Saisir la Commande
                </Button>
              )}
            </Paper>
          )}
        </Grid>

        {/* Right Side: Client details & Geolocation/Photos */}
        <Grid item xs={12} md={5} className="space-y-6">
          {/* Client Card */}
          <Paper
            onClick={() => navigate(`/clients/${client?.id}`)}
            className={`p-5 rounded-2xl border space-y-4 shadow-xl cursor-pointer hover:border-indigo-500/50 transition-premium ${
              theme === 'dark' ? 'glass-panel border-slate-800/80 bg-slate-900/5' : 'bg-white border-slate-200'
            }`}
          >
            <div>
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Fiche Client Associée</span>
              <h3 className="text-base font-bold text-slate-100 mt-1 hover:text-indigo-300 transition-colors">
                {client?.companyName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{client?.code} &bull; {client?.city}</p>
            </div>
            
            <Divider className="opacity-10" />

            <div className="text-xs text-slate-400 space-y-1">
              <div><strong className="text-slate-350">Téléphone:</strong> {client?.phone}</div>
              <div><strong className="text-slate-350">Email:</strong> {client?.email}</div>
              <div className="truncate"><strong className="text-slate-350">Adresse:</strong> {client?.address}</div>
            </div>
          </Paper>

          {/* GPS Coordinates & Map Shortcut */}
          {(latitude || longitude) && (
            <Paper className={`p-5 rounded-2xl border space-y-4 shadow-xl ${
              theme === 'dark' ? 'glass-panel border-slate-800/80 bg-slate-900/5' : 'bg-white border-slate-200'
            }`}>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-550 tracking-wider">Géolocalisation du relevé</span>
                <div className="text-xs text-slate-300 font-bold mt-1.5 flex items-center gap-1.5">
                  <MapIcon className="text-indigo-400 w-4 h-4" />
                  Lat: {latitude?.toFixed(6)}, Lon: {longitude?.toFixed(6)}
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
                target="_blank"
                rel="noreferrer"
                className={`w-full min-h-[40px] border rounded-xl flex items-center justify-center text-xs font-bold transition-premium hover:-translate-y-0.5 ${
                  theme === 'dark'
                    ? 'border-slate-800 hover:bg-slate-900 text-slate-300'
                    : 'border-slate-200 hover:bg-slate-100 text-slate-700 shadow-sm'
                }`}
              >
                Ouvrir dans Google Maps &rarr;
              </a>
            </Paper>
          )}

          {/* Field Photos gallery */}
          {photos && photos.length > 0 && (
            <Paper className={`p-5 rounded-2xl border space-y-4 shadow-xl ${
              theme === 'dark' ? 'glass-panel border-slate-800/80 bg-slate-900/5' : 'bg-white border-slate-200'
            }`}>
              <span className="text-[10px] font-black uppercase text-slate-550 tracking-wider block">Photos Terrain ({photos.length})</span>
              
              <div className="space-y-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="group relative rounded-xl border border-slate-850 overflow-hidden bg-slate-950">
                    <img
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${photo.cheminFichier}`}
                      alt={photo.legende || 'Photo terrain'}
                      className="w-full h-auto object-cover max-h-48 group-hover:scale-103 transition-premium"
                    />
                    {photo.legende && (
                      <div className="p-2.5 bg-slate-950/90 text-xs font-bold text-slate-300 border-t border-slate-850">
                        {photo.legende}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Paper>
          )}
        </Grid>
      </Grid>
    </div>
  );
}
