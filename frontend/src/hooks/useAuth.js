// src/hooks/useAuth.js

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier l'authentification au chargement
    checkAuth();
  }, []);

  const checkAuth = () => {
    const sessionToken = localStorage.getItem('sessionToken');
    const authToken = localStorage.getItem('authToken');
    
    if (sessionToken || authToken) {
      setIsAuthenticated(true);
      // Optionnel: récupérer les informations de l'utilisateur depuis une API
      // fetchUserInfo();
    } else {
      setIsAuthenticated(false);
    }
    
    setLoading(false);
  };

  const login = (token, sessionToken = null) => {
    localStorage.setItem('authToken', token);
    if (sessionToken) {
      localStorage.setItem('sessionToken', sessionToken);
    }
    setIsAuthenticated(true);
    // Vous pouvez également définir les infos utilisateur ici
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('sessionToken');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  return {
    isAuthenticated,
    loading,
    user,
    login,
    logout,
    checkAuth
  };
};

export default useAuth;