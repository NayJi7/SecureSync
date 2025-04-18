import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import DeleteUserModal from '@/components/DeleteUserModal'; // Import du composant modal

// Définir le type pour les membres du personnel
interface StaffMember {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  sexe: string;
  date_naissance: string;
  role: string;
  section: string;
  Prison: string;
}

interface CurrentUser {
  role: string;
}

const StaffPage: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, username: string, userId: string}>({
    isOpen: false,
    username: '',
    userId: ''
  });
  const navigate = useNavigate();

  // Récupération des données du personnel depuis l'API
  const fetchStaffData = async () => {
    try {
      // Récupérer le token JWT du stockage local
      const token = localStorage.getItem('sessionToken');
      
      if (!token) {
        // Rediriger vers la page de connexion si non authentifié
        navigate('/login');
        return;
      }

      const [staffResponse, userResponse] = await Promise.all([
        axios.get('http://localhost:8000/api/staff/', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/profile/', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      console.log('Profil utilisateur récupéré:', userResponse.data);
      // Définir les membres du staff
      if (Array.isArray(staffResponse.data)) {
        setStaff(staffResponse.data);
      } else if (staffResponse.data && typeof staffResponse.data === 'object') {
        const dataField = Object.keys(staffResponse.data).find(key => Array.isArray(staffResponse.data[key]));
        if (dataField) {
          setStaff(staffResponse.data[dataField]);
        } else {
          console.error('Format de réponse inattendu:', staffResponse.data);
          setError('Format de données inattendu reçu du serveur');
        }
      }

      // Définir l'utilisateur courant
      setCurrentUser(userResponse.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Erreur de chargement:', err);
      setError('Erreur lors du chargement des données du personnel');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, [navigate]);

  // Gérer la suppression d'un utilisateur
  const handleOpenDeleteModal = (username: string, userId: string) => {
    setDeleteModal({
      isOpen: true,
      username,
      userId
    });
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      username: '',
      userId: ''
    });
  };

  const handleUserDeleted = () => {
    // Rafraîchir la liste après suppression
    fetchStaffData();
  };

  // Fonction pour formater la date de naissance
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Fonction pour obtenir l'âge à partir de la date de naissance
  const calculateAge = (dateString: string) => {
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // S'assurer que staff est un tableau avant d'utiliser .map()
  const staffList = Array.isArray(staff) ? staff : [];
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Équipe</h1>
        
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700">Total des membres</h2>
            <p className="text-3xl font-bold text-blue-600">{staffList.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700">Sections</h2>
            <p className="text-3xl font-bold text-green-600">
              {new Set(staffList.map(member => member.section)).size}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700">Rôles</h2>
            <p className="text-3xl font-bold text-purple-600">
              {new Set(staffList.map(member => member.role)).size}
            </p>
          </div>
        </div>
        
        {/* Liste du personnel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffList.map((member) => (
            <div key={member.username} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {member.sexe === 'M' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {member.first_name} {member.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">@{member.username}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Rôle</p>
                      <p className="text-sm text-gray-900">{member.role || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Section</p>
                      <p className="text-sm text-gray-900">{member.section || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Prison</p>
                      <p className="text-sm text-gray-900">{member.prison || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Âge</p>
                      <p className="text-sm text-gray-900">
                        {member.date_naissance ? `${calculateAge(member.date_naissance)} ans` : 'Non spécifié'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 flex justify-between">
                <Link 
                  to={`/staff/${member.username}`}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Voir profil détaillé
                </Link>
                
                {isAdmin && (
                  <button
                    onClick={() => handleOpenDeleteModal(member.username, member.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:underline"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Message si aucun membre n'est trouvé */}
        {staffList.length === 0 && (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Aucun membre trouvé</h2>
            <p className="text-gray-500">Il n'y a actuellement aucun membre du personnel enregistré dans le système.</p>
          </div>
        )}
      </div>

      {/* Modal de suppression */}
      <DeleteUserModal
        isOpen={deleteModal.isOpen}
        username={deleteModal.username}
        userId={deleteModal.userId}
        onClose={handleCloseDeleteModal}
        onUserDeleted={handleUserDeleted}
      />
    </div>
  );
};

export default StaffPage;