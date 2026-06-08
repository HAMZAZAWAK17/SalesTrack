import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import UserForm from '../../components/users/UserForm';
import * as api from '../../services/api';

export default function UserCreate() {
  const navigate = useNavigate();
  const { theme } = useAuth();

  // Component states
  const [managers, setManagers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  
  // Load managers on mount (to assign them for commercials)
  useEffect(() => {
    async function loadManagers() {
      try {
        const response = await api.getManagers();
        if (response.success) {
          setManagers(response.data);
        }
      } catch (error) {
        console.error('Failed to load managers:', error);
        toast.error('Impossible de charger la liste des managers.');
      }
    }
    loadManagers();
  }, []);

  // Form submission handler
  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const response = await api.createUser(formData);
      if (response.success) {
        toast.success('Utilisateur créé avec succès ! Redirection...');
        
        // Redirect back to user list after 1.5s delay to let the toast display
        setTimeout(() => {
          navigate('/users');
        }, 1500);
      }
    } catch (error) {
      toast.error(error.message || "Une erreur est survenue lors de la création de l'utilisateur.");
    } finally {
      setSubmitting(false);
    }
  };

  );
  };

  return (
    <div className={`min-h-screen w-full p-4 md:p-8 relative overflow-hidden transition-colors duration-300 font-sans ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100 grid-pattern' : 'bg-slate-50 text-slate-800 grid-pattern-light'
    }`}>
      
    </div>
  );
}
