import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Container, Typography, TextField, MenuItem, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Snackbar, Alert, Paper, IconButton, Divider } from '@mui/material';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

const PRODUCT_PRESETS = [
  { designation: 'Boisson Cola 33cl', reference: 'COL33', conditionnement: 'Carton de 24', prixUnitaireHT: 12.0 },
  { designation: 'Eau Pétillante 50cl', reference: 'EAU50', conditionnement: 'Carton de 12', prixUnitaireHT: 12.0 },
  { designation: 'Jus d’Orange Bio 1L', reference: 'JUS1L', conditionnement: 'Carton de 6', prixUnitaireHT: 15.0 },
  { designation: 'Bière Blonde Premium', reference: 'BIE33', conditionnement: 'Fût 30L', prixUnitaireHT: 100.0 },
  { designation: 'Eau Plate 1.5L', reference: 'EAU15', conditionnement: 'Pack de 6', prixUnitaireHT: 10.0 },
  { designation: 'Jus de Pomme 1L', reference: 'POM1L', conditionnement: 'Carton de 6', prixUnitaireHT: 15.0 },
  { designation: 'Saisie personnalisée...', reference: 'CUSTOM', conditionnement: '', prixUnitaireHT: 0.0 }
];

export default function OrderCreate() {
  const navigate = useNavigate();
  const { theme } = useAuth();
  const [searchParams] = useSearchParams();
  const paramClientId = searchParams.get('clientId');
  const paramVisiteId = searchParams.get('visiteId');

  // Lists state
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);

  // Form main fields
  const [clientId, setClientId] = useState(paramClientId || '');
  const [type, setType] = useState('COMMANDE'); // COMMANDE or DEVIS
  const [statut, setStatut] = useState('EN_ATTENTE'); // BROUILLON, EN_ATTENTE

  // Line items state
  const [lines, setLines] = useState([
    { designation: '', reference: '', conditionnement: '', quantite: 1, prixUnitaireHT: 0, remise: 0, presetIndex: '' }
  ]);

  // Submission / Toast state
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Load clients lists
  useEffect(() => {
    async function loadClients() {
      try {
        setLoadingClients(true);
        const res = await api.getClients({ limit: 100 });
        if (res.success) {
          setClients(res.data.clients);
        }
      } catch (err) {
        console.error('Error loading clients list:', err);
        setToast({ open: true, message: 'Erreur lors du chargement des clients.', severity: 'error' });
      } finally {
        setLoadingClients(false);
      }
    }
    loadClients();
  }, []);

  // Preset Selection Auto-fill
  const handlePresetChange = (idx, presetVal) => {
    const selectedPresetIdx = Number(presetVal);
    const preset = PRODUCT_PRESETS[selectedPresetIdx];

    setLines(prev => {
      const next = [...prev];
      if (preset.reference === 'CUSTOM') {
        next[idx] = {
          ...next[idx],
          designation: '',
          reference: '',
          conditionnement: '',
          prixUnitaireHT: 0,
          presetIndex: presetVal
        };
      } else {
        next[idx] = {
          ...next[idx],
          designation: preset.designation,
          reference: preset.reference,
          conditionnement: preset.conditionnement,
          prixUnitaireHT: preset.prixUnitaireHT,
          presetIndex: presetVal
        };
      }
      return next;
    });
  };

  const handleLineValueChange = (idx, field, val) => {
    setLines(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const handleAddLine = () => {
    setLines(prev => [
      ...prev,
      { designation: '', reference: '', conditionnement: '', quantite: 1, prixUnitaireHT: 0, remise: 0, presetIndex: '' }
    ]);
  };

  const handleRemoveLine = (idx) => {
    if (lines.length === 1) return; // Keep at least one line
    setLines(prev => prev.filter((_, i) => i !== idx));
  };

  // UI calculations
  const calculateLineTotal = (line) => {
    const qty = Number(line.quantite) || 0;
    const price = Number(line.prixUnitaireHT) || 0;
    const discount = Number(line.remise) || 0;
    const sub = qty * price * (1 - discount / 100);
    return Math.round(sub * 100) / 100;
  };

  const totalHT = lines.reduce((sum, line) => sum + calculateLineTotal(line), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Core validations
    if (!clientId) {
      setToast({ open: true, message: 'Le client est obligatoire.', severity: 'error' });
      return;
    }

    const invalidLines = lines.some(line => !line.designation || !line.reference || !line.conditionnement || Number(line.quantite) <= 0 || Number(line.prixUnitaireHT) < 0);
    if (invalidLines) {
      setToast({ open: true, message: 'Veuillez remplir correctement toutes les lignes d\'articles.', severity: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        clientId: Number(clientId),
        visiteId: paramVisiteId ? Number(paramVisiteId) : null,
        type,
        statut,
        lignes: lines.map(line => ({
          designation: line.designation,
          reference: line.reference,
          conditionnement: line.conditionnement,
          quantite: Number(line.quantite),
          prixUnitaireHT: Number(line.prixUnitaireHT),
          remise: Number(line.remise || 0),
        }))
      };

      const res = await api.createCommande(payload);
      if (res.success) {
        setToast({ open: true, message: `${type === 'COMMANDE' ? 'Commande' : 'Devis'} créé avec succès.`, severity: 'success' });
        setTimeout(() => {
          navigate('/orders');
        }, 1000);
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setToast({ open: true, message: err.message || 'Erreur lors de la création.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToastClose = () => {
    setToast({ ...toast, open: false });
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
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
            Saisir un {type === 'COMMANDE' ? 'Bon de Commande' : 'Devis'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enregistrer une nouvelle vente ou proposition commerciale.
          </Typography>
        </div>
      </Box>

      <form onSubmit={handleSubmit}>
        <Paper className={`p-6 rounded-2xl border space-y-6 shadow-xl ${
          theme === 'dark' ? 'glass-panel border-slate-800/80 bg-slate-950/20' : 'bg-white border-slate-200'
        }`}>
          {/* Top block options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Client Select */}
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Client Destinataire</span>
              {loadingClients ? (
                <Box className="flex items-center gap-2 py-2">
                  <CircularProgress size={16} />
                  <span className="text-xs text-slate-500">Chargement...</span>
                </Box>
              ) : (
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                >
                  {clients.map(c => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.companyName} ({c.city})
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </div>

            {/* Document Type select */}
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Type de document</span>
              <TextField
                select
                fullWidth
                size="small"
                value={type}
                onChange={(e) => setType(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              >
                <MenuItem value="COMMANDE">Commande Ferme</MenuItem>
                <MenuItem value="DEVIS">Devis / Proposition</MenuItem>
              </TextField>
            </div>

            {/* Document initial status */}
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Statut initial</span>
              <TextField
                select
                fullWidth
                size="small"
                value={statut}
                onChange={(e) => setStatut(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              >
                <MenuItem value="EN_ATTENTE">En attente de traitement</MenuItem>
                <MenuItem value="BROUILLON">Brouillon temporaire</MenuItem>
              </TextField>
            </div>
          </div>

          <Divider className="opacity-10" />

          {/* Line items interactive grid */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Articles Commandés</span>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddLine}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
              >
                Ajouter un article
              </Button>
            </div>

            {/* Line rows */}
            <div className="space-y-3">
              {lines.map((line, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center relative ${
                    theme === 'dark' ? 'border-slate-850 bg-slate-900/10' : 'border-slate-150 bg-slate-50 shadow-sm'
                  }`}
                >
                  {/* Preset Autocomplete */}
                  <div className="sm:col-span-3 space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 block">Présélection</span>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      value={line.presetIndex}
                      onChange={(e) => handlePresetChange(idx, e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    >
                      <MenuItem value="">-- Saisie libre --</MenuItem>
                      {PRODUCT_PRESETS.map((p, pIdx) => (
                        <MenuItem key={pIdx} value={pIdx}>
                          {p.designation}
                        </MenuItem>
                      ))}
                    </TextField>
                  </div>

                  {/* Designation */}
                  <div className="sm:col-span-3 space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 block">Désignation</span>
                    <TextField
                      fullWidth
                      size="small"
                      value={line.designation}
                      onChange={(e) => handleLineValueChange(idx, 'designation', e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </div>

                  {/* Ref & Conditionnement */}
                  <div className="sm:col-span-2 space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 block">Réf / Cond.</span>
                    <div className="flex gap-1">
                      <TextField
                        placeholder="Réf"
                        size="small"
                        value={line.reference}
                        onChange={(e) => handleLineValueChange(idx, 'reference', e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                      <TextField
                        placeholder="Cond"
                        size="small"
                        value={line.conditionnement}
                        onChange={(e) => handleLineValueChange(idx, 'conditionnement', e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </div>
                  </div>

                  {/* Quantité & Prix & Remise */}
                  <div className="sm:col-span-3 space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 block">Quantité / Prix HT / Remise %</span>
                    <div className="flex gap-1">
                      <TextField
                        type="number"
                        placeholder="Qté"
                        size="small"
                        value={line.quantite}
                        onChange={(e) => handleLineValueChange(idx, 'quantite', e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                      <TextField
                        type="number"
                        placeholder="Prix"
                        size="small"
                        value={line.prixUnitaireHT}
                        onChange={(e) => handleLineValueChange(idx, 'prixUnitaireHT', e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                      <TextField
                        type="number"
                        placeholder="Remise"
                        size="small"
                        value={line.remise}
                        onChange={(e) => handleLineValueChange(idx, 'remise', e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </div>
                  </div>

                  {/* Delete / Summary Line */}
                  <div className="sm:col-span-1 flex items-center justify-end gap-2 mt-2 sm:mt-0">
                    <div className="text-right shrink-0">
                      <div className="text-[10px] font-bold text-slate-500 leading-none">Total</div>
                      <div className="text-xs font-black text-indigo-400 mt-1">
                        {calculateLineTotal(line)} €
                      </div>
                    </div>

                    <IconButton
                      disabled={lines.length === 1}
                      onClick={() => handleRemoveLine(idx)}
                      className="text-red-400"
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Divider className="opacity-10" />

          {/* Subtotal review display */}
          <div className="flex justify-between items-center p-4 rounded-xl bg-slate-900/30 border border-slate-800/20">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Total de la commande estimé (HT)</span>
              <p className="text-xs text-slate-500 mt-0.5">Le total exact sera calculé et validé par le serveur.</p>
            </div>
            
            <div className="text-2xl font-black text-slate-100">
              {totalHT.toLocaleString('fr-FR')} €
            </div>
          </div>

          {/* Form Actions */}
          <Box className="flex justify-end gap-3 pt-2">
            <Button
              variant="outlined"
              onClick={() => navigate('/orders')}
              sx={{
                borderRadius: 2.5,
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
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={18} /> : <SaveIcon />}
              sx={{
                borderRadius: 2.5,
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 'extrabold',
                px: 4,
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)',
              }}
            >
              {submitting ? 'Validation...' : `Enregistrer le ${type === 'COMMANDE' ? 'Bon de Commande' : 'Devis'}`}
            </Button>
          </Box>
        </Paper>
      </form>

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
