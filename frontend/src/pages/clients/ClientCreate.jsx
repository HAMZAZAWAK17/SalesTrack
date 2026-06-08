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
      {/* Background ambient glows */}
      <div className="absolute top-[-25%] left-[-15%] w-[70%] h-[70%] rounded-full radial-glow animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-15%] w-[70%] h-[70%] rounded-full radial-glow-purple animate-pulse-slow pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── Top Header Bar ─────────────────────────────────────────── */}
        <header className={`flex justify-between items-center p-4 rounded-2xl border transition-all shadow-xl ${
          theme === 'dark' ? 'glass-panel border-slate-800/60' : 'bg-white/90 border-slate-200 shadow-slate-100'
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/clients')}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-300'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm'
              }`}
              title="Retour à la liste"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-300 bg-clip-text text-transparent">
                SalesTrack
              </span>
              <span className={`text-[10px] block font-extrabold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                Nouveau client
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block mr-1">
              <div className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                {currentUser?.firstName} {currentUser?.lastName}
              </div>
              <div className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">{currentUser?.role}</div>
            </div>
            <button onClick={toggleTheme} className={`p-2 rounded-xl border transition-all cursor-pointer ${
              theme === 'dark' ? 'border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-yellow-400' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm'
            }`}>
              {theme === 'dark'
                ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg>
                : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              }
            </button>
            <button onClick={logoutUser} className={`px-3 py-2 border hover:bg-red-500/10 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              theme === 'dark' ? 'border-slate-700 bg-slate-900/40 text-red-400' : 'border-red-200 bg-white text-red-500 shadow-sm'
            }`}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </header>

        {/* ── Page Title ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 px-1">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 shadow-lg shadow-indigo-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
              Créer un nouveau client
            </h1>
            <p className={`text-sm mt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Remplissez les informations ci-dessous pour enregistrer un nouveau compte client.
            </p>
          </div>
        </div>

        {/* ── Form Card ──────────────────────────────────────────────── */}
        <div className={`rounded-3xl border p-6 shadow-2xl ${
          theme === 'dark'
            ? 'bg-slate-900/80 border-slate-800/70 backdrop-blur-sm'
            : 'bg-white border-slate-200 shadow-slate-100'
        }`}>
          <ClientForm
            onSubmit={handleSubmit}
            loading={submitting}
            commercials={commercials}
            isEdit={false}
          />
        </div>

      </div>

      
    </div>
  );
}
