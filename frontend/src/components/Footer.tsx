import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="p-6 backdrop-blur-sm bg-black/30 border-t border-green-900/30">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center gap-4 mb-6 md:mb-0 mx-auto md:mx-0 text-center md:text-left">
          <img src="/src/assets/logo-band-inverted.png" alt="Logo" className="w-32" />
          <p className="text-green-300/60 text-sm">
            © {new Date().getFullYear()} SecureSync. Tous droits réservés.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm justify-center md:justify-start">
          <Link to="/about" className="text-green-300/60 hover:text-green-300 transition-colors">À propos</Link>
          <Link to="/privacy" className="text-green-300/60 hover:text-green-300 transition-colors">Politique de confidentialité</Link>
          <Link to="/terms" className="text-green-300/60 hover:text-green-300 transition-colors">Conditions d'utilisation</Link>
          <Link to="/contact" className="text-green-300/60 hover:text-green-300 transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
