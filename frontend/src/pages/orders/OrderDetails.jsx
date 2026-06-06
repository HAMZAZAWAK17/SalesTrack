import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Container, Typography, CircularProgress, Alert, Paper, Grid, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, MenuItem, TextField } from '@mui/material';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, theme } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status transition state
  const [statusVal, setStatusVal] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  async function loadOrder() {
    try {
      setLoading(true);
      const res = await api.getCommandeById(id);
      if (res.success) {
        setOrder(res.data);
        setStatusVal(res.data.statut);
      }
    } catch (err) {
      console.error('Error loading order details:', err);
      setError(err.message || 'Erreur lors du chargement de la commande.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleStatusChange = async (e) => {
    const nextStatus = e.target.value;
    setStatusVal(nextStatus);

    try {
      setStatusUpdating(true);
      const res = await api.updateCommande(id, { statut: nextStatus });
      if (res.success) {
        setToast({ open: true, message: 'Statut mis à jour avec succès.', severity: 'success' });
        loadOrder();
      }
    } catch (err) {
      console.error('Error changing order status:', err);
      alert(err.message || 'Impossible de mettre à jour le statut.');
      setStatusVal(order.statut); // Revert
    } finally {
      setStatusUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Box className="h-full w-full flex flex-col items-center justify-center py-20 gap-3">
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Chargement de la commande...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container className="py-10">
        <Alert severity="error" variant="filled" sx={{ borderRadius: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  const { client, commercial, createdAt, type, statut, totalHT, lignes, visite } = order || {};

  // Status styling
  const getStatusLabel = (stat) => {
    switch (stat) {
      case 'VALIDEE': return 'Validée';
      case 'TRAITEE': return 'Traitée';
      case 'EN_ATTENTE': return 'En attente';
      case 'BROUILLON': return 'Brouillon';
      case 'ANNULEE': return 'Annulée';
      default: return stat;
    }
  };

  // Determine allowed statuses for the status changer dropdown based on roles
  const getAllowedStatuses = () => {
    if (currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER') {
      return ['BROUILLON', 'EN_ATTENTE', 'VALIDEE', 'TRAITEE', 'ANNULEE'];
    }
    // Commercial can update draft (BROUILLON) to pending validation (EN_ATTENTE) or cancel (ANNULEE)
    if (currentUser?.role === 'COMMERCIAL') {
      if (statut === 'BROUILLON') {
        return ['BROUILLON', 'EN_ATTENTE', 'ANNULEE'];
      }
    }
    return [statut]; // Restricted
  };

  const allowedStatuses = getAllowedStatuses();
  const canChangeStatus = allowedStatuses.length > 1;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 print:p-0 print:max-w-full print:bg-white print:text-black">
      {/* Header back */}
      <Box className="flex items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/orders')}
            className={`p-2.5 rounded-xl border transition-premium flex items-center justify-center cursor-pointer ${
              theme === 'dark' ? 'border-slate-800 hover:bg-slate-900 text-slate-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600 shadow-sm'
            }`}
          >
            <ArrowBackIcon fontSize="small" />
          </button>
          <div>
            <Typography variant="h5" component="h1" className="font-extrabold tracking-tight">
              Détails du Document
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {type === 'COMMANDE' ? 'Bon de commande' : 'Devis commercial'} n°{id}
            </Typography>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-premium cursor-pointer flex items-center gap-2 hover:bg-indigo-600/10 ${
            theme === 'dark' ? 'border-slate-800 text-slate-300' : 'border-slate-250 text-slate-700 shadow-sm'
          }`}
        >
          <PrintIcon fontSize="small" />
          <span>Imprimer</span>
        </button>
      </Box>

      {/* Main Order Container */}
      <Paper className={`p-6 rounded-2xl border space-y-6 shadow-xl print:shadow-none print:border-none print:bg-white ${
        theme === 'dark' ? 'glass-panel border-slate-800/80 bg-slate-950/20' : 'bg-white border-slate-200'
      }`}>
        {/* Top Header details */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded ${
              type === 'COMMANDE' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-purple-500/10 text-purple-400'
            }`}>
              {type}
            </span>
            
            <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded ${
              statut === 'VALIDEE'
                ? 'bg-emerald-500/15 text-emerald-400'
                : statut === 'TRAITEE'
                ? 'bg-blue-500/15 text-blue-400'
                : statut === 'EN_ATTENTE'
                ? 'bg-amber-500/15 text-amber-400'
                : statut === 'ANNULEE'
                ? 'bg-red-500/15 text-red-400'
                : 'bg-slate-500/15 text-slate-400'
            }`}>
              {getStatusLabel(statut)}
            </span>
          </div>

          {/* Status changer dropdown widget (hide when printing) */}
          {canChangeStatus && (
            <div className="flex items-center gap-2 print:hidden w-full sm:w-auto">
              <span className="text-[10px] font-black uppercase text-slate-500 shrink-0">Changer le statut:</span>
              <TextField
                select
                size="small"
                disabled={statusUpdating}
                value={statusVal}
                onChange={handleStatusChange}
                sx={{
                  width: 150,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                  }
                }}
              >
                {allowedStatuses.map(st => (
                  <MenuItem key={st} value={st}>
                    {getStatusLabel(st)}
                  </MenuItem>
                ))}
              </TextField>
            </div>
          )}
        </div>

        <Divider className="opacity-10" />

        {/* Client & Commercial Details */}
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} className="space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Émetteur / Commercial</span>
            <div className="flex items-start gap-2.5">
              <PersonIcon className="text-slate-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold text-slate-200">{commercial?.firstName} {commercial?.lastName}</p>
                <p className="text-xs text-slate-550">{commercial?.email}</p>
              </div>
            </div>
          </Grid>

          <Grid item xs={12} sm={6} className="space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Destinataire / Client</span>
            <div className="flex items-start gap-2.5">
              <ReceiptIcon className="text-slate-400 w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold text-slate-200">{client?.companyName} ({client?.code})</p>
                <p className="text-xs text-slate-500">{client?.address}, {client?.city}</p>
                <p className="text-xs text-slate-550">{client?.phone} &bull; {client?.email}</p>
              </div>
            </div>
          </Grid>
        </Grid>

        <Divider className="opacity-10" />

        {/* Invoice Date & Visit Link */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans text-slate-400">
          <div className="flex items-center gap-2">
            <CalendarMonthIcon className="text-slate-550 w-4.5 h-4.5" />
            <span>Date d'émission : <strong>{new Date(createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></span>
          </div>

          {visite && (
            <div className="flex items-center gap-2 cursor-pointer text-indigo-400 hover:underline print:hidden" onClick={() => navigate(`/visits/${visite.id}`)}>
              <MapIcon className="w-4.5 h-4.5" />
              <span>Généré depuis le rapport de visite n°{visite.id} &rarr;</span>
            </div>
          )}
        </div>

        {/* Ordered products table */}
        <div className="space-y-3 pt-2">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Détails des articles</span>
          
          <TableContainer
            component={Paper}
            className={`border rounded-xl shadow overflow-hidden print:border-slate-300 ${
              theme === 'dark' ? 'border-slate-850 bg-slate-900/10' : 'border-slate-150 bg-slate-50'
            }`}
          >
            <Table size="small">
              <TableHead>
                <tr className={`border-b text-[9px] font-black uppercase tracking-wider ${
                  theme === 'dark' ? 'border-slate-800 bg-slate-900/30 text-slate-450' : 'border-slate-200 bg-slate-100 text-slate-650'
                }`}>
                  <th className="py-3 px-4 text-left">Désignation</th>
                  <th className="py-3 px-4 text-center">Référence</th>
                  <th className="py-3 px-4 text-center">Conditionnement</th>
                  <th className="py-3 px-4 text-center">Quantité</th>
                  <th className="py-3 px-4 text-right">P.U. HT</th>
                  <th className="py-3 px-4 text-center">Remise (%)</th>
                  <th className="py-3 px-4 text-right">Montant HT</th>
                </tr>
              </TableHead>
              <TableBody className="divide-y divide-slate-800/10 print:divide-slate-200">
                {lignes.map((line) => (
                  <tr key={line.id} className="text-slate-300 print:text-black">
                    <td className="py-3 px-4 font-bold text-slate-250 print:text-black">{line.designation}</td>
                    <td className="py-3 px-4 text-center font-bold text-xs text-slate-500 print:text-black">{line.reference}</td>
                    <td className="py-3 px-4 text-center text-xs text-slate-450 print:text-black">{line.conditionnement}</td>
                    <td className="py-3 px-4 text-center font-extrabold">{line.quantite}</td>
                    <td className="py-3 px-4 text-right font-bold">{line.prixUnitaireHT.toLocaleString('fr-FR')} €</td>
                    <td className="py-3 px-4 text-center">
                      {line.remise > 0 ? (
                        <span className="text-purple-400 font-extrabold">-{line.remise}%</span>
                      ) : (
                        <span className="text-slate-550">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-100 print:text-black">
                      {line.totalLigneHT.toLocaleString('fr-FR')} €
                    </td>
                  </tr>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {/* Sum totals */}
        <div className="flex justify-end pt-4">
          <div className={`p-4 rounded-xl border min-w-[240px] flex items-center justify-between gap-4 ${
            theme === 'dark' ? 'border-slate-850 bg-slate-900/35' : 'border-slate-200 bg-slate-50'
          }`}>
            <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Total Final HT</span>
            <span className="text-xl font-black text-slate-100 print:text-black">
              {totalHT.toLocaleString('fr-FR')} €
            </span>
          </div>
        </div>
      </Paper>
    </div>
  );
}
