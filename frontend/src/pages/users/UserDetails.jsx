import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as userService from '../../services/userService';

export default function UserDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { theme } = useAuth();

  // Component states
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Load user details on mount
  useEffect(() => {
    async function loadUserDetails() {
      try {
        const response = await userService.getUserById(id);
        if (response.success) {
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to load user details:', error);
        setToast({
          open: true,
          message: error.message || 'Impossible de récupérer les détails de l\'utilisateur.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      loadUserDetails();
    }
  }, [id]);

  // Format date utility
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render role badges with cohesive colors
  const getRoleBadge = (role) => {
    if (role === 'ADMIN') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border border-red-500/30 bg-red-500/10 text-red-500 dark:text-red-400">
          ADMIN
        </span>
      );
    }
    if (role === 'MANAGER') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border border-purple-500/30 bg-purple-500/10 text-purple-650 dark:text-purple-400">
          MANAGER
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
        COMMERCIAL
      </span>
    );
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
        
        {/* Header bar */}
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center space-x-3.5">
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
            
            <h1 className={`text-2xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Détails de l'utilisateur
            </h1>
          </div>
          
          {user && (
            <button
              onClick={() => navigate(`/users/edit/${user.id}`)}
              className="px-5 py-3 min-h-[48px] bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-extrabold rounded-xl transition-premium shadow-lg shadow-indigo-500/10 hover:scale-[1.02] flex items-center space-x-2.5 cursor-pointer"
            >
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Modifier le profil</span>
            </button>
          )}
        </div>

        {/* Loading / Content Card */}
        {loading ? (
          <div className={`p-10 rounded-2xl border flex flex-col items-center justify-center space-y-3 ${
            theme === 'dark' ? 'glass-panel border-slate-800/60' : 'bg-white border-slate-200'
          }`}>
            <svg className="animate-spin h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-xs text-slate-550">Récupération des détails...</span>
          </div>
        ) : user ? (
          <div className={`p-6 md:p-8 rounded-2xl border transition-premium shadow-xl space-y-8 ${
            theme === 'dark' ? 'glass-panel border-slate-800/60' : 'bg-white border-slate-200'
          }`}>
            
            {/* 1. Header initials avatar */}
            <div className="flex flex-col sm:flex-row items-center gap-4.5 pb-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-650 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-500/10">
                {user.firstName[0].toUpperCase()}{user.lastName[0].toUpperCase()}
              </div>
              <div className="text-center sm:text-left space-y-1">
                <h2 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {user.firstName} {user.lastName}
                </h2>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  {getRoleBadge(user.role)}
                  {user.equipe && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/15">
                      {user.equipe}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <hr className={theme === 'dark' ? 'border-slate-800/60' : 'border-slate-100'} />

            {/* 2. Profile Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="flex items-start space-x-3.5">
                <div className={`p-2.5 rounded-xl border ${theme === 'dark' ? 'border-slate-850 bg-slate-900/40 text-slate-450' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                </div>
                <div>
                  <span className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Adresse Email</span>
                  <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{user.email}</span>
                </div>
              </div>

              {/* Téléphone */}
              <div className="flex items-start space-x-3.5">
                <div className={`p-2.5 rounded-xl border ${theme === 'dark' ? 'border-slate-850 bg-slate-900/40 text-slate-450' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Numéro de Téléphone</span>
                  <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{user.phone || '-'}</span>
                </div>
              </div>

              {/* Équipe */}
              {(user.role === 'MANAGER' || user.role === 'COMMERCIAL') && (
                <div className="flex items-start space-x-3.5">
                  <div className={`p-2.5 rounded-xl border ${theme === 'dark' ? 'border-slate-850 bg-slate-900/40 text-slate-450' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Équipe de rattachement</span>
                    <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{user.equipe}</span>
                  </div>
                </div>
              )}

              {/* Manager (Required ONLY for COMMERCIAL) */}
              {user.role === 'COMMERCIAL' && (
                <div className="flex items-start space-x-3.5">
                  <div className={`p-2.5 rounded-xl border ${theme === 'dark' ? 'border-slate-850 bg-slate-900/40 text-slate-450' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Manager superviseur</span>
                    <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                      {user.manager ? `${user.manager.firstName} ${user.manager.lastName}` : 'Aucun manager affecté'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <hr className={theme === 'dark' ? 'border-slate-800/60' : 'border-slate-100'} />

            {/* 3. Account Stamps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-2.5 text-xs text-slate-500">
                <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Créé le {formatDate(user.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs text-slate-500">
                <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
                </svg>
                <span>Dernière mise à jour le {formatDate(user.updatedAt)}</span>
              </div>
            </div>

          </div>
        ) : (
          <div className={`p-8 rounded-2xl border text-center text-slate-500 ${
            theme === 'dark' ? 'glass-panel border-slate-800/60' : 'bg-white border-slate-200'
          }`}>
            Aucun utilisateur trouvé pour cet identifiant.
          </div>
        )}
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
