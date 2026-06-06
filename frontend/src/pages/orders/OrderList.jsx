import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Container, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, CircularProgress, Snackbar, Alert, Paper, TextField, MenuItem } from '@mui/material';

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
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

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
      setToast({ open: true, message: err.message || 'Erreur de chargement des commandes.', severity: 'error' });
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
        setToast({ open: true, message: 'Document supprimé avec succès.', severity: 'success' });
        if (orders.length === 1 && page > 0) {
          setPage(page - 1);
        } else {
          loadOrders();
        }
      }
    } catch (err) {
      console.error('Error deleting order:', err);
      setToast({ open: true, message: err.message || 'Erreur lors de la suppression.', severity: 'error' });
    }
  };

  const handleToastClose = () => {
    setToast({ ...toast, open: false });
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
      {/* Header section */}
      <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Typography variant="h4" component="h1" className="font-extrabold tracking-tight">
            Commandes & Devis
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mt-0.5">
            Registre des ventes et propositions commerciales de la plateforme SalesTrack.
          </Typography>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadOrders}
            className={`p-2.5 rounded-xl border transition-premium flex items-center justify-center cursor-pointer ${
              theme === 'dark' ? 'border-slate-800 hover:bg-slate-900 text-slate-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600 shadow-sm'
            }`}
            title="Rafraîchir"
          >
            <RefreshIcon fontSize="small" />
          </button>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/orders/create')}
            sx={{
              minHeight: 48,
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 'extrabold',
              px: 3,
            }}
          >
            Nouveau Devis/Commande
          </Button>
        </div>
      </Box>

      {/* Filter Section */}
      <Paper className={`p-5 rounded-2xl border space-y-4 shadow-lg ${
        theme === 'dark' ? 'glass-panel border-slate-800/80 bg-slate-900/5' : 'bg-white border-slate-200'
      }`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Client Filter */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Filtrer par Client</span>
            <TextField
              select
              fullWidth
              size="small"
              value={clientId}
              onChange={(e) => { setClientId(e.target.value); setPage(0); }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
            >
              <MenuItem value="">Tous les clients</MenuItem>
              {clients.map(c => (
                <MenuItem key={c.id} value={c.id}>
                  {c.companyName} ({c.city})
                </MenuItem>
              ))}
            </TextField>
          </div>

          {/* Commercial Filter (Admin/Manager only) */}
          {isAdminOrManager && (
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Filtrer par Commercial</span>
              <TextField
                select
                fullWidth
                size="small"
                value={commercialId}
                onChange={(e) => { setCommercialId(e.target.value); setPage(0); }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              >
                <MenuItem value="">Tous les commerciaux</MenuItem>
                {commercials.map(c => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.email})
                  </MenuItem>
                ))}
              </TextField>
            </div>
          )}

          {/* Document Type Filter */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Type de Document</span>
            <TextField
              select
              fullWidth
              size="small"
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(0); }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
            >
              <MenuItem value="">Tous les types</MenuItem>
              <MenuItem value="COMMANDE">Commande</MenuItem>
              <MenuItem value="DEVIS">Devis</MenuItem>
            </TextField>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Statut</span>
            <TextField
              select
              fullWidth
              size="small"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
            >
              <MenuItem value="">Tous les statuts</MenuItem>
              <MenuItem value="BROUILLON">Brouillon</MenuItem>
              <MenuItem value="EN_ATTENTE">En attente</MenuItem>
              <MenuItem value="VALIDEE">Validée</MenuItem>
              <MenuItem value="TRAITEE">Traitée</MenuItem>
              <MenuItem value="ANNULEE">Annulée</MenuItem>
            </TextField>
          </div>

          {/* Clear button */}
          <div className="flex items-end">
            <Button
              onClick={handleClearFilters}
              variant="outlined"
              fullWidth
              sx={{ borderRadius: 2.5, minHeight: 40, textTransform: 'none', fontWeight: 'bold' }}
            >
              Réinitialiser
            </Button>
          </div>
        </div>
      </Paper>

      {/* Grid List Table */}
      {loading ? (
        <Box className="flex flex-col items-center justify-center py-20 gap-3">
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Chargement des bons de commandes...
          </Typography>
        </Box>
      ) : (
        <div className="space-y-4">
          <TableContainer
            component={Paper}
            className={`border rounded-2xl shadow-xl overflow-hidden ${
              theme === 'dark' ? 'glass-panel border-slate-800/80 bg-slate-900/5' : 'bg-white border-slate-200'
            }`}
          >
            <Table className="min-w-full text-sm">
              <TableHead>
                <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${
                  theme === 'dark' ? 'border-slate-800 bg-slate-900/30 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}>
                  <th className="py-3.5 px-5">ID / Date</th>
                  <th className="py-3.5 px-4">Client</th>
                  {isAdminOrManager && <th className="py-3.5 px-4">Commercial</th>}
                  <th className="py-3.5 px-4 text-center">Type</th>
                  <th className="py-3.5 px-4 text-center">Statut</th>
                  <th className="py-3.5 px-4 text-right">Total HT</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </TableHead>
              <tbody className="divide-y divide-slate-800/15">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className={`transition-premium hover:bg-slate-900/30 ${
                      theme === 'dark' ? 'text-slate-350' : 'text-slate-700'
                    }`}
                  >
                    <td className="py-4 px-5 shrink-0">
                      <span className="font-extrabold text-slate-200 block text-xs">Doc #{order.id}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-black text-slate-200">
                      {order.client?.companyName}
                    </td>
                    {isAdminOrManager && (
                      <td className="py-4 px-4 text-slate-350 font-bold">
                        {order.commercial?.firstName} {order.commercial?.lastName}
                      </td>
                    )}
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        order.type === 'COMMANDE'
                          ? 'bg-indigo-500/10 text-indigo-400'
                          : 'bg-purple-500/10 text-purple-400'
                      }`}>
                        {order.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${getStatusStyle(order.statut)}`}>
                        {order.statut}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-black text-slate-100">
                      {order.totalHT.toLocaleString('fr-FR')} €
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex justify-end gap-1.5">
                        {/* Details */}
                        <button
                          onClick={() => navigate(`/orders/${order.id}`)}
                          className={`p-1.5 rounded-lg border transition-premium cursor-pointer hover:scale-105 ${
                            theme === 'dark' ? 'border-slate-800 hover:bg-slate-800 text-indigo-400' : 'border-slate-250 hover:bg-slate-100 text-indigo-650'
                          }`}
                          title="Voir les détails"
                        >
                          <VisibilityIcon fontSize="small" />
                        </button>
                        
                        {/* Delete (Admin/Manager, or Commercial if Draft/Brouillon) */}
                        {(isAdminOrManager || (currentUser.role === 'COMMERCIAL' && order.statut === 'BROUILLON')) && (
                          <button
                            onClick={() => handleDelete(order.id, order.statut)}
                            className={`p-1.5 rounded-lg border transition-premium cursor-pointer hover:scale-105 hover:bg-red-500/10 ${
                              theme === 'dark' ? 'border-slate-800 text-red-400' : 'border-slate-250 text-red-650'
                            }`}
                            title="Supprimer"
                          >
                            <DeleteIcon fontSize="small" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={isAdminOrManager ? 7 : 6} className="text-center py-12 text-slate-500 font-bold">
                      Aucune commande ou devis trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalOrders > 0 && (
            <TablePagination
              component="div"
              count={totalOrders}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 25, 50]}
              labelRowsPerPage="Lignes par page :"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
              sx={{
                border: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                borderRadius: 3,
                bgcolor: theme === 'dark' ? 'rgba(30, 41, 59, 0.15)' : '#ffffff',
              }}
            />
          )}
        </div>
      )}

      {/* Toast Feedback */}
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
