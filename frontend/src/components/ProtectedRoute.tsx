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

// Check if the user is at the correct prison route
const isCorrectPrisonRoute = (pathname: string): boolean => {
  // Si l'URL n'a pas de format /:prisonId/*, on considère que c'est une route sans contexte de prison
  // donc on la laisse passer pour compatibilité
  if (!pathname.match(/^\/[^\/]+\/[^\/]+/)) {
    return true;
  }
  
  // Extraire le prisonId de l'URL (premier segment)
  const urlPrisonId = pathname.split('/')[1];
  
  // Obtenir la prison de l'utilisateur du localStorage
  const userPrison = localStorage.getItem('userPrison');
  
  // Si l'utilisateur est admin, toutes les prisons sont correctes
  const userRole = localStorage.getItem('userRole');
  if (userRole === 'admin') {
    return true;
  }
  
  // Vérifier que l'utilisateur accède à sa prison assignée
  return userPrison === urlPrisonId;
};

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  
  // Vérifier l'authentification
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Vérifier si l'utilisateur est au bon endroit (bonne prison)
  if (!isCorrectPrisonRoute(location.pathname)) {
    const userPrison = localStorage.getItem('userPrison');
    const userRole = localStorage.getItem('userRole');
    
    // Si c'est un admin, renvoyer à la page de sélection de prison
    if (userRole === 'admin') {
      return <Navigate to="/prison-selection" replace />;
    }
    
    // Si c'est un utilisateur standard avec une prison assignée, le rediriger vers sa prison
    if (userPrison) {
      return <Navigate to={`/${userPrison}/home`} replace />;
    }
    
    // Si pas de prison assignée (cas rare), rediriger vers home par défaut
    return <Navigate to="/home" replace />;
  }

  // Si l'utilisateur est authentifié et à la bonne prison, afficher le contenu de la route
  return <>{children}</>;
};

export default ProtectedRoute;