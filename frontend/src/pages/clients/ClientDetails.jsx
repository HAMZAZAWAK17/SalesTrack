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
      
    </div>
  );
}
