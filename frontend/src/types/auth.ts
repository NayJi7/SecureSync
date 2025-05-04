// Définition des types pour les utilisateurs
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'gerant' | 'gestionnaire' | 'employe';
  points: number;
  Prison_id?: string;
  // Autres propriétés de l'utilisateur
}

// Interface pour le retour du hook useAuth
export interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  prisonId: string | null;
  login: (token: string, refreshToken?: string | null, sessionToken?: string | null) => void;
  logout: () => void;
  checkAuth: () => void;
}
