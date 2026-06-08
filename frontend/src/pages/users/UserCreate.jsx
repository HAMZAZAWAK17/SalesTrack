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

  
  return (
    <div className={`min-h-screen w-full p-4 md:p-8 relative overflow-hidden transition-colors duration-300 font-sans ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100 grid-pattern' : 'bg-slate-50 text-slate-800 grid-pattern-light'
    }`}>
      {/* Background ambient glows */}
      <div className="absolute top-[-25%] left-[-15%] w-[70%] h-[70%] rounded-full radial-glow animate-pulse-slow pointer-events-none"></div>
      <div className="absolute bottom-[-25%] right-[-15%] w-[70%] h-[70%] rounded-full radial-glow-purple animate-pulse-slow pointer-events-none"></div>

      <div className="max-w-3xl mx-auto relative z-10 space-y-6">
        
        {/* Back button and page title header */}
        <div className="flex items-center space-x-3.5 py-2">
          <button
            onClick={() => navigate('/users')}
            className={`p-2.5 rounded-xl border transition-premium cursor-pointer ${
              theme === 'dark'
                ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-sm'
            }`}
            title="Retour à la liste"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          
          <div>
            <h1 className={`text-2xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Créer un nouvel utilisateur
            </h1>
            <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Enregistrez un nouvel agent et affectez ses accès à la plateforme terrain SalesTrack.
            </p>
          </div>
        </div>

        {/* Form Container Card */}
        <div className={`p-6 md:p-8 rounded-2xl border transition-premium shadow-xl ${
          theme === 'dark' ? 'glass-panel border-slate-800/60' : 'bg-white border-slate-200'
        }`}>
          <UserForm
            onSubmit={handleSubmit}
            loading={submitting}
            managers={managers}
            isEdit={false}
          />
        </div>
      </div>

      
    </div>
  );
}
