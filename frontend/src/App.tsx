// React Router
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
// Pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import LandingPage from '@/pages/LandingPage';
import FeaturesPage from '@/pages/FeaturesPage';
import ContactPage from '@/pages/ContactPage';
import AboutPage from '@/pages/AboutPage';
import CreateObjetPage from '@/pages/CreateObjetPage';
import ObjectPage from '@/pages/ObjectDashboard';
import PrisonSelectionPage from '@/pages/PrisonSelectionPage';
import LogsPage from '@/pages/LogsPage';
// Composant de protection des routes
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/object" element={<ObjectPage />} />
        <Route path="/CreateObject" element={<CreateObjetPage />} />
        <Route path="/logs" element={<LogsPage />} />
        
        {/* Route de sélection de prison pour les administrateurs */}
        <Route path="/prison-selection" element={
          <ProtectedRoute>
            <PrisonSelectionPage />
          </ProtectedRoute>
        } />

        {/* Routes spécifiques aux prisons - le paramètre prisonId sera disponible dans les composants */}
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
        <Route path="/:prisonId/createobject" element={
          <ProtectedRoute>
            <CreateObjetPage />
          </ProtectedRoute>
        } />
        
        {/* Routes legacy maintenues pour compatibilité */}
        <Route path="/home" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        
        
        {/* Redirection pour les routes non définies */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}