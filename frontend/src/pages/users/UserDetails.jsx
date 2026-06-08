import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';

export default function UserDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { theme } = useAuth();

  // Component states
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Load user details on mount
  useEffect(() => {
    async function loadUserDetails() {
      try {
        const response = await api.getUserById(id);
        if (response.success) {
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to load user details:', error);
        toast.error(error.message || 'Impossible de récupérer les détails de l\'utilisateur.');
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

  );
  };

  return (
    <div className={`min-h-screen w-full p-4 md:p-8 relative overflow-hidden transition-colors duration-300 font-sans ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100 grid-pattern' : 'bg-slate-50 text-slate-800 grid-pattern-light'
    }`}>
      
    </div>
  );
}
