import { useState } from 'react';

export default function UserTable({ users = [], onEdit, onDelete, onView, theme }) {
  // States for delete confirmation dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Open the deletion warning popup
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  // Close the deletion warning popup
  const handleDeleteClose = () => {
    setSelectedUser(null);
    setOpenDeleteDialog(false);
  };

  // Confirm and execute delete callback
  const handleDeleteConfirm = () => {
    if (selectedUser) {
      onDelete(selectedUser.id);
    }
    handleDeleteClose();
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

  return (
    <>
      {/* Premium Table Card */}
      <div className={`w-full overflow-hidden rounded-2xl border shadow-lg ${
        theme === 'dark' ? 'glass-panel border-slate-800/60 shadow-slate-950/20' : 'bg-white border-slate-200 shadow-slate-100'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-xs font-bold uppercase tracking-wider ${
                theme === 'dark' ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                <th className="py-4.5 px-5 font-extrabold">Nom Complet</th>
                <th className="py-4.5 px-5 font-extrabold">Email</th>
                <th className="py-4.5 px-5 font-extrabold">Téléphone</th>
                <th className="py-4.5 px-5 font-extrabold">Rôle</th>
                <th className="py-4.5 px-5 font-extrabold">Équipe</th>
                <th className="py-4.5 px-5 font-extrabold">Manager</th>
                <th className="py-4.5 px-5 font-extrabold text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-sm ${
              theme === 'dark' ? 'divide-slate-850 text-slate-300' : 'divide-slate-100 text-slate-700'
            }`}>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 font-medium">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className={`transition-colors duration-150 ${
                      theme === 'dark' ? 'hover:bg-slate-900/20' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <td className="py-4.5 px-5 font-bold text-slate-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="py-4.5 px-5 font-medium">{user.email}</td>
                    <td className="py-4.5 px-5 font-medium">{user.phone || '-'}</td>
                    <td className="py-4.5 px-5">{getRoleBadge(user.role)}</td>
                    <td className="py-4.5 px-5 font-medium">{user.equipe || '-'}</td>
                    <td className="py-4.5 px-5 font-medium text-xs">
                      {user.manager ? (
                        <div className="flex items-center space-x-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${theme === 'dark' ? 'bg-indigo-400' : 'bg-indigo-500'}`}></span>
                          <span>{user.manager.firstName} {user.manager.lastName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-4.5 px-5 text-right pr-6">
                      <div className="flex items-center justify-end space-x-2">
                        {/* View Button */}
                        <button
                          onClick={() => onView(user.id)}
                          className={`p-2 rounded-xl border transition-premium cursor-pointer ${
                            theme === 'dark'
                              ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-cyan-400'
                              : 'border-slate-200 bg-white hover:bg-cyan-50 text-cyan-600 shadow-sm'
                          }`}
                          title="Consulter le profil"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => onEdit(user.id)}
                          className={`p-2 rounded-xl border transition-premium cursor-pointer ${
                            theme === 'dark'
                              ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-indigo-400'
                              : 'border-slate-200 bg-white hover:bg-indigo-50 text-indigo-600 shadow-sm'
                          }`}
                          title="Modifier"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className={`p-2 rounded-xl border transition-premium cursor-pointer ${
                            theme === 'dark'
                              ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-red-400'
                              : 'border-slate-200 bg-white hover:bg-red-50 text-red-650 shadow-sm'
                          }`}
                          title="Supprimer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal Dialog */}
      {openDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl space-y-6 ${
            theme === 'dark' ? 'glass-panel border-slate-800' : 'bg-white border-slate-200 text-slate-850'
          }`}>
            <div className="flex items-center space-x-3 text-red-500">
              <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">Confirmer la suppression</h3>
            </div>

            <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
              <strong className="text-slate-900 dark:text-white">
                {selectedUser?.firstName} {selectedUser?.lastName}
              </strong>{' '}
              ? Cette action est irréversible et supprimera définitivement ses données d'accès.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={handleDeleteClose}
                className={`px-4 py-2.5 min-h-[48px] border text-xs font-bold rounded-xl transition-premium cursor-pointer ${
                  theme === 'dark'
                    ? 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 min-h-[48px] bg-red-650 hover:bg-red-550 text-white text-xs font-extrabold rounded-xl transition-premium cursor-pointer shadow-lg shadow-red-500/10"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
