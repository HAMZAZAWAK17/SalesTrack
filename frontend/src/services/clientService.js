import axios from 'axios';

const API_URL = 'http://localhost:3001/api/clients';

/**
 * Generate request headers with JWT authorization token.
 */
const getHeaders = () => {
  const token = localStorage.getItem('salestrack_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

/**
 * Fetch list of clients with search and filter parameters.
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
}) => {
  try {
    const response = await axios.get(API_URL, {
      headers: getHeaders(),
      params: { name, code, city, distributionChannel, category, status, assignedTo, page, limit }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des clients.');
  }
};

/**
 * Fetch a client by ID.
 */
export const getClientById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors du chargement des détails du client.');
  }
};

/**
 * Create a new client.
 */
export const createClient = async (clientData) => {
  try {
    const response = await axios.post(API_URL, clientData, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    const err = new Error(error.response?.data?.error || 'Erreur lors de la création du client.');
    err.errors = error.response?.data?.errors;
    throw err;
  }
};

/**
 * Update an existing client.
 */
export const updateClient = async (id, clientData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, clientData, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    const err = new Error(error.response?.data?.error || 'Erreur lors de la modification du client.');
    err.errors = error.response?.data?.errors;
    throw err;
  }
};

/**
 * Delete a client by ID.
 */
export const deleteClient = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors de la suppression du client.');
  }
};

/**
 * Fetch all unique cities represented in the database.
 */
export const getCities = async () => {
  try {
    const response = await axios.get(`${API_URL}/cities`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors du chargement des villes.');
  }
};
