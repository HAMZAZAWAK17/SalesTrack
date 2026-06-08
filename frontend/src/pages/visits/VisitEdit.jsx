import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Container, Typography, TextField, MenuItem, Button, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Checkbox, FormGroup, CircularProgress, Paper } from '@mui/material'

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
        toast.error('Impossible de charger les détails de la visite.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const triggerGPSCapture = () => {
    if (!navigator.geolocation) {
      toast('La géolocalisation n\'est pas supportée par votre navigateur.', { icon: '⚠️' });
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
        toast('Impossible d\'obtenir vos coordonnées GPS.', { icon: '⚠️' });
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
      toast.success(`${files.length} photo(s) compressée(s) et importée(s) avec succès.`);
    } catch (err) {
      console.error('Photo upload error:', err);
      toast.error(err.message || 'Erreur lors du traitement des images.');
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
      toast.error('Le client est obligatoire.');
      return;
    }
    if (!objet) {
      toast.error('L\'objet de la visite est obligatoire.');
      return;
    }
    if (statutCommande === 'NON_COMMANDE' && !raisonNonCommande) {
      toast.error('La raison de non-commande est obligatoire.');
      return;
    }
    if (!commentaire.trim()) {
      toast.error('Veuillez saisir un commentaire de visite.');
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
        toast.success('Rapport de visite modifié avec succès !');
        setTimeout(() => {
          navigate(`/visits/${id}`);
        }, 1000);
      }
    } catch (err) {
      console.error('Error updating visit:', err);
      toast.error(err.message || 'Erreur lors de la modification.');
    } finally {
      setSubmitting(false);
    }
  };

  );
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
      
    </div>
  );
}
