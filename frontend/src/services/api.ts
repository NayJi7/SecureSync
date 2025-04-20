// src/services/api.ts
import axios from 'axios';

// Create a custom axios instance with default config
const API = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Function to get authentication token from various possible storage locations
const getAuthToken = () => {
  // Check all possible token storage locations
  const possibleTokens = [
    localStorage.getItem('authToken'),
    localStorage.getItem('sessionToken'),
    sessionStorage.getItem('token'),
    localStorage.getItem('token')
  ];

  // Find the first non-null token
  const token = possibleTokens.find(token => token !== null);

  // Log for debugging whether we found a token
  console.debug('Auth token retrieval:', token ? 'Token found' : 'No token found');

  return token || '';
};

// Add request interceptor to include auth token in every request
API.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

    if (token) {
      // IMPORTANT: Django REST Framework with SimpleJWT expects this exact format
      // The space after "Bearer" is required
      config.headers.Authorization = `Bearer ${token.trim()}`;
      // Log request with URL and method for debugging (without sensitive data)
      console.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    } else {
      console.debug(`API Request (no auth): ${config.method?.toUpperCase()} ${config.url}`);

      // Make sure we don't have any leftover Authorization header
      if (config.headers.Authorization) {
        delete config.headers.Authorization;
      }
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling specifically focusing on auth errors
API.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.debug(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Special handling for authentication errors
    if (error.response) {
      const { status, data } = error.response;
      const requestUrl = error.config.url;

      console.error(`API Error ${status} for ${requestUrl}:`, data);

      if (status === 401) {
        // Token is likely invalid - we should clear it and force re-auth
        console.error('Authentication error - clearing tokens');
        localStorage.removeItem('authToken');
        localStorage.removeItem('sessionToken');
        sessionStorage.removeItem('token');

        // Set a flag to indicate auth error
        localStorage.setItem('authError', 'true');

        // Optional: Force user to login page if needed
        // window.location.href = '/login';
      }
    } else {
      // Network errors, timeouts, etc.
      console.error('API Error (network):', error.message);
    }

    // Create a more detailed error message
    const errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'Erreur de connexion au serveur';

    // Enhance the error object for better debugging
    const enhancedError = {
      ...error,
      friendlyMessage: errorMessage,
      timestamp: new Date().toISOString()
    };

    return Promise.reject(enhancedError);
  }
);

// Export the API instance
export default API;
