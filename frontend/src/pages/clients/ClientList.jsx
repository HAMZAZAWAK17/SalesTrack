import toast from 'react-hot-toast';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button, TablePagination, CircularProgress } from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../contexts/AuthContext';
import ClientFilters from '../../components/clients/ClientFilters';
import ClientTable from '../../components/clients/ClientTable';
import * as api from '../../services/api';

export default function ClientList() {
  const navigate = useNavigate();
  const { user: currentUser, logoutUser, theme, toggleTheme } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  // Filters State
  const [nameSearch, setNameSearch] = useState('');
  const [codeSearch, setCodeSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [commercialFilter, setCommercialFilter] = useState('');

  // Dropdown list states
  const [cities, setCities] = useState([]);
  const [commercials, setCommercials] = useState([]);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Data states
  const [clients, setClients] = useState([]);
  const [totalClients, setTotalClients] = useState(0);
  const [loading, setLoading] = useState(true);

  // Toast feedback state
  
  // Load cities & commercials lists on mount
  useEffect(() => {
    async function loadFilterData() {
      try {
        const citiesRes = await api.getCities();
        if (citiesRes.success) {
          setCities(citiesRes.data);
        }

        // Only load commercials dropdown if admin or manager
        if (currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER') {
          const commsRes = await api.getUsers({ role: 'COMMERCIAL', limit: 100 });
          if (commsRes.success) {
            setCommercials(commsRes.data.users);
          }
        }
      } catch (err) {
        console.error('Error loading client filter data:', err);
      }
    }
    loadFilterData();
  }, [currentUser]);

  // Load clients table data (memoized)
  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getClients({
        name: nameSearch,
        code: codeSearch,
        city: cityFilter,
        distributionChannel: channelFilter,
        category: categoryFilter,
        status: statusFilter,
        assignedTo: commercialFilter,
        page: page + 1, // Convert 0-indexed MUI page to 1-indexed API page
        limit: rowsPerPage
      });
      if (response.success) {
        setClients(response.data.clients);
        setTotalClients(response.data.total);
      }
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la récupération des clients.');
    } finally {
      setLoading(false);
    }
  }, [nameSearch, codeSearch, cityFilter, channelFilter, categoryFilter, statusFilter, commercialFilter, page, rowsPerPage]);

  // Trigger load when filters or pagination change
  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Reset filters
  const handleClearFilters = () => {
    setNameSearch('');
    setCodeSearch('');
    setCityFilter('');
    setChannelFilter('');
    setCategoryFilter('');
    setStatusFilter('');
    setCommercialFilter('');
    setPage(0);
  };

  // Pagination Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Actions
  const handleView = (id) => {
    navigate(`/clients/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/clients/edit/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.deleteClient(id);
      if (response.success) {
        toast.success('Client supprimé avec succès !');
        if (clients.length === 1 && page > 0) {
          setPage(page - 1);
        } else {
          loadClients();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression.');
    }
  };

  );
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('salestrack_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/clients/export?name=${nameSearch}&code=${codeSearch}&city=${cityFilter}&distributionChannel=${channelFilter}&category=${categoryFilter}&status=${statusFilter}&assignedTo=${commercialFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Erreur de téléchargement du fichier.");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clients_export_${Date.now()}.csv`;
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

  const handleImportCSV = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const res = await api.importClients(formData);
      if (res.success) {
        toast.success(res.data.message || 'Clients importés avec succès.');
        loadClients();
      }
    } catch (err) {
      console.error(err);
      let detailMsg = err.message;
      if (err.errors && Array.isArray(err.errors)) {
        detailMsg = err.errors.map(e => `Ligne ${e.row}: ${Object.values(e.errors).join(', ')}`).join(' | ');
      }
      toast.error(`Erreur d'import : ${detailMsg.substring(0, 150)}...`);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div className={`min-h-screen w-full p-4 md:p-8 relative overflow-hidden transition-colors duration-300 font-sans ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100 grid-pattern' : 'bg-slate-50 text-slate-800 grid-pattern-light'
    }`}>
      
    </div>
  );
}
