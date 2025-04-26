// src/hooks/useAuth.js

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [prisonId, setPrisonId] = useState(null);
  const navigate = useNavigate();

  // Verify a token format is valid before trying to use it
  const isValidTokenFormat = (token: string) => {
    if (!token) return false;

    // JWT tokens should be a string with 3 parts separated by dots
    const parts = token.split('.');
    return parts.length === 3;
  };

  // Log authentication state for debugging
  const logAuthState = () => {
    const authToken = localStorage.getItem('authToken');
    const sessionToken = localStorage.getItem('sessionToken');

    console.debug('Auth State Check:');
    console.debug(`- authToken present: ${!!authToken}`);
    console.debug(`- sessionToken present: ${!!sessionToken}`);
    console.debug(`- isAuthenticated: ${isAuthenticated}`);
  };

  // Add this function to help debug token issues
  const debugToken = (token: string) => {
    if (!token) {
      console.debug('Token is null or undefined');
      return;
    }

    try {
      // Split the token parts
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.debug('Invalid token format - not a valid JWT');
        return;
      }

      // Decode the payload (middle part)
      const payload = JSON.parse(atob(parts[1]));

      // Log key info without exposing sensitive data
      console.debug('Token info:');
      console.debug('- Issued at:', new Date(payload.iat * 1000).toISOString());
      if (payload.exp) {
        console.debug('- Expires at:', new Date(payload.exp * 1000).toISOString());
        const now = Math.floor(Date.now() / 1000);
        console.debug('- Expired:', payload.exp < now);
      }
      if (payload.sub) {
        console.debug('- Subject:', payload.sub);
      }
    } catch (e) {
      console.debug('Error decoding token:', e);
    }
  };

  useEffect(() => {
    // Check authentication on load
    checkAuth();

    // Debug log to help track issues
    console.debug('useAuth hook initialized');
  }, []);

  const checkAuth = () => {
    // Check all possible token storage locations
    const authToken = localStorage.getItem('authToken');
    const sessionToken = localStorage.getItem('sessionToken');
    const token = authToken || sessionToken || sessionStorage.getItem('token');

    // Debug output
    console.debug('Checking authentication tokens');
    logAuthState();

    // Debug token if available
    if (token) {
      debugToken(token);
    }

    if (token && isValidTokenFormat(token)) {
      console.debug('Found valid token format - setting authenticated');
      setIsAuthenticated(true);

      // Set the active token in API headers
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Optionally: fetch user info
      fetchUserInfo(token).catch(err => {
        console.error('Error fetching user info:', err);

        // If we get a 401, the token is invalid
        if (err.response && err.response.status === 401) {
          console.warn('Token invalid or expired - logging out');
          logout();
        }
      });
    } else {
      if (token) {
        console.debug('Found token but format is invalid - clearing');
        // Clear invalid tokens
        localStorage.removeItem('authToken');
        localStorage.removeItem('sessionToken');
        sessionStorage.removeItem('token');
      } else {
        console.debug('No authentication token found');
      }

      setIsAuthenticated(false);
      delete API.defaults.headers.common['Authorization'];
    }

    setLoading(false);
  };

  const fetchUserInfo = async (token: string) => {
    try {
      // Don't try to fetch if we don't have a token
      if (!token) return;

      console.debug('Attempting to fetch user info with token');

      // Call profile API or user info endpoint
      const response = await API.get('/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.debug('User info fetched successfully');
      setUser(response.data);
      
      // Récupération de l'ID de la prison de l'utilisateur
      if (response.data && response.data.Prison_id) {
        console.debug('Prison ID trouvé:', response.data.Prison_id);
        setPrisonId(response.data.Prison_id);
        
        // Stocker l'ID de prison dans localStorage pour plus de sécurité
        localStorage.setItem('userPrison', String(response.data.Prison_id));
      }
    } catch (error: any) {
      console.error('Error fetching user info:', error);

      // Handle token validation errors
      if (error.response && error.response.status === 401) {
        console.warn('Token rejected by server during profile fetch');
      }

      throw error;
    }
  };

  const login = (token: string, refreshToken = null, sessionToken = null) => {
    console.debug('Storing authentication tokens');

    // Validate token before storing
    if (!isValidTokenFormat(token)) {
      console.error('Received invalid token format during login');
    }

    // Store access token
    if (token) {
      localStorage.setItem('authToken', token);

      // Set the token in the API service for future requests
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Store refresh token if provided
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    // Store session token if provided
    if (sessionToken) {
      localStorage.setItem('sessionToken', sessionToken);
    }

    setIsAuthenticated(true);
    logAuthState();

    // Try to fetch user info after login
    fetchUserInfo(token).catch(err => {
      console.error('Error fetching user info after login:', err);
    });
  };

  const logout = () => {
    console.debug('Logging out - removing tokens');

    // Remove all tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('sessionToken');
    sessionStorage.removeItem('token');

    // Clear authorization header
    delete API.defaults.headers.common['Authorization'];

    // Update state
    setIsAuthenticated(false);
    setUser(null);

    logAuthState();

    // Redirect to login page
    navigate('/login');
  };

  return {
    isAuthenticated,
    loading,
    user,
    prisonId,
    login,
    logout,
    checkAuth
  };
};

export default useAuth;