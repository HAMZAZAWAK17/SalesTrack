import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import UserForm from '../../components/users/UserForm';
import * as api from '../../services/api';

export default function UserEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { theme } = useAuth();

  // Component states
  const [userData, setUserData] = useState(null);
  const [managers, setManagers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Load user data and managers on mount
  useEffect(() => {
    async function loadData() {
      try {
        // Fetch specific user details
        const userResponse = await api.getUserById(id);
        
        // Fetch managers list
        const managersResponse = await api.getManagers();

        if (userResponse.success) {
          // Exclude null values and map password to empty string for edit input
          const user = userResponse.data;
          setUserData({
            role: user.role,
            lastName: user.lastName,
            firstName: user.firstName,
            email: user.email,
            phone: user.phone || '',
            equipe: user.equipe || '',
            managerId: user.managerId || '',
            password: '' // Kept empty in form edit mode
          });
        }
        
        if (managersResponse.success) {
          setManagers(managersResponse.data);
        }
      } catch (error) {
        console.error('Failed to load user edit data:', error);
        toast.error(error.message || 'Impossible de récupérer les informations de l\'utilisateur.');
      } finally {
        setLoadingData(false);
      }
    }
    
    if (id) {
      loadData();
    }
  }, [id]);

  // Form edit submission handler
  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const response = await api.updateUser(id, formData);
      if (response.success) {
        toast.success('Utilisateur mis à jour avec succès ! Redirection...');
        
        // Redirect back to user list after 1.5s delay to let the toast display
        setTimeout(() => {
          navigate('/users');
        }, 1500);
      }
    } catch (error) {
      toast.error(error.message || "Une erreur est survenue lors de la modification.");
    } finally {
      setSubmitting(false);
    }
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
