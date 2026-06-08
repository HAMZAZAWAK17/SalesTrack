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

export default function VisitList() {
  const navigate = useNavigate();
  const { user: currentUser, theme } = useAuth();
  const isAdminOrManager = currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';

  // Filters State
  const [clientId, setClientId] = useState('');
  const [commercialId, setCommercialId] = useState('');
  const [status, setStatus] = useState('');

  // Dropdown lists
  const [clients, setClients] = useState([]);
  const [commercials, setCommercials] = useState([]);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Data
  const [visits, setVisits] = useState([]);
  const [totalVisits, setTotalVisits] = useState(0);
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

  const loadVisits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getVisits({
        clientId,
        commercialId,
        status,
        page: page + 1,
        limit: rowsPerPage
      });
      if (res.success) {
        setVisits(res.data.visits);
        setTotalVisits(res.data.total);
      }
    } catch (err) {
      console.error('Error loading visits:', err);
      toast.error(err.message || 'Erreur de chargement des visites.');
    } finally {
      setLoading(false);
    }
  }, [clientId, commercialId, status, page, rowsPerPage]);

  useEffect(() => {
    loadVisits();
  }, [loadVisits]);

  const handleClearFilters = () => {
    setClientId('');
    setCommercialId('');
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

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rapport de visite ? Cette action est irréversible.')) return;
    
    try {
      const res = await api.deleteVisit(id);
      if (res.success) {
        toast.success('Visite supprimée avec succès.');
        if (visits.length === 1 && page > 0) {
          setPage(page - 1);
        } else {
          loadVisits();
        }
      }
    } catch (err) {
      console.error('Error deleting visit:', err);
      toast.error(err.message || 'Erreur lors de la suppression.');
    }
  };

  );
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('salestrack_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/visites/export?clientId=${clientId}&commercialId=${commercialId}&status=${status}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Erreur de téléchargement du fichier.");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `visites_export_${Date.now()}.csv`;
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

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      
    </div>
  );
}
