import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Users, Award, Landmark } from 'lucide-react';
import Squares from '../blocks/Backgrounds/Squares/squares.tsx';
import { useDevice } from '@/hooks/use-device';
import Footer from '@/components/Footer.tsx';
import Header from '@/components/Header.tsx';

export default function AboutPage() {
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
        speed={0.2} 
        squareSize={60}
        direction='diagonal'
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
            <div className="max-w-5xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-8 text-white text-center">À propos de SecureSync</h1>
              
              {/* Section Histoire */}
              <section className="mb-20">
                <div className="backdrop-blur-md bg-black/40 p-8 rounded-lg border border-green-900/30 mb-8">
                  <h2 className="text-3xl font-semibold mb-6 text-green-300">Notre Histoire</h2>
                  <div className="prose prose-lg prose-invert max-w-none">
                    <p className="text-gray-300">
                      SecureSync a été fondé en 2020 par une équipe d'experts en sécurité et en technologies numériques, 
                      partageant une vision commune : révolutionner les systèmes de gestion des établissements pénitentiaires 
                      grâce à des solutions numériques innovantes et sécurisées.
                    </p>
                    <p className="text-gray-300 mt-4">
                      Face aux défis croissants en matière de sécurité et d'efficacité opérationnelle dans les établissements correctionnels, 
                      nous avons identifié le besoin d'une solution intégrée qui réponde aux exigences spécifiques du secteur. 
                      Notre expertise combinée en systèmes de sécurité, en développement logiciel et en gestion pénitentiaire 
                      nous a permis de concevoir une plateforme complète et révolutionnaire.
                    </p>
                    <p className="text-gray-300 mt-4">
                      Aujourd'hui, notre système est déployé dans plus de 12 établissements à travers 5 états, 
                      contribuant significativement à l'amélioration de la sécurité et de l'efficacité opérationnelle 
                      de ces institutions tout en respectant les normes les plus strictes en matière de sécurité et de confidentialité.
                    </p>
                  </div>
                </div>
                
                {/* Timeline */}
                <div className="relative">
                  <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-green-900/50"></div>
                  
                  <div className="relative z-10">
                    {/* 2020 */}
                    <div className="mb-16 flex items-center">
                      <div className="w-1/2 pr-12 text-right">
                        <h3 className="text-2xl font-semibold text-green-300">2020</h3>
                        <p className="mt-2 text-gray-300">Fondation de SecureSync et développement du concept initial</p>
                      </div>
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-900/30 border-4 border-black flex items-center justify-center z-10">
                        <div className="w-5 h-5 rounded-full bg-green-500"></div>
                      </div>
                      <div className="w-1/2 pl-12"></div>
                    </div>
                    
                    {/* 2021 */}
                    <div className="mb-16 flex items-center">
                      <div className="w-1/2 pr-12"></div>
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-900/30 border-4 border-black flex items-center justify-center z-10">
                        <div className="w-5 h-5 rounded-full bg-green-500"></div>
                      </div>
                      <div className="w-1/2 pl-12">
                        <h3 className="text-2xl font-semibold text-green-300">2021</h3>
                        <p className="mt-2 text-gray-300">Premier déploiement pilote dans deux établissements</p>
                      </div>
                    </div>
                    
                    {/* 2022 */}
                    <div className="mb-16 flex items-center">
                      <div className="w-1/2 pr-12 text-right">
                        <h3 className="text-2xl font-semibold text-green-300">2022</h3>
                        <p className="mt-2 text-gray-300">Expansion à 5 établissements et développement de nouvelles fonctionnalités</p>
                      </div>
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-900/30 border-4 border-black flex items-center justify-center z-10">
                        <div className="w-5 h-5 rounded-full bg-green-500"></div>
                      </div>
                      <div className="w-1/2 pl-12"></div>
                    </div>
                    
                    {/* 2023 */}
                    <div className="mb-16 flex items-center">
                      <div className="w-1/2 pr-12"></div>
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-900/30 border-4 border-black flex items-center justify-center z-10">
                        <div className="w-5 h-5 rounded-full bg-green-500"></div>
                      </div>
                      <div className="w-1/2 pl-12">
                        <h3 className="text-2xl font-semibold text-green-300">2023</h3>
                        <p className="mt-2 text-gray-300">Intégration de l'IA pour la détection d'anomalies et expansion inter-états</p>
                      </div>
                    </div>
                    
                    {/* 2024 */}
                    <div className="mb-16 flex items-center">
                      <div className="w-1/2 pr-12 text-right">
                        <h3 className="text-2xl font-semibold text-green-300">2024</h3>
                        <p className="mt-2 text-gray-300">Déploiement dans 12+ établissements et lancement de la version 2.0</p>
                      </div>
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-900/30 border-4 border-black flex items-center justify-center z-10">
                        <div className="w-5 h-5 rounded-full bg-green-500"></div>
                      </div>
                      <div className="w-1/2 pl-12"></div>
                    </div>
                    
                    {/* 2025 */}
                    <div className="flex items-center">
                      <div className="w-1/2 pr-12"></div>
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-900/30 border-4 border-black flex items-center justify-center z-10">
                        <div className="w-5 h-5 rounded-full bg-green-500"></div>
                      </div>
                      <div className="w-1/2 pl-12">
                        <h3 className="text-2xl font-semibold text-green-300">2025</h3>
                        <p className="mt-2 text-gray-300">Objectif d'expansion internationale et développement de nouvelles solutions</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              
              {/* Section Mission et Valeurs */}
              <section className="mb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="backdrop-blur-md bg-black/40 p-8 rounded-lg border border-green-900/30">
                    <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                      <Landmark className="h-6 w-6 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-4 text-green-300">Notre Mission</h2>
                    <p className="text-gray-300">
                      Transformer la gestion des établissements pénitentiaires grâce à des technologies de pointe, 
                      en améliorant la sécurité, l'efficacité opérationnelle et les conditions de travail du personnel, 
                      tout en contribuant à un environnement plus sûr pour tous.
                    </p>
                  </div>
                  
                  <div className="backdrop-blur-md bg-black/40 p-8 rounded-lg border border-green-900/30">
                    <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                      <Award className="h-6 w-6 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-4 text-green-300">Notre Vision</h2>
                    <p className="text-gray-300">
                      Devenir le leader mondial des solutions technologiques pour établissements pénitentiaires, 
                      en établissant de nouvelles normes en matière de sécurité numérique, d'innovation et de 
                      gestion efficace des établissements correctionnels.
                    </p>
                  </div>
                </div>
                
                <div className="backdrop-blur-md bg-black/40 p-8 rounded-lg border border-green-900/30 mt-8">
                  <h2 className="text-2xl font-semibold mb-6 text-green-300">Nos Valeurs</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="flex">
                      <div className="flex-shrink-0 mr-4">
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-medium mb-2 text-green-200">Sécurité</h3>
                        <p className="text-gray-300">
                          La sécurité est au cœur de tout ce que nous faisons, de la conception de nos produits à leur déploiement.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex-shrink-0 mr-4">
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-medium mb-2 text-green-200">Innovation</h3>
                        <p className="text-gray-300">
                          Nous repoussons constamment les limites de la technologie pour créer des solutions toujours plus efficaces.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex-shrink-0 mr-4">
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-medium mb-2 text-green-200">Intégrité</h3>
                        <p className="text-gray-300">
                          Nous agissons avec honnêteté et transparence dans toutes nos interactions avec nos clients et partenaires.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex-shrink-0 mr-4">
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-medium mb-2 text-green-200">Excellence</h3>
                        <p className="text-gray-300">
                          Nous nous efforçons d'atteindre l'excellence dans tous les aspects de notre travail, du développement au support client.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              
                {/* Section Équipe */}
                <section className="mb-20">
                <h2 className="text-3xl font-semibold mb-8 text-green-300 text-center">Notre Équipe Dirigeante</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Membre 1 */}
                  <div className="backdrop-blur-md bg-black/40 p-6 rounded-lg border border-green-900/30 text-center">
                  <div className="w-24 h-24 mx-auto rounded-full bg-green-900/30 mb-4 flex items-center justify-center">
                    <Users className="h-12 w-12 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-200">Adam Terrak</h3>
                  <p className="text-green-400 mb-3">PDG & Co-fondateur</p>
                  <p className="text-gray-300 text-sm p-4">
                    Expert en développement de solutions innovantes et gestion de projets complexes multi-secteurs.
                  </p>
                  </div>
                  
                  {/* Membre 2 */}
                  <div className="backdrop-blur-md bg-black/40 p-6 rounded-lg border border-green-900/30 text-center">
                  <div className="w-24 h-24 mx-auto rounded-full bg-green-900/30 mb-4 flex items-center justify-center">
                    <Users className="h-12 w-12 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-200">Anthony Voisin</h3>
                  <p className="text-green-400 mb-3">Directeur Technique & Co-fondateur</p>
                  <p className="text-gray-300 text-sm p-4">
                    Ingénieur en informatique spécialisé dans les systèmes de sécurité, l'intelligence artificielle et la gestion sécurisée de données.
                  </p>
                  </div>
                  
                  {/* Membre 3 */}
                  <div className="backdrop-blur-md bg-black/40 p-6 rounded-lg border border-green-900/30 text-center">
                  <div className="w-24 h-24 mx-auto rounded-full bg-green-900/30 mb-4 flex items-center justify-center">
                    <Users className="h-12 w-12 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-200">Mehdi Sekkat</h3>
                  <p className="text-green-400 mb-3">Directeur des Opérations</p>
                  <p className="text-gray-300 text-sm p-4">
                    Ancien directeur d'établissement pénitentiaire avec une vaste expérience en gestion opérationnelle.
                  </p>
                  </div>

                  {/* Membre 4 */}
                  <div className="backdrop-blur-md bg-black/40 p-6 rounded-lg border border-green-900/30 text-center">
                  <div className="w-24 h-24 mx-auto rounded-full bg-green-900/30 mb-4 flex items-center justify-center">
                    <Users className="h-12 w-12 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-200">Firas Benmansour</h3>
                  <p className="text-green-400 mb-3">Directeur Design</p>
                  <p className="text-gray-300 text-sm p-4">
                    Expert en UX/UI design et expérience utilisateur, créant des interfaces intuitives pour des systèmes de sécurité complexes.
                  </p>
                  </div>
                </div>
                </section>
              
              {/* Call to Action */}
              <div className="text-center backdrop-blur-md bg-black/40 p-8 rounded-lg border border-green-900/30">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                  Rejoignez la révolution de la gestion pénitentiaire
                </h2>
                <p className="text-lg mb-6 text-gray-300">
                  Découvrez comment SecureSync peut transformer votre établissement
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/contact">
                    <Button size="lg" className="bg-green-600 hover:bg-green-700 text-black font-semibold px-6">
                      Contactez-nous
                    </Button>
                  </Link>
                  <Link to="/features">
                    <Button variant="outline" size="lg" className="border-green-500 hover:bg-green-900/30 text-green-300 px-6">
                      Découvrir nos fonctionnalités
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </main>
          
          <Footer />
        </div>
      </div>
    </div>
  );
}
