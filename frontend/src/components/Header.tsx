import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useDevice } from '@/hooks/use-device';
import logobandinverted from '@/assets/logo-band-inverted.png';

interface HeaderProps {
  isScrolled: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;
}

// A AJOUTER DANS LES NOUVELLES PAGES AVANT LE HEADER

// const [isScrolled, setIsScrolled] = useState(false);
// const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

// useEffect(() => {
//   // Add scroll listener for header
//   const handleScroll = () => {
//     setIsScrolled(window.scrollY > 20);
//   };

//   window.addEventListener('scroll', handleScroll);

//   return () => {
//     window.removeEventListener('scroll', handleScroll);
//   };
// }, []);

export default function Header({ isScrolled, mobileMenuOpen, setMobileMenuOpen }: HeaderProps) {
  const { isMobile } = useDevice();

  return (
    <>
      {/* Sticky Header */}
      <header className={`fixed top-0 left-0 right-0 w-full z-50 ${isScrolled
          ? 'p-3 md:p-4 backdrop-blur-md bg-black/80 shadow-lg'
          : 'p-4 md:p-6 backdrop-blur-sm bg-black/20'
        } transition-all duration-300 flex justify-between items-center`}>
        <Link to="/">
          <img src={logobandinverted} alt="Logo" className={`${isScrolled ? 'w-25' : 'w-28'} transition-all duration-300`} />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-green-300/80 hover:text-green-300 transition-colors">Accueil</Link>
          <Link to="/features" className="text-green-300/80 hover:text-green-300 transition-colors">Fonctionnalités</Link>
          <Link to="/about" className="text-green-300/80 hover:text-green-300 transition-colors">À propos</Link>
          <Link to="/contact" className="text-green-300/80 hover:text-green-300 transition-colors">Contact</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="outline" className="bg-black/40 border border-white/70 text-white hover:bg-white/80 hover:border-white hover:text-black cursor-pointer">
              Connexion
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
            <Link to="/" className="py-2 text-green-300/80 hover:text-green-300 transition-colors">Accueil</Link>
            <Link to="/features" className="py-2 text-green-300/80 hover:text-green-300 transition-colors">Fonctionnalités</Link>
            <Link to="/about" className="py-2 text-green-300/80 hover:text-green-300 transition-colors">À propos</Link>
            <Link to="/contact" className="py-2 text-green-300/80 hover:text-green-300 transition-colors">Contact</Link>
            <Link to="/login" className="py-2 text-green-300/80 hover:text-green-300 transition-colors">Connexion</Link>
          </div>
        </div>
      )}
    </>
  );
}
