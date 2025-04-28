import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin } from 'lucide-react';
import Squares from '../blocks/Backgrounds/Squares/squares.tsx';
import { useDevice } from '@/hooks/use-device';
import Header from '@/components/Header.tsx';
import Footer from '@/components/Footer.tsx';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const response = await fetch('http://localhost:8000/api/contact/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsSubmitting(false);
        setSubmitSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        
        // Réinitialiser le message de succès après 5 secondes
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        throw new Error(data.message || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('Error sending contact form:', error);
      setIsSubmitting(false);
      setSubmitError(error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'envoi');
    }
  };

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
              <h1 className="text-4xl md:text-5xl font-bold mb-8 text-white text-center">Contactez-nous</h1>
              <p className="text-xl text-green-200 text-center mb-12">
                Nous sommes à votre disposition pour répondre à toutes vos questions sur SecureSync
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-12">
                {/* Informations de contact */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="backdrop-blur-md bg-black/40 p-6 rounded-lg border border-green-900/30">
                    <h2 className="text-2xl font-semibold mb-6 text-green-300">Nos coordonnées</h2>
                    
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-green-900/30 rounded-full flex items-center justify-center mr-4 mt-1">
                          <Mail className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-green-200">Email</h3>
                          <a href="mailto:securesynccytech@gmail.com" className="text-gray-300 hover:text-green-300 transition-colors">
                            securesynccytech@gmail.com
                          </a>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-green-900/30 rounded-full flex items-center justify-center mr-4 mt-1">
                          <Phone className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-green-200">Téléphone</h3>
                          <a href="tel:+33123456789" className="text-gray-300 hover:text-green-300 transition-colors">
                            +33 1 23 45 67 89
                          </a>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-green-900/30 rounded-full flex items-center justify-center mr-4 mt-1">
                          <MapPin className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-green-200">Adresse</h3>
                          <address className="not-italic text-gray-300">
                            123 Avenue de la Sécurité<br />
                            75008 Paris<br />
                            France
                          </address>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="backdrop-blur-md bg-black/40 p-6 rounded-lg border border-green-900/30">
                    <h2 className="text-2xl font-semibold mb-4 text-green-300">Horaires d'ouverture</h2>
                    <div className="space-y-2 text-gray-300">
                      <p>Lundi - Vendredi: 9h00 - 18h00</p>
                      <p>Samedi: Fermé</p>
                      <p>Dimanche: Fermé</p>
                    </div>
                  </div>
                </div>
                
                {/* Formulaire de contact */}
                <div className="lg:col-span-3 backdrop-blur-md bg-black/40 p-6 rounded-lg border border-green-900/30">
                  <h2 className="text-2xl font-semibold mb-6 text-green-300">Envoyez-nous un message</h2>
                  
                  {submitSuccess ? (
                    <div className="p-4 bg-green-900/40 border border-green-500 rounded-lg text-green-200">
                      <p className="font-medium">Message envoyé avec succès!</p>
                      <p className="mt-2">Nous vous répondrons dans les plus brefs délais.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {submitError && (
                        <div className="p-4 bg-red-900/40 border border-red-500 rounded-lg text-red-200">
                          <p className="font-medium">Erreur:</p>
                          <p className="mt-1">{submitError}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block mb-2 text-green-200">
                            Nom complet
                          </label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="bg-black/30 border-green-900/50 focus:border-green-500 text-white"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block mb-2 text-green-200">
                            Email
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="bg-black/30 border-green-900/50 focus:border-green-500 text-white"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="subject" className="block mb-2 text-green-200">
                          Sujet
                        </label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="bg-black/30 border-green-900/50 focus:border-green-500 text-white"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="message" className="block mb-2 text-green-200">
                          Message
                        </label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={5}
                          className="bg-black/30 border-green-900/50 focus:border-green-500 text-white"
                        />
                      </div>
                      
                      <Button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-black font-semibold px-6"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
              
              {/* Section de la carte */}
              <div className="w-full h-64 md:h-96 rounded-lg overflow-hidden border border-green-900/30">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6600.589234947048!2d2.067171476913903!3d49.03505808825709!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e6f5265bbc2f79%3A0x301dd6c7102e1852!2sCy%20Tech!5e1!3m2!1sen!2sfr!4v1744546910410!5m2!1sen!2sfr"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </main>
          
          <Footer />
        </div>
      </div>
    </div>
  );
}