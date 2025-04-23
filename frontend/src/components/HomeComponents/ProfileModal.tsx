import React, { useState, useEffect } from 'react';
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import axios from 'axios';

// Types pour le profil utilisateur
interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_naissance: string;
  sexe: string;
  photo: string | null;
  points: number; // Ajout du champ points
}

// Composant pour la barre de progression du niveau
interface ProgressBarProps {
  points: number;
}

const UserLevelProgressBar: React.FC<ProgressBarProps> = ({ points }) => {
  // Définition des niveaux avec leurs images
  const levels = [
    { 
      name: "Junior", 
      minPoints: 0, 
      maxPoints: 100, 
      color: "bg-blue-500",
      badgeImg: "/JUNIOR.png" 
    },
    { 
      name: "Confirmé", 
      minPoints: 100, 
      maxPoints: 1000, 
      color: "bg-green-500",
      badgeImg: "/CONFIRME.png" 
    },
    { 
      name: "Senior", 
      minPoints: 1000, 
      maxPoints: Infinity, 
      color: "bg-yellow-600",
      badgeImg: "/SENIOR.png" 
    }
  ];
  
  // Déterminer le niveau actuel
  const currentLevel = levels.find(level => 
    points >= level.minPoints && points < level.maxPoints
  ) || levels[levels.length - 1];
  
  // Calculer le pourcentage de progression dans le niveau actuel
  let percentage = 0;
  if (currentLevel.maxPoints !== Infinity) {
    percentage = ((points - currentLevel.minPoints) / (currentLevel.maxPoints - currentLevel.minPoints)) * 100;
  } else {
    // Pour le niveau Senior, on remplit la barre à 100%
    percentage = 100;
  }
  
  // Points restants pour atteindre le niveau suivant
  let nextLevelInfo = '';
  if (currentLevel.maxPoints !== Infinity) {
    const pointsToNextLevel = currentLevel.maxPoints - points;
    nextLevelInfo = `${pointsToNextLevel} points pour atteindre ${levels[levels.indexOf(currentLevel) + 1].name}`;
  } else {
    nextLevelInfo = `Niveau maximum atteint`;
  }
  
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-35 h-35">
          <img 
            src={currentLevel.badgeImg} 
            alt={`Badge ${currentLevel.name}`} 
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-grow">
          <div className="flex justify-between">
            <span className="font-semibold">{currentLevel.name}</span>
            <span className="text-sm text-gray-500">{points} points</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
            <div
              className={`h-2.5 rounded-full ${currentLevel.color}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{nextLevelInfo}</p>
        </div>
      </div>
    </div>
  );
};

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    existingProfile?: UserProfile | null;
    setProfile?: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ 
    isOpen, 
    onClose, 
    existingProfile, 
    setProfile: updateParentProfile 
  }) => {
  // États
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  // Récupération des données du profil
  useEffect(() => {
    if (isOpen) {
      // Utiliser le profil fourni par le parent si disponible
      if (existingProfile) {
        setProfile(existingProfile);
        setEditedProfile(existingProfile);
        setLoading(false);
      } else {
        // Sinon, le récupérer depuis l'API
        const fetchProfile = async () => {
          try {
            const token = localStorage.getItem('sessionToken');
            const response = await axios.get('http://localhost:8000/api/profile/', {
              headers: {
                'Authorization': `Bearer ${token}` 
              }
            });
            console.log("API response data:", response.data);
            setProfile(response.data);
            setEditedProfile(response.data);
            
            // Mettre à jour l'état du parent si la fonction est fournie
            if (updateParentProfile) {
              updateParentProfile(response.data);
            }
            
            setLoading(false);
          } catch (err) {
            console.error("Erreur API:", err);
            setError('Erreur lors du chargement du profil');
            setLoading(false);
          }
        };
  
        fetchProfile();
      }
    }
  }, [isOpen, existingProfile, updateParentProfile]);
  // Gestionnaire pour les changements de champs texte
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editedProfile) {
      setEditedProfile({
        ...editedProfile,
        [name]: value
      });
    }
  };

  // Gestionnaire pour l'upload de photo
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      
      // Prévisualisation de l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // États pour la vérification du mot de passe avant édition
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authPasswordError, setAuthPasswordError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);

  // Demande le mot de passe avant d'activer le mode édition
  const handleEditClick = () => {
    console.log("Bouton Modifier mon profil cliqué");
    // Pour éviter les problèmes d'API, dans la version actuelle, on passe directement en mode édition
    // Dans une version de production, il faudrait implémenter la vérification du mot de passe
    setIsEditing(true);
    
    setShowPasswordPrompt(true);
    setAuthPassword('');
    setAuthPasswordError('');
  };

  // Vérifie le mot de passe avant d'autoriser l'édition
  const verifyPassword = async () => {
    if (!authPassword) {
      setAuthPasswordError('Veuillez entrer votre mot de passe');
      return;
    }

    try {
      setLoading(true);
      setAuthPasswordError('');
      
      // Vérifier si l'utilisateur existe avant de tester le mot de passe
      const token = localStorage.getItem('sessionToken') || localStorage.getItem('access_token');
      
      // Utilisation d'un endpoint spécifique pour vérifier le mot de passe sans déclencher de connexion
      try {
        const response = await axios.post('http://localhost:8000/api/verify-password/', 
          { 
            password: authPassword 
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        // Si la vérification réussit, on autorise l'édition
        console.log("Vérification du mot de passe réussie, édition autorisée");
        setShowPasswordPrompt(false);
        setAuthPasswordError('');
        setIsEditing(true);
      } catch (apiError: any) {
        // Si la vérification échoue, c'est que le mot de passe est incorrect
        if (apiError.response && apiError.response.status === 401) {
          setAuthPasswordError('Mot de passe incorrect');
        } else {
          console.error("Erreur lors de la vérification:", apiError);
          setAuthPasswordError('Erreur de vérification. Veuillez réessayer.');
        }
      }
      
    } catch (err: any) {
      console.error("Erreur générale:", err);
      setAuthPasswordError('Une erreur est survenue lors de la vérification');
    } finally {
      setLoading(false);
    }
  };

  // Annulation des modifications
  const handleCancelClick = () => {
    console.log("Annulation des modifications");
    setIsEditing(false);
    setShowPasswordPrompt(false); // Masquer le formulaire de confirmation du mot de passe
    setEditedProfile(profile);
    setPassword('');
    setPasswordError('');
    setPhotoFile(null);
    setPhotoPreview(null);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordMatch(true);
    setAuthPassword(''); // Réinitialiser le mot de passe d'authentification
    setAuthPasswordError(''); // Réinitialiser les erreurs d'authentification
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Formulaire soumis");
    
    // L'utilisateur a déjà été authentifié, pas besoin de vérifier à nouveau le mot de passe
    try {
      setLoading(true);
      console.log("Début de l'envoi des données");
      
      // Création d'un FormData pour gérer l'upload de fichier
      const formData = new FormData();
      
      // Ajout des champs du profil
      if (editedProfile) {
        Object.entries(editedProfile).forEach(([key, value]) => {
          if (value !== null && key !== 'photo') {
            formData.append(key, String(value));
            console.log(`Ajout du champ ${key} avec la valeur ${value}`);
          }
        });
      }
      
      // Ajout du mot de passe pour vérification
      formData.append('password', authPassword);
      console.log('Mot de passe ajouté au formulaire');
      
      // Ajout de la photo si modifiée
      if (photoFile) {
        formData.append('photo', photoFile);
        console.log('Photo ajoutée au formulaire');
      }
      
      // Ajout du nouveau mot de passe si fourni
      if (newPassword && passwordMatch) {
        formData.append('new_password', newPassword);
        console.log('Nouveau mot de passe ajouté au formulaire');
      }
      
      // Récupération du token de session
      const token = localStorage.getItem('sessionToken');
      console.log('Token utilisé pour la mise à jour:', token);
      
      // Utilisation de l'URL complète
      console.log('Envoi de la requête PUT au backend...');
      const response = await axios.put('http://localhost:8000/api/profile/update/', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Réponse du backend:', response.data);
      setProfile(response.data);
      if (updateParentProfile) {
        updateParentProfile(response.data);
      }
      setIsEditing(false);
      setPassword('');
      setPhotoFile(null);
      setPhotoPreview(null);
      
      // Afficher le message de succès et rester en mode affichage
      setSuccessMessage('Profil mis à jour avec succès');
      
      // Fermeture de la modale après un délai de 1.5 secondes
      setTimeout(() => {
        setSuccessMessage(''); // Retire le message de succès avant de fermer
      }, 2000);
    } catch (err: any) {
      if (err.response && err.response.status === 403) {
        setPasswordError('Mot de passe incorrect');
      } else {
        setError('Erreur lors de la mise à jour du profil');
        console.error('Erreur:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="xl">
      <ModalHeader>
        <h3 className="text-xl font-medium text-gray-900 dark:text-white">Mon Profil</h3>
      </ModalHeader>
      <ModalBody>
        {loading && !profile ? (
          <div className="text-center py-10">Chargement du profil...</div>
        ) : error && !profile ? (
          <div className="text-center py-10 text-red-600">{error}</div>
        ) : (
          <>
            {successMessage && (
              <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
                {successMessage}
              </div>
            )}
            
            {error && error !== 'Erreur lors du chargement du profil' && (
              <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
                {error}
              </div>
            )}
            
            {profile && !isEditing ? (
              <div className="space-y-4 flex-col justify-center ">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-22 h-22 flex-shrink-0 align-">
                        <div className="w-22 h-22 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-4xl border-2 border-gray-200">
                            {profile && (profile.first_name || profile.last_name) ? 
                            `${profile.first_name?.charAt(0).toUpperCase() || ''}${profile.last_name?.charAt(0).toUpperCase() || ''}` : 
                            profile?.username?.charAt(0).toUpperCase() || '?'}
                        </div>                      
                    </div>
                  
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-gray-500">Nom d'utilisateur</h3>
                      <p className="font-medium">{profile.username}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-gray-500">Email</h3>
                      <p className="font-medium truncate" title={profile.email}>
                        {profile.email}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-gray-500">Prénom</h3>
                      <p className="font-medium">{profile.first_name || '-'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-gray-500">Nom</h3>
                      <p className="font-medium">{profile.last_name || '-'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-gray-500">Date de naissance</h3>
                      <p className="font-medium">{profile.date_naissance || '-'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-gray-500">Sexe</h3>
                      <p className="font-medium">{
                        profile.sexe === 'M' ? 'Masculin' : 
                        profile.sexe === 'F' ? 'Féminin' : 
                        profile.sexe === 'A' ? 'Autre' : '-'
                      }</p>
                    </div>
                  </div>
                </div>
                
                {/* Ajout de la barre de progression du niveau */}
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <UserLevelProgressBar points={profile.points || 0} />
                </div>
                
                <div className="mt-6 flex justify-center">  
                  <button
                    onClick={handleEditClick}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Modifier mon profil
                  </button>
                </div>
              </div>
            ) : showPasswordPrompt ? (
              <div className="space-y-6">
                <p className="text-gray-700">
                  Veuillez entrer votre mot de passe actuel pour confirmer votre identité avant de modifier votre profil.
                </p>
                
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="authPassword">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    id="authPassword"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        verifyPassword();
                      }
                    }}
                    className={`w-full p-2 border rounded ${authPasswordError ? 'border-red-500' : ''}`}
                  />
                  {authPasswordError && (
                    <p className="text-red-500 text-sm mt-1">{authPasswordError}</p>
                  )}
                </div>
                
                <div className="flex space-x-4 justify-center">
                  <button
                    type="button"
                    onClick={verifyPassword}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    disabled={loading}
                  >
                    {loading ? 'Vérification...' : 'Confirmer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleCancelClick();
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                    disabled={loading}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              editedProfile && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-22 h-22 flex-shrink-0 align-">
                        <div className="w-22 h-22 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-4xl border-2 border-gray-200">
                            {profile && (profile.first_name || profile.last_name) ? 
                            `${profile.first_name?.charAt(0).toUpperCase() || ''}${profile.last_name?.charAt(0).toUpperCase() || ''}` : 
                            profile?.username?.charAt(0).toUpperCase() || '?'}
                        </div>                      
                    </div>
                    
                    <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 mb-2" htmlFor="username">
                          Nom d'utilisateur
                        </label>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={editedProfile.username}
                          className="w-full p-2 border rounded bg-gray-100"
                          disabled
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Non modifiable
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 mb-2" htmlFor="email">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={editedProfile.email}
                          onChange={handleChange}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 mb-2" htmlFor="first_name">
                          Prénom
                        </label>
                        <input
                          type="text"
                          id="first_name"
                          name="first_name"
                          value={editedProfile.first_name}
                          onChange={handleChange}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 mb-2" htmlFor="last_name">
                          Nom
                        </label>
                        <input
                          type="text"
                          id="last_name"
                          name="last_name"
                          value={editedProfile.last_name}
                          onChange={handleChange}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 mb-2" htmlFor="date_naissance">
                          Date de naissance
                        </label>
                        <input
                          type="date"
                          id="date_naissance"
                          name="date_naissance"
                          value={editedProfile.date_naissance}
                          onChange={handleChange}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 mb-2" htmlFor="sexe">
                          Sexe
                        </label>
                        <select
                          id="sexe"
                          name="sexe"
                          value={editedProfile.sexe}
                          onChange={handleChange}
                          className="w-full p-2 border rounded"
                        >
                          <option value="M">Masculin</option>
                          <option value="F">Féminin</option>
                          <option value="A">Autre</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="font-medium text-gray-700 mb-3">Changer le mot de passe (optionnel)</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 mb-2" htmlFor="newPassword">
                          Nouveau mot de passe
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            setPasswordMatch(e.target.value === confirmPassword || !e.target.value);
                          }}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
                          Confirmer le mot de passe
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setPasswordMatch(newPassword === e.target.value || !newPassword);
                          }}
                          className={`w-full p-2 border rounded ${!passwordMatch ? 'border-red-500' : ''}`}
                          disabled={!newPassword}
                        />
                        {!passwordMatch && (
                          <p className="text-red-500 text-sm mt-1">Les mots de passe sont différents</p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-3">
                        Laissez vide pour ne pas modifier le mot de passe
                    </p>
                  </div>
                  
                  <div className="flex space-x-4 justify-center">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      disabled={loading}
                    >
                      {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelClick}
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                      disabled={loading}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )
            )}
          </>
        )}
      </ModalBody>
    </Modal>
  );
};

export default ProfileModal;
console.log('Bouton cliqué');
