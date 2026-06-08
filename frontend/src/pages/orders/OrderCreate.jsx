import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Container, Typography, TextField, MenuItem, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Paper, IconButton, Divider } from '@mui/material'

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
        toast.error('Erreur lors du chargement des clients.');
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
      toast.error('Le client est obligatoire.');
      return;
    }

    const invalidLines = lines.some(line => !line.designation || !line.reference || !line.conditionnement || Number(line.quantite) <= 0 || Number(line.prixUnitaireHT) < 0);
    if (invalidLines) {
      toast.error('Veuillez remplir correctement toutes les lignes d\'articles.');
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
        toast.success(`${type === 'COMMANDE' ? 'Commande' : 'Devis'} créé avec succès.`);
        setTimeout(() => {
          navigate('/orders');
        }, 1000);
      }
    } catch (err) {
      console.error('Error creating order:', err);
      toast.error(err.message || 'Erreur lors de la création.');
    } finally {
      setSubmitting(false);
    }
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
            <div className="space-y-4">
              {lines.map((line, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border transition-premium relative flex flex-col gap-4 ${
                    theme === 'dark' 
                      ? 'border-slate-800/80 bg-slate-900/20 hover:border-slate-700/60' 
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  {/* Card Header: Line index, Total, Delete button */}
                  <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-800/10 dark:border-slate-700/10">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-amber-500 bg-amber-500/10 rounded-full uppercase">
                        Article #{idx + 1}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Sous-total :</span>
                        <span className="text-sm font-black text-amber-500">
                          {calculateLineTotal(line).toLocaleString('fr-FR')} €
                        </span>
                      </div>
                      
                      <IconButton
                        disabled={lines.length === 1}
                        onClick={() => handleRemoveLine(idx)}
                        sx={{
                          color: 'rgb(248 113 113)',
                          bgcolor: 'rgba(248, 113, 113, 0.08)',
                          '&:hover': {
                            bgcolor: 'rgba(248, 113, 113, 0.15)',
                          },
                          borderRadius: 2,
                          width: 32,
                          height: 32
                        }}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </div>

                  {/* Inputs Grid Layout */}
                  <div className="grid grid-cols-12 gap-4">
                    {/* Preset Autocomplete */}
                    <div className="col-span-12 sm:col-span-6 space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Présélection d'un article</span>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        value={line.presetIndex}
                        onChange={(e) => handlePresetChange(idx, e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 9999,
                          }
                        }}
                      >
                        <MenuItem value="">-- Saisie libre --</MenuItem>
                        {PRODUCT_PRESETS.map((p, pIdx) => (
                          <MenuItem key={pIdx} value={pIdx}>
                            {p.designation} {p.prixUnitaireHT > 0 ? `(${p.prixUnitaireHT}€)` : ''}
                          </MenuItem>
                        ))}
                      </TextField>
                    </div>

                    {/* Designation */}
                    <div className="col-span-12 sm:col-span-6 space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Désignation de l'article</span>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Ex: Eau Plate 1.5L"
                        value={line.designation}
                        onChange={(e) => handleLineValueChange(idx, 'designation', e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 9999,
                          }
                        }}
                      />
                    </div>

                    {/* Reference */}
                    <div className="col-span-6 sm:col-span-3 space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Référence</span>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Ex: SKU-01"
                        value={line.reference}
                        onChange={(e) => handleLineValueChange(idx, 'reference', e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 9999,
                          }
                        }}
                      />
                    </div>

                    {/* Conditionnement */}
                    <div className="col-span-6 sm:col-span-3 space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Conditionnement</span>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Ex: Pack de 6"
                        value={line.conditionnement}
                        onChange={(e) => handleLineValueChange(idx, 'conditionnement', e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 9999,
                          }
                        }}
                      />
                    </div>

                    {/* Quantité */}
                    <div className="col-span-4 sm:col-span-2 space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Quantité</span>
                      <TextField
                        type="number"
                        fullWidth
                        size="small"
                        placeholder="0"
                        value={line.quantite}
                        onChange={(e) => handleLineValueChange(idx, 'quantite', e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 9999,
                          }
                        }}
                      />
                    </div>

                    {/* Prix Unitaire HT */}
                    <div className="col-span-4 sm:col-span-2 space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Prix HT (€)</span>
                      <TextField
                        type="number"
                        fullWidth
                        size="small"
                        placeholder="0.00"
                        value={line.prixUnitaireHT}
                        onChange={(e) => handleLineValueChange(idx, 'prixUnitaireHT', e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 9999,
                          }
                        }}
                      />
                    </div>

                    {/* Remise % */}
                    <div className="col-span-4 sm:col-span-2 space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Remise (%)</span>
                      <TextField
                        type="number"
                        fullWidth
                        size="small"
                        placeholder="0"
                        value={line.remise}
                        onChange={(e) => handleLineValueChange(idx, 'remise', e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 9999,
                          }
                        }}
                      />
                    </div>
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

      
    </div>
  );
}
