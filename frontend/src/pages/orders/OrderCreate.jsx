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

  );
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      
    </div>
  );
}
