import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ClientForm from '../../components/clients/ClientForm';
import * as api from '../../services/api';

export default function ClientEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: currentUser, theme, toggleTheme, logoutUser } = useAuth();
  const canManageAssignment = currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';

  const [clientData, setClientData] = useState(null);
  const [commercials, setCommercials] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const showToast = (message, type = 'success') => {
    if (type === 'success') {
      toast.success(message);
    } else if (type === 'warning') {
      toast(message, { icon: '⚠️' });
    } else {
      toast.error(message);
    }
  };
);
    setTimeout(() => , 4000);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const clientRes = await api.getClientById(id);
        if (clientRes.success) {
          const c = clientRes.data;
          setClientData({
            code: c.code,
            companyName: c.companyName,
            phone: c.phone || '',
            email: c.email || '',
            address: c.address || '',
            city: c.city || '',
            distributionChannel: c.distributionChannel || 'ON_TRADE',
            category: c.category || 'OTHER',
            status: c.status || 'PROSPECT',
            assignedTo: c.assignedTo || '',
            notes: c.notes || ''
          });
        }
        if (canManageAssignment) {
          const commsRes = await api.getUsers({ role: 'COMMERCIAL', limit: 100 });
          if (commsRes.success) setCommercials(commsRes.data.users);
        }
      } catch (err) {
        showToast(err.message || 'Impossible de charger les détails du client.', 'error');
      } finally {
        setLoadingData(false);
      }
    }
    if (id) loadData();
  }, [id, canManageAssignment]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const response = await api.updateClient(id, formData);
      if (response.success) {
        showToast('Client mis à jour avec succès !', 'success');
        setTimeout(() => navigate('/clients'), 1500);
      }
    } catch (err) {
      showToast(err.message || 'Erreur lors de la mise à jour.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen w-full relative overflow-hidden transition-colors duration-300 font-sans ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100 grid-pattern' : 'bg-slate-50 text-slate-800 grid-pattern-light'
    }`}>
      
    </div>
  );
}
