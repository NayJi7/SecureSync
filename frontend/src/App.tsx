// React Router
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
// Pages - ajout progressif des composants
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import FeaturesPage from '@/pages/FeaturesPage';
import HomePage from '@/pages/HomePage';
import ObjectPage from '@/pages/ObjectDashboard';
import PrisonSelectionPage from '@/pages/PrisonSelectionPage';
import StatForm from '@/pages/StatPage';
import StatPage from '@/pages/StatList';
import TermsPage from '@/pages/TermsPage';
// Composant de protection des routes
import ProtectedRoute from './components/ProtectedRoute';
// Gestionnaire de session
import sessionManager from './services/sessionManager';
import './App.css';

export default function App() {
  // Initialiser la surveillance de la session au chargement de l'application
  useEffect(() => {
    // Démarrer la surveillance de session si un token de session existe
    if (localStorage.getItem('sessionToken')) {
      sessionManager.startSessionMonitoring();
    }

    // Écouter les changements de paramètres de timeout
    const handleSessionTimeoutChange = () => {
      sessionManager.startSessionMonitoring(); // Redémarrer avec la nouvelle valeur
    };

    // Écouter les événements de connexion/déconnexion
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'sessionToken') {
        if (event.newValue) {
          // Token ajouté - démarrer la surveillance
          sessionManager.startSessionMonitoring();
        } else {
          // Token supprimé - arrêter la surveillance
          sessionManager.stopSessionMonitoring();
        }
      }
    };

    // Ajouter les écouteurs d'événements
    document.addEventListener('sessionTimeoutChanged', handleSessionTimeoutChange as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      // Nettoyage des écouteurs lors du démontage du composant
      document.removeEventListener('sessionTimeoutChanged', handleSessionTimeoutChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      sessionManager.stopSessionMonitoring();
    };
  }, []);

  return (
    <Router>
      <Routes>
        {/* Routes principales */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/Stat" element={<StatForm />} />
        <Route path="/StatPage" element={<StatPage />} />


        
        <Route path="/prison-selection" element={
          <ProtectedRoute>
            <PrisonSelectionPage />
          </ProtectedRoute>
        } />
        
        {/* Routes avec paramètre prisonId */}
        <Route path="/:prisonId/home" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        
        <Route path="/:prisonId/object" element={
          <ProtectedRoute>
            <ObjectPage />
          </ProtectedRoute>
        } />
        
        {/* Composant de secours pour les autres routes */}
        <Route path="*" element={
          <div style={{ padding: '20px' }}>
            <h1>Page de test</h1>
            <p>Cette route est temporaire pendant le débogage.</p>
          </div>
        } />
      </Routes>
    </Router>
  );
}