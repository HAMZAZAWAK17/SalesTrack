import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ClientForm from '../../components/clients/ClientForm';
import * as api from '../../services/api';

export default function ClientCreate() {
  const navigate = useNavigate();
  const { user: currentUser, theme, toggleTheme, logoutUser } = useAuth();

  const [commercials, setCommercials] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    async function loadCommercials() {
      try {
        const response = await api.getUsers({ role: 'COMMERCIAL', limit: 100 });
        if (response.success) setCommercials(response.data.users);
      } catch (err) {
        showToast('Impossible de charger la liste des commerciaux.', 'error');
      }
    }
    loadCommercials();
  }, []);

  const showToast = (message, type = 'success') => {
    if (type === 'success') {
      toast.success(message);
    } else if (type === 'warning') {
      toast(message, { icon: '⚠️' });
    } else {
      toast.error(message);
    }
  };
);
    setTimeout(() => , 4000);
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const response = await api.createClient(formData);
      if (response.success) {
        showToast('Compte client créé avec succès !', 'success');
        setTimeout(() => navigate('/clients'), 1500);
      }
    } catch (err) {
      showToast(err.message || 'Erreur lors de la création du client.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen w-full relative overflow-hidden transition-colors duration-300 font-sans ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100 grid-pattern' : 'bg-slate-50 text-slate-800 grid-pattern-light'
    }`}>
      
    </div>
  );
}
