import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

// Local helper to fetch authorization headers with active JWT token
const getAuthHeaders = () => {
  const token = localStorage.getItem('salestrack_token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const getVisits = async ({ clientId = '', userId = '', subject = '', status = '', date = '', page = 1, limit = 10 } = {}) => {
  try {
    const token = localStorage.getItem('salestrack_token');
    const response = await axios.get(`${API_URL}/visits`, {
      params: { clientId, userId, subject, status, date, page, limit },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des visites.');
  }
};

export const getVisitById = async (id) => {
  try {
    const token = localStorage.getItem('salestrack_token');
    const response = await axios.get(`${API_URL}/visits/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors du chargement de la visite.');
  }
};

export const createVisit = async (visitData) => {
  try {
    const response = await axios.post(`${API_URL}/visits`, visitData, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors de l\'enregistrement de la visite.');
  }
};

export const updateVisit = async (id, visitData) => {
  try {
    const response = await axios.put(`${API_URL}/visits/${id}`, visitData, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors de la modification de la visite.');
  }
};

export const deleteVisit = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/visits/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors de la suppression de la visite.');
  }
};
