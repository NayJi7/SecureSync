import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Users, Award, Landmark } from 'lucide-react';
import Squares from '../blocks/Backgrounds/Squares/squares.tsx';
import { useDevice } from '@/hooks/use-device';
import Footer from '@/components/Footer.tsx';
import Header from '@/components/Header.tsx';
import { motion } from 'framer-motion';
import {
  fadeInVariants,
  slideUpVariants,
  slideRightVariants,
  slideLeftVariants,
  staggerChildrenVariants,
  staggerItemVariants,
  useScrollAnimation
} from '@/hooks/useScrollAnimation';

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
              <motion.h1
                className="text-4xl md:text-5xl font-bold mb-8 text-white text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                À propos de SecureSync
              </motion.h1>

              {/* Section Histoire */}
              <section className="mb-20">
                <motion.div
                  className="backdrop-blur-md bg-black/40 p-8 rounded-lg border border-green-900/30 mb-8"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                  viewport={{ once: true, amount: 0.1 }}
                >
                  <motion.h2
                    className="text-3xl font-semibold mb-6 text-green-300"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    Notre Histoire
                  </motion.h2>
                  <motion.div
                    className="prose prose-lg prose-invert max-w-none"
                    initial="hidden"
                    whileInView="visible"
                    variants={staggerChildrenVariants}
                    viewport={{ once: true }}
                  >
                    <motion.p
                      className="text-gray-300"
                      variants={fadeInVariants}
                    >
                      SecureSync a été fondé en 2020 par une équipe d'experts en sécurité et en technologies numériques,
                      partageant une vision commune : révolutionner les systèmes de gestion des établissements pénitentiaires
                      grâce à des solutions numériques innovantes et sécurisées.
                    </motion.p>
                    <motion.p
                      className="text-gray-300 mt-4"
                      variants={fadeInVariants}
                    >
                      Face aux défis croissants en matière de sécurité et d'efficacité opérationnelle dans les établissements correctionnels,
                      nous avons identifié le besoin d'une solution intégrée qui réponde aux exigences spécifiques du secteur.
                      Notre expertise combinée en systèmes de sécurité, en développement logiciel et en gestion pénitentiaire
                      nous a permis de concevoir une plateforme complète et révolutionnaire.
                    </motion.p>
                    <motion.p
                      className="text-gray-300 mt-4"
                      variants={fadeInVariants}
                    >
                      Aujourd'hui, notre système est déployé dans plus de 12 établissements à travers 5 états,
                      contribuant significativement à l'amélioration de la sécurité et de l'efficacité opérationnelle
                      de ces institutions tout en respectant les normes les plus strictes en matière de sécurité et de confidentialité.
                    </motion.p>
                  </motion.div>
                </motion.div>

                {/* Timeline */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-green-900/50"></div>

                  <div className="relative z-10">
                    {/* 2020 */}
                    <motion.div
                      className="mb-16 flex items-center"
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-1/2 pr-12 text-right">
                        <h3 className="text-2xl font-semibold text-green-300">2020</h3>
                        <p className="mt-2 text-gray-300">Fondation de SecureSync et développement du concept initial</p>
                      </div>
                      <motion.div
                        className="flex-shrink-0 w-12 h-12 rounded-full bg-green-900/30 border-4 border-black flex items-center justify-center z-10"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        viewport={{ once: true }}
                      >
                        <motion.div
                          className="w-5 h-5 rounded-full bg-green-500"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.8, 1]
                          }}
                          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                        ></motion.div>
                      </motion.div>
                      <div className="w-1/2 pl-12"></div>
                    </motion.div>

                    {/* 2021 */}
                    <motion.div
                      className="mb-16 flex items-center"
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-1/2 pr-12"></div>
                      <motion.div
                        className="flex-shrink-0 w-12 h-12 rounded-full bg-green-900/30 border-4 border-black flex items-center justify-center z-10"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                        viewport={{ once: true }}
                      >
                        <motion.div
                          className="w-5 h-5 rounded-full bg-green-500"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.8, 1]
                          }}
                          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                        ></motion.div>
                      </motion.div>
                      <div className="w-1/2 pl-12">
                        <h3 className="text-2xl font-semibold text-green-300">2021</h3>
                        <p className="mt-2 text-gray-300">Premier déploiement pilote dans deux établissements</p>
                      </div>
                    </motion.div>

                    {/* 2022 */}
                    <motion.div
                      className="mb-16 flex items-center"
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-1/2 pr-12 text-right">
                        <h3 className="text-2xl font-semibold text-green-300">2022</h3>
                        <p className="mt-2 text-gray-300">Expansion à 5 établissements et développement de nouvelles fonctionnalités</p>
                      </div>
                      <motion.div
                        className="flex-shrink-0 w-12 h-12 rounded-full bg-green-900/30 border-4 border-black flex items-center justify-center z-10"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.7 }}
                        viewport={{ once: true }}
                      >
                        <motion.div
                          className="w-5 h-5 rounded-full bg-green-500"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.8, 1]
                          }}
                          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                        ></motion.div>
                      </motion.div>
                      <div className="w-1/2 pl-12"></div>
                    </motion.div>

                    {/* 2023 */}
                    <motion.div
                      className="mb-16 flex items-center"
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-1/2 pr-12"></div>
                      <motion.div
                        className="flex-shrink-0 w-12 h-12 rounded-full bg-green-900/30 border-4 border-black flex items-center justify-center z-10"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.9 }}
                        viewport={{ once: true }}
                      >
                        <motion.div
                          className="w-5 h-5 rounded-full bg-green-500"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.8, 1]
                          }}
                          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                        ></motion.div>
                      </motion.div>
                      <div className="w-1/2 pl-12">
                        <h3 className="text-2xl font-semibold text-green-300">2023</h3>
                        <p className="mt-2 text-gray-300">Intégration de l'IA pour la détection d'anomalies et expansion inter-états</p>
                      </div>
                    </motion.div>

                    {/* 2024 */}
                    <motion.div
                      className="mb-16 flex items-center"
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-1/2 pr-12 text-right">
                        <h3 className="text-2xl font-semibold text-green-300">2024</h3>
                        <p className="mt-2 text-gray-300">Déploiement dans 12+ établissements et lancement de la version 2.0</p>
                      </div>
                      <motion.div
                        className="flex-shrink-0 w-12 h-12 rounded-full bg-green-900/30 border-4 border-black flex items-center justify-center z-10"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.4, delay: 1.1 }}
                        viewport={{ once: true }}
                      >
                        <motion.div
                          className="w-5 h-5 rounded-full bg-green-500"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.8, 1]
                          }}
                          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                        ></motion.div>
                      </motion.div>
                      <div className="w-1/2 pl-12"></div>
                    </motion.div>

                    {/* 2025 */}
                    <motion.div
                      className="flex items-center"
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 1.0 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-1/2 pr-12"></div>
                      <motion.div
                        className="flex-shrink-0 w-12 h-12 rounded-full bg-green-900/30 border-4 border-black flex items-center justify-center z-10"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.4, delay: 1.3 }}
                        viewport={{ once: true }}
                      >
                        <motion.div
                          className="w-5 h-5 rounded-full bg-green-500"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.8, 1]
                          }}
                          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                        ></motion.div>
                      </motion.div>
                      <div className="w-1/2 pl-12">
                        <h3 className="text-2xl font-semibold text-green-300">2025</h3>
                        <p className="mt-2 text-gray-300">Objectif d'expansion internationale et développement de nouvelles solutions</p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </section>

              {/* Section Mission et Valeurs */}
              <section className="mb-20">
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                  viewport={{ once: true, amount: 0.1 }}
                >
                  <motion.div
                    className="backdrop-blur-md bg-black/40 p-8 rounded-lg border border-green-900/30"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    <motion.div
                      className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center mb-4"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1, rotate: [0, 360] }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      viewport={{ once: true }}
                    >
                      <Landmark className="h-6 w-6 text-green-400" />
                    </motion.div>
                    <motion.h2
                      className="text-2xl font-semibold mb-4 text-green-300"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      viewport={{ once: true }}
                    >
                      Notre Mission
                    </motion.h2>
                    <motion.p
                      className="text-gray-300"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      viewport={{ once: true }}
                    >
                      Transformer la gestion des établissements pénitentiaires grâce à des technologies de pointe,
                      en améliorant la sécurité, l'efficacité opérationnelle et les conditions de travail du personnel,
                      tout en contribuant à un environnement plus sûr pour tous.
                    </motion.p>
                  </motion.div>

                  <motion.div
                    className="backdrop-blur-md bg-black/40 p-8 rounded-lg border border-green-900/30"
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    <motion.div
                      className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center mb-4"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1, rotate: [0, 360] }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      viewport={{ once: true }}
                    >
                      <Award className="h-6 w-6 text-green-400" />
                    </motion.div>
                    <motion.h2
                      className="text-2xl font-semibold mb-4 text-green-300"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      viewport={{ once: true }}
                    >
                      Notre Vision
                    </motion.h2>
                    <motion.p
                      className="text-gray-300"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.7 }}
                      viewport={{ once: true }}
                    >
                      Devenir le leader mondial des solutions technologiques pour établissements pénitentiaires,
                      en établissant de nouvelles normes en matière de sécurité numérique, d'innovation et de
                      gestion efficace des établissements correctionnels.
                    </motion.p>
                  </motion.div>
                </motion.div>

                <motion.div
                  className="backdrop-blur-md bg-black/40 p-8 rounded-lg border border-green-900/30 mt-8"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  viewport={{ once: true, amount: 0.1 }}
                >
                  <motion.h2
                    className="text-2xl font-semibold mb-6 text-green-300"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    viewport={{ once: true }}
                  >
                    Nos Valeurs
                  </motion.h2>
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8"
                    initial="hidden"
                    whileInView="visible"
                    variants={staggerChildrenVariants}
                    viewport={{ once: true }}
                  >
                    <motion.div className="flex" variants={fadeInVariants}>
                      <motion.div
                        className="flex-shrink-0 mr-4"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.7 }}
                        viewport={{ once: true }}
                      >
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-medium mb-2 text-green-200">Sécurité</h3>
                        <p className="text-gray-300">
                          La sécurité est au cœur de tout ce que nous faisons, de la conception de nos produits à leur déploiement.
                        </p>
                      </div>
                    </motion.div>

                    <motion.div className="flex" variants={fadeInVariants}>
                      <motion.div
                        className="flex-shrink-0 mr-4"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.8 }}
                        viewport={{ once: true }}
                      >
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-medium mb-2 text-green-200">Innovation</h3>
                        <p className="text-gray-300">
                          Nous repoussons constamment les limites de la technologie pour créer des solutions toujours plus efficaces.
                        </p>
                      </div>
                    </motion.div>

                    <motion.div className="flex" variants={fadeInVariants}>
                      <motion.div
                        className="flex-shrink-0 mr-4"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.9 }}
                        viewport={{ once: true }}
                      >
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-medium mb-2 text-green-200">Intégrité</h3>
                        <p className="text-gray-300">
                          Nous agissons avec honnêteté et transparence dans toutes nos interactions avec nos clients et partenaires.
                        </p>
                      </div>
                    </motion.div>

                    <motion.div className="flex" variants={fadeInVariants}>
                      <motion.div
                        className="flex-shrink-0 mr-4"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.4, delay: 1.0 }}
                        viewport={{ once: true }}
                      >
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-medium mb-2 text-green-200">Excellence</h3>
                        <p className="text-gray-300">
                          Nous nous efforçons d'atteindre l'excellence dans tous les aspects de notre travail, du développement au support client.
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </section>

              {/* Section Équipe */}
              <section className="mb-20">
                <motion.h2
                  className="text-3xl font-semibold mb-8 text-green-300 text-center"
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true, amount: 0.1 }}
                >
                  Notre Équipe Dirigeante
                </motion.h2>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  initial="hidden"
                  whileInView="visible"
                  variants={staggerChildrenVariants}
                  viewport={{ once: true, amount: 0.1 }}
                >
                  {/* Membre 1 */}
                  <motion.div
                    className="backdrop-blur-md bg-black/40 p-6 rounded-lg border border-green-900/30 text-center"
                    variants={fadeInVariants}
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(45, 161, 51, 0.3)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="w-24 h-24 mx-auto rounded-full bg-green-900/30 mb-4 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <Users className="h-12 w-12 text-green-400" />
                    </motion.div>
                    <motion.h3
                      className="text-xl font-semibold text-green-200"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      viewport={{ once: true }}
                    >
                      Adam Terrak
                    </motion.h3>
                    <motion.p
                      className="text-green-400 mb-3"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      viewport={{ once: true }}
                    >
                      PDG & Co-fondateur
                    </motion.p>
                    <motion.p
                      className="text-gray-300 text-sm p-4"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      viewport={{ once: true }}
                    >
                      Expert en développement de solutions innovantes et gestion de projets complexes multi-secteurs.
                    </motion.p>
                  </motion.div>

                  {/* Membre 2 */}
                  <motion.div
                    className="backdrop-blur-md bg-black/40 p-6 rounded-lg border border-green-900/30 text-center"
                    variants={fadeInVariants}
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(45, 161, 51, 0.3)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="w-24 h-24 mx-auto rounded-full bg-green-900/30 mb-4 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <Users className="h-12 w-12 text-green-400" />
                    </motion.div>
                    <motion.h3
                      className="text-xl font-semibold text-green-200"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      viewport={{ once: true }}
                    >
                      Anthony Voisin
                    </motion.h3>
                    <motion.p
                      className="text-green-400 mb-3"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      viewport={{ once: true }}
                    >
                      Directeur Technique & Co-fondateur
                    </motion.p>
                    <motion.p
                      className="text-gray-300 text-sm p-4"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      viewport={{ once: true }}
                    >
                      Ingénieur en informatique spécialisé dans les systèmes de sécurité, l'intelligence artificielle et la gestion sécurisée de données.
                    </motion.p>
                  </motion.div>

                  {/* Membre 3 */}
                  <motion.div
                    className="backdrop-blur-md bg-black/40 p-6 rounded-lg border border-green-900/30 text-center"
                    variants={fadeInVariants}
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(45, 161, 51, 0.3)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="w-24 h-24 mx-auto rounded-full bg-green-900/30 mb-4 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      viewport={{ once: true }}
                    >
                      <Users className="h-12 w-12 text-green-400" />
                    </motion.div>
                    <motion.h3
                      className="text-xl font-semibold text-green-200"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      viewport={{ once: true }}
                    >
                      Mehdi Sekkat
                    </motion.h3>
                    <motion.p
                      className="text-green-400 mb-3"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      viewport={{ once: true }}
                    >
                      Directeur des Opérations
                    </motion.p>
                    <motion.p
                      className="text-gray-300 text-sm p-4"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                      viewport={{ once: true }}
                    >
                      Ancien directeur d'établissement pénitentiaire avec une vaste expérience en gestion opérationnelle.
                    </motion.p>
                  </motion.div>

                  {/* Membre 4 */}
                  <motion.div
                    className="backdrop-blur-md bg-black/40 p-6 rounded-lg border border-green-900/30 text-center"
                    variants={fadeInVariants}
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(45, 161, 51, 0.3)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="w-24 h-24 mx-auto rounded-full bg-green-900/30 mb-4 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      viewport={{ once: true }}
                    >
                      <Users className="h-12 w-12 text-green-400" />
                    </motion.div>
                    <motion.h3
                      className="text-xl font-semibold text-green-200"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      viewport={{ once: true }}
                    >
                      Firas Benmansour
                    </motion.h3>
                    <motion.p
                      className="text-green-400 mb-3"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                      viewport={{ once: true }}
                    >
                      Directeur Design
                    </motion.p>
                    <motion.p
                      className="text-gray-300 text-sm p-4"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                      viewport={{ once: true }}
                    >
                      Expert en UX/UI design et expérience utilisateur, créant des interfaces intuitives pour des systèmes de sécurité complexes.
                    </motion.p>
                  </motion.div>
                </motion.div>
              </section>

              {/* Call to Action */}
              <motion.div
                className="text-center backdrop-blur-md bg-black/40 p-8 rounded-lg border border-green-900/30"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, amount: 0.1 }}
              >
                <motion.h2
                  className="text-2xl md:text-3xl font-bold mb-4 text-white"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Rejoignez la révolution de la gestion pénitentiaire
                </motion.h2>
                <motion.p
                  className="text-lg mb-6 text-gray-300"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  Découvrez comment SecureSync peut transformer votre établissement
                </motion.p>
                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Link to="/contact">
                    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                      <Button size="lg" className="bg-green-900/60 hover:bg-green-900/80 text-white font-semibold cursor-pointer border border-green-500/50">
                        Contactez-nous
                      </Button>
                    </motion.div>
                  </Link>
                  <Link to="/features">
                    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                      <Button variant="outline" size="lg" className="bg-black/40 border border-white/70 text-white hover:bg-white/80 hover:border-white hover:text-black cursor-pointer">
                        Découvrir nos fonctionnalités
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}
