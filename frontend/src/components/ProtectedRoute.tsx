// src/components/ProtectedRoute.tsx

import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

// Define the function to check authentication
const isAuthenticated = (): boolean => {
  // Vérifie si l'un des tokens d'authentification existe
  return localStorage.getItem('sessionToken') !== null || 
         localStorage.getItem('access_token') !== null || 
         localStorage.getItem('token') !== null;
};

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si l'utilisateur est authentifié, afficher le contenu de la route
  return <>{children}</>;
};

export default ProtectedRoute;