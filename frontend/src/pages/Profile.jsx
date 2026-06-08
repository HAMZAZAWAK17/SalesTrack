import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';
import { Box, Typography, Paper, CircularProgress, Button, Divider } from '@mui/material'
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
        toast.error('Erreur lors de la récupération des informations du profil.');
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

  );
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
      toast.error('Veuillez corriger les erreurs de validation.');
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

        toast.success('Profil mis à jour avec succès !');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.message || 'Erreur lors de la mise à jour.');
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
      
    </div>
  );
}
