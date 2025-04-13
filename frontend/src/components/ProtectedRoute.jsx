// Créez d'abord un composant ProtectedRoute dans un nouveau fichier
// src/components/ProtectedRoute.jsx

import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  // Vérifier si l'utilisateur est authentifié en cherchant le token dans localStorage
  const isAuthenticated = () => {
    const sessionToken = localStorage.getItem('sessionToken');
    return !!sessionToken;
  };

  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  // en conservant l'URL d'origine pour pouvoir y revenir après connexion
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si l'utilisateur est authentifié, afficher le contenu de la route
  return children;
};

export default ProtectedRoute;