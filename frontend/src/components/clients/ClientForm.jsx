import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';

// ─── SVG Icon helpers ──────────────────────────────────────────────────────────
const Icon = ({ path, className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const ICONS = {
  code:     'M7 20l4-16m2 16l4-16M6 9h14M4 15h14',
  building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  phone:    'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  email:    'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  address:  'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
  city:     'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  channel:  'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
  category: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
  status:   'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
  user:     'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  notes:    'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  lock:     'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  spinner:  'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z',
};

// ─── Reusable field components ─────────────────────────────────────────────────
function FieldLabel({ icon, label, required, theme }) {
  return (
    <label className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1.5 ${
      theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
    }`}>
      <Icon path={icon} className="w-3.5 h-3.5" />
      {label}{required && <span className="text-indigo-400 ml-0.5">*</span>}
    </label>
  );
}

function InputField({ label, icon, required, error, theme, children, hint }) {
  return (
    <div className="flex flex-col">
      <FieldLabel icon={icon} label={label} required={required} theme={theme} />
      {children}
      {error && (
        <span className="mt-1 text-xs font-semibold text-red-400 flex items-center gap-1">
          <Icon path="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </span>
      )}
      {hint && !error && (
        <span className={`mt-1 text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{hint}</span>
      )}
    </div>
  );
}

function StyledInput({ theme, error, disabled, ...props }) {
  return (
    <input
      className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-medium outline-none transition-all duration-200 border ${
        disabled
          ? theme === 'dark'
            ? 'bg-slate-800/40 border-slate-700/50 text-slate-500 cursor-not-allowed'
            : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
          : error
          ? 'border-red-500/60 bg-red-500/5 focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
          : theme === 'dark'
          ? 'bg-slate-800/60 border-slate-700/60 text-slate-100 placeholder-slate-500 focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 focus:bg-slate-800'
          : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 shadow-sm'
      }`}
      disabled={disabled}
      {...props}
    />
  );
}

function StyledSelect({ theme, error, disabled, children, ...props }) {
  return (
    <select
      className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-medium outline-none transition-all duration-200 border appearance-none cursor-pointer ${
        disabled
          ? theme === 'dark'
            ? 'bg-slate-800/40 border-slate-700/50 text-slate-500 cursor-not-allowed'
            : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
          : error
          ? 'border-red-500/60 bg-red-500/5 focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
          : theme === 'dark'
          ? 'bg-slate-800/60 border-slate-700/60 text-slate-100 focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 focus:bg-slate-800'
          : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 shadow-sm'
      }`}
      disabled={disabled}
      {...props}
    >
      {children}
    </select>
  );
}

function SectionHeader({ icon, title, subtitle, theme }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-indigo-50 border border-indigo-100'}`}>
        <Icon path={icon} className="w-4 h-4 text-indigo-400" />
      </div>
      <div>
        <h3 className={`text-sm font-extrabold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{title}</h3>
        {subtitle && <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{subtitle}</p>}
      </div>
    </div>
  );
}

function FormSection({ children, theme }) {
  return (
    <div className={`rounded-2xl p-5 border ${
      theme === 'dark'
        ? 'bg-slate-800/30 border-slate-700/40'
        : 'bg-slate-50/80 border-slate-200/80'
    }`}>
      {children}
    </div>
  );
}

// ─── Main Form ─────────────────────────────────────────────────────────────────
export default function ClientForm({
  defaultValues,
  onSubmit,
  isEdit = false,
  loading = false,
  commercials = []
}) {
  const { user, theme } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm({
    defaultValues: {
      code: '',
      companyName: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      distributionChannel: 'ON_TRADE',
      category: 'OTHER',
      status: 'PROSPECT',
      assignedTo: '',
      notes: '',
      ...defaultValues
    }
  });

  useEffect(() => {
    if (defaultValues) reset(defaultValues);
  }, [defaultValues, reset]);

  const selectArrow = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

      {/* ── Section 1: Identité ──────────────────────────────────────────── */}
      <FormSection theme={theme}>
        <SectionHeader
          icon={ICONS.building}
          title="Identité du client"
          subtitle="Informations d'identification de l'entreprise"
          theme={theme}
        />
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          {/* Code Client */}
          <div className="sm:col-span-4">
            <InputField label="Code client" icon={ICONS.code} required error={errors.code?.message} theme={theme}
              hint={isEdit && !isAdmin ? 'Modification réservée à l\'Admin' : undefined}>
              <div className="relative">
                <StyledInput
                  theme={theme}
                  error={!!errors.code}
                  disabled={isEdit && !isAdmin}
                  placeholder="Ex: CL001"
                  {...register('code', { required: 'Le code client est obligatoire.' })}
                />
                {isEdit && !isAdmin && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Icon path={ICONS.lock} className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                )}
              </div>
            </InputField>
          </div>

          {/* Nom de l'entreprise */}
          <div className="sm:col-span-8">
            <InputField label="Nom de l'entreprise" icon={ICONS.building} required error={errors.companyName?.message} theme={theme}>
              <StyledInput
                theme={theme}
                error={!!errors.companyName}
                placeholder="Ex: Café de la Gare, Hôtel Bristol..."
                {...register('companyName', { required: 'Le nom est obligatoire.' })}
              />
            </InputField>
          </div>
        </div>
      </FormSection>

      {/* ── Section 2: Coordonnées ───────────────────────────────────────── */}
      <FormSection theme={theme}>
        <SectionHeader
          icon={ICONS.phone}
          title="Coordonnées"
          subtitle="Informations de contact et localisation"
          theme={theme}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Téléphone */}
          <InputField label="Téléphone" icon={ICONS.phone} required error={errors.phone?.message} theme={theme}>
            <StyledInput
              theme={theme}
              error={!!errors.phone}
              placeholder="Ex: 0142345678"
              type="tel"
              {...register('phone', { required: 'Le numéro de téléphone est obligatoire.' })}
            />
          </InputField>

          {/* Email */}
          <InputField label="Adresse email" icon={ICONS.email} required error={errors.email?.message} theme={theme}>
            <StyledInput
              theme={theme}
              error={!!errors.email}
              placeholder="Ex: contact@entreprise.com"
              type="email"
              {...register('email', {
                required: "L'email est obligatoire.",
                pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Format d'email invalide." }
              })}
            />
          </InputField>

          {/* Adresse */}
          <InputField label="Adresse" icon={ICONS.address} required error={errors.address?.message} theme={theme}>
            <StyledInput
              theme={theme}
              error={!!errors.address}
              placeholder="Ex: 12 Rue de la Paix"
              {...register('address', { required: "L'adresse est obligatoire." })}
            />
          </InputField>

          {/* Ville */}
          <InputField label="Ville" icon={ICONS.city} required error={errors.city?.message} theme={theme}>
            <StyledInput
              theme={theme}
              error={!!errors.city}
              placeholder="Ex: Lille, Paris, Lyon..."
              {...register('city', { required: 'La ville est obligatoire.' })}
            />
          </InputField>
        </div>
      </FormSection>

      {/* ── Section 3: Classification ────────────────────────────────────── */}
      <FormSection theme={theme}>
        <SectionHeader
          icon={ICONS.category}
          title="Classification commerciale"
          subtitle="Canal de distribution, catégorie et statut du compte"
          theme={theme}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Canal de Distribution */}
          <InputField label="Canal de distribution" icon={ICONS.channel} required error={errors.distributionChannel?.message} theme={theme}>
            <Controller
              name="distributionChannel"
              control={control}
              rules={{ required: 'Le canal est obligatoire.' }}
              render={({ field }) => (
                <div className="relative">
                  <StyledSelect theme={theme} error={!!errors.distributionChannel}
                    style={{ backgroundImage: selectArrow, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px', paddingRight: '36px' }}
                    {...field}>
                    <option value="ON_TRADE">🏪 On Trade — CHR / Place</option>
                    <option value="OFF_TRADE">🛒 Off Trade — À emporter</option>
                  </StyledSelect>
                </div>
              )}
            />
          </InputField>

          {/* Catégorie */}
          <InputField label="Catégorie" icon={ICONS.category} required error={errors.category?.message} theme={theme}>
            <Controller
              name="category"
              control={control}
              rules={{ required: 'La catégorie est obligatoire.' }}
              render={({ field }) => (
                <StyledSelect theme={theme} error={!!errors.category}
                  style={{ backgroundImage: selectArrow, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px', paddingRight: '36px' }}
                  {...field}>
                  <option value="HOTEL">🏨 Hôtel</option>
                  <option value="RESTAURANT">🍽️ Restaurant</option>
                  <option value="CAFE">☕ Café / Bar</option>
                  <option value="GROCERY">🧺 Épicerie</option>
                  <option value="SUPERMARKET">🏬 Supermarché / GMS</option>
                  <option value="TRADITIONAL">🏘️ Traditionnel</option>
                  <option value="OTHER">📦 Autre</option>
                </StyledSelect>
              )}
            />
          </InputField>

          {/* Statut */}
          <InputField label="Statut du compte" icon={ICONS.status} required error={errors.status?.message} theme={theme}>
            <Controller
              name="status"
              control={control}
              rules={{ required: 'Le statut est obligatoire.' }}
              render={({ field }) => (
                <StyledSelect theme={theme} error={!!errors.status}
                  style={{ backgroundImage: selectArrow, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px', paddingRight: '36px' }}
                  {...field}>
                  <option value="ACTIVE">✅ Actif</option>
                  <option value="PROSPECT">🔍 Prospect</option>
                  <option value="INACTIVE">⛔ Inactif</option>
                </StyledSelect>
              )}
            />
          </InputField>
        </div>
      </FormSection>

      {/* ── Section 4: Affectation (only for admin / manager with commercials list) ── */}
      {(isAdmin || (!isEdit && commercials.length > 0)) && (
        <FormSection theme={theme}>
          <SectionHeader
            icon={ICONS.user}
            title="Affectation commerciale"
            subtitle="Commercial responsable de ce compte client"
            theme={theme}
          />
          <InputField label="Commercial affecté" icon={ICONS.user} required error={errors.assignedTo?.message} theme={theme}>
            <Controller
              name="assignedTo"
              control={control}
              rules={{ required: "L'affectation à un commercial est obligatoire." }}
              render={({ field }) => (
                <StyledSelect theme={theme} error={!!errors.assignedTo}
                  disabled={isEdit && !isAdmin}
                  style={{ backgroundImage: selectArrow, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px', paddingRight: '36px' }}
                  {...field}
                  value={field.value ?? ''}
                  onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}>
                  <option value="">— Sélectionner un commercial —</option>
                  {commercials.map((comm) => (
                    <option key={comm.id} value={comm.id}>
                      {comm.firstName} {comm.lastName}
                      {comm.equipe ? ` · ${comm.equipe}` : ''}
                    </option>
                  ))}
                </StyledSelect>
              )}
            />
          </InputField>
        </FormSection>
      )}

      {/* ── Section 5: Notes ─────────────────────────────────────────────── */}
      <FormSection theme={theme}>
        <SectionHeader
          icon={ICONS.notes}
          title="Notes internes"
          subtitle="Informations complémentaires visibles par l'équipe uniquement"
          theme={theme}
        />
        <InputField label="Commentaires & notes" icon={ICONS.notes} theme={theme}>
          <textarea
            rows={3}
            placeholder="Saisissez des notes, remarques ou informations particulières sur ce client..."
            className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-medium outline-none transition-all duration-200 border resize-none ${
              theme === 'dark'
                ? 'bg-slate-800/60 border-slate-700/60 text-slate-100 placeholder-slate-500 focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 focus:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 shadow-sm'
            }`}
            {...register('notes')}
          />
        </InputField>
      </FormSection>

      {/* ── Submit Button ─────────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl font-extrabold text-sm text-white transition-all duration-200 ${
          loading
            ? 'opacity-60 cursor-not-allowed bg-indigo-600'
            : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0'
        }`}
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d={ICONS.spinner} />
            </svg>
            Enregistrement en cours...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={isEdit
                ? 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                : 'M12 4v16m8-8H4'
              } />
            </svg>
            {isEdit ? 'Enregistrer les modifications' : 'Créer le compte client'}
          </>
        )}
      </button>

    </form>
  );
}
