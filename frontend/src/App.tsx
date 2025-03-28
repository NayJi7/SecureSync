import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import './App.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}

// Composant pour le contenu de la page d'accueil
const HomeContent: React.FC = () => {
  const [apiData, setApiData] = React.useState<{ message: string, status: string } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // Importer dynamiquement pour éviter les problèmes potentiels de chargement
        const { getHomeData } = await import('@/services/apiService');
        const data = await getHomeData();
        setApiData(data);
        setIsLoading(false);
      } catch (err) {
        setError('Erreur lors de la connexion à l\'API. Vérifiez que le serveur Django est en cours d\'exécution.');
        setIsLoading(false);
        console.error('Erreur:', err);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <Router>
      <App />
    </Router>
  );
};
