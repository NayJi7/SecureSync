// filepath: /home/aterrak/gitstore/SecureSync/frontend/src/pages/PrisonSelectionPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LiquidChrome from '../blocks/Backgrounds/LiquidChrome/LiquidChrome';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Building, ArrowRight, Plus, Trash2 } from 'lucide-react';
import SpotlightCard from '@/blocks/Components/SpotlightCard/SpotlightCard';

// Interface pour les prisons
interface Prison {
  id: string;
  nom: string;  
  nb_detenus?: number;
  date_creation?: string;
  // Champs optionnels pour la compatibilité
  adresse?: string;
  location?: string;  
  detainees_count?: number;
  security_level?: string;
}

export default function PrisonSelectionPage() {
  const navigate = useNavigate();
  const [prisons, setPrisons] = useState<Prison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // État pour le formulaire de création de prison
  const [newPrisonName, setNewPrisonName] = useState('');
  const [detaineesCount, setDetaineesCount] = useState<number>(0);
  const [isCreatingPrison, setIsCreatingPrison] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [createError, setCreateError] = useState('');

  // Vérification du rôle administrateur
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    // Si l'utilisateur n'est pas un administrateur, rediriger vers sa page d'accueil
    if (userRole !== 'admin') {
      // Récupérer l'ID de la prison de l'utilisateur
      const prisonId = localStorage.getItem('userPrison');
      if (prisonId) {
        // Rediriger vers la page d'accueil de la prison de l'utilisateur
        navigate(`/${prisonId}/home`, { replace: true });
      } else {
        // En cas de problème, rediriger vers la page de connexion
        navigate('/login', { replace: true });
      }
    }
  }, [navigate]);
  
  useEffect(() => {
    document.body.classList.add('prison-selection-page');
    return () => {
      document.body.classList.remove('prison-selection-page');
    };
  }, []);

  // Fonction pour charger les prisons
  const fetchPrisons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('sessionToken');
      
      // Récupérer les prisons depuis l'API
      const response = await axios.get('http://localhost:8000/api/prisons/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Assigner les prisons récupérées
      setPrisons(response.data);
      setLoading(false);
      
    } catch (err) {
      console.error("Erreur lors du chargement des prisons:", err);
      setError('Erreur lors du chargement des établissements pénitentiaires');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Charger la liste des prisons disponibles
    fetchPrisons();
  }, []);

  const handleSelectPrison = async (prisonId: string) => {
    try {
        // Stocker l'ID de la prison sélectionnée localement
        localStorage.setItem('userPrison', prisonId);
        
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

  // Fonction pour ajouter une nouvelle prison
  const handleAddPrison = async () => {
    setIsCreatingPrison(true);
    setCreateError('');
    
    try {
      const token = localStorage.getItem('sessionToken');
      await axios.post(
        'http://localhost:8000/api/prisons/', 
        { 
          nom: newPrisonName, 
          detainees_count: detaineesCount 
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Réinitialiser le formulaire et retourner la carte
      setIsFlipped(false);
      setNewPrisonName('');
      setDetaineesCount(0);
      
      // Rafraîchir la liste des prisons
      fetchPrisons();
      
    } catch (err) {
      console.error("Erreur lors de la création de la prison:", err);
      setCreateError('Erreur lors de la création. Veuillez réessayer.');
    } finally {
      setIsCreatingPrison(false);
    }
  };
  
  // Fonction pour supprimer une prison
  const handleDeletePrison = async (prisonId: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer cette prison ? Cette action est irréversible.`)) {
      try {
        const token = localStorage.getItem('sessionToken');
        await axios.delete(`http://localhost:8000/api/prisons/${prisonId}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Rafraîchir la liste des prisons
        fetchPrisons();
        
      } catch (err) {
        console.error("Erreur lors de la suppression de la prison:", err);
        alert("Erreur lors de la suppression. Il est possible que des utilisateurs soient encore associés à cet établissement.");
      }
    }
  };

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
            Gestion des Établissements Pénitentiaires
          </h1>
          
          <p className="text-xl text-center text-white mb-8">
            En tant qu'administrateur, vous pouvez accéder à tous les établissements,
            en créer de nouveaux ou supprimer ceux qui ne sont plus utilisés.
          </p>
        </div>
        
        {/* Le formulaire de création de prison est maintenant intégré dans la carte */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-6xl mx-auto">          
          {/* Liste des prisons existantes */}
          {prisons.map((prison) => (
            <SpotlightCard 
              key={prison.id}
              className="h-full cursor-pointer transition duration-300 hover:scale-105 pointer-events-auto relative flex items-center justify-center" 
              spotlightColor="rgba(45, 161, 51, 0.2)"
            >
              {/* Bouton supprimer en haut à droite */}
              <button 
                className="cursor-pointer absolute top-1 right-1 text-red-500 hover:text-red-700 z-10 p-1 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePrison(prison.id);
                }}
              >
                <Trash2 className="cursor-pointer h-5 w-5" />
              </button>
              
              <div className="flex flex-col w-full items-center justify-center">
                <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                  <Building className="h-8 w-8 text-green-400" />
                </div>
                
                <h2 className="text-2xl font-bold text-green-300 text-center mb-4">
                  Centre pénitentiaire de {prison.nom}
                </h2>
                
                <div className="flex-grow w-full flex flex-col items-center justify-center">
                  <div className="grid grid-cols-1 gap-y-4 mb-6 text-center">
                    <div>
                      <p className="text-gray-400 text-sm">Date de création</p>
                      <p className="text-white font-medium">
                        {prison.date_creation
                          ? new Date(prison.date_creation).toLocaleDateString('fr-FR')
                          : '—'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="w-full px-4">
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-black font-semibold cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPrison(prison.id);
                    }}
                  >
                    Accéder <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </SpotlightCard>
          ))}
          
          {/* Carte pour ajouter une nouvelle prison avec effet de retournement */}
          <div className={`perspective-1000 h-full w-full ${isFlipped ? 'cursor-default' : 'cursor-pointer'}`}>
            <div 
              className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
              style={{
                perspective: '1000px',
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* Face avant - Bouton d'ajout */}
              <SpotlightCard 
                className="h-full w-full transition duration-300 hover:scale-105 pointer-events-auto border-2 border-dashed border-green-500/50 absolute backface-hidden"
                spotlightColor="rgba(45, 161, 51, 0.3)"
                onClick={() => setIsFlipped(true)}
                style={{
                  backfaceVisibility: 'hidden',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%'
                }}
              >
                <div className="flex flex-col h-full items-center justify-center py-10">
                  <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                    <Plus className="h-10 w-10 text-green-400" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-green-300 text-center mb-4">
                    Ajouter un nouvel établissement
                  </h2>
                  
                  <p className="text-gray-400 text-center mb-4 px-6">
                    Cliquez ici pour créer un nouveau centre pénitentiaire dans le système
                  </p>
                </div>
              </SpotlightCard>
              
              {/* Face arrière - Formulaire d'ajout */}
              <div 
                className="h-full w-full absolute rounded-lg p-6 shadow-xl rotate-y-180 backface-hidden border-2 border-dashed border-green-500/50 bg-black/75 backdrop-blur-sm"
                style={{
                  backfaceVisibility: 'hidden',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  transform: 'rotateY(180deg)'
                }}
              >
                <div className="flex flex-col h-full justify-center">
                  <h2 className="text-2xl font-bold text-green-400 text-center mb-6">
                    Ajouter un nouvel établissement
                  </h2>
                  
                  {createError && (
                    <div className="bg-red-900/50 text-red-200 p-3 rounded mb-4 text-center">
                      {createError}
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label className="block text-gray-200 text-sm mb-2 text-center">Nom de la ville</label>
                    <input 
                      type="text" 
                      value={newPrisonName} 
                      onChange={(e) => setNewPrisonName(e.target.value)}
                      className="w-full bg-gray-700/70 text-white p-2 rounded border border-green-500/30 focus:border-green-400 focus:outline-none"
                      placeholder="Ex: Nice"
                    />
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setIsFlipped(false)} 
                      className="bg-gray-800/70 hover:bg-gray-700 text-white px-4 py-2 rounded border border-gray-600"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleAddPrison}
                      disabled={!newPrisonName || isCreatingPrison}
                      className={`${
                        !newPrisonName || isCreatingPrison 
                          ? 'bg-green-800/50 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700'
                      } text-white px-4 py-2 rounded`}
                    >
                      {isCreatingPrison ? 'Création...' : 'Créer'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
