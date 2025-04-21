// filepath: /home/aterrak/gitstore/SecureSync/frontend/src/pages/PrisonSelectionPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LiquidChrome from '../blocks/Backgrounds/LiquidChrome/LiquidChrome';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Building, ArrowRight } from 'lucide-react';
import SpotlightCard from '@/blocks/Components/SpotlightCard/SpotlightCard';

// Interface pour les prisons
interface Prison {
  id: string;
  name: string;
  location: string;
  detainees_count?: number;
  security_level?: string;
}

export default function PrisonSelectionPage() {
  const navigate = useNavigate();
  const [prisons, setPrisons] = useState<Prison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    document.body.classList.add('prison-selection-page');
    return () => {
      document.body.classList.remove('prison-selection-page');
    };
  }, []);

  useEffect(() => {
    // Charger la liste des prisons disponibles (ou utiliser des données de test)
    const fetchPrisons = async () => {
      try {
        const token = localStorage.getItem('sessionToken');
        
        // Essayer de charger depuis l'API
        try {
          const response = await axios.get('http://localhost:8000/api/prisons/', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.data && Array.isArray(response.data)) {
            setPrisons(response.data);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.warn("Erreur API pour charger les prisons, utilisation des données de test", apiError);
        }
        
        // Données de test au cas où l'API n'est pas prête
        setPrisons([
          { id: "paris", name: "Centre Pénitentiaire de Paris", location: "Paris", detainees_count: 876, security_level: "Haute" },
          { id: "lyon", name: "Centre Pénitentiaire de Lyon", location: "Lyon", detainees_count: 542, security_level: "Moyenne" },
          { id: "marseille", name: "Centre Pénitentiaire de Marseille", location: "Marseille", detainees_count: 653, security_level: "Haute" },
        ]);
        setLoading(false);
        
      } catch (err) {
        console.error("Erreur lors du chargement des prisons:", err);
        setError('Erreur lors du chargement des établissements pénitentiaires');
        setLoading(false);
      }
    };

    fetchPrisons();
  }, []);

  const handleSelectPrison = async (prisonId: string) => {
    try {
        // Stocker l'ID de la prison sélectionnée localement
        localStorage.setItem('selectedPrison', prisonId);
        
        // Mettre à jour le Prison_id dans la base de données
        const token = localStorage.getItem('sessionToken');
        
        // Utiliser POST au lieu de PUT
        await axios.post('http://localhost:8000/api/update-user-prison/', 
        {
            prison_id: prisonId,
        },
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
        );
        
        // Rediriger vers la page d'accueil avec la prison sélectionnée
        navigate(`/${prisonId}/home`);
    } catch (error) {
        console.error("Erreur lors de la mise à jour du Prison_id:", error);
        // Vous pourriez ajouter ici un log plus détaillé des données de l'erreur
        if (axios.isAxiosError(error) && error.response) {
        console.error("Détails de la réponse d'erreur:", error.response);
        }
        
        // Puisqu'il s'agit d'un admin, vous pourriez quand même rediriger
        // même si la mise à jour a échoué, et mettre à jour la base plus tard
        navigate(`/${prisonId}/home`);
    }
};

  // Fonction pour se déconnecter
  const handleLogout = () => {
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center text-white">
          <div className="mb-4 text-4xl">Chargement des établissements...</div>
          <div className="animate-pulse flex space-x-4">
            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center text-white">
          <div className="mb-4 text-4xl">Erreur</div>
          <div className="text-red-500 mb-8">{error}</div>
          <Button 
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Se déconnecter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen relative">
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <LiquidChrome
          baseColor={[0.1, 0.1, 0.1]}
          speed={0.5}
          amplitude={0.6}
          interactive={false}
        />
      </div>
      
      <div className="container mx-auto px-4 py-16 z-10 relative">
        <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 mb-12 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-green-400">
            Sélection de l'Établissement Pénitentiaire
          </h1>
          
          <p className="text-xl text-center text-white">
            En tant qu'administrateur, vous pouvez accéder à tous les établissements. 
            Veuillez sélectionner un établissement pour continuer.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {prisons.map((prison) => (
            <SpotlightCard 
              key={prison.id}
              className="h-full cursor-pointer transition duration-300 hover:scale-105 pointer-events-auto" 
              spotlightColor="rgba(45, 161, 51, 0.2)"
              onClick={() => handleSelectPrison(prison.id)}
            >
              <div className="flex flex-col h-full">
                <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Building className="h-8 w-8 text-green-400" />
                </div>
                
                <h2 className="text-2xl font-bold text-green-300 text-center mb-4">
                  {prison.name}
                </h2>
                
                <div className="flex-grow">
                  <div className="grid grid-cols-2 gap-y-4 mb-6">
                    <div>
                      <p className="text-gray-400 text-sm">Localisation</p>
                      <p className="text-white font-medium">{prison.location}</p>
                    </div>
                    
                    {prison.detainees_count && (
                      <div>
                        <p className="text-gray-400 text-sm">Détenus</p>
                        <p className="text-white font-medium">{prison.detainees_count}</p>
                      </div>
                    )}
                    
                    {prison.security_level && (
                      <div>
                        <p className="text-gray-400 text-sm">Niveau de sécurité</p>
                        <p className="text-white font-medium">{prison.security_level}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-black font-semibold cursor-pointer"
                  onClick={() => handleSelectPrison(prison.id)}
                >
                  Accéder <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </SpotlightCard>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button 
            variant="outline"
            className="border-red-500 text-white bg-red-600 hover:bg-red-700 hover:text-white cursor-pointer transition-transform duration-300 hover:scale-110"
            onClick={handleLogout}
          >
            Se déconnecter
          </Button>
        </div>
      </div>
    </div>
  );
}
