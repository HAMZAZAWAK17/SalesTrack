import toast from 'react-hot-toast';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import UserTable from '../../components/users/UserTable';
import * as api from '../../services/api';

export default function UserList() {
  const navigate = useNavigate();
  const { user: currentUser, logoutUser, theme, toggleTheme } = useAuth();

  // Search & filter states
  const [nameSearch, setNameSearch] = useState('');
  const [emailSearch, setEmailSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Pagination states (0-indexed page)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Data states
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);

  // Feedback states (Toast alerts)
  
  // Load user data from server (memoized with useCallback)
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getUsers({
        name: nameSearch,
        email: emailSearch,
        role: roleFilter,
        page: page + 1, // Convert 0-indexed page to 1-indexed for backend API
        limit: rowsPerPage
      });
      if (response.success) {
        setUsers(response.data.users);
        setTotalUsers(response.data.total);
      }
    } catch (error) {
      toast.error(error.message || 'Erreur de chargement des utilisateurs. Le serveur est-il actif ?');
    } finally {
      setLoading(false);
    }
  }, [nameSearch, emailSearch, roleFilter, page, rowsPerPage]);

  // Fetch users when parameters change
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Reset filter inputs
  const handleClearFilters = () => {
    setNameSearch('');
    setEmailSearch('');
    setRoleFilter('');
    setPage(0);
  };

  // Pagination change handlers
  const handlePrevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if ((page + 1) * rowsPerPage < totalUsers) {
      setPage(page + 1);
    }
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // User Actions handlers
  const handleViewDetails = (id) => {
    navigate(`/users/${id}`);
  };

  const handleEditUser = (id) => {
    navigate(`/users/edit/${id}`);
  };

  const handleDeleteUser = async (id) => {
    try {
      const response = await api.deleteUser(id);
      if (response.success) {
        toast.success('Utilisateur supprimé avec succès !');
        // Reload list, resetting page to 0 if current list becomes empty
        if (users.length === 1 && page > 0) {
          setPage(page - 1);
        } else {
          loadUsers();
        }
      }
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la suppression.');
    }
  };

  );
  };

  // Calculate displayed range text
  const fromRecord = totalUsers === 0 ? 0 : page * rowsPerPage + 1;
  const toRecord = Math.min((page + 1) * rowsPerPage, totalUsers);

  return (
    <div className={`min-h-screen w-full p-4 md:p-8 relative overflow-hidden transition-colors duration-300 font-sans ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100 grid-pattern' : 'bg-slate-50 text-slate-800 grid-pattern-light'
    }`}>
      {/* Background ambient glows */}
      <div className="absolute top-[-25%] left-[-15%] w-[70%] h-[70%] rounded-full radial-glow animate-pulse-slow pointer-events-none"></div>
      <div className="absolute bottom-[-25%] right-[-15%] w-[70%] h-[70%] rounded-full radial-glow-purple animate-pulse-slow pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-6">
        
        {/* Top Header Dashboard Bar */}
        <header className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 rounded-2xl border transition-premium shadow-xl gap-4 ${
          theme === 'dark' ? 'glass-panel border-slate-800/60' : 'bg-white/90 border-slate-200 shadow-slate-100'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/5">
              <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-300 bg-clip-text text-transparent">
                SalesTrack
              </span>
              <span className={`text-[10px] block font-extrabold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                Administration
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 ml-auto sm:ml-0">
            <div className="text-right hidden xs:block mr-2">
              <div className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                {currentUser?.firstName} {currentUser?.lastName}
              </div>
              <div className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">
                {currentUser?.role}
              </div>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className={`p-2 rounded-xl border transition-premium cursor-pointer ${
                theme === 'dark'
                  ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-yellow-400'
                  : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-600 shadow-sm'
              }`}
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            {/* Logout Button */}
            <button
              onClick={logoutUser}
              className={`px-4 py-2.5 border hover:bg-red-500/10 text-xs font-bold rounded-xl transition-premium cursor-pointer flex items-center space-x-2 ${
                theme === 'dark'
                  ? 'border-slate-850 bg-slate-900/40 text-red-400'
                  : 'border-red-200 bg-white text-red-650 shadow-sm'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Se déconnecter</span>
            </button>
          </div>
        </header>

        {/* Dashboard Title & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-2">
          <div>
            <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Gestion des Utilisateurs
            </h1>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Gérez les profils et rôles d'accès des agents de terrain, des gestionnaires et des administrateurs.
            </p>
          </div>
          
          <button
            onClick={() => navigate('/users/create')}
            className="px-5 py-3 min-h-[48px] bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-extrabold rounded-xl transition-premium shadow-lg shadow-indigo-500/20 hover:scale-[1.02] flex items-center space-x-2 cursor-pointer"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Créer un utilisateur</span>
          </button>
        </div>

        {/* Filter Card */}
        <div className={`p-5 rounded-2xl border transition-premium shadow-lg ${
          theme === 'dark' ? 'glass-panel border-slate-800/60' : 'bg-white border-slate-200'
        }`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 items-end">
            
            {/* Search by Name */}
            <div className="md:col-span-4 space-y-1.5">
              <label className={`block text-[10px] font-extrabold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-650'}`}>
                Rechercher par nom
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Ex: Dupont"
                  value={nameSearch}
                  onChange={(e) => {
                    setNameSearch(e.target.value);
                    setPage(0);
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-premium text-sm ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-450'
                  }`}
                />
              </div>
            </div>

            {/* Search by Email */}
            <div className="md:col-span-4 space-y-1.5">
              <label className={`block text-[10px] font-extrabold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-650'}`}>
                Rechercher par email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="Ex: commercial@salestrack.test"
                  value={emailSearch}
                  onChange={(e) => {
                    setEmailSearch(e.target.value);
                    setPage(0);
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-premium text-sm ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-450'
                  }`}
                />
              </div>
            </div>

            {/* Filter by Role */}
            <div className="md:col-span-3 space-y-1.5">
              <label className={`block text-[10px] font-extrabold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-650'}`}>
                Rôle
              </label>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(0);
                }}
                className={`w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-slate-800 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900 shadow-sm'
                }`}
              >
                <option value="">Tous les rôles</option>
                <option value="ADMIN">ADMIN</option>
                <option value="MANAGER">MANAGER</option>
                <option value="COMMERCIAL">COMMERCIAL</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="md:col-span-1">
              <button
                onClick={handleClearFilters}
                className={`w-full py-2.5 min-h-[42px] border rounded-xl transition-premium cursor-pointer flex items-center justify-center ${
                  theme === 'dark'
                    ? 'border-slate-800 bg-slate-900 text-slate-450 hover:bg-slate-800 hover:text-white'
                    : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                }`}
                title="Réinitialiser les filtres"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className={`text-xs ${theme === 'dark' ? 'text-slate-450' : 'text-slate-550'}`}>Chargement des utilisateurs...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <UserTable
              users={users}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onView={handleViewDetails}
              theme={theme}
            />

            {/* Pagination Controls */}
            {totalUsers > 0 && (
              <div className={`flex flex-col sm:flex-row justify-between items-center p-4 rounded-xl border shadow-sm gap-4 ${
                theme === 'dark' ? 'bg-slate-900/20 border-slate-850' : 'bg-white border-slate-150'
              }`}>
                {/* Rows per page selector */}
                <div className="flex items-center space-x-2.5 text-xs text-slate-500">
                  <span>Lignes par page :</span>
                  <select
                    value={rowsPerPage}
                    onChange={handleRowsPerPageChange}
                    className={`px-2.5 py-1 border rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-950'
                    }`}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                  </select>
                </div>

                {/* Display page info */}
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-slate-500">
                    {fromRecord}-{toRecord} sur {totalUsers}
                  </span>

                  {/* Previous / Next buttons */}
                  <div className="flex space-x-1.5">
                    <button
                      onClick={handlePrevPage}
                      disabled={page === 0}
                      className={`p-2 border rounded-lg transition-premium cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                        theme === 'dark'
                          ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={(page + 1) * rowsPerPage >= totalUsers}
                      className={`p-2 border rounded-lg transition-premium cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                        theme === 'dark'
                          ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      
    </div>
  );
}
