import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Particles from '../blocks/Backgrounds/Particles/Particles';

export default function TermsPage() {
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
    <div className="relative min-h-screen bg-black">
      <div className="absolute inset-0 overflow-hidden">
        <Particles
          particleColors={['#ffffff', '#ffffff']}
          particleCount={100}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>
      <Header 
        isScrolled={isScrolled} 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
      />
      
      <div className="relative z-10 container mx-auto px-4 py-28">
        <div className="mt-15 bg-black/60 backdrop-blur-md rounded-xl p-8 border border-green-900/30 max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-6">Conditions d'utilisation</h1>
          
          <div className="space-y-6 text-white/90">
            <p className="text-lg leading-relaxed">
              En utilisant l'application SecureSync de gestion intelligente de prison, vous acceptez les conditions suivantes :
            </p>
            
            <ul className="list-disc pl-6 space-y-3">
              <li>L'application est réservée au personnel autorisé des établissements pénitentiaires.</li>
              <li>Chaque utilisateur est responsable de la confidentialité de ses identifiants.</li>
              <li>L'utilisation des données doit respecter le RGPD et les lois sur la protection des données.</li>
              <li>Les données des détenus sont strictement confidentielles.</li>
              <li>Nous vous informerons immédiatement de toute violation de données conformément au RGPD.</li>
              <li>L'application est fournie "telle quelle" sans garantie d'absence d'erreurs.</li>
              <li>Des mises à jour seront effectuées régulièrement pour améliorer la sécurité.</li>
              <li>L'accès peut être révoqué en cas de non-respect de ces conditions.</li>
            </ul>
            
            <p className="text-base leading-relaxed mt-4">
              Pour toute question, contactez <a href="mailto:email@securesync.com" className="text-green-500 hover:text-green-600">securesynccytech@gmail.com</a>
              <br />
              En date du : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-16 relative z-10">
        <Footer />
      </div>
    </div>
  );
}
