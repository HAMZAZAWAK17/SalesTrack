import axios from 'axios';

const API_URL = 'http://localhost:3001/api/users';

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
 * Fetch paginated list of users with search and filter parameters.
 */
export const getUsers = async ({ name = '', email = '', role = '', page = 1, limit = 10 }) => {
  try {
    const response = await axios.get(API_URL, {
      headers: getHeaders(),
      params: { name, email, role, page, limit }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des utilisateurs.');
  }
};

/**
 * Fetch a user by ID.
 */
export const getUserById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Erreur lors du chargement de l'utilisateur.");
  }
};

/**
 * Fetch all managers (used for assigning managers).
 */
export const getManagers = async () => {
  try {
    const response = await axios.get(`${API_URL}/managers`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des managers.');
  }
};

/**
 * Create a new user.
 */
export const createUser = async (userData) => {
  try {
    const response = await axios.post(API_URL, userData, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    const err = new Error(error.response?.data?.error || "Erreur lors de la création de l'utilisateur.");
    err.errors = error.response?.data?.errors;
    throw err;
  }
};

/**
 * Update an existing user.
 */
export const updateUser = async (id, userData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, userData, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    const err = new Error(error.response?.data?.error || "Erreur lors de la modification de l'utilisateur.");
    err.errors = error.response?.data?.errors;
    throw err;
  }
};

/**
 * Delete a user by ID.
 */
export const deleteUser = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Erreur lors de la suppression de l'utilisateur.");
  }
};
