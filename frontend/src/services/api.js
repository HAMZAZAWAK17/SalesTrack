import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Create a single Axios instance for the entire app
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios Request Interceptor to attach the JWT token automatically from local storage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('salestrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Authentication service
 */
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Une erreur est survenue lors de la connexion.');
  }
};

/**
 * User services (Admin only)
 */
export const getUsers = async ({ name = '', email = '', role = '', page = 1, limit = 10 } = {}) => {
  try {
    const response = await api.get('/users', {
      params: { name, email, role, page, limit }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des utilisateurs.');
  }
};

export const getUserById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Erreur lors du chargement de l'utilisateur.");
  }
};

export const getManagers = async () => {
  try {
    const response = await api.get('/users/managers');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des managers.');
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    const err = new Error(error.response?.data?.error || "Erreur lors de la création de l'utilisateur.");
    err.errors = error.response?.data?.errors;
    throw err;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    const err = new Error(error.response?.data?.error || "Erreur lors de la modification de l'utilisateur.");
    err.errors = error.response?.data?.errors;
    throw err;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Erreur lors de la suppression de l'utilisateur.");
  }
};

/**
 * Client services
 */
export const getClients = async ({
  name = '',
  code = '',
  city = '',
  distributionChannel = '',
  category = '',
  status = '',
  assignedTo = '',
  page = 1,
  limit = 10
} = {}) => {
  try {
    const response = await api.get('/clients', {
      params: { name, code, city, distributionChannel, category, status, assignedTo, page, limit }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des clients.');
  }
};

export const getClientById = async (id) => {
  try {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors du chargement des détails du client.');
  }
};

export const createClient = async (clientData) => {
  try {
    const response = await api.post('/clients', clientData);
    return response.data;
  } catch (error) {
    const err = new Error(error.response?.data?.error || 'Erreur lors de la création du client.');
    err.errors = error.response?.data?.errors;
    throw err;
  }
};

export const updateClient = async (id, clientData) => {
  try {
    const response = await api.put(`/clients/${id}`, clientData);
    return response.data;
  } catch (error) {
    const err = new Error(error.response?.data?.error || 'Erreur lors de la modification du client.');
    err.errors = error.response?.data?.errors;
    throw err;
  }
};

export const deleteClient = async (id) => {
  try {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors de la suppression du client.');
  }
};

export const getCities = async () => {
  try {
    const response = await api.get('/clients/cities');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors du chargement des villes.');
  }
};

