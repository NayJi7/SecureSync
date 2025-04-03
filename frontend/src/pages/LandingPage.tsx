import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDevice } from '@/hooks/use-device.ts';
import SpotlightCard from '@/blocks/Components/SpotlightCard/SpotlightCard.tsx';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Users, Building, Activity, Globe, Server, Menu, X } from 'lucide-react';
import Squares from '../blocks/Backgrounds/Squares/squares.tsx';

export default function LandingPage() {
  const isMobile = useDevice();
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
          {/* Sticky Header */}
          <header className={`fixed top-0 left-0 right-0 w-full z-50 ${
            isScrolled 
              ? 'p-3 md:p-4 backdrop-blur-md bg-black/80 shadow-lg' 
              : 'p-4 md:p-6 backdrop-blur-sm bg-black/20'
          } transition-all duration-300 flex justify-between items-center`}>
            <img src="/src/assets/logo-band-inverted.png" alt="Logo" className={`${isScrolled ? 'w-25' : 'w-28'} transition-all duration-300`} />
            
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-green-300/80 hover:text-green-300 transition-colors">Home</Link>
              <Link to="/features" className="text-green-300/80 hover:text-green-300 transition-colors">Features</Link>
              <Link to="/about" className="text-green-300/80 hover:text-green-300 transition-colors">About</Link>
              <Link to="/contact" className="text-green-300/80 hover:text-green-300 transition-colors">Contact</Link>
            </div>
            
            <div className="flex items-center gap-4">
              {!isMobile && (
                <Link to="/demo">
                  <Button variant="ghost" className="text-green-300/90 hover:text-green-300 hover:bg-green-900/30">
                    Demo
                  </Button>
                </Link>
              )}
              <Link to="/login">
                <Button variant="outline" className="text-black-300 border-green-500 hover:bg-green-900/30 hover:text-white">
                  Login
                </Button>
              </Link>
              
              {/* Mobile menu toggle */}
              {isMobile && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 text-green-300 hover:bg-green-900/30 rounded-md"
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              )}
            </div>
          </header>
          
          {/* Mobile menu dropdown */}
          {isMobile && mobileMenuOpen && (
            <div className="fixed top-[60px] left-0 right-0 bg-black/95 backdrop-blur-lg z-40 border-t border-green-900/30 animate-in slide-in-from-top">
              <div className="flex flex-col p-4">
                <Link to="/" className="py-3 px-4 text-green-300 hover:bg-green-900/30 rounded-md">Home</Link>
                <Link to="/features" className="py-3 px-4 text-green-300 hover:bg-green-900/30 rounded-md">Features</Link>
                <Link to="/about" className="py-3 px-4 text-green-300 hover:bg-green-900/30 rounded-md">About</Link>
                <Link to="/contact" className="py-3 px-4 text-green-300 hover:bg-green-900/30 rounded-md">Contact</Link>
                <Link to="/demo" className="py-3 px-4 text-green-300 hover:bg-green-900/30 rounded-md">Demo</Link>
              </div>
            </div>
          )}
          
          {/* Main content - added top padding to account for fixed header */}
          <main className="flex-grow flex flex-col items-center justify-center p-4 pt-24 md:pt-28">
            {/* Hero Section */}
            <div className="max-w-4xl text-center my-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
                Smart Prison Management System
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-green-200">
                Comprehensive control and monitoring for correctional facilities with enhanced security protocols
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link to="/login">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-black font-semibold px-6 py-3">
                    Access Dashboard
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="text-black-300 border-green-500 hover:bg-green-900/30 hover:text-white px-6 py-3">
                  View Demo
                </Button>
              </div>
            </div>
            
            {/* Key Features Section */}
            <div className="w-1/2 max-w-6xl mb-20">
              <h2 className="text-3xl font-bold mb-12 text-center text-white">Comprehensive Control System</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Feature 1 */}
                <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(45, 161, 51, 0.2)">
                  <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <Lock className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-green-300">Smart Access Control</h3>
                  <p className="text-gray-300">
                    Centralized control of all doors, gates, and access points with real-time status monitoring and emergency override capabilities.
                  </p>
                </SpotlightCard>

                {/* Feature 2 */}
                <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(45, 161, 51, 0.2)">
                  <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-green-300">Privilege Hierarchy</h3>
                  <p className="text-gray-300">
                    Role-based access control with multi-level authorization, ensuring staff members only access systems relevant to their responsibilities.
                  </p>
                </SpotlightCard>

                {/* Feature 3 */}
                <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(45, 161, 51, 0.2)">
                  <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <Activity className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-green-300">Advanced Monitoring</h3>
                  <p className="text-gray-300">
                    Integrated surveillance with AI-powered anomaly detection and real-time alert system for immediate response to security incidents.
                  </p>
                </SpotlightCard>

                {/* Feature 4 */}
                <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(45, 161, 51, 0.2)">
                  <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <Server className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-green-300">Connected Devices</h3>
                  <p className="text-gray-300">
                    Seamless integration with lighting, HVAC, communication systems, and security devices for comprehensive facility control.
                  </p>
                </SpotlightCard>
              </div>
            </div>
            
            {/* Facilities and Expansion */}
            <div className="w-full max-w-6xl mb-20 bg-black/60 backdrop-blur-md p-8 rounded-lg border border-green-900/50">
              <h2 className="text-3xl font-bold mb-6 text-center text-white">Growing Network of Secure Facilities</h2>
              <p className="text-lg text-center text-gray-300 mb-8">
                SecureSync is currently deployed in multiple correctional facilities nationwide with ambitious expansion plans.
              </p>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center justify-center mb-4">
                    <Building className="h-10 w-10 text-green-400 mr-3" />
                    <span className="text-4xl font-bold text-green-300">12+</span>
                  </div>
                  <p className="text-center text-gray-300">Facilities Currently Using SecureSync</p>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-center mb-4">
                    <Globe className="h-10 w-10 text-green-400 mr-3" />
                    <span className="text-4xl font-bold text-green-300">5</span>
                  </div>
                  <p className="text-center text-gray-300">States with SecureSync Implementation</p>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-center mb-4">
                    <Users className="h-10 w-10 text-green-400 mr-3" />
                    <span className="text-4xl font-bold text-green-300">3,000+</span>
                  </div>
                  <p className="text-center text-gray-300">Security Personnel Trained</p>
                </div>
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="w-full max-w-4xl text-center mb-16">
              <h2 className="text-2xl md:text-4xl font-bold mb-6 text-white">
                Ready to Transform Your Correctional Facility?
              </h2>
              <p className="text-lg mb-8 text-gray-300">
                Join the growing network of modern, secure correctional facilities powered by SecureSync technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-black font-semibold px-6 py-3">
                    Schedule a Demo
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="outline" size="lg" className="text-black-300 border-green-500 hover:bg-green-900/30 hover:text-white px-6 py-3">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </main>
          
          {/* Footer */}
          <footer className="p-6 backdrop-blur-sm bg-black/30 border-t border-green-900/30">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-4 mb-6 md:mb-0">
                <img src="/src/assets/logo-band-inverted.png" alt="Logo" className="w-32" />
                <p className="text-green-300/60 text-sm">
                  © {new Date().getFullYear()} SecureSync. All rights reserved.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-x-12 gap-y-4 text-sm">
                <Link to="/about" className="text-green-300/60 hover:text-green-300 transition-colors">About Us</Link>
                <Link to="/privacy" className="text-green-300/60 hover:text-green-300 transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="text-green-300/60 hover:text-green-300 transition-colors">Terms of Service</Link>
                <Link to="/contact" className="text-green-300/60 hover:text-green-300 transition-colors">Contact</Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}