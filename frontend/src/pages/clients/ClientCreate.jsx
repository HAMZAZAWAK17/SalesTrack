import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Box, Typography, IconButton, Snackbar, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../contexts/AuthContext';
import ClientForm from '../../components/clients/ClientForm';
import * as clientService from '../../services/clientService';
import * as userService from '../../services/userService';

export default function ClientCreate() {
  const navigate = useNavigate();
  const { theme } = useAuth();

  // State
  const [commercials, setCommercials] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Load commercials on mount to populate assignment select list
  useEffect(() => {
    async function loadCommercials() {
      try {
        const response = await userService.getUsers({ role: 'COMMERCIAL', limit: 100 });
        if (response.success) {
          setCommercials(response.data.users);
        }
      } catch (err) {
        console.error('Failed to load commercials list:', err);
        setToast({
          open: true,
          message: 'Impossible de charger la liste des commerciaux.',
          severity: 'error'
        });
      }
    }
    loadCommercials();
  }, []);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const response = await clientService.createClient(formData);
      if (response.success) {
        setToast({
          open: true,
          message: 'Fiche client créée avec succès ! Redirection...',
          severity: 'success'
        });
        
        setTimeout(() => {
          navigate('/clients');
        }, 1500);
      }
    } catch (err) {
      setToast({
        open: true,
        message: err.message || 'Erreur lors de la création du client.',
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
              Créer un nouveau client
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Remplissez les informations obligatoires pour enregistrer le client.
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
          <ClientForm
            onSubmit={handleSubmit}
            loading={submitting}
            commercials={commercials}
            isEdit={false}
          />
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
