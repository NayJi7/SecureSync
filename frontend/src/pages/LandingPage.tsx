import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDevice } from '@/hooks/use-device.ts';
import SpotlightCard from '@/blocks/Components/SpotlightCard/SpotlightCard.tsx';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Users, Building, Activity, Globe, Server } from 'lucide-react';
import Squares from '../blocks/Backgrounds/Squares/squares.tsx';
import Header from '@/components/Header.tsx';
import Footer from '@/components/Footer.tsx';
import useAuth from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import {
  useScrollAnimation,
  fadeInVariants,
  slideUpVariants,
  slideRightVariants,
  slideLeftVariants,
  staggerChildrenVariants,
  staggerItemVariants
} from '@/hooks/useScrollAnimation';

export default function LandingPage() {
  const { isMobile } = useDevice();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, prisonId, user } = useAuth();

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
        squareSize={50}
        direction='diagonal'
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
            <motion.div
              className="max-w-4xl text-center my-12"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.3
                  }
                }
              }}
            >
              <motion.h1
                className="text-4xl md:text-6xl font-bold mb-6 text-white"
                variants={slideUpVariants}
              >
                Système de Gestion Pénitentiaire Intelligent
              </motion.h1>
              <motion.p
                className="text-xl md:text-2xl mb-8 text-green-200"
                variants={slideUpVariants}
              >
                Contrôle complet et surveillance des établissements pénitentiaires avec protocoles de sécurité renforcés
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
                variants={fadeInVariants}
              >
                <Button
                  size="lg"
                  className="bg-green-900/60 hover:bg-green-900/80 text-white font-semibold cursor-pointer border border-green-500/50 px-6 py-3"
                  onClick={() => {
                    // Affichage détaillé pour le débogage
                    console.log("Clic sur Accéder au Tableau de Bord");
                    console.log("État d'authentification:", isAuthenticated);
                    console.log("Prison ID:", prisonId);
                    console.log("Données utilisateur:", user);

                    // Vérifier si une prison est sélectionnée dans le localStorage (prioritaire)
                    const selectedPrisonId = localStorage.getItem('selectedPrison');
                    console.log("Prison sélectionnée dans localStorage:", selectedPrisonId);

                    if (isAuthenticated) {
                      // Si l'utilisateur est authentifié
                      if (selectedPrisonId) {
                        // Toujours privilégier la sélection manuelle faite par l'admin
                        console.log("Redirection vers la prison sélectionnée manuellement:", selectedPrisonId);
                        navigate(`/${selectedPrisonId}/home`);
                      } else if (prisonId) {
                        // Si l'ID de prison est défini via le hook useAuth
                        console.log("Redirection vers la page d'accueil avec l'ID de prison de l'utilisateur:", prisonId);
                        navigate(`/${prisonId}/home`);
                      } else if (user && (user as any).Prison_id) {
                        // Vérification directe dans l'objet user avec cast pour éviter erreur TypeScript
                        console.log("Redirection vers la page d'accueil avec l'ID de prison trouvé dans user:", (user as any).Prison_id);
                        navigate(`/${(user as any).Prison_id}/home`);
                      } else {
                        // Fallback sur l'ID stocké dans userPrison
                        const userPrisonId = localStorage.getItem('userPrison');
                        if (userPrisonId) {
                          console.log("Redirection vers la page d'accueil avec l'ID userPrison:", userPrisonId);
                          navigate(`/${userPrisonId}/home`);
                        }
                        else {
                          console.log("Aucun ID de prison trouvé, impossible de rediriger");
                        }
                      }
                    } else {
                      // Non authentifié, redirection vers login
                      console.log("Non authentifié, redirection vers login");
                      navigate('/login');
                    }
                  }}
                >
                  Accéder au Tableau de Bord
                </Button>
                <Link to="/contact">
                  <Button variant="outline" size="lg" className={`bg-black/40 border border-white/70 text-white hover:bg-white/80 hover:border-white hover:text-black cursor-pointer px-6 py-3 ${isMobile ? 'm-auto w-[50%]' : ''}`}>
                    Obtenir une Démo
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Key Features Section */}
            <div className="w-full md:w-4/5 lg:w-3/4 max-w-6xl mb-20 px-4">
              <motion.h2
                className="text-3xl font-bold mb-12 text-center text-white"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                Système de Contrôle Complet
              </motion.h2>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={staggerChildrenVariants}
              >
                {/* Feature 1 */}
                <motion.div variants={staggerItemVariants}>
                  <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(45, 161, 51, 0.2)">
                    <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                      <Lock className="h-6 w-6 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-green-300">Contrôle d'Accès Intelligent</h3>
                    <p className="text-gray-300">
                      Contrôle centralisé de toutes les portes, portails et points d'accès avec surveillance en temps réel et capacités de déverrouillage d'urgence.
                    </p>
                  </SpotlightCard>
                </motion.div>

                {/* Feature 2 */}
                <motion.div variants={staggerItemVariants}>
                  <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(45, 161, 51, 0.2)">
                    <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                      <Shield className="h-6 w-6 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-green-300">Hiérarchie des Privilèges</h3>
                    <p className="text-gray-300">
                      Contrôle d'accès basé sur les rôles avec autorisation multi-niveaux, garantissant que le personnel n'accède qu'aux systèmes pertinents à leurs responsabilités.
                    </p>
                  </SpotlightCard>
                </motion.div>

                {/* Feature 3 */}
                <motion.div variants={staggerItemVariants}>
                  <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(45, 161, 51, 0.2)">
                    <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                      <Activity className="h-6 w-6 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-green-300">Surveillance Avancée</h3>
                    <p className="text-gray-300">
                      Surveillance intégrée avec détection d'anomalies par IA et système d'alerte en temps réel pour une réponse immédiate aux incidents de sécurité.
                    </p>
                  </SpotlightCard>
                </motion.div>

                {/* Feature 4 */}
                <motion.div variants={staggerItemVariants}>
                  <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(45, 161, 51, 0.2)">
                    <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                      <Server className="h-6 w-6 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-green-300">Appareils Connectés</h3>
                    <p className="text-gray-300">
                      Intégration transparente avec l'éclairage, la CVC, les systèmes de communication et les dispositifs de sécurité pour un contrôle complet des installations.
                    </p>
                  </SpotlightCard>
                </motion.div>
              </motion.div>
            </div>

            {/* Facilities and Expansion */}
            <motion.div
              className="w-full max-w-6xl mb-20 bg-black/60 backdrop-blur-md p-8 rounded-lg border border-green-900/50"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <motion.h2
                className="text-3xl font-bold mb-6 text-center text-white"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                viewport={{ once: true }}
              >
                Réseau Croissant d'Établissements Sécurisés
              </motion.h2>
              <motion.p
                className="text-lg text-center text-gray-300 mb-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                viewport={{ once: true }}
              >
                SecureSync est actuellement déployé dans de nombreux établissements pénitentiaires à travers le pays avec des plans d'expansion ambitieux.
              </motion.p>

              <motion.div
                className="flex flex-col md:flex-row items-center justify-between gap-8"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.2,
                      delayChildren: 0.3
                    }
                  }
                }}
              >
                <motion.div
                  className="flex-1"
                  variants={{
                    hidden: { opacity: 0, scale: 0.9 },
                    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
                  }}
                >
                  <div className="flex items-center justify-center mb-4">
                    <Building className="h-10 w-10 text-green-400 mr-3" />
                    <span className="text-4xl font-bold text-green-300">12+</span>
                  </div>
                  <p className="text-center text-gray-300">Établissements Utilisant SecureSync</p>
                </motion.div>

                <motion.div
                  className="flex-1"
                  variants={{
                    hidden: { opacity: 0, scale: 0.9 },
                    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
                  }}
                >
                  <div className="flex items-center justify-center mb-4">
                    <Globe className="h-10 w-10 text-green-400 mr-3" />
                    <span className="text-4xl font-bold text-green-300">5</span>
                  </div>
                  <p className="text-center text-gray-300">Régions avec Implémentation SecureSync</p>
                </motion.div>

                <motion.div
                  className="flex-1"
                  variants={{
                    hidden: { opacity: 0, scale: 0.9 },
                    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
                  }}
                >
                  <div className="flex items-center justify-center mb-4">
                    <Users className="h-10 w-10 text-green-400 mr-3" />
                    <span className="text-4xl font-bold text-green-300">3,000+</span>
                  </div>
                  <p className="text-center text-gray-300">Personnel de Sécurité Formé</p>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              className="w-full max-w-4xl text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <h2 className="text-2xl md:text-4xl font-bold mb-6 text-white">Prêt à Transformer Votre Établissement ?</h2>
              <p className="text-lg mb-8 text-gray-300">
                Rejoignez le réseau croissant d'établissements pénitentiaires modernes et sécurisés propulsés par la technologie SecureSync.
              </p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Link to="/contact">
                  <Button size="lg" className="bg-green-900/60 hover:bg-green-900/80 text-white font-semibold cursor-pointer border border-green-500/50">
                    Planifier une Démo
                  </Button>
                </Link>
                <Link to="/features">
                  <Button variant="outline" size="lg" className="bg-black/40 border border-white/70 text-white hover:bg-white/80 hover:border-white hover:text-black cursor-pointer">
                    Voir les Tarifs
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}