// filepath: /home/aterrak/gitstore/SecureSync/frontend/src/pages/PrisonSelectionPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LiquidChrome from '../blocks/Backgrounds/LiquidChrome/LiquidChrome';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Building, ArrowRight, Plus, Trash2 } from 'lucide-react';
import SpotlightCard from '@/blocks/Components/SpotlightCard/SpotlightCard';
import Swal from 'sweetalert2';

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
      
      // Notification de succès
      Swal.fire({
        title: 'Succès !',
        text: 'L\'établissement a été créé avec succès',
        icon: 'success',
        background: '#1a1a1a',
        color: '#fff',
        iconColor: '#4ade80',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      
    } catch (err) {
      console.error("Erreur lors de la création de la prison:", err);
      setCreateError('');
      Swal.fire({
        title: 'Erreur',
        text: 'Erreur lors de la création. Veuillez réessayer.',
        icon: 'error',
        background: '#1a1a1a',
        color: '#fff'
      });
    } finally {
      setIsCreatingPrison(false);
    }
  };
  
  // Fonction pour supprimer une prison
  const handleDeletePrison = async (prisonId: string) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous êtes sur le point de supprimer cet établissement. Cette action est irréversible.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#046c4e',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      background: '#1a1a1a',
      color: '#fff',
      iconColor: '#d33'
    });
    
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('sessionToken');
        await axios.delete(`http://localhost:8000/api/prisons/${prisonId}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Rafraîchir la liste des prisons
        fetchPrisons();
        
        // Message de confirmation de suppression
        Swal.fire({
          title: 'Supprimé !',
          text: 'L\'établissement a été supprimé avec succès.',
          icon: 'success',
          background: '#1a1a1a',
          color: '#fff',
          iconColor: '#4ade80'
        });
        
      } catch (err) {
        console.error("Erreur lors de la suppression de la prison:", err);
        Swal.fire({
          title: 'Erreur',
          text: 'Erreur lors de la suppression. Il est possible que des utilisateurs soient encore associés à cet établissement.',
          icon: 'error',
          background: '#1a1a1a',
          color: '#fff',
        });
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

        {/* Section des établissements et carte d'ajout dans la même grille */}
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
          
          {/* Carte d'ajout - intégrée dans la grille */}
          <div className="h-full min-h-[350px] perspective-1000">
            <div 
              className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
              style={{
                perspective: '1000px',
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* Face avant - Bouton d'ajout */}
              <div 
                className={`absolute inset-0 w-full h-full backface-hidden transition duration-300 hover:scale-105 rounded-lg overflow-hidden ${isFlipped ? '' : 'cursor-pointer'}`}
                style={{
                  backfaceVisibility: 'hidden'
                }}
                onClick={() => !isFlipped && setIsFlipped(true)}
              >
                <SpotlightCard 
                  className="h-full w-full relative flex items-center justify-center align-middle"
                  spotlightColor="rgba(45, 161, 51, 0.3)"
                >
                  {/* Bordure en pointillés séparée et bien alignée sur les bords */}
                  <div className="absolute inset-0 border-2 border-dashed border-green-500/50 rounded-lg pointer-events-none"></div>
                  
                  {/* Conteneur avec un meilleur centrage */}
                  <div className="flex flex-col h-full w-full items-center justify-center py-6 px-6">
                    <div className="w-20 h-10 bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                      <Plus className="h-6 w-6 text-green-400" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-green-300 text-center mb-6">
                      Ajouter un nouvel établissement
                    </h2>
                    
                    <p className="text-gray-400 text-center mb-0 px-4 max-w-xs mx-auto">
                      Cliquez ici pour créer un nouveau centre pénitentiaire dans le système
                    </p>
                  </div>
                </SpotlightCard>
              </div>
              
              {/* Face arrière - Formulaire d'ajout */}
              <div 
                className="absolute inset-0 w-full h-full backface-hidden rounded-lg shadow-xl rotate-y-180 bg-black/75 backdrop-blur-sm overflow-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                {/* Bordure en pointillés séparée et bien alignée sur les bords */}
                <div className="absolute inset-0 border-2 border-dashed border-green-500/50 rounded-lg pointer-events-none"></div>
                
                {/* Contenu du formulaire mieux centré */}
                <div className="flex flex-col h-full justify-center items-center p-8">
                  <h2 className="text-2xl font-bold text-green-400 text-center mb-8">
                    Ajouter un nouvel établissement
                  </h2>
                  
                  {createError && (
                    <div className="bg-red-900/50 text-red-200 p-3 rounded mb-4 text-center">
                      {createError}
                    </div>
                  )}
                  
                  <div className="mb-8 w-full max-w-xs">
                    <label className="block text-gray-200 text-sm mb-2 text-center">Nom de la ville</label>
                    <input 
                      type="text" 
                      value={newPrisonName} 
                      onChange={(e) => setNewPrisonName(e.target.value)}
                      className="w-full bg-gray-700/70 text-white p-3 rounded border border-green-500/30 focus:border-green-400 focus:outline-none"
                      placeholder="Ex: Nice"
                    />
                  </div>
                  
                  <div className="flex justify-center gap-6 mt-4">
                    <button
                      onClick={() => setIsFlipped(false)} 
                      className="bg-gray-800/70 hover:bg-gray-700 text-white px-6 py-3 rounded border border-gray-600 transition-colors duration-200"
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
                      } text-white px-6 py-3 rounded transition-colors duration-200`}
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
