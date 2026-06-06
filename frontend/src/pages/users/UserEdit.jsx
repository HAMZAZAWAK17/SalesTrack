import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import UserForm from '../../components/users/UserForm';
import * as userService from '../../services/userService';

export default function UserEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { theme } = useAuth();

  // Component states
  const [userData, setUserData] = useState(null);
  const [managers, setManagers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Load user data and managers on mount
  useEffect(() => {
    async function loadData() {
      try {
        // Fetch specific user details
        const userResponse = await userService.getUserById(id);
        
        // Fetch managers list
        const managersResponse = await userService.getManagers();

        if (userResponse.success) {
          // Exclude null values and map password to empty string for edit input
          const user = userResponse.data;
          setUserData({
            role: user.role,
            lastName: user.lastName,
            firstName: user.firstName,
            email: user.email,
            phone: user.phone || '',
            equipe: user.equipe || '',
            managerId: user.managerId || '',
            password: '' // Kept empty in form edit mode
          });
        }
        
        if (managersResponse.success) {
          setManagers(managersResponse.data);
        }
      } catch (error) {
        console.error('Failed to load user edit data:', error);
        setToast({
          open: true,
          message: error.message || 'Impossible de récupérer les informations de l\'utilisateur.',
          severity: 'error'
        });
      } finally {
        setLoadingData(false);
      }
    }
    
    if (id) {
      loadData();
    }
  }, [id]);

  // Form edit submission handler
  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const response = await userService.updateUser(id, formData);
      if (response.success) {
        setToast({
          open: true,
          message: 'Utilisateur mis à jour avec succès ! Redirection...',
          severity: 'success'
        });
        
        // Redirect back to user list after 1.5s delay to let the toast display
        setTimeout(() => {
          navigate('/users');
        }, 1500);
      }
    } catch (error) {
      setToast({
        open: true,
        message: error.message || "Une erreur est survenue lors de la modification.",
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToastClose = () => {
    setToast({ ...toast, open: false });
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
              Modifier l'utilisateur
            </h1>
            <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Mettez à jour les informations de profil et d'accès de l'agent.
            </p>
          </div>
        </div>

        {/* Form Container Card */}
        <div className={`p-6 md:p-8 rounded-2xl border transition-premium shadow-xl ${
          theme === 'dark' ? 'glass-panel border-slate-800/60' : 'bg-white border-slate-200'
        }`}>
          {loadingData ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <svg className="animate-spin h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-xs text-slate-550">Récupération des informations...</span>
            </div>
          ) : (
            <UserForm
              defaultValues={userData}
              onSubmit={handleSubmit}
              loading={submitting}
              managers={managers}
              isEdit={true}
            />
          )}
        </div>
      </div>

      {/* Feedback alerts */}
      {toast.open && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-[fadeIn_0.25s_ease-out]">
          <div className={`px-4 py-3 rounded-xl border flex items-center space-x-3.5 shadow-lg ${
            toast.severity === 'error'
              ? 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-200'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-200'
          }`}>
            <span>{toast.message}</span>
            <button onClick={handleToastClose} className="p-0.5 hover:bg-white/10 rounded-lg cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
