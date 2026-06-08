import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Paper, Box, Typography, Button, Grid, Chip, Divider, CircularProgress, IconButton } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import BadgeIcon from '@mui/icons-material/Badge';
import ClassIcon from '@mui/icons-material/Class';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';

export default function ClientDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { theme } = useAuth();

  // States
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Load details on mount
  useEffect(() => {
    async function loadDetails() {
      try {
        const response = await api.getClientById(id);
        if (response.success) {
          setClient(response.data);
        }
      } catch (err) {
        console.error('Failed to load client details:', err);
        toast.error(err.message || 'Impossible de récupérer les détails du client.');
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadDetails();
    }
  }, [id]);

  // Status badges
  const getStatusChip = (status) => {
    const configs = {
      ACTIVE: { color: 'success', label: 'ACTIF' },
      INACTIVE: { color: 'error', label: 'INACTIF' },
      PROSPECT: { color: 'info', label: 'PROSPECT' }
    };
    const config = configs[status] || { color: 'default', label: status };
    return (
      <Chip
        label={config.label}
        color={config.color}
        sx={{ fontWeight: 'extrabold', px: 1, borderRadius: '8px' }}
      />
    );
  };

  // Translate category values to French labels
  const getCategoryLabel = (category) => {
    const map = {
      HOTEL: 'Hôtel',
      RESTAURANT: 'Restaurant',
      CAFE: 'Café',
      GROCERY: 'Épicerie',
      SUPERMARKET: 'Supermarché',
      TRADITIONAL: 'Traditionnel',
      OTHER: 'Autre'
    };
    return map[category] || category;
  };

  );
  };

  return (
    <div className={`min-h-screen w-full p-4 md:p-8 relative overflow-hidden transition-colors duration-300 font-sans ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100 grid-pattern' : 'bg-slate-50 text-slate-800 grid-pattern-light'
    }`}>
      {/* Background ambient glows */}
      <div className="absolute top-[-25%] left-[-15%] w-[70%] h-[70%] rounded-full radial-glow animate-pulse-slow pointer-events-none"></div>
      <div className="absolute bottom-[-25%] right-[-15%] w-[70%] h-[70%] rounded-full radial-glow-purple animate-pulse-slow pointer-events-none"></div>

      <Container maxWidth="md" className="relative z-10 space-y-6">
        
        {/* Top bar */}
        <Box className="flex justify-between items-center py-2">
          <Box className="flex items-center space-x-3.5">
            <IconButton
              onClick={() => navigate('/clients')}
              sx={{
                p: 1.5,
                borderRadius: 3,
                border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
                bgcolor: theme === 'dark' ? 'rgba(30, 41, 59, 0.45)' : '#ffffff',
                color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                '&:hover': {
                  bgcolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
                }
              }}
              title="Retour"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 'extrabold' }}>
              Fiche Client
            </Typography>
          </Box>
          
          {client && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/clients/edit/${client.id}`)}
              sx={{
                minHeight: 48,
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 'extrabold',
                px: 3
              }}
            >
              Modifier la fiche
            </Button>
          )}
        </Box>

        {/* Content Panel */}
        {loading ? (
          <Paper
            sx={{
              p: 6,
              borderRadius: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : 'none',
              bgcolor: theme === 'dark' ? '#111827' : '#ffffff',
              backgroundImage: 'none'
            }}
          >
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">Chargement de la fiche client...</Typography>
          </Paper>
        ) : client ? (
          <div className="space-y-6">
            
            {/* General Information Card */}
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 4,
                border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.05)',
                bgcolor: theme === 'dark' ? '#111827' : '#ffffff',
                backgroundImage: 'none'
              }}
            >
              {/* Header Title with Code & Initials avatar */}
              <Box className="flex flex-col sm:flex-row items-center gap-4.5 pb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-500/10">
                  {client.companyName[0].toUpperCase()}
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <Typography variant="h5" sx={{ fontWeight: 'black' }}>
                    {client.companyName}
                  </Typography>
                  <Box className="flex items-center justify-center sm:justify-start gap-2">
                    <Chip label={client.code} size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
                    {getStatusChip(client.status)}
                  </Box>
                </div>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Client attributes grid */}
              <Grid container spacing={3.5}>
                {/* Telephone */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PhoneIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">Téléphone</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{client.phone}</Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Email */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <EmailIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">Adresse Email</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{client.email}</Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Address */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <HomeIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">Adresse</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{client.address}</Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* City */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <HomeIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">Ville</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{client.city}</Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Distribution Channel */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AccountBalanceWalletIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">Canal de distribution</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {client.distributionChannel === 'ON_TRADE' ? 'On Trade (Place)' : 'Off Trade (Emporter)'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Category */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ClassIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">Catégorie</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {getCategoryLabel(client.category)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Commercial Affecte */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AssignmentIndIcon color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">Commercial affecté</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'indigo.main' }}>
                        {client.commercial ? `${client.commercial.firstName} ${client.commercial.lastName} (${client.commercial.email})` : 'Aucun'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {client.notes && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                      Notes Internes / Commentaires
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                        border: theme === 'dark' ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)',
                        fontStyle: 'italic',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {client.notes}
                    </Typography>
                  </Box>
                </>
              )}
            </Paper>

            {/* History Aggregates Card */}
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 4,
                border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.05)',
                bgcolor: theme === 'dark' ? '#111827' : '#ffffff',
                backgroundImage: 'none'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Historique d'activité
              </Typography>

              <Grid container spacing={3}>
                {/* Visits Count */}
                <Grid item xs={12} sm={6}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2.5,
                      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: 'info.light',
                        color: 'info.main',
                        borderRadius: '10px',
                        display: 'flex'
                      }}
                    >
                      <EventAvailableIcon />
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 'black' }}>
                        {client._count?.visites || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Nombre de visites</Typography>
                    </Box>
                  </Paper>
                </Grid>

                {/* Orders Count */}
                <Grid item xs={12} sm={6}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2.5,
                      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: 'success.light',
                        color: 'success.main',
                        borderRadius: '10px',
                        display: 'flex'
                      }}
                    >
                      <ShoppingCartIcon />
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 'black' }}>
                        {client._count?.commandes || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Nombre de commandes</Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* Placeholder Section for Future Details */}
              <Box
                sx={{
                  mt: 4,
                  p: 3,
                  borderRadius: 3,
                  border: '1px dashed',
                  borderColor: theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
                  textAlign: 'center',
                  bgcolor: theme === 'dark' ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.005)'
                }}
              >
                <CalendarMonthIcon sx={{ color: 'text.secondary', fontSize: 32, mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Historique détaillé (Visites & Commandes)
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  Les détails complets des rapports de visites et des lignes de commandes seront affichés ici dans la prochaine version.
                </Typography>
              </Box>
            </Paper>

          </div>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            Aucun client trouvé pour cet identifiant.
          </Paper>
        )}

      </Container>

      
    </div>
  );
}
