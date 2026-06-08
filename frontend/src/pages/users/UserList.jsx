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
      
    </div>
  );
}
