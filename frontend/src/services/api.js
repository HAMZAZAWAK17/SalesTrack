import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

// Create a single Axios instance for the entire app
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
// Attach the access token from localStorage to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('salestrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────────────────
// When a 401 is received, attempt a silent token refresh using the stored
// refresh token. If the refresh succeeds the original request is retried.
// If the refresh fails, the user is logged out.
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors, and avoid infinite loops on the refresh endpoint
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh') &&
      !originalRequest.url.includes('/auth/login')
    ) {
      if (isRefreshing) {
        // Queue subsequent requests while a refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const storedRefreshToken = localStorage.getItem('salestrack_refresh_token');

      if (!storedRefreshToken) {
        // No refresh token → force logout
        isRefreshing = false;
        localStorage.removeItem('salestrack_token');
        localStorage.removeItem('salestrack_refresh_token');
        localStorage.removeItem('salestrack_user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {
          token: storedRefreshToken,
        });

        if (refreshResponse.data.success) {
          const { accessToken, refreshToken } = refreshResponse.data.data;

          localStorage.setItem('salestrack_token', accessToken);
          localStorage.setItem('salestrack_refresh_token', refreshToken);

          api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          processQueue(null, accessToken);
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed → force logout
        localStorage.removeItem('salestrack_token');
        localStorage.removeItem('salestrack_refresh_token');
        localStorage.removeItem('salestrack_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Authentication ───────────────────────────────────────────────────────────

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      const { accessToken, refreshToken } = response.data.data;
      // Store both tokens
      localStorage.setItem('salestrack_token', accessToken);
      localStorage.setItem('salestrack_refresh_token', refreshToken);
    }
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Une erreur est survenue lors de la connexion.');
  }
};

// ─── Users ────────────────────────────────────────────────────────────────────

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

// ─── Clients ──────────────────────────────────────────────────────────────────

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

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des statistiques.');
  }
};

// ─── Visites ──────────────────────────────────────────────────────────────────

export const getVisits = async ({ clientId = '', commercialId = '', status = '', page = 1, limit = 10 } = {}) => {
  try {
    const response = await api.get('/visites', {
      params: { clientId, commercialId, status, page, limit }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des visites.');
  }
};

export const getVisitById = async (id) => {
  try {
    const response = await api.get(`/visites/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors du chargement des détails de la visite.');
  }
};

export const createVisit = async (visitData) => {
  try {
    const response = await api.post('/visites', visitData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors de l\'enregistrement de la visite.');
  }
};

export const deleteVisit = async (id) => {
  try {
    const response = await api.delete(`/visites/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors de la suppression de la visite.');
  }
};

export const updateVisit = async (id, visitData) => {
  try {
    const response = await api.put(`/visites/${id}`, visitData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors de la modification de la visite.');
  }
};

export const uploadVisitPhoto = async (formData) => {
  try {
    const response = await api.post('/visites/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors de l\'envoi de la photo.');
  }
};

export const importClients = async (formData) => {
  try {
    const response = await api.post('/clients/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    const err = new Error(error.response?.data?.error || 'Erreur lors de l\'import des clients.');
    err.errors = error.response?.data?.errors;
    throw err;
  }
};

// ─── Commandes ────────────────────────────────────────────────────────────────

export const getCommandes = async ({ clientId = '', commercialId = '', type = '', status = '', page = 1, limit = 10 } = {}) => {
  try {
    const response = await api.get('/commandes', {
      params: { clientId, commercialId, type, status, page, limit }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des commandes.');
  }
};

export const getCommandeById = async (id) => {
  try {
    const response = await api.get(`/commandes/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors du chargement des détails de la commande.');
  }
};

export const createCommande = async (commandeData) => {
  try {
    const response = await api.post('/commandes', commandeData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors de la création de la commande.');
  }
};

export const updateCommande = async (id, commandeData) => {
  try {
    const response = await api.put(`/commandes/${id}`, commandeData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors de la mise à jour de la commande.');
  }
};

export const deleteCommande = async (id) => {
  try {
    const response = await api.delete(`/commandes/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors de la suppression de la commande.');
  }
};

export const cleanupPhotos = async () => {
  try {
    const response = await api.post('/visites/cleanup-photos', {});
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors du nettoyage des photos.');
  }
};

// ─── Profile ─────────────────────────────────────────────────────────────────

export const getProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erreur lors du chargement du profil.');
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  } catch (error) {
    const err = new Error(error.response?.data?.error || 'Erreur lors de la mise à jour du profil.');
    err.errors = error.response?.data?.errors;
    throw err;
  }
};
