const API_URL = 'http://localhost:3001/api';

/**
 * Helper to make API calls with authorization header
 */
async function request(endpoint, options = {}, token = null) {
  const url = `${API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // If token is provided, add it to Authorization header
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const result = await response.json();
    
    if (!response.ok) {
      // Throw error with message and validation details if any
      const error = new Error(result.error || 'Une erreur est survenue.');
      error.status = response.status;
      error.errors = result.errors;
      error.code = result.code;
      throw error;
    }
    
    return result;
  } catch (error) {
    console.error(`API Request failed for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Authentication service
 */
export const login = async (email, password) => {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

/**
 * User services
 */
export const createUser = async (userData, token) => {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }, token);
};

export const getManagers = async (token) => {
  return request('/users/managers', {
    method: 'GET',
  }, token);
};
