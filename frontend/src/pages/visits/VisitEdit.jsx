import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Container, Typography, TextField, MenuItem, Button, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Checkbox, FormGroup, CircularProgress, Snackbar, Alert, Paper } from '@mui/material';

// Icons
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const OBJETS_VISITE = [
  { value: 'PRISE_COMMANDE', label: 'Prise de commande' },
  { value: 'SUIVI_CLIENT', label: 'Suivi client' },
  { value: 'RECOUVREMENT', label: 'Recouvrement' },
  { value: 'VISIBILITE_MARQUE', label: 'Visibilité marque' },
  { value: 'IMPLANTATION_PRODUIT', label: 'Implantation produit' },
  { value: 'NEGOCIATION', label: 'Négociation' },
  { value: 'LIVRAISON', label: 'Livraison' },
  { value: 'RELANCE', label: 'Relance' },
  { value: 'AUTRE', label: 'Autre' },
];

const RAISONS_NON_COMMANDE = [
  { value: 'STOCK_NON_ECOULE', label: 'Stock non écoulé' },
  { value: 'TROP_STOCK', label: 'Trop de stock' },
  { value: 'BAISSE_ACTIVITE', label: 'Baisse d\'activité' },
  { value: 'CHANGEMENT_FOURNISSEUR', label: 'Changement de fournisseur' },
  { value: 'PRIX_ELEVE', label: 'Prix trop élevé' },
  { value: 'CLIENT_ABSENT', label: 'Client absent' },
  { value: 'ATTENTE_VALIDATION', label: 'Attente validation manager' },
  { value: 'PROBLEME_LIVRAISON', label: 'Problème lors de la livraison précédente' },
  { value: 'AUTRE', label: 'Autre' },
];

const PROBLEMES_CONSTATES = [
  { value: 'LIVRAISON', label: 'Livraison' },
  { value: 'FACTURATION', label: 'Facturation' },
  { value: 'STOCK', label: 'Stock' },
  { value: 'QUALITE', label: 'Qualité produit' },
  { value: 'AUTRE', label: 'Autre' },
];

export default function VisitEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useAuth();

  // Lists states
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [clientId, setClientId] = useState('');
  const [objet, setObjet] = useState('');
  const [statutCommande, setStatutCommande] = useState('NON_COMMANDE');
  const [raisonNonCommande, setRaisonNonCommande] = useState('');
  const [commentaire, setCommentaire] = useState('');
  
  // Problems checkbox list
  const [selectedProblems, setSelectedProblems] = useState([]);

  // Geolocation states
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Photo states
  const [photos, setPhotos] = useState([]);
  const [photoCompressing, setPhotoCompressing] = useState(false);

  // Form submission state
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Load visit details and clients list on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load clients
        const clientsRes = await api.getClients({ limit: 100 });
        if (clientsRes.success) {
          setClients(clientsRes.data.clients);
        }

        // Load visit details
        const visitRes = await api.getVisitById(id);
        if (visitRes.success) {
          const v = visitRes.data;
          setClientId(v.clientId || '');
          setObjet(v.objet || '');
          setStatutCommande(v.statutCommande || 'NON_COMMANDE');
          setRaisonNonCommande(v.raisonNonCommande || '');
          setCommentaire(v.commentaire || '');
          setLatitude(v.latitude || null);
          setLongitude(v.longitude || null);
          setPhotos(v.photos || []);
          if (v.problemesConstates) {
            setSelectedProblems(v.problemesConstates.split(','));
          }
        }
      } catch (err) {
        console.error('Error loading visit edit data:', err);
        setToast({ open: true, message: 'Impossible de charger les détails de la visite.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const triggerGPSCapture = () => {
    if (!navigator.geolocation) {
      setToast({ open: true, message: 'La géolocalisation n\'est pas supportée par votre navigateur.', severity: 'warning' });
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setGpsLoading(false);
      },
      (error) => {
        console.error('GPS error:', error);
        setGpsLoading(false);
        setToast({ open: true, message: 'Impossible d\'obtenir vos coordonnées GPS.', severity: 'warning' });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleProblemChange = (val) => {
    setSelectedProblems(prev =>
      prev.includes(val) ? prev.filter(p => p !== val) : [...prev, val]
    );
  };

  // Image compression & upload
  const handlePhotoUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setPhotoCompressing(true);
    try {
      const uploadedPhotos = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const cheminFichier = await compressAndUploadPhoto(file);
        uploadedPhotos.push({
          cheminFichier,
          legende: '',
          latitude: latitude || null,
          longitude: longitude || null
        });
      }
      
      setPhotos(prev => [...prev, ...uploadedPhotos]);
      setToast({ open: true, message: `${files.length} photo(s) compressée(s) et importée(s) avec succès.`, severity: 'success' });
    } catch (err) {
      console.error('Photo upload error:', err);
      setToast({ open: true, message: err.message || 'Erreur lors du traitement des images.', severity: 'error' });
    } finally {
      setPhotoCompressing(false);
      e.target.value = '';
    }
  };

  const compressAndUploadPhoto = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_WIDTH_HEIGHT = 800;
          if (width > MAX_WIDTH_HEIGHT || height > MAX_WIDTH_HEIGHT) {
            if (width > height) {
              height = Math.round((height * MAX_WIDTH_HEIGHT) / width);
              width = MAX_WIDTH_HEIGHT;
            } else {
              width = Math.round((width * MAX_WIDTH_HEIGHT) / height);
              height = MAX_WIDTH_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(async (blob) => {
            if (!blob) {
              reject(new Error('Erreur de traitement d\'image.'));
              return;
            }
            try {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: 'image/jpeg',
                lastModified: Date.now()
              });

              const formData = new FormData();
              formData.append('photo', compressedFile);

              const uploadRes = await api.uploadVisitPhoto(formData);
              if (uploadRes.success) {
                resolve(uploadRes.data.cheminFichier);
              } else {
                reject(new Error('Erreur serveur lors de l\'upload.'));
              }
            } catch (uploadErr) {
              reject(uploadErr);
            }
          }, 'image/jpeg', 0.7);
        };
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handlePhotoLegendeChange = (idx, value) => {
    setPhotos(prev => {
      const next = [...prev];
      next[idx].legende = value;
      return next;
    });
  };

  const handleRemovePhoto = (idx) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientId) {
      setToast({ open: true, message: 'Le client est obligatoire.', severity: 'error' });
      return;
    }
    if (!objet) {
      setToast({ open: true, message: 'L\'objet de la visite est obligatoire.', severity: 'error' });
      return;
    }
    if (statutCommande === 'NON_COMMANDE' && !raisonNonCommande) {
      setToast({ open: true, message: 'La raison de non-commande est obligatoire.', severity: 'error' });
      return;
    }
    if (!commentaire.trim()) {
      setToast({ open: true, message: 'Veuillez saisir un commentaire de visite.', severity: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        clientId: Number(clientId),
        objet,
        commentaire,
        statutCommande,
        raisonNonCommande: statutCommande === 'NON_COMMANDE' ? raisonNonCommande : null,
        problemesConstates: selectedProblems.length > 0 ? selectedProblems.join(',') : null,
        latitude,
        longitude,
        photos: photos.map(p => ({
          cheminFichier: p.cheminFichier,
          legende: p.legende,
          latitude: p.latitude,
          longitude: p.longitude
        }))
      };

      const res = await api.updateVisit(id, payload);
      if (res.success) {
        setToast({ open: true, message: 'Rapport de visite modifié avec succès !', severity: 'success' });
        setTimeout(() => {
          navigate(`/visits/${id}`);
        }, 1000);
      }
    } catch (err) {
      console.error('Error updating visit:', err);
      setToast({ open: true, message: err.message || 'Erreur lors de la modification.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToastClose = () => {
    setToast({ ...toast, open: false });
  };

  if (loading) {
    return (
      <Box className="h-full w-full flex flex-col items-center justify-center py-20 gap-3">
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Chargement des informations...
        </Typography>
      </Box>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
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
            Modifier la Visite n°{id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Modifier le rapport de visite et les photos rattachées.
          </Typography>
        </div>
      </Box>

      {/* Main Form container */}
      <form onSubmit={handleSubmit}>
        <Paper className={`p-6 rounded-2xl border space-y-6 shadow-xl ${
          theme === 'dark' ? 'glass-panel border-slate-800/80 bg-slate-950/20' : 'bg-white border-slate-200'
        }`}>
          {/* 1. Client Select */}
          <div className="space-y-1.5">
            <FormLabel className="text-xs font-black uppercase text-slate-500 tracking-wider">Client Visité</FormLabel>
            <TextField
              select
              fullWidth
              variant="outlined"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Sélectionnez un client"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                }
              }}
            >
              {clients.map(c => (
                <MenuItem key={c.id} value={c.id}>
                  {c.companyName} ({c.code} - {c.city})
                </MenuItem>
              ))}
            </TextField>
          </div>

          {/* 2. Visit Object */}
          <div className="space-y-1.5">
            <FormLabel className="text-xs font-black uppercase text-slate-500 tracking-wider">Objet de la Visite</FormLabel>
            <TextField
              select
              fullWidth
              variant="outlined"
              value={objet}
              onChange={(e) => setObjet(e.target.value)}
              placeholder="Sélectionnez l'objet"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                }
              }}
            >
              {OBJETS_VISITE.map(obj => (
                <MenuItem key={obj.value} value={obj.value}>
                  {obj.label}
                </MenuItem>
              ))}
            </TextField>
          </div>

          {/* 3. Order Status Toggle */}
          <div className="space-y-1.5">
            <FormLabel className="text-xs font-black uppercase text-slate-500 tracking-wider">Prise de commande lors de la visite ?</FormLabel>
            <RadioGroup
              row
              value={statutCommande}
              onChange={(e) => setStatutCommande(e.target.value)}
              className="gap-6 mt-1"
            >
              <FormControlLabel
                value="COMMANDE"
                control={<Radio />}
                label={<span className="text-sm font-bold text-slate-250">Oui (Commande prise)</span>}
              />
              <FormControlLabel
                value="NON_COMMANDE"
                control={<Radio />}
                label={<span className="text-sm font-bold text-slate-250">Non (Pas de commande)</span>}
              />
            </RadioGroup>
          </div>

          {/* 4. Non-Order Reason (Conditional on NON_COMMANDE) */}
          {statutCommande === 'NON_COMMANDE' && (
            <div className="space-y-1.5 animate-fade-in">
              <FormLabel className="text-xs font-black uppercase text-slate-500 tracking-wider">Raison de non-commande</FormLabel>
              <TextField
                select
                fullWidth
                variant="outlined"
                value={raisonNonCommande}
                onChange={(e) => setRaisonNonCommande(e.target.value)}
                placeholder="Pourquoi aucune commande n'a été prise ?"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  }
                }}
              >
                {RAISONS_NON_COMMANDE.map(r => (
                  <MenuItem key={r.value} value={r.value}>
                    {r.label}
                  </MenuItem>
                ))}
              </TextField>
            </div>
          )}

          {/* 5. Problems Observed Checkbox list */}
          <div className="space-y-1.5">
            <FormLabel className="text-xs font-black uppercase text-slate-500 tracking-wider">Problèmes constatés chez le client</FormLabel>
            <FormGroup row className="gap-2.5 mt-1">
              {PROBLEMES_CONSTATES.map(prob => (
                <FormControlLabel
                  key={prob.value}
                  control={
                    <Checkbox
                      checked={selectedProblems.includes(prob.value)}
                      onChange={() => handleProblemChange(prob.value)}
                    />
                  }
                  label={<span className="text-xs font-bold text-slate-400">{prob.label}</span>}
                />
              ))}
            </FormGroup>
          </div>

          {/* 6. Comment area */}
          <div className="space-y-1.5">
            <FormLabel className="text-xs font-black uppercase text-slate-500 tracking-wider">Compte-rendu de Visite</FormLabel>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Saisissez des commentaires précis sur la visite..."
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                }
              }}
            />
          </div>

          {/* 7. GPS Geolocation Card */}
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
            theme === 'dark' ? 'border-slate-850 bg-slate-900/10' : 'border-slate-200 bg-slate-50'
          }`}>
            <div className="space-y-1 flex-1">
              <span className="text-[10px] font-black uppercase text-slate-550 tracking-wider block">Coordonnées GPS</span>
              {latitude && longitude ? (
                <div className="text-xs font-bold text-indigo-400">
                  Lat: {latitude.toFixed(6)}, Lon: {longitude.toFixed(6)}
                </div>
              ) : (
                <div className="text-xs text-slate-500">
                  Non capturées
                </div>
              )}
            </div>
            
            <button
              type="button"
              onClick={triggerGPSCapture}
              disabled={gpsLoading}
              className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center gap-2 cursor-pointer transition-premium ${
                gpsLoading
                  ? 'border-slate-800 text-slate-600 bg-transparent'
                  : theme === 'dark'
                  ? 'border-slate-800 text-slate-350 hover:bg-slate-900 bg-slate-900/30'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100 bg-white shadow-sm'
              }`}
            >
              {gpsLoading ? <CircularProgress size={14} /> : <GpsFixedIcon fontSize="small" />}
              <span>{latitude ? 'Recapturer' : 'Capturer'} GPS</span>
            </button>
          </div>

          {/* 8. Photo Upload section */}
          <div className="space-y-2">
            <FormLabel className="text-xs font-black uppercase text-slate-500 tracking-wider block">Photos Terrain (max 800px, 0.7 compression auto)</FormLabel>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
              {photos.map((photo, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex gap-3 relative items-center ${
                    theme === 'dark' ? 'border-slate-850 bg-slate-900/10' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <img
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${photo.cheminFichier}`}
                    alt="Terrain"
                    className="w-14 h-14 rounded-lg object-cover bg-slate-900 border border-slate-800/40"
                  />
                  <div className="flex-1 min-w-0">
                    <TextField
                      placeholder="Légende..."
                      size="small"
                      variant="standard"
                      value={photo.legende || ''}
                      onChange={(e) => handlePhotoLegendeChange(idx, e.target.value)}
                      className="text-xs font-bold w-full"
                    />
                    <div className="text-[9px] text-slate-500 mt-1 truncate">
                      {photo.cheminFichier.split('/').pop()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="p-1 rounded-lg text-red-400 hover:bg-red-500/10 cursor-pointer font-bold text-xs"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <input
                accept="image/*"
                className="hidden"
                id="visit-photo-file-edit"
                type="file"
                onChange={handlePhotoUpload}
                disabled={photoCompressing}
                multiple
              />
              <label htmlFor="visit-photo-file-edit" className="block w-full">
                <Button
                  component="span"
                  variant="outlined"
                  fullWidth
                  disabled={photoCompressing}
                  startIcon={photoCompressing ? <CircularProgress size={16} /> : <AddAPhotoIcon />}
                  sx={{
                    minHeight: 48,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 'extrabold',
                    borderStyle: 'dashed',
                    borderWidth: 2,
                  }}
                >
                  {photoCompressing ? 'Compression de la photo...' : 'Ajouter une photo'}
                </Button>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <Box className="flex justify-end gap-3 pt-4 border-t border-slate-800/20">
            <Button
              variant="outlined"
              onClick={() => navigate(`/visits/${id}`)}
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
              disabled={submitting}
              variant="contained"
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
              {submitting ? 'Enregistrement...' : 'Enregistrer les Modifications'}
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
