import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDevice } from '@/hooks/use-device.ts';
import SpotlightCard from '@/blocks/Components/SpotlightCard/SpotlightCard.tsx';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Users, Building, Activity, Globe, Server } from 'lucide-react';
import Squares from '../blocks/Backgrounds/Squares/squares.tsx';
import Header from '@/components/Header.tsx';
import Footer from '@/components/Footer.tsx';

export default function LandingPage() {
  const { isMobile } = useDevice();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    // Set direct styles instead of just adding a class
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = '#000';
    document.body.style.overflow = 'hidden'; // Start with hidden
    
    // Add scroll listener for header
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Allow scrolling after a brief period to ensure rendering
    const timer = setTimeout(() => {
      document.body.style.overflow = 'auto';
    }, 100);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.backgroundColor = '';
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full min-h-screen overflow-x-hidden bg-black">
      <Squares 
       speed={0.3} 
       squareSize={60}
       direction='diagonal' // up, down, left, right, diagonal
       borderColor='#fff'
       hoverFillColor='#222'
       />
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="relative z-10 flex flex-col min-h-screen pointer-events-auto">
          <Header 
            isScrolled={isScrolled} 
            mobileMenuOpen={mobileMenuOpen} 
            setMobileMenuOpen={setMobileMenuOpen} 
          />
          
          {/* Main content - added top padding to account for fixed header */}
          <main className="flex-grow flex flex-col items-center justify-center p-4 pt-24 md:pt-28">
            {/* Hero Section */}
            <div className="max-w-4xl text-center my-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
                Système de Gestion Pénitentiaire Intelligent
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-green-200">
                Contrôle complet et surveillance des établissements pénitentiaires avec protocoles de sécurité renforcés
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link to="/login">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-black font-semibold px-6 py-3">
                    Accéder au Tableau de Bord
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className={`text-black-300 border-green-500 hover:bg-green-900/30 hover:text-white px-6 py-3 ${isMobile ? 'm-auto w-[50%]' : ''}`}>
                  Obtenir une Démo
                </Button>
              </div>
            </div>
            
            {/* Key Features Section */}
            <div className="w-full md:w-4/5 lg:w-3/4 max-w-6xl mb-20 px-4">
              <h2 className="text-3xl font-bold mb-12 text-center text-white">Système de Contrôle Complet</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Feature 1 */}
                <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(45, 161, 51, 0.2)">
                  <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <Lock className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-green-300">Contrôle d'Accès Intelligent</h3>
                  <p className="text-gray-300">
                    Contrôle centralisé de toutes les portes, portails et points d'accès avec surveillance en temps réel et capacités de déverrouillage d'urgence.
                  </p>
                </SpotlightCard>

                {/* Feature 2 */}
                <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(45, 161, 51, 0.2)">
                  <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-green-300">Hiérarchie des Privilèges</h3>
                  <p className="text-gray-300">
                    Contrôle d'accès basé sur les rôles avec autorisation multi-niveaux, garantissant que le personnel n'accède qu'aux systèmes pertinents à leurs responsabilités.
                  </p>
                </SpotlightCard>

                {/* Feature 3 */}
                <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(45, 161, 51, 0.2)">
                  <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <Activity className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-green-300">Surveillance Avancée</h3>
                  <p className="text-gray-300">
                    Surveillance intégrée avec détection d'anomalies par IA et système d'alerte en temps réel pour une réponse immédiate aux incidents de sécurité.
                  </p>
                </SpotlightCard>

                {/* Feature 4 */}
                <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(45, 161, 51, 0.2)">
                  <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <Server className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-green-300">Appareils Connectés</h3>
                  <p className="text-gray-300">
                    Intégration transparente avec l'éclairage, la CVC, les systèmes de communication et les dispositifs de sécurité pour un contrôle complet des installations.
                  </p>
                </SpotlightCard>
              </div>
            </div>
            
            {/* Facilities and Expansion */}
            <div className="w-full max-w-6xl mb-20 bg-black/60 backdrop-blur-md p-8 rounded-lg border border-green-900/50">
              <h2 className="text-3xl font-bold mb-6 text-center text-white">Réseau Croissant d'Établissements Sécurisés</h2>
              <p className="text-lg text-center text-gray-300 mb-8">
                SecureSync est actuellement déployé dans de nombreux établissements pénitentiaires à travers le pays avec des plans d'expansion ambitieux.
              </p>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center justify-center mb-4">
                    <Building className="h-10 w-10 text-green-400 mr-3" />
                    <span className="text-4xl font-bold text-green-300">12+</span>
                  </div>
                  <p className="text-center text-gray-300">Établissements Utilisant SecureSync</p>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-center mb-4">
                    <Globe className="h-10 w-10 text-green-400 mr-3" />
                    <span className="text-4xl font-bold text-green-300">5</span>
                  </div>
                  <p className="text-center text-gray-300">Régions avec Implémentation SecureSync</p>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-center mb-4">
                    <Users className="h-10 w-10 text-green-400 mr-3" />
                    <span className="text-4xl font-bold text-green-300">3,000+</span>
                  </div>
                  <p className="text-center text-gray-300">Personnel de Sécurité Formé</p>
                </div>
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="w-full max-w-4xl text-center mb-16">
              <h2 className="text-2xl md:text-4xl font-bold mb-6 text-white">Prêt à Transformer Votre Établissement ?</h2>
              <p className="text-lg mb-8 text-gray-300">
                Rejoignez le réseau croissant d'établissements pénitentiaires modernes et sécurisés propulsés par la technologie SecureSync.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-black font-semibold px-6 py-3">
                    Planifier une Démo
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="outline" size="lg" className="text-black-300 border-green-500 hover:bg-green-900/30 hover:text-white px-6 py-3">
                    Voir les Tarifs
                  </Button>
                </Link>
              </div>
            </div>
          </main>
          
          <Footer />
        </div>
      </div>
    </div>
  );
}