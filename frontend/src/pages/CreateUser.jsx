import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';

// Zod schema for validation (matches the original rules)
const userFormSchema = z.object({
  role: z.enum(['ADMIN', 'MANAGER', 'COMMERCIAL'], {
    errorMap: () => ({ message: 'Le rôle est obligatoire.' }),
  }),
  lastName: z.string().min(1, 'Le nom est obligatoire.'),
  firstName: z.string().min(1, 'Le prénom est obligatoire.'),
  email: z.string().min(1, 'L\'email est obligatoire.').email('Format d\'email invalide.'),
  phone: z.string().min(1, 'Le téléphone est obligatoire.'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères.'),
  equipe: z.string().optional().nullable(),
  managerId: z.any().optional().nullable(),
}).superRefine((data, ctx) => {
  // Team (equipe) is required for MANAGER and COMMERCIAL roles
  if (data.role === 'MANAGER' || data.role === 'COMMERCIAL') {
    if (!data.equipe || data.equipe.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'L\'équipe est obligatoire pour les managers et les commerciaux.',
        path: ['equipe'],
      });
    }
  }
  // Manager is required ONLY for COMMERCIAL role
  if (data.role === 'COMMERCIAL') {
    if (!data.managerId || data.managerId === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Le manager est obligatoire pour un commercial.',
        path: ['managerId'],
      });
    }
  }
});

export default function CreateUser() {
  const { token, logoutUser, user: currentUser } = useAuth();
  
  // State for available managers
  const [managers, setManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  
  // Form submission status
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Initialize React Hook Form
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      role: '',
      lastName: '',
      firstName: '',
      email: '',
      phone: '',
      password: '',
      equipe: '',
      managerId: '',
    },
  });

  // Watch the role field to conditionally show the rest of the form
  const selectedRole = watch('role');

  // Load managers when COMMERCIAL role is selected or on mount
  useEffect(() => {
    async function loadManagers() {
      setLoadingManagers(true);
      try {
        const response = await api.getManagers(token);
        if (response.success) {
          setManagers(response.data);
        }
      } catch (err) {
        console.error('Failed to load managers:', err);
      } finally {
        setLoadingManagers(false);
      }
    }

    if (token) {
      loadManagers();
    }
  }, [token]);

  // Form submission handler
  const onSubmit = async (data) => {
    setSubmitError('');
    setFieldErrors({});
    setSubmitSuccess(false);
    setLoadingSubmit(true);

    try {
      // Prepare request payload
      const payload = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        password: data.password,
        role: data.role,
        equipe: (data.role === 'MANAGER' || data.role === 'COMMERCIAL') ? data.equipe : null,
        managerId: data.role === 'COMMERCIAL' ? Number(data.managerId) : null,
      };

      const response = await api.createUser(payload, token);
      if (response.success) {
        setSubmitSuccess(true);
        // Reset form to default blank values
        reset({
          role: '',
          lastName: '',
          firstName: '',
          email: '',
          phone: '',
          password: '',
          equipe: '',
          managerId: '',
        });
      }
    } catch (error) {
      console.error('Creation error:', error);
      if (error.errors) {
        setFieldErrors(error.errors);
      }
      setSubmitError(error.message || 'Une erreur est survenue lors de la création.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="min-h-screen w-full p-4 md:p-8 bg-slate-950 text-slate-100 font-sans relative overflow-hidden grid-pattern">
      {/* Background ambient glows */}
      <div className="absolute top-[-25%] left-[-15%] w-[70%] h-[70%] rounded-full radial-glow animate-pulse-slow pointer-events-none"></div>
      <div className="absolute bottom-[-25%] right-[-15%] w-[70%] h-[70%] rounded-full radial-glow-purple animate-pulse-slow pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10 space-y-6">
        
        {/* Top Header Dashboard Bar */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 glass-panel rounded-2xl border border-slate-800/60 shadow-xl gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight leading-none">
                SalesTrack Admin
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Espace d'administration et de gestion des accès
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 self-end sm:self-auto">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-white">
                {currentUser?.firstName} {currentUser?.lastName}
              </div>
              <div className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider">
                Rôle : {currentUser?.role}
              </div>
            </div>
            
            {/* Logout button */}
            <button
              onClick={logoutUser}
              className="flex items-center space-x-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-350 border border-red-500/20 rounded-xl text-xs font-bold transition-premium cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Se déconnecter</span>
            </button>
          </div>
        </header>

        {/* Main Form Content */}
        <main className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl space-y-8">
          
          {/* Card title and icon */}
          <div className="flex items-center space-x-4 border-b border-slate-800/80 pb-6">
            <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
              <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Création d'un nouvel utilisateur</h2>
              <p className="text-xs text-slate-400 mt-0.5">Créez un compte pour un administrateur, un manager ou un commercial terrain.</p>
            </div>
          </div>

          {submitError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm space-y-2">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-semibold">{submitError}</span>
              </div>
              {Object.keys(fieldErrors).length > 0 && (
                <ul className="list-disc pl-7 text-xs space-y-0.5 text-red-300">
                  {Object.entries(fieldErrors).map(([key, val]) => (
                    <li key={key}>{val}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Step 1: Rich Card-based Role Selector */}
            <div className="space-y-3">
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider">
                1. Sélectionner le Rôle de l'utilisateur
              </label>
              
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* ADMIN CARD */}
                    <button
                      type="button"
                      onClick={() => field.onChange('ADMIN')}
                      className={`p-5 rounded-2xl border text-left transition-premium flex flex-col justify-between group cursor-pointer h-40 ${
                        field.value === 'ADMIN'
                          ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/5'
                          : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-2 rounded-xl border transition-colors ${
                          field.value === 'ADMIN'
                            ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 group-hover:text-slate-200'
                        }`}>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        {field.value === 'ADMIN' && (
                          <span className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">✓</span>
                        )}
                      </div>
                      <div>
                        <h3 className={`font-bold text-sm ${field.value === 'ADMIN' ? 'text-white' : 'text-slate-350'}`}>ADMIN</h3>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Contrôle complet de la plateforme et gestion de tous les profils.</p>
                      </div>
                    </button>

                    {/* MANAGER CARD */}
                    <button
                      type="button"
                      onClick={() => field.onChange('MANAGER')}
                      className={`p-5 rounded-2xl border text-left transition-premium flex flex-col justify-between group cursor-pointer h-40 ${
                        field.value === 'MANAGER'
                          ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/5'
                          : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-2 rounded-xl border transition-colors ${
                          field.value === 'MANAGER'
                            ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 group-hover:text-slate-200'
                        }`}>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        {field.value === 'MANAGER' && (
                          <span className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white text-[10px] font-bold">✓</span>
                        )}
                      </div>
                      <div>
                        <h3 className={`font-bold text-sm ${field.value === 'MANAGER' ? 'text-white' : 'text-slate-350'}`}>MANAGER</h3>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Supervise et pilote l'activité des commerciaux affectés à son équipe.</p>
                      </div>
                    </button>

                    {/* COMMERCIAL CARD */}
                    <button
                      type="button"
                      onClick={() => field.onChange('COMMERCIAL')}
                      className={`p-5 rounded-2xl border text-left transition-premium flex flex-col justify-between group cursor-pointer h-40 ${
                        field.value === 'COMMERCIAL'
                          ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/5'
                          : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-2 rounded-xl border transition-colors ${
                          field.value === 'COMMERCIAL'
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 group-hover:text-slate-200'
                        }`}>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        {field.value === 'COMMERCIAL' && (
                          <span className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-white text-[10px] font-bold">✓</span>
                        )}
                      </div>
                      <div>
                        <h3 className={`font-bold text-sm ${field.value === 'COMMERCIAL' ? 'text-white' : 'text-slate-350'}`}>COMMERCIAL</h3>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Agent terrain en contact avec les clients pour les commandes et visites.</p>
                      </div>
                    </button>
                  </div>
                )}
              />
              {errors.role && (
                <p className="text-red-400 text-xs mt-1 animate-pulse">{errors.role.message}</p>
              )}
            </div>

            {/* Dynamic Rendering: Show remaining form fields only after Role is selected */}
            {selectedRole && (
              <div className="space-y-6 border-t border-slate-800/60 pt-6 animate-[fadeIn_0.4s_ease-out]">
                
                <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">
                  <span>2. Remplir les informations du profil ({selectedRole})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Prénom */}
                  <div>
                    <label className="block text-slate-400 text-xs font-semibold mb-2" htmlFor="firstName">
                      Prénom *
                    </label>
                    <Controller
                      name="firstName"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="firstName"
                          type="text"
                          placeholder="Jean"
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-premium text-sm"
                        />
                      )}
                    />
                    {errors.firstName && (
                      <p className="text-red-400 text-[11px] mt-1">{errors.firstName.message}</p>
                    )}
                  </div>

                  {/* Nom */}
                  <div>
                    <label className="block text-slate-400 text-xs font-semibold mb-2" htmlFor="lastName">
                      Nom *
                    </label>
                    <Controller
                      name="lastName"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="lastName"
                          type="text"
                          placeholder="Dupont"
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-premium text-sm"
                        />
                      )}
                    />
                    {errors.lastName && (
                      <p className="text-red-400 text-[11px] mt-1">{errors.lastName.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-slate-400 text-xs font-semibold mb-2" htmlFor="email">
                      Adresse Email *
                    </label>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="email"
                          type="email"
                          placeholder="jean.dupont@salestrack.test"
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-premium text-sm"
                        />
                      )}
                    />
                    {errors.email && (
                      <p className="text-red-400 text-[11px] mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-slate-400 text-xs font-semibold mb-2" htmlFor="phone">
                      Téléphone *
                    </label>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="phone"
                          type="text"
                          placeholder="+33612345678"
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-premium text-sm"
                        />
                      )}
                    />
                    {errors.phone && (
                      <p className="text-red-400 text-[11px] mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  {/* Team (equipe) - Shown ONLY for MANAGER and COMMERCIAL */}
                  {(selectedRole === 'MANAGER' || selectedRole === 'COMMERCIAL') && (
                    <div className={selectedRole === 'COMMERCIAL' ? 'col-span-1' : 'col-span-1 sm:col-span-2'}>
                      <label className="block text-slate-400 text-xs font-semibold mb-2" htmlFor="equipe">
                        Nom de l'équipe *
                      </label>
                      <Controller
                        name="equipe"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            id="equipe"
                            type="text"
                            placeholder="ex: Équipe Nord"
                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-premium text-sm"
                          />
                        )}
                      />
                      {errors.equipe && (
                        <p className="text-red-400 text-[11px] mt-1">{errors.equipe.message}</p>
                      )}
                    </div>
                  )}

                  {/* Manager selector - Shown ONLY for COMMERCIAL */}
                  {selectedRole === 'COMMERCIAL' && (
                    <div>
                      <label className="block text-slate-400 text-xs font-semibold mb-2" htmlFor="managerId">
                        Manager rattaché *
                      </label>
                      <Controller
                        name="managerId"
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            id="managerId"
                            disabled={loadingManagers}
                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-premium text-sm cursor-pointer appearance-none"
                          >
                            <option value="" className="bg-slate-950 text-slate-500">Sélectionner un manager</option>
                            {loadingManagers ? (
                              <option disabled className="bg-slate-950">Chargement des managers...</option>
                            ) : managers.length === 0 ? (
                              <option disabled className="bg-slate-950">Aucun manager disponible</option>
                            ) : (
                              managers.map((m) => (
                                <option key={m.id} value={m.id} className="bg-slate-950 text-white">
                                  {m.firstName} {m.lastName} ({m.email})
                                </option>
                              ))
                            )}
                          </select>
                        )}
                      />
                      {errors.managerId && (
                        <p className="text-red-400 text-[11px] mt-1">{errors.managerId.message}</p>
                      )}
                    </div>
                  )}

                  {/* Mot de passe */}
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-slate-400 text-xs font-semibold mb-2" htmlFor="password">
                      Mot de passe *
                    </label>
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-premium text-sm"
                        />
                      )}
                    />
                    {errors.password && (
                      <p className="text-red-400 text-[11px] mt-1">{errors.password.message}</p>
                    )}
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loadingSubmit}
                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.005] transition-premium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loadingSubmit ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Création en cours...</span>
                      </>
                    ) : (
                      <span>Créer l'utilisateur {selectedRole}</span>
                    )}
                  </button>
                </div>

              </div>
            )}
          </form>
        </main>
      </div>

      {/* Custom Success Toast Banner */}
      {submitSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 min-w-[320px] p-4 rounded-xl bg-emerald-500 border border-emerald-400 text-white shadow-xl shadow-emerald-500/10 flex items-center justify-between space-x-4 animate-[bounce_1s_infinite_ease-in-out_1]">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-semibold">L'utilisateur a été créé avec succès !</span>
          </div>
          <button 
            onClick={() => setSubmitSuccess(false)}
            className="text-white hover:text-emerald-100 font-bold text-xs p-1 cursor-pointer"
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  );
}
