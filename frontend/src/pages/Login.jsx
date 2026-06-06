import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Complete translations for French and English
const translations = {
  fr: {
    connexion: "Connexion",
    loginSubtitle: "Sélectionnez votre rôle pour déverrouiller et saisir vos identifiants.",
    roleLabel: "1. Choisissez votre rôle",
    emailLabel: "2. Adresse Email",
    passwordLabel: "Mot de passe",
    placeholderEmail: "email@exemple.com",
    placeholderPassword: "••••••••",
    btnConnect: "Se connecter",
    connecting: "Connexion en cours...",
    lockedForm: "Formulaire verrouillé",
    lockedDesc: "Sélectionnez ADMIN, MANAGER ou COMMERCIAL ci-dessus pour déverrouiller les champs et vous connecter.",
    noAccount: "Pas encore de compte ?",
    hasAccount: "Déjà un compte ?",
    signup: "S'inscrire",
    signupTitle: "Inscription",
    signupSubtitle: "Créez votre compte SalesTrack en remplissant le formulaire.",
    firstName: "Prénom *",
    lastName: "Nom *",
    phone: "Téléphone *",
    roleFormLabel: "Rôle de l'utilisateur *",
    teamName: "Nom de l'équipe *",
    managerLabel: "Manager rattaché *",
    btnSignup: "Créer un compte",
    signingUp: "Création en cours...",
    signupSuccess: "Votre demande d'inscription a été transmise à l'administrateur pour validation.",
    adminRole: "ADMIN",
    managerRole: "MANAGER",
    commercialRole: "COMMERCIAL",
    selectRoleOption: "Choisir un rôle...",
    selectManager: "Sélectionner un manager",
    slogan: "Optimisez vos ventes terrain",
    desc: "SalesTrack centralise vos visites, planifie vos rendez-vous, gère vos commandes clients et suit vos performances commerciales en temps réel.",
    solution: "Solution Professionnelle",
    secured: "Sécurisée JWT",
    copyright: "© 2026 SalesTrack",
    appType: "Application Terrain",
    testCredentialsLabel: "Identifiants de test : "
  },
  en: {
    connexion: "Sign In",
    loginSubtitle: "Select your role to unlock and enter your credentials.",
    roleLabel: "1. Choose your role",
    emailLabel: "2. Email Address",
    passwordLabel: "Password",
    placeholderEmail: "email@example.com",
    placeholderPassword: "••••••••",
    btnConnect: "Sign In",
    connecting: "Signing In...",
    lockedForm: "Form Locked",
    lockedDesc: "Select ADMIN, MANAGER, or COMMERCIAL above to unlock fields and sign in.",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    signup: "Sign Up",
    signupTitle: "Register",
    signupSubtitle: "Fill in the form to create your SalesTrack account.",
    firstName: "First Name *",
    lastName: "Last Name *",
    phone: "Phone Number *",
    roleFormLabel: "User Role *",
    teamName: "Team Name *",
    managerLabel: "Assigned Manager *",
    btnSignup: "Register Account",
    signingUp: "Registering...",
    signupSuccess: "Your registration request has been sent to the administrator for approval.",
    adminRole: "ADMIN",
    managerRole: "MANAGER",
    commercialRole: "COMMERCIAL",
    selectRoleOption: "Select a role...",
    selectManager: "Select a manager",
    slogan: "Optimize your field sales",
    desc: "SalesTrack centralizes visits, schedules client meetings, manages sales orders, and tracks performance in real-time.",
    solution: "Professional Solution",
    secured: "JWT Secured",
    copyright: "© 2026 SalesTrack",
    appType: "Field Application",
    testCredentialsLabel: "Test credentials: "
  }
};

export default function Login() {
  const { loginUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null);
  
  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Custom Interface States
  const [isSignup, setIsSignup] = useState(false);
  const [lang, setLang] = useState('fr');
  const [theme, setTheme] = useState('dark');
  
  // Signup Form States
  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    equipe: '',
    managerId: ''
  });
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const t = translations[lang];

  // Login handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginUser(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
    }
  };

  // Mock Signup Submit handler
  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Quick validation
    if (!selectedRole) {
      setError(lang === 'fr' ? 'Veuillez sélectionner un rôle.' : 'Please select a role.');
      return;
    }

    if (!signupForm.firstName || !signupForm.lastName || !signupForm.email || !signupForm.phone || !signupForm.password) {
      setError(lang === 'fr' ? 'Veuillez remplir tous les champs obligatoires.' : 'Please fill all required fields.');
      return;
    }
    
    if ((selectedRole === 'MANAGER' || selectedRole === 'COMMERCIAL') && !signupForm.equipe) {
      setError(lang === 'fr' ? "Le nom de l'équipe est obligatoire." : 'Team name is required.');
      return;
    }

    if (selectedRole === 'COMMERCIAL' && !signupForm.managerId) {
      setError(lang === 'fr' ? 'Le manager rattaché est obligatoire.' : 'Assigned manager is required.');
      return;
    }

    setSignupLoading(true);
    
    // Simulate API registration request delay
    setTimeout(() => {
      setSignupLoading(false);
      setSignupSuccess(true);
      // Reset signup form fields
      setSignupForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        equipe: '',
        managerId: ''
      });
      // Switch back to login page after brief success notification display
      setTimeout(() => {
        setIsSignup(false);
        setSignupSuccess(false);
        setSelectedRole(null);
      }, 5000);
    }, 1200);
  };

  // Restored Test account auto pre-filling!
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
    
    if (role === 'ADMIN') {
      setEmail('admin@salestrack.test');
      setPassword('Admin1234!');
    } else if (role === 'MANAGER') {
      setEmail('manager@salestrack.test');
      setPassword('Manager1234!');
    } else if (role === 'COMMERCIAL') {
      setEmail('commercial1@salestrack.test');
      setPassword('Commercial1234!');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const getTestCredentialsText = () => {
    if (selectedRole === 'ADMIN') {
      return 'admin@salestrack.test / Admin1234!';
    }
    if (selectedRole === 'MANAGER') {
      return 'manager@salestrack.test / Manager1234!';
    }
    if (selectedRole === 'COMMERCIAL') {
      return 'commercial1@salestrack.test / Commercial1234!';
    }
    return '';
  };

  const toggleLanguage = () => {
    setLang(lang === 'fr' ? 'en' : 'fr');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSignupChange = (e) => {
    setSignupForm({
      ...signupForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSwitchMode = () => {
    setIsSignup(!isSignup);
    setSelectedRole(null);
    setError('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 md:p-8 relative overflow-hidden transition-colors duration-300 font-sans ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100 grid-pattern' : 'bg-slate-50 text-slate-800 grid-pattern-light'
    }`}>
      {/* Background ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full radial-glow animate-pulse-slow pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full radial-glow-purple animate-pulse-slow pointer-events-none"></div>

      {/* Main card container */}
      <div className={`w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[640px] relative z-10 transition-all duration-300 border ${
        theme === 'dark' ? 'glass-panel border-slate-800' : 'bg-white/80 backdrop-blur-md border-slate-200'
      }`}>
        
        {/* Left Side: Brand Showcase (Desktop only) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-12 flex-col justify-between relative overflow-hidden border-r border-slate-800/50 text-slate-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(99,102,241,0.08)_0%,transparent_70%)]"></div>
          
          {/* Logo & Brand Name */}
          <div className="flex items-center space-x-3 relative z-10">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/5">
              <svg className="w-6 h-6 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="18.7" cy="8" r="1.5" fill="currentColor"/>
              </svg>
            </div>
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              SalesTrack
            </span>
          </div>

          {/* Graphic Area */}
          <div className="my-8 flex justify-center items-center relative z-10 select-none">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <div className="absolute w-full h-full rounded-full border border-indigo-500/10 animate-[spin_20s_linear_infinite]"></div>
              <div className="absolute w-[80%] h-[80%] rounded-full border border-purple-500/10 animate-[spin_15s_linear_infinite_reverse]"></div>
              
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-xl shadow-indigo-500/25 flex items-center justify-center animate-float">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <svg className="w-10 h-10 text-indigo-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>

              <div className="absolute top-4 right-10 p-2 bg-slate-900 border border-slate-800 rounded-xl shadow-lg animate-float-delay">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>

              <div className="absolute bottom-6 left-6 p-2 bg-slate-900 border border-slate-800 rounded-xl shadow-lg animate-float">
                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
            </div>
          </div>

          {/* Slogan */}
          <div className="space-y-4 relative z-10">
            <h3 className="text-xl font-bold text-white">{t.slogan}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{t.desc}</p>
            <div className="pt-2 flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
              <span>{t.solution}</span>
              <span>•</span>
              <span>{t.secured}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form & Controls */}
        <div className={`w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-between backdrop-blur-md relative z-10 transition-colors duration-300 ${
          theme === 'dark' ? 'bg-slate-900/40' : 'bg-slate-50/20'
        }`}>
          
          {/* Top Bar controls (Language Switcher, Theme Switcher) */}
          <div className="flex items-center justify-between mb-6">
            {/* Mobile logo */}
            <div className="flex items-center space-x-2 md:hidden">
              <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className={`text-md font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>SalesTrack</span>
            </div>
            
            {/* Top Right Controls Group */}
            <div className="flex items-center space-x-2 ml-auto">
              {/* Language Switch Button */}
              <button
                onClick={toggleLanguage}
                className={`px-3 py-1.5 text-xs font-extrabold rounded-lg border transition-premium cursor-pointer ${
                  theme === 'dark'
                    ? 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-indigo-400'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-indigo-600 shadow-sm'
                }`}
              >
                {lang === 'fr' ? 'EN' : 'FR'}
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className={`p-1.5 rounded-lg border transition-premium cursor-pointer ${
                  theme === 'dark'
                    ? 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-yellow-400'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm'
                }`}
              >
                {theme === 'dark' ? (
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
                  </svg>
                ) : (
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Login or Register Form Area */}
          {!isSignup ? (
            /* ==================== LOGIN VIEW ==================== */
            <div className="flex-grow flex flex-col justify-center space-y-6">
              
              {/* Header */}
              <div>
                <h2 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {t.connexion}
                </h2>
                <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t.loginSubtitle}
                </p>
              </div>

              {/* Step 1: Role Selection Cards */}
              <div className="space-y-3">
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                  {t.roleLabel}
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Admin Card */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('ADMIN')}
                    className={`p-3 rounded-xl border text-left transition-premium flex flex-col justify-between group cursor-pointer relative h-20 ${
                      selectedRole === 'ADMIN'
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/5'
                        : theme === 'dark'
                          ? 'border-slate-850 bg-slate-950/40 hover:border-slate-750 hover:bg-slate-900/10'
                          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100/50 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <svg className={`w-4 h-4 ${selectedRole === 'ADMIN' ? 'text-indigo-400' : theme === 'dark' ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      {selectedRole === 'ADMIN' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      )}
                    </div>
                    <span className={`text-[10px] font-extrabold ${selectedRole === 'ADMIN' ? (theme === 'dark' ? 'text-white' : 'text-indigo-700') : 'text-slate-500 group-hover:text-slate-800'}`}>ADMIN</span>
                  </button>

                  {/* Manager Card */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('MANAGER')}
                    className={`p-3 rounded-xl border text-left transition-premium flex flex-col justify-between group cursor-pointer relative h-20 ${
                      selectedRole === 'MANAGER'
                        ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/5'
                        : theme === 'dark'
                          ? 'border-slate-850 bg-slate-950/40 hover:border-slate-750 hover:bg-slate-900/10'
                          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100/50 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <svg className={`w-4 h-4 ${selectedRole === 'MANAGER' ? 'text-purple-400' : theme === 'dark' ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {selectedRole === 'MANAGER' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-550"></span>
                      )}
                    </div>
                    <span className={`text-[10px] font-extrabold ${selectedRole === 'MANAGER' ? (theme === 'dark' ? 'text-white' : 'text-purple-700') : 'text-slate-500 group-hover:text-slate-800'}`}>MANAGER</span>
                  </button>

                  {/* Commercial Card */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('COMMERCIAL')}
                    className={`p-3 rounded-xl border text-left transition-premium flex flex-col justify-between group cursor-pointer relative h-20 ${
                      selectedRole === 'COMMERCIAL'
                        ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/5'
                        : theme === 'dark'
                          ? 'border-slate-850 bg-slate-950/40 hover:border-slate-750 hover:bg-slate-900/10'
                          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100/50 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <svg className={`w-4 h-4 ${selectedRole === 'COMMERCIAL' ? 'text-cyan-400' : theme === 'dark' ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {selectedRole === 'COMMERCIAL' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                      )}
                    </div>
                    <span className={`text-[10px] font-extrabold ${selectedRole === 'COMMERCIAL' ? (theme === 'dark' ? 'text-white' : 'text-cyan-700') : 'text-slate-500 group-hover:text-slate-800'}`}>SALES REP</span>
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-200 text-sm flex items-start space-x-2 animate-[shake_0.4s_ease-in-out]">
                  <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Step 2: Show inputs only after role is selected */}
              {selectedRole ? (
                <form onSubmit={handleSubmit} className="space-y-4 animate-[fadeIn_0.35s_ease-out]">
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-slate-350' : 'text-slate-655'}`} htmlFor="email">
                      {t.emailLabel}
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                        </svg>
                      </span>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder={t.placeholderEmail}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-premium text-sm ${
                          theme === 'dark'
                            ? 'bg-slate-900/50 border-slate-800 text-white placeholder-slate-550'
                            : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 shadow-inner'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-slate-355' : 'text-slate-655'}`} htmlFor="password">
                      {t.passwordLabel}
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder={t.placeholderPassword}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pl-11 pr-11 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-premium text-sm ${
                          theme === 'dark'
                            ? 'bg-slate-900/50 border-slate-800 text-white placeholder-slate-550'
                            : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 shadow-inner'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-indigo-400 transition-colors"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Refilled credentials info label for help */}
                  <div className="mt-2 text-[10px] text-slate-500 font-semibold leading-relaxed animate-[fadeIn_0.3s_ease-out]">
                    <span>{t.testCredentialsLabel}</span>
                    <code className="text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded ml-1 border border-indigo-500/10">
                      {getTestCredentialsText()}
                    </code>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.01] transition-premium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>{t.connecting}</span>
                      </>
                    ) : (
                      <span>{t.btnConnect}</span>
                    )}
                  </button>
                </form>
              ) : (
                /* Locked Form state */
                <div className={`py-12 px-4 rounded-2xl border border-dashed text-center space-y-3 animate-[pulse_3s_infinite_ease-in-out] ${
                  theme === 'dark' ? 'border-slate-800' : 'border-slate-300'
                }`}>
                  <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-slate-950 border-slate-850 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {t.lockedForm}
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-[240px] mx-auto leading-relaxed">
                    {t.lockedDesc}
                  </p>
                </div>
              )}
              
              {/* Bottom Switch Trigger to Signup */}
              <div className="text-center pt-2 text-xs">
                <span className={theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}>{t.noAccount} </span>
                <button
                  onClick={handleSwitchMode}
                  className="font-extrabold text-indigo-500 hover:text-indigo-400 cursor-pointer"
                >
                  {t.signup}
                </button>
              </div>

            </div>
          ) : (
            /* ==================== SIGNUP VIEW ==================== */
            <div className="flex-grow flex flex-col justify-center space-y-4">
              
              {/* Header */}
              <div>
                <h2 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {t.signupTitle}
                </h2>
                <p className={`text-xs mt-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t.signupSubtitle}
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-200 text-xs flex items-start space-x-2 animate-[shake_0.4s_ease-in-out]">
                  <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Form is unlocked and always shown directly on signup */}
              <form onSubmit={handleSignupSubmit} className="space-y-3 animate-[fadeIn_0.35s_ease-out] overflow-y-auto max-h-[380px] pr-1">
                
                {/* Role field selection INSIDE the form */}
                <div>
                  <label className="block text-slate-405 text-[10px] font-bold uppercase tracking-wider mb-1">
                    {t.roleFormLabel}
                  </label>
                  <select
                    name="role"
                    required
                    value={selectedRole || ''}
                    onChange={(e) => setSelectedRole(e.target.value || null)}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 text-xs cursor-pointer ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900 shadow-sm'
                    }`}
                  >
                    <option value="">{t.selectRoleOption}</option>
                    <option value="ADMIN" className={theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50'}>{t.adminRole}</option>
                    <option value="MANAGER" className={theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50'}>{t.managerRole}</option>
                    <option value="COMMERCIAL" className={theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50'}>{t.commercialRole}</option>
                  </select>
                </div>

                {/* Grid fields for Nom / Prenom */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[10px] font-semibold mb-1">{t.firstName}</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={signupForm.firstName}
                      onChange={handleSignupChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 text-xs ${
                        theme === 'dark' ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-semibold mb-1">{t.lastName}</label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={signupForm.lastName}
                      onChange={handleSignupChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 text-xs ${
                        theme === 'dark' ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[10px] font-semibold mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={signupForm.email}
                      onChange={handleSignupChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 text-xs ${
                        theme === 'dark' ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-semibold mb-1">{t.phone}</label>
                    <input
                      type="text"
                      name="phone"
                      required
                      placeholder="+33612345678"
                      value={signupForm.phone}
                      onChange={handleSignupChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 text-xs ${
                        theme === 'dark' ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-slate-400 text-[10px] font-semibold mb-1">{t.passwordLabel} *</label>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="min. 6 chars"
                    value={signupForm.password}
                    onChange={handleSignupChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 text-xs ${
                      theme === 'dark' ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                {/* Team & Manager (Conditional on Role selected in dropdown) */}
                {(selectedRole === 'MANAGER' || selectedRole === 'COMMERCIAL') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 animate-[fadeIn_0.25s_ease-out]">
                    <div className={selectedRole === 'COMMERCIAL' ? 'col-span-1' : 'col-span-1 sm:col-span-2'}>
                      <label className="block text-slate-400 text-[10px] font-semibold mb-1">{t.teamName}</label>
                      <input
                        type="text"
                        name="equipe"
                        required
                        placeholder="ex: Team Nord"
                        value={signupForm.equipe}
                        onChange={handleSignupChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 text-xs ${
                          theme === 'dark' ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>

                    {/* Mock Manager Selection */}
                    {selectedRole === 'COMMERCIAL' && (
                      <div>
                        <label className="block text-slate-400 text-[10px] font-semibold mb-1">{t.managerLabel}</label>
                        <select
                          name="managerId"
                          required
                          value={signupForm.managerId}
                          onChange={handleSignupChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 text-xs cursor-pointer ${
                            theme === 'dark' ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        >
                          <option value="">{t.selectManager}</option>
                          <option value="1" className={theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50'}>Sophie Laurent (Manager Nord)</option>
                          <option value="2" className={theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50'}>Marc Dubois (Manager IDF)</option>
                          <option value="3" className={theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50'}>Antoine Martin (Manager Sud)</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={signupLoading}
                  className="w-full py-2.5 px-4 mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/15 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {signupLoading ? (
                    <span>{t.signingUp}</span>
                  ) : (
                    <span>{t.btnSignup}</span>
                  )}
                </button>

              </form>

              {/* Bottom switch trigger to Login */}
              <div className="text-center pt-2 text-xs">
                <span className={theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}>{t.hasAccount} </span>
                <button
                  onClick={handleSwitchMode}
                  className="font-extrabold text-indigo-500 hover:text-indigo-400 cursor-pointer"
                >
                  {t.connexion}
                </button>
              </div>

            </div>
          )}

          {/* Footer branding */}
          <div className="mt-6 text-center md:text-left text-[10px] text-slate-550 flex items-center justify-center md:justify-start space-x-2">
            <span>{t.copyright}</span>
            <span>•</span>
            <span>{t.appType}</span>
          </div>

        </div>

      </div>

      {/* Custom success notification banner for Signup simulation */}
      {signupSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-sm p-4 rounded-xl bg-emerald-500 border border-emerald-400 text-white shadow-xl flex items-start space-x-3 animate-[bounce_1s_infinite_ease-in-out_1]">
          <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-xs">
            <p className="font-bold">{lang === 'fr' ? 'Inscription Transmise' : 'Registration Submitted'}</p>
            <p className="mt-1 opacity-90">{t.signupSuccess}</p>
          </div>
        </div>
      )}

    </div>
  );
}
