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
      setToast({ open: true, message: err.message || 'Erreur de chargement des visites.', severity: 'error' });
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
        setToast({ open: true, message: 'Visite supprimée avec succès.', severity: 'success' });
        if (visits.length === 1 && page > 0) {
          setPage(page - 1);
        } else {
          loadVisits();
        }
      }
    } catch (err) {
      console.error('Error deleting visit:', err);
      setToast({ open: true, message: err.message || 'Erreur lors de la suppression.', severity: 'error' });
    }
  };

  const handleToastClose = () => {
    setToast({ ...toast, open: false });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header section */}
      <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Typography variant="h4" component="h1" className="font-extrabold tracking-tight">
            Rapports de Visites
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mt-0.5">
            Registre et comptes-rendus des visites client effectuées par les commerciaux.
          </Typography>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadVisits}
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
            onClick={() => navigate('/visits/create')}
            sx={{
              minHeight: 48,
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 'extrabold',
              px: 3,
            }}
          >
            Nouvelle Visite
          </Button>
        </div>
      </Box>

      {/* Filter Section */}
      <Paper className={`p-5 rounded-2xl border space-y-4 shadow-lg ${
        theme === 'dark' ? 'glass-panel border-slate-800/80 bg-slate-900/5' : 'bg-white border-slate-200'
      }`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Order Taken Filter */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Prise de Commande</span>
            <TextField
              select
              fullWidth
              size="small"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
            >
              <MenuItem value="">Toutes les visites</MenuItem>
              <MenuItem value="COMMANDE">Commande Passée</MenuItem>
              <MenuItem value="NON_COMMANDE">Aucune Commande</MenuItem>
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
            Chargement des rapports de visite...
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
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-4">Client</th>
                  {isAdminOrManager && <th className="py-3.5 px-4">Commercial</th>}
                  <th className="py-3.5 px-4">Objet</th>
                  <th className="py-3.5 px-4 text-center">Prise Commande</th>
                  <th className="py-3.5 px-4">Commentaire</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </TableHead>
              <tbody className="divide-y divide-slate-800/15">
                {visits.map((visit) => (
                  <tr
                    key={visit.id}
                    className={`transition-premium hover:bg-slate-900/30 ${
                      theme === 'dark' ? 'text-slate-350' : 'text-slate-700'
                    }`}
                  >
                    <td className="py-4 px-5 font-bold text-xs shrink-0 text-slate-400">
                      {new Date(visit.dateDebut).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-4 px-4 font-black text-slate-200">
                      {visit.client?.companyName}
                    </td>
                    {isAdminOrManager && (
                      <td className="py-4 px-4 text-slate-300 font-bold">
                        {visit.commercial?.firstName} {visit.commercial?.lastName}
                      </td>
                    )}
                    <td className="py-4 px-4 font-bold text-xs">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                        theme === 'dark' ? 'bg-slate-800/50 text-slate-300' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {visit.objet}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                        visit.statutCommande === 'COMMANDE'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                          : 'bg-red-500/15 text-red-400 border border-red-500/25'
                      }`}>
                        {visit.statutCommande === 'COMMANDE' ? 'Oui' : 'Non'}
                      </span>
                    </td>
                    <td className="py-4 px-4 max-w-[240px] truncate text-slate-450 text-xs">
                      {visit.commentaire}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex justify-end gap-1.5">
                        {/* Details */}
                        <button
                          onClick={() => navigate(`/visits/${visit.id}`)}
                          className={`p-1.5 rounded-lg border transition-premium cursor-pointer hover:scale-105 ${
                            theme === 'dark' ? 'border-slate-800 hover:bg-slate-800 text-indigo-400' : 'border-slate-250 hover:bg-slate-100 text-indigo-650'
                          }`}
                          title="Voir les détails"
                        >
                          <VisibilityIcon fontSize="small" />
                        </button>
                        
                        {/* Delete (Admin/Manager only) */}
                        {isAdminOrManager && (
                          <button
                            onClick={() => handleDelete(visit.id)}
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
                {visits.length === 0 && (
                  <tr>
                    <td colSpan={isAdminOrManager ? 7 : 6} className="text-center py-12 text-slate-500 font-bold">
                      Aucun rapport de visite trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalVisits > 0 && (
            <TablePagination
              component="div"
              count={totalVisits}
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
