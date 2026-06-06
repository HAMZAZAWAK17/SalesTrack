import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  TablePagination,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
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
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Data states
  const [clients, setClients] = useState([]);
  const [totalClients, setTotalClients] = useState(0);
  const [loading, setLoading] = useState(true);

  // Toast feedback state
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

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
      setToast({
        open: true,
        message: error.message || 'Erreur lors de la récupération des clients.',
        severity: 'error'
      });
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
        setToast({
          open: true,
          message: 'Client supprimé avec succès !',
          severity: 'success'
        });
        if (clients.length === 1 && page > 0) {
          setPage(page - 1);
        } else {
          loadClients();
        }
      }
    } catch (err) {
      setToast({
        open: true,
        message: err.message || 'Erreur lors de la suppression.',
        severity: 'error'
      });
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

      <Container maxWidth="lg" className="relative z-10 space-y-6" sx={{ px: { xs: 0, sm: 2 } }}>
        
        {/* Top Header Dashboard Bar */}
        <header className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 rounded-2xl border transition-premium shadow-xl gap-4 ${
          theme === 'dark' ? 'glass-panel border-slate-800/60' : 'bg-white/90 border-slate-200 shadow-slate-100'
        }`}>
          <div className="flex items-center space-x-3">
            <div
              className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/5 cursor-pointer"
              onClick={() => navigate('/users')}
              title="Aller à la Gestion des Utilisateurs"
            >
              <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-300 bg-clip-text text-transparent">
                SalesTrack
              </span>
              <span className={`text-[10px] block font-extrabold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                Clients
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 ml-auto sm:ml-0">
            <div className="text-right hidden xs:block mr-2">
              <div className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                {currentUser?.firstName} {currentUser?.lastName}
              </div>
              <div className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">
                {currentUser?.role}
              </div>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-premium cursor-pointer ${
                theme === 'dark'
                  ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-yellow-400'
                  : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-600 shadow-sm'
              }`}
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            {/* Logout Button */}
            <button
              onClick={logoutUser}
              className={`px-4 py-2.5 border hover:bg-red-500/10 text-xs font-bold rounded-xl transition-premium cursor-pointer flex items-center space-x-2 ${
                theme === 'dark'
                  ? 'border-slate-850 bg-slate-900/40 text-red-400'
                  : 'border-red-200 bg-white text-red-650 shadow-sm'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Se déconnecter</span>
            </button>
          </div>
        </header>

        {/* Dashboard Title & Actions */}
        <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-2">
          <div>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'extrabold' }}>
              Gestion des Clients
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Consultez, recherchez et gérez les comptes clients de votre secteur de vente.
            </Typography>
          </div>
          
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/clients/create')}
              sx={{
                minHeight: 48,
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 'extrabold',
                px: 3,
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(99, 102, 241, 0.35)'
                }
              }}
            >
              Créer un client
            </Button>
          )}
        </Box>

        {/* Filters */}
        <ClientFilters
          nameSearch={nameSearch}
          setNameSearch={setNameSearch}
          codeSearch={codeSearch}
          setCodeSearch={setCodeSearch}
          cityFilter={cityFilter}
          setCityFilter={setCityFilter}
          channelFilter={channelFilter}
          setChannelFilter={setChannelFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          commercialFilter={commercialFilter}
          setCommercialFilter={setCommercialFilter}
          cities={cities}
          commercials={commercials}
          onClear={handleClearFilters}
        />

        {/* Table & Pagination Section */}
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12, gap: 2 }}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary">Chargement des clients...</Typography>
          </Box>
        ) : (
          <Box className="space-y-4">
            <ClientTable
              clients={clients}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />

            {totalClients > 0 && (
              <TablePagination
                component="div"
                count={totalClients}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage="Lignes par page :"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`}
                sx={{
                  border: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                  borderRadius: 3,
                  bgcolor: theme === 'dark' ? 'rgba(30, 41, 59, 0.15)' : '#ffffff',
                }}
              />
            )}
          </Box>
        )}

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
