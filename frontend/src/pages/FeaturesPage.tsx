import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Check, Shield, Lock, Users, Building, Server, Eye, Database, BellRing, Calendar, Video, Cpu, CheckCircle, FolderOpen, Search } from 'lucide-react';
import Squares from '../blocks/Backgrounds/Squares/squares.tsx';
import SpotlightCard from '@/blocks/Components/SpotlightCard/SpotlightCard.tsx';
import { useDevice } from '@/hooks/use-device';
import Footer from '@/components/Footer.tsx';
import Header from '@/components/Header.tsx';

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState('security');
  const { isMobile } = useDevice();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Add scroll listener for header
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-black">
      <Squares
        speed={0.15}
        squareSize={80}
        direction='diagonal'
        borderColor='rgba(255, 255, 255, 0.15)'
        hoverFillColor='rgba(34, 197, 94, 0.1)'
        opacity={0.2}
      />

      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="relative z-10 flex flex-col min-h-screen pointer-events-auto">
          <Header
            isScrolled={isScrolled}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />

          {/* Mobile menu dropdown */}
          {isMobile && mobileMenuOpen && (
            <div className="fixed top-[60px] left-0 right-0 bg-black/95 backdrop-blur-lg z-40 border-t border-green-900/30 animate-in slide-in-from-top">
              <div className="flex flex-col p-4">
                <Link to="/" className="py-2 text-green-300/80 hover:text-green-300 transition-colors">Home</Link>
                <Link to="/features" className="py-2 text-green-300/80 hover:text-green-300 transition-colors">Features</Link>
                <Link to="/about" className="py-2 text-green-300/80 hover:text-green-300 transition-colors">About</Link>
                <Link to="/contact" className="py-2 text-green-300/80 hover:text-green-300 transition-colors">Contact</Link>
                <Link to="/demo" className="py-2 text-green-300/80 hover:text-green-300 transition-colors">Demo</Link>
                <Link to="/login" className="py-2 text-green-300/80 hover:text-green-300 transition-colors">Login</Link>
              </div>
            </div>
          )}

          <main className="flex-grow container mx-auto px-4 pt-32 pb-12">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white text-center drop-shadow-glow">Fonctionnalités</h1>
              <p className="text-xl text-green-200 text-center mb-12 max-w-3xl mx-auto">
                SecureSync offre une suite complète de fonctionnalités conçues pour optimiser la gestion et la sécurité des établissements pénitentiaires
              </p>

              {/* Section Introduction */}
              <section className="mb-16 backdrop-blur-md bg-black/60 p-8 rounded-xl border border-green-900/30 shadow-2xl shadow-green-900/10 hover:shadow-green-900/20 transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="text-3xl font-semibold mb-4 text-green-300 drop-shadow-sm">Solution complète de gestion pénitentiaire</h2>
                    <p className="text-gray-300 mb-6">
                      SecureSync est une plateforme intégrée qui connecte tous les aspects de la gestion pénitentiaire en un système unifié et sécurisé.
                      Notre solution offre un contrôle sans précédent, une surveillance en temps réel et une gestion efficace des ressources.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-900/40 flex items-center justify-center mr-3 mt-0.5 shadow-sm shadow-green-900/50">
                          <Check className="h-4 w-4 text-green-400" />
                        </div>
                        <span className="text-gray-300">Interface unifiée pour toutes les opérations</span>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-900/40 flex items-center justify-center mr-3 mt-0.5 shadow-sm shadow-green-900/50">
                          <Check className="h-4 w-4 text-green-400" />
                        </div>
                        <span className="text-gray-300">Architecture évolutive adaptée à tous types d'établissements</span>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-900/40 flex items-center justify-center mr-3 mt-0.5 shadow-sm shadow-green-900/50">
                          <Check className="h-4 w-4 text-green-400" />
                        </div>
                        <span className="text-gray-300">Conformité aux normes de sécurité les plus strictes</span>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-900/40 flex items-center justify-center mr-3 mt-0.5 shadow-sm shadow-green-900/50">
                          <Check className="h-4 w-4 text-green-400" />
                        </div>
                        <span className="text-gray-300">Déploiement flexible sur site ou en cloud sécurisé</span>
                      </li>
                    </ul>
                  </div>
                  <div className="relative h-64 md:h-full flex items-center justify-center">
                    <div className="w-full h-64 bg-green-900/20 rounded-lg flex items-center justify-center p-4 backdrop-blur-sm shadow-xl shadow-green-900/10 border border-green-900/40">
                      <Shield className="h-24 w-24 text-green-400/70" />
                      <p className="absolute bottom-4 text-sm text-green-300/70">
                        Interface du Dashboard SecureSync
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Onglets des fonctionnalités */}
              <Tabs
                defaultValue="security"
                value={activeTab}
                onValueChange={setActiveTab}
                className="mb-16"
              >
                <div className="backdrop-blur-md bg-black/60 p-6 rounded-t-xl border border-green-900/30 border-b-0 shadow-lg shadow-green-900/10">
                  <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-4 mx-auto w-full max-w-3xl">
                    <TabsTrigger
                      value="security"
                      className="data-[state=active]:bg-green-900/60 data-[state=active]:text-white transition-all duration-300"
                    >
                      <Shield className="h-4 w-4 mr-2" /> Sécurité
                    </TabsTrigger>
                    <TabsTrigger
                      value="monitoring"
                      className="data-[state=active]:bg-green-900/60 data-[state=active]:text-white transition-all duration-300"
                    >
                      <Eye className="h-4 w-4 mr-2" /> Surveillance
                    </TabsTrigger>
                    <TabsTrigger
                      value="management"
                      className="data-[state=active]:bg-green-900/60 data-[state=active]:text-white transition-all duration-300"
                    >
                      <Users className="h-4 w-4 mr-2" /> Gestion
                    </TabsTrigger>
                    <TabsTrigger
                      value="integration"
                      className="data-[state=active]:bg-green-900/60 data-[state=active]:text-white transition-all duration-300"
                    >
                      <Server className="h-4 w-4 mr-2" /> Intégration
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="backdrop-blur-md bg-black/60 p-8 rounded-b-xl border border-green-900/30 shadow-2xl shadow-green-900/10 transition-all duration-300">
                  <TabsContent value="security" className="mt-0 animate-in fade-in-50 duration-500">
                    <h3 className="text-2xl font-semibold mb-6 text-green-300 drop-shadow-sm">Sécurité avancée</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <SpotlightCard className="h-full" spotlightColor="rgba(45, 161, 51, 0.2)">
                        <div className="w-12 h-12 bg-green-900/40 rounded-full flex items-center justify-center mb-4 shadow-md shadow-green-900/20">
                          <Lock className="h-6 w-6 text-green-400" />
                        </div>
                        <h4 className="text-xl font-semibold mb-2 text-green-300">Contrôle d'accès intelligent</h4>
                        <p className="text-gray-300">
                          Gestion centralisée de toutes les portes, portails et points d'accès avec surveillance en temps réel et capacités de déverrouillage d'urgence.
                        </p>
                      </SpotlightCard>

                      <SpotlightCard className="h-full" spotlightColor="rgba(45, 161, 51, 0.2)">
                        <div className="w-12 h-12 bg-green-900/40 rounded-full flex items-center justify-center mb-4 shadow-md shadow-green-900/20">
                          <Shield className="h-6 w-6 text-green-400" />
                        </div>
                        <h4 className="text-xl font-semibold mb-2 text-green-300">Authentification multi-facteurs</h4>
                        <p className="text-gray-300">
                          Sécurité renforcée avec identification biométrique, cartes à puce et codes PIN pour un accès sécurisé à tous les niveaux.
                        </p>
                      </SpotlightCard>

                      <SpotlightCard className="h-full" spotlightColor="rgba(45, 161, 51, 0.2)">
                        <div className="w-12 h-12 bg-green-900/40 rounded-full flex items-center justify-center mb-4 shadow-md shadow-green-900/20">
                          <Database className="h-6 w-6 text-green-400" />
                        </div>
                        <h4 className="text-xl font-semibold mb-2 text-green-300">Chiffrement de bout en bout</h4>
                        <p className="text-gray-300">
                          Protection des données sensibles avec les dernières technologies de chiffrement et conformité aux normes internationales.
                        </p>
                      </SpotlightCard>
                    </div>
                    <div className="bg-green-900/20 p-6 rounded-lg border border-green-900/40 shadow-lg shadow-green-900/10 backdrop-blur-sm">
                      <h4 className="flex items-center text-lg font-medium mb-4 text-green-300">
                        <CheckCircle className="h-5 w-5 mr-2" /> En vedette: Système de réponse aux incidents
                      </h4>
                      <p className="text-gray-300 mb-4">
                        Notre protocole de réponse aux incidents de sécurité offre une gestion coordonnée des situations d'urgence, avec des alertes automatiques, des procédures prédéfinies et une coordination en temps réel.
                      </p>
                      <div className="w-full h-48 object-cover rounded-lg bg-black/40 mb-4 flex items-center justify-center border border-green-900/30">
                        <Shield className="h-16 w-16 text-green-500/30" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-green-900/60 text-green-300 hover:bg-green-800/80 shadow-sm">Alertes en temps réel</Badge>
                        <Badge className="bg-green-900/60 text-green-300 hover:bg-green-800/80 shadow-sm">Verrouillage d'urgence</Badge>
                        <Badge className="bg-green-900/60 text-green-300 hover:bg-green-800/80 shadow-sm">Coordination des équipes</Badge>
                        <Badge className="bg-green-900/60 text-green-300 hover:bg-green-800/80 shadow-sm">Procédures automatisées</Badge>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="monitoring" className="mt-0 animate-in fade-in-50 duration-500">
                    <h3 className="text-2xl font-semibold mb-6 text-green-300 drop-shadow-sm">Surveillance intelligente</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <SpotlightCard className="h-full" spotlightColor="rgba(45, 161, 51, 0.2)">
                        <div className="w-12 h-12 bg-green-900/40 rounded-full flex items-center justify-center mb-4 shadow-md shadow-green-900/20">
                          <Video className="h-6 w-6 text-green-400" />
                        </div>
                        <h4 className="text-xl font-semibold mb-2 text-green-300">Système de vidéosurveillance</h4>
                        <p className="text-gray-300">
                          Réseau de caméras HD avec analyse vidéo en temps réel, zoom avancé et capacités de vision nocturne pour une couverture 24/7.
                        </p>
                      </SpotlightCard>

                      <SpotlightCard className="h-full" spotlightColor="rgba(45, 161, 51, 0.2)">
                        <div className="w-12 h-12 bg-green-900/40 rounded-full flex items-center justify-center mb-4 shadow-md shadow-green-900/20">
                          <Cpu className="h-6 w-6 text-green-400" />
                        </div>
                        <h4 className="text-xl font-semibold mb-2 text-green-300">Détection d'anomalies par IA</h4>
                        <p className="text-gray-300">
                          Algorithmes d'intelligence artificielle qui identifient les comportements suspects et les situations potentiellement dangereuses.
                        </p>
                      </SpotlightCard>

                      <SpotlightCard className="h-full" spotlightColor="rgba(45, 161, 51, 0.2)">
                        <div className="w-12 h-12 bg-green-900/40 rounded-full flex items-center justify-center mb-4 shadow-md shadow-green-900/20">
                          <BellRing className="h-6 w-6 text-green-400" />
                        </div>
                        <h4 className="text-xl font-semibold mb-2 text-green-300">Système d'alerte avancé</h4>
                        <p className="text-gray-300">
                          Notifications instantanées sur plusieurs canaux pour une réponse rapide aux incidents de sécurité.
                        </p>
                      </SpotlightCard>
                    </div>
                    <div className="bg-green-900/20 p-6 rounded-lg border border-green-900/40 shadow-lg shadow-green-900/10 backdrop-blur-sm">
                      <h4 className="flex items-center text-lg font-medium mb-4 text-green-300">
                        <CheckCircle className="h-5 w-5 mr-2" /> En vedette: Tableau de bord de surveillance unifié
                      </h4>
                      <p className="text-gray-300 mb-4">
                        Interface centralisée offrant une vue d'ensemble de toutes les zones surveillées, avec possibilité de zoomer sur des secteurs spécifiques et d'accéder instantanément aux flux vidéo en direct.
                      </p>
                      <div className="w-full h-48 object-cover rounded-lg bg-black/40 mb-4 flex items-center justify-center border border-green-900/30">
                        <Shield className="h-16 w-16 text-green-500/30" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-green-900/60 text-green-300 hover:bg-green-800/80 shadow-sm">Vue multi-caméras</Badge>
                        <Badge className="bg-green-900/60 text-green-300 hover:bg-green-800/80 shadow-sm">Replay instantané</Badge>
                        <Badge className="bg-green-900/60 text-green-300 hover:bg-green-800/80 shadow-sm">Analyse comportementale</Badge>
                        <Badge className="bg-green-900/60 text-green-300 hover:bg-green-800/80 shadow-sm">Zones d'intérêt</Badge>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="management" className="mt-0 animate-in fade-in-50 duration-500">
                    <h3 className="text-2xl font-semibold mb-6 text-green-300 drop-shadow-sm">Gestion complète</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <SpotlightCard className="h-full" spotlightColor="rgba(45, 161, 51, 0.2)">
                        <div className="w-12 h-12 bg-green-900/40 rounded-full flex items-center justify-center mb-4 shadow-md shadow-green-900/20">
                          <Users className="h-6 w-6 text-green-400" />
                        </div>
                        <h4 className="text-xl font-semibold mb-2 text-green-300">Gestion du personnel</h4>
                        <p className="text-gray-300">
                          Suivi des horaires, des affectations et des accréditations du personnel avec gestion hiérarchisée des autorisations.
                        </p>
                      </SpotlightCard>

                      <SpotlightCard className="h-full" spotlightColor="rgba(45, 161, 51, 0.2)">
                        <div className="w-12 h-12 bg-green-900/40 rounded-full flex items-center justify-center mb-4 shadow-md shadow-green-900/20">
                          <FolderOpen className="h-6 w-6 text-green-400" />
                        </div>
                        <h4 className="text-xl font-semibold mb-2 text-green-300">Gestion des dossiers</h4>
                        <p className="text-gray-300">
                          Système complet de gestion des dossiers des détenus, incluant données personnelles, historique médical et juridique.
                        </p>
                      </SpotlightCard>

                      <SpotlightCard className="h-full" spotlightColor="rgba(45, 161, 51, 0.2)">
                        <div className="w-12 h-12 bg-green-900/40 rounded-full flex items-center justify-center mb-4 shadow-md shadow-green-900/20">
                          <Calendar className="h-6 w-6 text-green-400" />
                        </div>
                        <h4 className="text-xl font-semibold mb-2 text-green-300">Planification et logistique</h4>
                        <p className="text-gray-300">
                          Outils de planification pour les transferts, les visites et les activités quotidiennes avec optimisation automatique.
                        </p>
                      </SpotlightCard>
                    </div>
                    <div className="bg-green-900/20 p-6 rounded-lg border border-green-900/40 shadow-lg shadow-green-900/10 backdrop-blur-sm">
                      <h4 className="flex items-center text-lg font-medium mb-4 text-green-300">
                        <CheckCircle className="h-5 w-5 mr-2" /> En vedette: Système de rapports et analyses
                      </h4>
                      <p className="text-gray-300 mb-4">
                        Génération automatisée de rapports détaillés avec analyses statistiques, tendances et indicateurs de performance pour une prise de décision éclairée.
                      </p>
                      <div className="w-full h-48 object-cover rounded-lg bg-black/40 mb-4 flex items-center justify-center border border-green-900/30">
                        <Shield className="h-16 w-16 text-green-500/30" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-green-900/60 text-green-300 hover:bg-green-800/80 shadow-sm">Rapports personnalisables</Badge>
                        <Badge className="bg-green-900/60 text-green-300 hover:bg-green-800/80 shadow-sm">Visualisation des données</Badge>
                        <Badge className="bg-green-900/60 text-green-300 hover:bg-green-800/80 shadow-sm">Analyse prédictive</Badge>
                        <Badge className="bg-green-900/60 text-green-300 hover:bg-green-800/80 shadow-sm">Exportation multi-formats</Badge>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="integration" className="mt-0 animate-in fade-in-50 duration-500">
                    <h3 className="text-2xl font-semibold mb-6 text-green-300 drop-shadow-sm">Intégration des systèmes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <SpotlightCard className="h-full" spotlightColor="rgba(45, 161, 51, 0.2)">
                        <div className="w-12 h-12 bg-green-900/40 rounded-full flex items-center justify-center mb-4 shadow-md shadow-green-900/20">
                          <Server className="h-6 w-6 text-green-400" />
                        </div>
                        <h4 className="text-xl font-semibold mb-2 text-green-300">Contrôle des infrastructures</h4>
                        <p className="text-gray-300">
                          Intégration avec les systèmes d'éclairage, de CVC, de communication et autres équipements pour un contrôle centralisé.
                        </p>
                      </SpotlightCard>

                      <SpotlightCard className="h-full" spotlightColor="rgba(45, 161, 51, 0.2)">
                        <div className="w-12 h-12 bg-green-900/40 rounded-full flex items-center justify-center mb-4 shadow-md shadow-green-900/20">
                          <Database className="h-6 w-6 text-green-400" />
                        </div>
                        <h4 className="text-xl font-semibold mb-2 text-green-300">Intégration des bases de données</h4>
                        <p className="text-gray-300">
                          Connexion sécurisée avec les bases de données juridiques et administratives externes pour un accès simplifié aux informations.
                        </p>
                      </SpotlightCard>

                      <SpotlightCard className="h-full" spotlightColor="rgba(45, 161, 51, 0.2)">
                        <div className="w-12 h-12 bg-green-900/40 rounded-full flex items-center justify-center mb-4 shadow-md shadow-green-900/20">
                          <Search className="h-6 w-6 text-green-400" />
                        </div>
                        <h4 className="text-xl font-semibold mb-2 text-green-300">API ouvertes</h4>
                        <p className="text-gray-300">
                          Interfaces de programmation sécurisées permettant l'intégration avec des systèmes tiers et le développement d'extensions.
                        </p>
                      </SpotlightCard>
                    </div>
                    <div className="bg-green-900/20 p-6 rounded-lg border border-green-900/40 shadow-lg shadow-green-900/10 backdrop-blur-sm">
                      <h4 className="flex items-center text-lg font-medium mb-4 text-green-300">
                        <CheckCircle className="h-5 w-5 mr-2" /> En vedette: Centre de commande unifié
                      </h4>
                      <p className="text-gray-300 mb-4">
                        Plateforme centrale intégrant tous les systèmes de l'établissement en une interface unifiée, offrant un contrôle complet et une visibilité totale sur toutes les opérations.
                      </p>
                      <div className="w-full h-48 object-cover rounded-lg bg-black/40 mb-4 flex items-center justify-center border border-green-900/30">
                        <Shield className="h-16 w-16 text-green-500/30" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-green-900/60 text-green-300 hover:bg-green-800/80 shadow-sm">Interface unifiée</Badge>
                        <Badge className="bg-green-900/60 text-green-300 hover:bg-green-800/80 shadow-sm">Contrôle multi-systèmes</Badge>
                        <Badge className="bg-green-900/60 text-green-300 hover:bg-green-800/80 shadow-sm">Automatisation</Badge>
                        <Badge className="bg-green-900/60 text-green-300 hover:bg-green-800/80 shadow-sm">Personnalisation</Badge>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>

              {/* Tableau comparatif des éditions */}
              <section className="mb-16">
                <h2 className="text-3xl font-semibold mb-8 text-center text-green-300 drop-shadow-sm">Éditions disponibles</h2>

                <div className="overflow-x-auto">
                  <table className="w-full backdrop-blur-md bg-black/60 rounded-xl border border-green-900/30 shadow-2xl shadow-green-900/10">
                    <thead>
                      <tr className="border-b border-green-900/30">
                        <th className="p-4 text-left text-green-200">Fonctionnalités</th>
                        <th className="p-4 text-center text-green-200">Édition Standard</th>
                        <th className="p-4 text-center text-green-200">Édition Professionnelle</th>
                        <th className="p-4 text-center text-green-200">Édition Entreprise</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-green-900/30">
                        <td className="p-4 text-gray-300">Contrôle d'accès de base</td>
                        <td className="p-4 text-center text-gray-300"><CheckCircle className="h-5 w-5 mx-auto text-green-400" /></td>
                        <td className="p-4 text-center text-gray-300"><CheckCircle className="h-5 w-5 mx-auto text-green-400" /></td>
                        <td className="p-4 text-center text-gray-300"><CheckCircle className="h-5 w-5 mx-auto text-green-400" /></td>
                      </tr>
                      <tr className="border-b border-green-900/30">
                        <td className="p-4 text-gray-300">Vidéosurveillance</td>
                        <td className="p-4 text-center text-gray-300"><CheckCircle className="h-5 w-5 mx-auto text-green-400" /></td>
                        <td className="p-4 text-center text-gray-300"><CheckCircle className="h-5 w-5 mx-auto text-green-400" /></td>
                        <td className="p-4 text-center text-gray-300"><CheckCircle className="h-5 w-5 mx-auto text-green-400" /></td>
                      </tr>
                      <tr className="border-b border-green-900/30">
                        <td className="p-4 text-gray-300">Gestion des dossiers</td>
                        <td className="p-4 text-center text-gray-300"><CheckCircle className="h-5 w-5 mx-auto text-green-400" /></td>
                        <td className="p-4 text-center text-gray-300"><CheckCircle className="h-5 w-5 mx-auto text-green-400" /></td>
                        <td className="p-4 text-center text-gray-300"><CheckCircle className="h-5 w-5 mx-auto text-green-400" /></td>
                      </tr>
                      <tr className="border-b border-green-900/30">
                        <td className="p-4 text-gray-300">Analyse IA</td>
                        <td className="p-4 text-center text-gray-300">—</td>
                        <td className="p-4 text-center text-gray-300"><CheckCircle className="h-5 w-5 mx-auto text-green-400" /></td>
                        <td className="p-4 text-center text-gray-300"><CheckCircle className="h-5 w-5 mx-auto text-green-400" /></td>
                      </tr>
                      <tr className="border-b border-green-900/30">
                        <td className="p-4 text-gray-300">Intégration multi-systèmes</td>
                        <td className="p-4 text-center text-gray-300">—</td>
                        <td className="p-4 text-center text-gray-300"><CheckCircle className="h-5 w-5 mx-auto text-green-400" /></td>
                        <td className="p-4 text-center text-gray-300"><CheckCircle className="h-5 w-5 mx-auto text-green-400" /></td>
                      </tr>
                      <tr className="border-b border-green-900/30">
                        <td className="p-4 text-gray-300">Rapports avancés</td>
                        <td className="p-4 text-center text-gray-300">—</td>
                        <td className="p-4 text-center text-gray-300"><CheckCircle className="h-5 w-5 mx-auto text-green-400" /></td>
                        <td className="p-4 text-center text-gray-300"><CheckCircle className="h-5 w-5 mx-auto text-green-400" /></td>
                      </tr>
                      <tr className="border-b border-green-900/30">
                        <td className="p-4 text-gray-300">Système de réponse aux incidents</td>
                        <td className="p-4 text-center text-gray-300">Basique</td>
                        <td className="p-4 text-center text-gray-300">Avancé</td>
                        <td className="p-4 text-center text-gray-300">Premium</td>
                      </tr>
                      <tr className="border-b border-green-900/30">
                        <td className="p-4 text-gray-300">API personnalisables</td>
                        <td className="p-4 text-center text-gray-300">—</td>
                        <td className="p-4 text-center text-gray-300">—</td>
                        <td className="p-4 text-center text-gray-300"><CheckCircle className="h-5 w-5 mx-auto text-green-400" /></td>
                      </tr>
                      <tr className="border-b border-green-900/30">
                        <td className="p-4 text-gray-300">Support 24/7</td>
                        <td className="p-4 text-center text-gray-300">—</td>
                        <td className="p-4 text-center text-gray-300">—</td>
                        <td className="p-4 text-center text-gray-300"><CheckCircle className="h-5 w-5 mx-auto text-green-400" /></td>
                      </tr>
                      <tr className="border-b border-green-900/30">
                        <td className="p-4 text-gray-300">Déploiement multi-sites</td>
                        <td className="p-4 text-center text-gray-300">—</td>
                        <td className="p-4 text-center text-gray-300">—</td>
                        <td className="p-4 text-center text-gray-300"><CheckCircle className="h-5 w-5 mx-auto text-green-400" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Témoignages clients */}
              <section className="mb-16">
                <h2 className="text-3xl font-semibold mb-8 text-center text-green-300 drop-shadow-sm">Ce que nos clients disent</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="backdrop-blur-md bg-black/60 p-6 rounded-xl border border-green-900/30 shadow-xl shadow-green-900/10 hover:shadow-green-900/20 transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center mr-4">
                        <Building className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-200">Centre Pénitentiaire de Lyon</h4>
                        <p className="text-gray-400 text-sm">Établissement de haute sécurité</p>
                      </div>
                    </div>
                    <p className="text-gray-300">
                      "SecureSync a complètement transformé notre approche de la sécurité. La détection d'anomalies par IA nous a permis d'identifier et de prévenir plusieurs incidents potentiels avant qu'ils ne surviennent."
                    </p>
                  </div>

                  <div className="backdrop-blur-md bg-black/60 p-6 rounded-xl border border-green-900/30 shadow-xl shadow-green-900/10 hover:shadow-green-900/20 transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center mr-4">
                        <Building className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-200">Direction Régionale de l'Administration Pénitentiaire</h4>
                        <p className="text-gray-400 text-sm">Coordination multi-établissements</p>
                      </div>
                    </div>
                    <p className="text-gray-300">
                      "L'intégration multi-sites de SecureSync nous permet de superviser efficacement plusieurs établissements avec une équipe réduite. Les outils de reporting avancés facilitent la prise de décision stratégique."
                    </p>
                  </div>
                </div>
              </section>

              {/* FAQ */}
              <section className="mb-16 backdrop-blur-md bg-black/60 p-8 rounded-xl border border-green-900/30 shadow-2xl shadow-green-900/10">
                <h2 className="text-3xl font-semibold mb-8 text-center text-green-300 drop-shadow-sm">Questions fréquentes</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-medium mb-2 text-green-200">Quelle est la durée typique de déploiement ?</h3>
                    <p className="text-gray-300">
                      Le déploiement complet prend généralement entre 2 et 4 mois, selon la taille de l'établissement et la complexité des systèmes à intégrer. Notre équipe assure une transition fluide avec un minimum de perturbations.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium mb-2 text-green-200">Le système peut-il fonctionner sans connexion internet ?</h3>
                    <p className="text-gray-300">
                      Oui, SecureSync est conçu pour fonctionner en mode autonome en cas de perte de connectivité. Toutes les fonctions critiques restent opérationnelles et les données sont synchronisées automatiquement lorsque la connexion est rétablie.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium mb-2 text-green-200">Quelles sont les options de formation disponibles ?</h3>
                    <p className="text-gray-300">
                      Nous proposons des formations complètes pour tous les niveaux d'utilisateurs, des administrateurs système aux agents de sécurité. Les programmes sont personnalisés selon les besoins spécifiques de chaque établissement.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium mb-2 text-green-200">Comment est assurée la conformité aux réglementations ?</h3>
                    <p className="text-gray-300">
                      SecureSync est développé en conformité avec les normes de sécurité et de protection des données les plus strictes. Notre équipe juridique assure une veille réglementaire permanente pour garantir la conformité continue du système.
                    </p>
                  </div>
                </div>
              </section>

              {/* Call to Action */}
              <div className="text-center backdrop-blur-md bg-black/60 p-8 rounded-xl border border-green-900/30 shadow-2xl shadow-green-900/10">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white drop-shadow-glow">
                  Prêt à améliorer la sécurité de votre établissement ?
                </h2>
                <p className="text-lg mb-6 text-gray-300">
                  Contactez-nous dès aujourd'hui pour une démonstration personnalisée
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/contact">
                    <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 shadow-md shadow-green-900/40 hover:shadow-lg hover:shadow-green-900/50 transition-all">
                      Demander une démo
                    </Button>
                  </Link>
                  <Link to="/about">
                    <Button variant="outline" size="lg" className="border-green-500 hover:bg-green-900/40 text-green-300 px-6 shadow-md shadow-green-900/30 hover:shadow-lg transition-all hover:text-white">
                      En savoir plus
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </main>

          <Footer />
        </div>
      </div>

      {/* Add a style tag for custom drop shadow */}
      <style>
        {`
          .drop-shadow-glow {
            filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.2));
          }
        `}
      </style>
    </div>
  );
}
