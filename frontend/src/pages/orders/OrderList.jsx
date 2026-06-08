import toast from 'react-hot-toast';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Container, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, CircularProgress, Paper, TextField, MenuItem } from '@mui/material'

// Icons
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function OrderList() {
  const navigate = useNavigate();
  const { user: currentUser, theme } = useAuth();
  const isAdminOrManager = currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';

  // Filters State
  const [clientId, setClientId] = useState('');
  const [commercialId, setCommercialId] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');

  // Dropdown lists
  const [clients, setClients] = useState([]);
  const [commercials, setCommercials] = useState([]);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Data
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  // Feedback
  
  // Load clients and commercials dropdown lists on mount
  useEffect(() => {
    async function loadDropdowns() {
      try {
        const clientsRes = await api.getClients({ limit: 100 });
        if (clientsRes.success) {
          setClients(clientsRes.data.clients);
        }

        if (isAdminOrManager) {
          const commsRes = await api.getUsers({ role: 'COMMERCIAL', limit: 100 });
          if (commsRes.success) {
            setCommercials(commsRes.data.users);
          }
        }
      } catch (err) {
        console.error('Error loading dropdown filter lists:', err);
      }
    }
    loadDropdowns();
  }, [isAdminOrManager]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getCommandes({
        clientId,
        commercialId,
        type,
        status,
        page: page + 1,
        limit: rowsPerPage
      });
      if (res.success) {
        setOrders(res.data.commandes);
        setTotalOrders(res.data.total);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      toast.error(err.message || 'Erreur de chargement des commandes.');
    } finally {
      setLoading(false);
    }
  }, [clientId, commercialId, type, status, page, rowsPerPage]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleClearFilters = () => {
    setClientId('');
    setCommercialId('');
    setType('');
    setStatus('');
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id, orderStatus) => {
    // Commercial can only delete drafts. Admin/Manager can delete any.
    if (currentUser.role === 'COMMERCIAL' && orderStatus !== 'BROUILLON') {
      alert('Vous ne pouvez supprimer que vos commandes au statut Brouillon.');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible.')) return;
    
    try {
      const res = await api.deleteCommande(id);
      if (res.success) {
        toast.success('Document supprimé avec succès.');
        if (orders.length === 1 && page > 0) {
          setPage(page - 1);
        } else {
          loadOrders();
        }
      }
    } catch (err) {
      console.error('Error deleting order:', err);
      toast.error(err.message || 'Erreur lors de la suppression.');
    }
  };

  );
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('salestrack_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/commandes/export?clientId=${clientId}&commercialId=${commercialId}&type=${type}&status=${status}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Erreur de téléchargement du fichier.");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `commandes_export_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Export CSV réussi !');
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'export CSV.");
    }
  };

  const getStatusStyle = (stat) => {
    switch (stat) {
      case 'VALIDEE':
        return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25';
      case 'TRAITEE':
        return 'bg-blue-500/15 text-blue-400 border border-blue-500/25';
      case 'EN_ATTENTE':
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/25';
      case 'BROUILLON':
        return 'bg-slate-500/15 text-slate-400 border border-slate-500/25';
      case 'ANNULEE':
        return 'bg-red-500/15 text-red-400 border border-red-500/25';
      default:
        return 'bg-slate-500/15 text-slate-400 border border-slate-500/25';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      
    </div>
  );
}
