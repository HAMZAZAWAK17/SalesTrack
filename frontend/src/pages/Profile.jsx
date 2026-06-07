import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';
import { Box, Typography, Paper, CircularProgress, Snackbar, Alert, Button, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import MailOutlineIcon from '@mui/icons-material/MailOutlined';
import PhoneIcon from '@mui/icons-material/Phone';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import BadgeIcon from '@mui/icons-material/Badge';
import GroupIcon from '@mui/icons-material/Group';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser, theme } = useAuth();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: '',
    equipe: '',
    manager: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    async function fetchLatestProfile() {
      try {
        setLoading(true);
        const res = await api.getProfile();
        if (res.success) {
          const u = res.data;
          setProfileData({
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            email: u.email || '',
            phone: u.phone || '',
            password: '',
            role: u.role || '',
            equipe: u.equipe || '',
            manager: u.manager || null,
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setToast({ open: true, message: 'Erreur lors de la récupération des informations du profil.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    }
    fetchLatestProfile();
  }, []);

  const handleChange = (field, val) => {
    setProfileData(prev => ({ ...prev, [field]: val }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleToastClose = () => {
    setToast({ ...toast, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const errors = {};
    if (!profileData.firstName.trim()) errors.firstName = 'Le prénom est obligatoire.';
    if (!profileData.lastName.trim()) errors.lastName = 'Le nom est obligatoire.';
    if (!profileData.email.trim()) {
      errors.email = "L'adresse e-mail est obligatoire.";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(profileData.email)) {
      errors.email = "Format d'adresse e-mail invalide.";
    }
    if (!profileData.phone.trim()) errors.phone = 'Le numéro de téléphone est obligatoire.';
    if (profileData.password && profileData.password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setToast({ open: true, message: 'Veuillez corriger les erreurs de validation.', severity: 'error' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
      };

      if (profileData.password.trim() !== '') {
        payload.password = profileData.password;
      }

      const res = await api.updateProfile(payload);
      if (res.success) {
        // Update context & local storage
        updateUser({
          ...user,
          firstName: res.data.firstName,
          lastName: res.data.lastName,
          email: res.data.email,
          phone: res.data.phone,
        });

        // Reset password field
        setProfileData(prev => ({ ...prev, password: '' }));

        setToast({ open: true, message: 'Profil mis à jour avec succès !', severity: 'success' });
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setToast({ open: true, message: err.message || 'Erreur lors de la mise à jour.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box className="h-full w-full flex flex-col items-center justify-center py-20 gap-3">
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Chargement de votre profil...
        </Typography>
      </Box>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      {/* Header back */}
      <Box className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className={`p-2.5 rounded-xl border transition-premium flex items-center justify-center cursor-pointer ${
            theme === 'dark' ? 'border-slate-800 hover:bg-slate-900 text-slate-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600 shadow-sm'
          }`}
        >
          <ArrowBackIcon fontSize="small" />
        </button>
        <div>
          <Typography variant="h5" component="h1" className="font-extrabold tracking-tight">
            Mon Profil
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Consulter ou modifier vos informations personnelles.
          </Typography>
        </div>
      </Box>

      <form onSubmit={handleSubmit}>
        <Paper className={`p-6 rounded-2xl border space-y-6 shadow-xl ${
          theme === 'dark' ? 'glass-panel border-slate-800/80 bg-slate-950/20' : 'bg-white border-slate-200'
        }`}>
          
          {/* Read Only Meta Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-slate-800/20 bg-slate-900/10">
            {/* Role */}
            <div className="flex items-start gap-2.5">
              <BadgeIcon className="text-slate-500 w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <span className="text-[9px] font-black uppercase text-slate-500 block leading-none mb-1">Rôle</span>
                <span className="text-xs font-black text-indigo-400 uppercase tracking-wide">{profileData.role}</span>
              </div>
            </div>

            {/* Team */}
            {profileData.equipe && (
              <div className="flex items-start gap-2.5 border-t sm:border-t-0 sm:border-l border-slate-800/20 pt-2.5 sm:pt-0 sm:pl-4">
                <GroupIcon className="text-slate-500 w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-500 block leading-none mb-1">Nom de l'équipe</span>
                  <span className="text-xs font-extrabold text-slate-200">{profileData.equipe}</span>
                </div>
              </div>
            )}

            {/* Manager */}
            {profileData.manager && (
              <div className="flex items-start gap-2.5 border-t sm:border-t-0 sm:border-l border-slate-800/20 pt-2.5 sm:pt-0 sm:pl-4">
                <SupervisorAccountIcon className="text-slate-500 w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-500 block leading-none mb-1">Manager rattaché</span>
                  <span className="text-xs font-extrabold text-slate-200">
                    {profileData.manager.firstName} {profileData.manager.lastName}
                  </span>
                </div>
              </div>
            )}
          </div>

          <Divider className="opacity-10" />

          {/* Editable Fields */}
          <div className="space-y-4">
            {/* Prénom & Nom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                  <PersonIcon className="w-3.5 h-3.5" />
                  Prénom
                </label>
                <input
                  type="text"
                  required
                  value={profileData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="Votre prénom"
                  className={`w-full px-4 py-2.5 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-premium text-sm ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-650'
                      : 'bg-slate-550 border-slate-200 text-slate-900 placeholder-slate-400 bg-white shadow-sm'
                  } ${validationErrors.firstName ? 'border-red-500' : ''}`}
                />
                {validationErrors.firstName && <p className="text-[10px] font-bold text-red-500">{validationErrors.firstName}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                  <PersonIcon className="w-3.5 h-3.5" />
                  Nom
                </label>
                <input
                  type="text"
                  required
                  value={profileData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Votre nom de famille"
                  className={`w-full px-4 py-2.5 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-premium text-sm ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-650'
                      : 'bg-slate-550 border-slate-200 text-slate-900 placeholder-slate-400 bg-white shadow-sm'
                  } ${validationErrors.lastName ? 'border-red-500' : ''}`}
                />
                {validationErrors.lastName && <p className="text-[10px] font-bold text-red-500">{validationErrors.lastName}</p>}
              </div>
            </div>

            {/* Email & Téléphone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                  <MailOutlineIcon className="w-3.5 h-3.5" />
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  required
                  value={profileData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Votre adresse e-mail"
                  className={`w-full px-4 py-2.5 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-premium text-sm ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-650'
                      : 'bg-slate-550 border-slate-200 text-slate-900 placeholder-slate-400 bg-white shadow-sm'
                  } ${validationErrors.email ? 'border-red-500' : ''}`}
                />
                {validationErrors.email && <p className="text-[10px] font-bold text-red-500">{validationErrors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                  <PhoneIcon className="w-3.5 h-3.5" />
                  Téléphone
                </label>
                <input
                  type="text"
                  required
                  value={profileData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Votre numéro de téléphone"
                  className={`w-full px-4 py-2.5 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-premium text-sm ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-650'
                      : 'bg-slate-550 border-slate-200 text-slate-900 placeholder-slate-400 bg-white shadow-sm'
                  } ${validationErrors.phone ? 'border-red-500' : ''}`}
                />
                {validationErrors.phone && <p className="text-[10px] font-bold text-red-500">{validationErrors.phone}</p>}
              </div>
            </div>

            {/* Nouveau Mot de passe */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                <LockOpenIcon className="w-3.5 h-3.5" />
                Nouveau mot de passe (laisser vide si inchangé)
              </label>
              <input
                type="password"
                value={profileData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Entrez un nouveau mot de passe de minimum 8 caractères"
                className={`w-full px-4 py-2.5 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-premium text-sm ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-650'
                    : 'bg-slate-550 border-slate-200 text-slate-900 placeholder-slate-400 bg-white shadow-sm'
                } ${validationErrors.password ? 'border-red-500' : ''}`}
              />
              {validationErrors.password && <p className="text-[10px] font-bold text-red-500">{validationErrors.password}</p>}
            </div>
          </div>

          {/* Form Actions */}
          <Box className="flex justify-end gap-3 pt-4 border-t border-slate-800/20">
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={{
                borderRadius: 9999,
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 'extrabold',
                px: 3
              }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={saving}
              variant="contained"
              startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
              sx={{
                borderRadius: 9999,
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 'extrabold',
                px: 4,
                boxShadow: '0 4px 14px rgba(223, 177, 91, 0.25)',
              }}
            >
              {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
            </Button>
          </Box>
        </Paper>
      </form>

      {/* Toast Notification */}
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
