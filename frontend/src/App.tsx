// React Router
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';

// Pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import LandingPage from '@/pages/LandingPage';
import FeaturesPage from '@/pages/FeaturesPage';
import ContactPage from '@/pages/ContactPage';
import AboutPage from '@/pages/AboutPage';
import './App.css';
  import RegisterPage from '@/pages/Register'; // 👈 importer ta page

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} /> {/* 👈 route pour s’inscrire */}
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
