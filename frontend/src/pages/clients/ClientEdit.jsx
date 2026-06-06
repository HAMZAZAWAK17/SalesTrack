import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Paper, Box, Typography, IconButton, Snackbar, Alert, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../contexts/AuthContext';
import ClientForm from '../../components/clients/ClientForm';
import * as api from '../../services/api';

export default function ClientEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { theme } = useAuth();

  // Component states
  const [clientData, setClientData] = useState(null);
  const [commercials, setCommercials] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Load client details and commercials on mount
  useEffect(() => {
    async function loadData() {
      try {
        const clientRes = await api.getClientById(id);
        const commsRes = await api.getUsers({ role: 'COMMERCIAL', limit: 100 });

        if (clientRes.success) {
          const client = clientRes.data;
          setClientData({
            code: client.code,
            companyName: client.companyName,
            phone: client.phone || '',
            email: client.email || '',
            address: client.address || '',
            city: client.city || '',
            distributionChannel: client.distributionChannel || 'ON_TRADE',
            category: client.category || 'OTHER',
            status: client.status || 'PROSPECT',
            assignedTo: client.assignedTo || '',
            notes: client.notes || ''
          });
        }
        
        if (commsRes.success) {
          setCommercials(commsRes.data.users);
        }
      } catch (err) {
        console.error('Failed to load edit client data:', err);
        setToast({
          open: true,
          message: err.message || 'Impossible de charger les détails du client.',
          severity: 'error'
        });
      } finally {
        setLoadingData(false);
      }
    }

    if (id) {
      loadData();
    }
  }, [id]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const response = await api.updateClient(id, formData);
      if (response.success) {
        setToast({
          open: true,
          message: 'Client mis à jour avec succès ! Redirection...',
          severity: 'success'
        });
        
        setTimeout(() => {
          navigate('/clients');
        }, 1500);
      }
    } catch (err) {
      setToast({
        open: true,
        message: err.message || 'Erreur lors de la mise à jour.',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToastClose = () => {
    setToast({ ...toast, open: false });
  };

  return (
    <div className={`min-h-screen w-full p-4 md:p-8 relative overflow-hidden transition-colors duration-300 font-sans ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100 grid-pattern' : 'bg-slate-50 text-slate-800 grid-pattern-light'
    }`}>
      {/* Background ambient glows */}
      <div className="absolute top-[-25%] left-[-15%] w-[70%] h-[70%] rounded-full radial-glow animate-pulse-slow pointer-events-none"></div>
      <div className="absolute bottom-[-25%] right-[-15%] w-[70%] h-[70%] rounded-full radial-glow-purple animate-pulse-slow pointer-events-none"></div>

      <Container maxWidth="md" className="relative z-10 space-y-6">
        
        {/* Header bar */}
        <Box className="flex items-center space-x-3 py-2">
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
            title="Retour à la liste"
          >
            <ArrowBackIcon />
          </IconButton>
          
          <div>
            <Typography variant="h5" sx={{ fontWeight: 'extrabold' }}>
              Modifier le client
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Modifiez les informations de la fiche client ci-dessous.
            </Typography>
          </div>
        </Box>

        {/* Form Container Card */}
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
          {loadingData ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, gap: 2 }}>
              <CircularProgress size={30} />
              <Typography variant="body2" color="text.secondary">Récupération de la fiche client...</Typography>
            </Box>
          ) : (
            <ClientForm
              defaultValues={clientData}
              onSubmit={handleSubmit}
              loading={submitting}
              commercials={commercials}
              isEdit={true}
            />
          )}
        </Paper>

      </Container>

      {/* Snackbar Alert */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleToastClose} severity={toast.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
