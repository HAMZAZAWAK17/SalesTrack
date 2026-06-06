import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';

export default function UserForm({ defaultValues, onSubmit, isEdit = false, loading = false, managers = [] }) {
  const { theme } = useAuth();
  
  // React Hook Form initialization
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors }
  } = useForm({
    defaultValues: {
      role: '',
      lastName: '',
      firstName: '',
      email: '',
      phone: '',
      password: '',
      equipe: '',
      managerId: '',
      ...defaultValues
    }
  });

  // Reset form when default values change (e.g. after edit details load)
  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  // Watch role selection to dynamically render fields
  const watchRole = watch('role');

  const onFormSubmit = (data) => {
    // If managerId is selected, convert it to Number or null
    const payload = {
      ...data,
      managerId: data.managerId ? Number(data.managerId) : null,
      // Pass null for equipe if role is ADMIN
      equipe: data.role === 'ADMIN' ? null : data.equipe
    };
    
    // In edit mode, if password is empty, don't send it to backend
    if (isEdit && !payload.password) {
      delete payload.password;
    }
    
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      
      {/* 1. Rôle Selector Cards */}
      <div className="space-y-3">
        <label className={`block text-[10px] font-extrabold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-650'}`}>
          Choisissez le rôle de l'utilisateur *
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Admin Card */}
          <button
            type="button"
            disabled={isEdit}
            onClick={() => setValue('role', 'ADMIN')}
            className={`p-4 rounded-xl border text-left transition-premium flex flex-col justify-between group relative min-h-[96px] ${
              isEdit ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            } ${
              watchRole === 'ADMIN'
                ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/5'
                : theme === 'dark'
                  ? 'border-slate-850 bg-slate-900/20 hover:border-slate-750 hover:bg-slate-900/40'
                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100/50'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <svg className={`w-5 h-5 ${watchRole === 'ADMIN' ? 'text-indigo-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {watchRole === 'ADMIN' && (
                <span className="w-2 h-2 rounded-full bg-indigo-550 shadow-md"></span>
              )}
            </div>
            <div className="mt-2.5">
              <div className={`text-xs font-bold ${watchRole === 'ADMIN' ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-450'}`}>ADMIN</div>
              <p className="text-[10px] text-slate-500 dark:text-slate-600 mt-0.5 leading-snug">Gestion globale et droits d'administration.</p>
            </div>
          </button>

          {/* Manager Card */}
          <button
            type="button"
            disabled={isEdit}
            onClick={() => setValue('role', 'MANAGER')}
            className={`p-4 rounded-xl border text-left transition-premium flex flex-col justify-between group relative min-h-[96px] ${
              isEdit ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            } ${
              watchRole === 'MANAGER'
                ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/5'
                : theme === 'dark'
                  ? 'border-slate-850 bg-slate-900/20 hover:border-slate-750 hover:bg-slate-900/40'
                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100/50'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <svg className={`w-5 h-5 ${watchRole === 'MANAGER' ? 'text-purple-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {watchRole === 'MANAGER' && (
                <span className="w-2 h-2 rounded-full bg-purple-500 shadow-md"></span>
              )}
            </div>
            <div className="mt-2.5">
              <div className={`text-xs font-bold ${watchRole === 'MANAGER' ? 'text-purple-550 dark:text-purple-400' : 'text-slate-500 dark:text-slate-455'}`}>MANAGER</div>
              <p className="text-[10px] text-slate-500 dark:text-slate-600 mt-0.5 leading-snug">Gestion des équipes et commerciaux.</p>
            </div>
          </button>

          {/* Commercial Card */}
          <button
            type="button"
            disabled={isEdit}
            onClick={() => setValue('role', 'COMMERCIAL')}
            className={`p-4 rounded-xl border text-left transition-premium flex flex-col justify-between group relative min-h-[96px] ${
              isEdit ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            } ${
              watchRole === 'COMMERCIAL'
                ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/5'
                : theme === 'dark'
                  ? 'border-slate-850 bg-slate-900/20 hover:border-slate-750 hover:bg-slate-900/40'
                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100/50'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <svg className={`w-5 h-5 ${watchRole === 'COMMERCIAL' ? 'text-cyan-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {watchRole === 'COMMERCIAL' && (
                <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-md"></span>
              )}
            </div>
            <div className="mt-2.5">
              <div className={`text-xs font-bold ${watchRole === 'COMMERCIAL' ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-455'}`}>COMMERCIAL</div>
              <p className="text-[10px] text-slate-500 dark:text-slate-600 mt-0.5 leading-snug">Saisie des visites et des commandes terrain.</p>
            </div>
          </button>
        </div>
        
        {errors.role && (
          <p className="text-[10px] font-bold text-red-500">{errors.role.message}</p>
        )}
      </div>

      {/* 2. Conditionally reveal input fields once Role is chosen */}
      {watchRole ? (
        <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
          
          {/* Prénom & Nom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={`block text-[10px] font-extrabold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-650'}`}>
                Prénom *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Sophie"
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-premium text-sm ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
                {...register('firstName', { required: "Le prénom est obligatoire." })}
              />
              {errors.firstName && <p className="text-[10px] font-bold text-red-500">{errors.firstName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className={`block text-[10px] font-extrabold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-650'}`}>
                Nom *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Laurent"
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-premium text-sm ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
                {...register('lastName', { required: "Le nom est obligatoire." })}
              />
              {errors.lastName && <p className="text-[10px] font-bold text-red-500">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Email & Téléphone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={`block text-[10px] font-extrabold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-650'}`}>
                Adresse Email *
              </label>
              <input
                type="email"
                required
                placeholder="Ex: sophie@salestrack.test"
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-premium text-sm ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
                {...register('email', {
                  required: "L'email est obligatoire.",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Format d'email invalide."
                  }
                })}
              />
              {errors.email && <p className="text-[10px] font-bold text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className={`block text-[10px] font-extrabold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-650'}`}>
                Téléphone *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: +33612345678"
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-premium text-sm ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
                {...register('phone', { required: "Le téléphone est obligatoire." })}
              />
              {errors.phone && <p className="text-[10px] font-bold text-red-500">{errors.phone.message}</p>}
            </div>
          </div>

          {/* Conditional Fields: Team and Manager */}
          {(watchRole === 'MANAGER' || watchRole === 'COMMERCIAL') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-[fadeIn_0.25s_ease-out]">
              
              {/* Équipe (Required for Manager & Commercial) */}
              <div className={watchRole === 'COMMERCIAL' ? 'col-span-1' : 'col-span-1 sm:col-span-2'}>
                <div className="space-y-1.5">
                  <label className={`block text-[10px] font-extrabold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-650'}`}>
                    Nom de l'équipe *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Équipe Nord"
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-premium text-sm ${
                      theme === 'dark'
                        ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                    {...register('equipe', { required: "Le nom de l'équipe est obligatoire." })}
                  />
                  {errors.equipe && <p className="text-[10px] font-bold text-red-500">{errors.equipe.message}</p>}
                </div>
              </div>

              {/* Manager Dropdown (Required for Commercial ONLY) */}
              {watchRole === 'COMMERCIAL' && (
                <div className="space-y-1.5">
                  <label className={`block text-[10px] font-extrabold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-650'}`}>
                    Manager rattaché *
                  </label>
                  <Controller
                    name="managerId"
                    control={control}
                    rules={{ required: "Le manager est obligatoire pour un commercial." }}
                    render={({ field }) => (
                      <select
                        {...field}
                        className={`w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm cursor-pointer ${
                          theme === 'dark'
                            ? 'bg-slate-950 border-slate-800 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-900 shadow-sm'
                        }`}
                      >
                        <option value="">Sélectionner un manager</option>
                        {managers.map((m) => (
                          <option key={m.id} value={m.id} className={theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50'}>
                            {m.firstName} {m.lastName} ({m.email})
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.managerId && <p className="text-[10px] font-bold text-red-500">{errors.managerId.message}</p>}
                </div>
              )}
            </div>
          )}

          {/* Mot de passe */}
          <div className="space-y-1.5">
            <label className={`block text-[10px] font-extrabold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-650'}`}>
              {isEdit ? "Mot de passe (laisser vide si inchangé)" : "Mot de passe *"}
            </label>
            <input
              type="password"
              placeholder={isEdit ? "••••••••" : "Min. 8 caractères"}
              className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-premium text-sm ${
                theme === 'dark'
                  ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
              {...register('password', {
                required: !isEdit && "Le mot de passe est obligatoire.",
                minLength: {
                  value: 8,
                  message: "Le mot de passe doit contenir au moins 8 caractères."
                }
              })}
            />
            {errors.password && <p className="text-[10px] font-bold text-red-500">{errors.password.message}</p>}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl font-extrabold text-sm shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 hover:scale-[1.01] transition-premium flex items-center justify-center space-x-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Enregistrement...</span>
                </>
              ) : isEdit ? (
                <span>Sauvegarder les modifications</span>
              ) : (
                <span>Créer l'utilisateur {watchRole}</span>
              )}
            </button>
          </div>

        </div>
      ) : (
        /* 3. Role Locked descriptive placeholder state (original business logic: only show Role field first) */
        <div className={`p-8 rounded-2xl border border-dashed text-center space-y-3.5 ${
          theme === 'dark' ? 'border-slate-850 bg-slate-900/10' : 'border-slate-200 bg-slate-50/50'
        }`}>
          <div className={`mx-auto w-12 h-12 rounded-full border flex items-center justify-center ${
            theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-400'
          }`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className={`text-xs font-extrabold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-650'}`}>
            Formulaire verrouillé
          </div>
          <p className="text-xs text-slate-500 max-w-[280px] mx-auto leading-relaxed">
            Veuillez choisir un rôle ci-dessus (ADMIN, MANAGER ou COMMERCIAL) pour afficher et remplir les informations du profil.
          </p>
        </div>
      )}

    </form>
  );
}
