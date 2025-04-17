// React Router
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
// Pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import LandingPage from '@/pages/LandingPage';
import FeaturesPage from '@/pages/FeaturesPage';
import ContactPage from '@/pages/ContactPage';
import AboutPage from '@/pages/AboutPage';
import RegisterPage from '@/pages/Register';
import ProfilePage from '@/pages/ProfilePage';
import CreateObjetPage from '@/pages/CreateObjetPage';
import ObjectPage from '@/pages/ObjectDashboard';
import StaffPage from '@/pages/StaffPage';
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
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/object" element={<ObjectPage />} />
        <Route path="/CreateObject" element={<CreateObjetPage />} />
        <Route path="/Staff" element={<StaffPage />} />
        
        {/* Routes protégées nécessitant une authentification */}
        <Route path="/home" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        
        {/* Redirection pour les routes non définies */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}