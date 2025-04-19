// filepath: /home/aterrak/gitstore/SecureSync/frontend/src/mycomponents/StaffModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import axios from 'axios';
import { useDevice } from '@/hooks/use-device';

// Définir le type pour les membres du personnel
interface StaffMember {
  id?: string; // Optionnel car peut ne pas être inclus dans le sérialiseur
  username: string;
  first_name: string;
  last_name: string;
  sexe: string;
  date_naissance: string;
  role: string;
  section: string;
  prison: string; // "p" minuscule pour correspondre au sérialiseur
}

interface CurrentUser {
  role: string;
  username: string;
}

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Interface pour le formulaire d'ajout de membre
interface NewMemberFormData {
  username: string;
  email: string;
  password1: string;
  password2: string;
  nom: string;
  prenom: string;
  sexe: string;
  date_naissance: string;
  section: string;
  prison: string;
  role: string;
}

const StaffModal: React.FC<StaffModalProps> = ({ isOpen, onClose }) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, username: string, userId: string}>({
    isOpen: false,
    username: '',
    userId: ''
  });
  const { isMobile } = useDevice();
  
  // États pour le formulaire d'ajout de membre
  const [showAddMemberForm, setShowAddMemberForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<NewMemberFormData>({
    username: '',
    email: '',
    password1: '',
    password2: '',
    nom: '',
    prenom: '',
    sexe: 'M',
    date_naissance: '',
    section: 'a',
    prison: 'paris',
    role: 'employe'
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  
  // États pour l'affichage des mots de passe
  const [showPassword1, setShowPassword1] = useState<boolean>(false);
  const [showPassword2, setShowPassword2] = useState<boolean>(false);

  // Récupération des données du personnel depuis l'API
  const fetchStaffData = async () => {
    try {
      // Récupérer le token JWT du stockage local
      const token = localStorage.getItem('sessionToken');
      
      if (!token) {
        setError('Session expirée, veuillez vous reconnecter');
        setLoading(false);
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
      
      // Définir les membres du staff
      if (Array.isArray(staffResponse.data)) {
        setStaff(staffResponse.data);
      } else if (staffResponse.data && typeof staffResponse.data === 'object') {
        const dataField = Object.keys(staffResponse.data).find(key => Array.isArray(staffResponse.data[key]));
        if (dataField) {
          setStaff(staffResponse.data[dataField]);
        } else {
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
    if (isOpen) {
      fetchStaffData();
    }
  }, [isOpen]);

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
  
  // Handlers pour le formulaire d'ajout de membre
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Fonction pour ajouter un nouveau membre
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    
    // Vérifications basiques
    if (formData.password1 !== formData.password2) {
      setFormError("Les mots de passe ne correspondent pas.");
      return;
    }
    
    if (!formData.username || !formData.email || !formData.nom || !formData.prenom) {
      setFormError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    
    try {
      const token = localStorage.getItem('sessionToken');
      if (!token) {
        setFormError("Session expirée, veuillez vous reconnecter.");
        return;
      }
      
      await axios.post('http://localhost:8000/api/register/', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setFormSuccess("Le membre a été ajouté avec succès !");
      
      // Réinitialiser le formulaire
      setFormData({
        username: '',
        email: '',
        password1: '',
        password2: '',
        nom: '',
        prenom: '',
        sexe: 'M',
        date_naissance: '',
        section: 'a',
        prison: 'paris',
        role: 'employe'
      });
      
      // Fermer le formulaire et rafraîchir la liste
      setTimeout(() => {
        setShowAddMemberForm(false);
        fetchStaffData();
        setFormSuccess(null);
      }, 2000);
      
    } catch (err: any) {
      console.error("Erreur lors de l'ajout d'un membre:", err);
      if (err.response && err.response.data) {
        // Extraire les messages d'erreur de la réponse
        const errorsData = err.response.data;
        const errorMessages = Object.keys(errorsData)
          .map(key => `${key}: ${errorsData[key].join(', ')}`)
          .join('; ');
        setFormError(errorMessages || "Erreur lors de l'ajout du membre.");
      } else {
        setFormError("Une erreur s'est produite lors de l'ajout du membre.");
      }
    }
  };
  
  // Fonction pour réinitialiser le formulaire et fermer le modal d'ajout
  const handleCancelAdd = () => {
    setShowAddMemberForm(false);
    setFormError(null);
    setFormSuccess(null);
    setFormData({
      username: '',
      email: '',
      password1: '',
      password2: '',
      nom: '',
      prenom: '',
      sexe: 'M',
      date_naissance: '',
      section: 'a',
      prison: 'paris',
      role: 'employe'
    });
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

  // Affichage du contenu
  const renderContent = () => {
    // Affichage pendant le chargement
    if (loading) {
      return (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    // Affichage en cas d'erreur
    if (error) {
      return (
        <div className="bg-white p-8 rounded-lg shadow-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={fetchStaffData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Réessayer
          </button>
        </div>
      );
    }

    // S'assurer que staff est un tableau avant d'utiliser .map()
    const staffList = Array.isArray(staff) ? staff : [];
    const isAdmin = currentUser?.role === 'admin';

    // Filtrer les valeurs non spécifiées pour les statistiques
    const validSections = staffList
      .map(member => member.section)
      .filter(section => section && section !== 'Non spécifié');
    
    const validRoles = staffList
      .map(member => member.role)
      .filter(role => role && role !== 'Non spécifié');

    const uniqueSections = new Set(validSections).size;
    const uniqueRoles = new Set(validRoles).size;


    if (staffList.length === 0) {
      return (
        <div className="bg-white p-8 rounded-lg text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Aucun membre trouvé</h2>
          <p className="text-gray-500">Il n'y a actuellement aucun membre du personnel enregistré dans le système.</p>
        </div>
      );
    }

    return (
      <div className="container mx-auto p-4">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700">Total des membres</h2>
            <p className="text-3xl font-bold text-blue-600">{staffList.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700">Sections</h2>
            <p className="text-3xl font-bold text-green-600">
              {uniqueSections}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700">Rôles</h2>
            <p className="text-3xl font-bold text-purple-600">
              {uniqueRoles}
            </p>
          </div>
        </div>
        
        {/* Liste du personnel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffList.map((member) => (
            <div key={member.username} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg border-2 border-gray-200 overflow-hidden">
                    {(member.first_name || member.last_name) ? 
                      `${member.first_name?.charAt(0).toUpperCase() || ''}${member.last_name?.charAt(0).toUpperCase() || ''}` : 
                      member.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {member.first_name} {member.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">@{member.username}</p>
                  </div>
                
                  <div className="flex-grow flex justify-end items-center">
                      {/* Règles de suppression:
                        - Admins peuvent supprimer tout le monde sauf eux-mêmes
                        - Gestionnaires peuvent supprimer tous les employés
                        - Employés ne peuvent supprimer personne
                        - Personne ne peut se supprimer soi-même */}
                      {((isAdmin && (member.username !== currentUser?.username)) || 
                        (currentUser?.role === 'gestionnaire' && member.role === 'employe')) && (
                        <button
                          onClick={() => handleOpenDeleteModal(member.username, member.id || member.username)}
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                          title="Supprimer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
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
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Modal
      dismissible
      show={isOpen}
      onClose={onClose}
      size="6xl"
      position="center"
    >
      <ModalHeader className="border-b border-gray-200">
        <div className={`${isMobile ? 'flex-col' : 'flex'} justify-between items-center w-full`}>
          <div className="text-xl font-bold text-gray-900">Gestion de l'équipe</div>
          {(currentUser?.role === 'admin' || currentUser?.role === 'gestionnaire') && !showAddMemberForm && (
            <button 
              onClick={() => setShowAddMemberForm(true)}
              className={`px-4 py-2 ${isMobile ? 'mt-3' : 'ml-5'} bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm`}
            >
              Ajouter un nouvel employé
            </button>
          )}
        </div>
      </ModalHeader>
      <ModalBody className="max-h-[80vh] overflow-y-auto">
        {showAddMemberForm ? (
          <div className="p-4 bg-white rounded-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ajouter un nouvel employé</h2>
            
            {formSuccess && (
              <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
                {formSuccess}
              </div>
            )}
            
            {formError && (
              <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                {formError}
              </div>
            )}
            
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Informations de base */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom d'utilisateur *
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    className="w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    className="w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                {/* Mots de passe */}
                <div>
                  <label htmlFor="password1" className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword1 ? "text" : "password"}
                      id="password1"
                      name="password1"
                      value={formData.password1}
                      onChange={handleInputChange}
                      className="w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      required
                      minLength={8}
                    />
                    <button 
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword1(!showPassword1)}
                    >
                      {showPassword1 ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer le mot de passe *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword2 ? "text" : "password"}
                      id="password2"
                      name="password2"
                      value={formData.password2}
                      onChange={handleInputChange}
                      className="w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      required
                      minLength={8}
                    />
                    <button 
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword2(!showPassword2)}
                    >
                      {showPassword2 ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Informations supplémentaires */}
                <div>
                  <label htmlFor="sexe" className="block text-sm font-medium text-gray-700 mb-1">
                    Sexe
                  </label>
                  <select
                    id="sexe"
                    name="sexe"
                    value={formData.sexe}
                    onChange={handleInputChange}
                    className="w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                    <option value="O">Autre</option>
                    <option value="N">Préfère ne pas préciser</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="date_naissance" className="block text-sm font-medium text-gray-700 mb-1">
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    id="date_naissance"
                    name="date_naissance"
                    value={formData.date_naissance}
                    onChange={handleInputChange}
                    className="w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Rôle
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="employe">Employé</option>
                    {currentUser?.role === 'admin' && (
                      <>
                        <option value="gestionnaire">Gestionnaire</option>
                        <option value="admin">Administrateur</option>
                      </>
                    )}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
                    Section
                  </label>
                  <select
                    id="section"
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    className="w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="a">Section A</option>
                    <option value="b">Section B</option>
                    <option value="c">Section C</option>
                    <option value="toutes">Toutes les sections</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="prison" className="block text-sm font-medium text-gray-700 mb-1">
                    Prison
                  </label>
                  <select
                    id="prison"
                    name="prison"
                    value={formData.prison}
                    onChange={handleInputChange}
                    className="w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="paris">Paris</option>
                    <option value="lyon">Lyon</option>
                    <option value="marseille">Marseille</option>
                    <option value="cergy">Cergy</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={handleCancelAdd}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        ) : (
          renderContent()
        )}
      </ModalBody>

      {/* Modal de suppression - Intégré directement */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirmer la suppression</h2>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{deleteModal.username}</strong> ? 
              Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseDeleteModal}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('sessionToken');
                    
                    if (!token) {
                      console.error('Token de session non disponible');
                      return;
                    }

                    await axios.delete(`http://localhost:8000/api/account/delete/${deleteModal.username}/`, {
                      headers: { Authorization: `Bearer ${token}` }
                    });

                    handleUserDeleted();
                    handleCloseDeleteModal();
                  } catch (error) {
                    console.error('Erreur lors de la suppression:', error);
                  }
                }}
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default StaffModal;