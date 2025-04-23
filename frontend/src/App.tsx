// React Router
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// Pages - ajout progressif des composants
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import FeaturesPage from '@/pages/FeaturesPage';
import HomePage from '@/pages/HomePage';
import ObjectPage from '@/pages/ObjectDashboard';
import CreateObjetPage from '@/pages/CreateObjetPage';
import LogsPage from '@/pages/LogsPage';
import PrisonSelectionPage from '@/pages/PrisonSelectionPage';
import UserActivityLog from '@/pages/UserActivityLog';
// Composant de protection des routes
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

export default function App() {
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
        <Route path="/UserLogs" element={<UserActivityLog />} />

        
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
        
        <Route path="/:prisonId/createobject" element={
          <ProtectedRoute>
            <CreateObjetPage />
          </ProtectedRoute>
        } />
        
        <Route path="/:prisonId/logs" element={
          <ProtectedRoute>
            <LogsPage />
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