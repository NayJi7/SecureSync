import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Types pour le profil utilisateur basés sur le modèle CustomUser
interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_naissance: string;
  sexe: string;
  photo: string | null;
  // Autres champs selon votre modèle CustomUser
}

const ProfileComponent: React.FC = () => {
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
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('sessionToken');
        const response = await axios.get('http://localhost:8000/api/profile/', {
          headers: {
            'Authorization': `Bearer ${token}` 
          }
        });
        console.log("API response data:", response.data); // Vérifiez ce que renvoie l'API
        setProfile(response.data);
        setEditedProfile(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur API:", err); // Log plus détaillé de l'erreur
        setError('Erreur lors du chargement du profil');
        setLoading(false);
      }
    };

    fetchProfile();
    console.log("Profile data:", profile); // Ajoutez ceci
  }, []);

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

  // Activation du mode édition
  const handleEditClick = () => {
    setIsEditing(true);
    setPassword('');
    setPasswordError('');
  };

  // Annulation des modifications
  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedProfile(profile);
    setPassword('');
    setPasswordError('');
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setPasswordError('Veuillez entrer votre mot de passe pour confirmer les modifications');
      return;
    }

    try {
      setLoading(true);
      
      // Création d'un FormData pour gérer l'upload de fichier
      const formData = new FormData();
      
      // Ajout des champs du profil
      if (editedProfile) {
        Object.entries(editedProfile).forEach(([key, value]) => {
          if (value !== null && key !== 'photo') {
            formData.append(key, String(value));
          }
        });
      }
      
      // Ajout du mot de passe pour vérification
      formData.append('password', password);
      
      // Ajout de la photo si modifiée
      if (photoFile) {
        formData.append('photo', photoFile);
      }
      
      const token = localStorage.getItem('access_token');
      const response = await axios.put('/api/profile/update/', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setProfile(response.data);
      setIsEditing(false);
      setPassword('');
      setPhotoFile(null);
      setPhotoPreview(null);
      setSuccessMessage('Profil mis à jour avec succès');
      setTimeout(() => setSuccessMessage(''), 3000);
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

  if (loading && !profile) {
    return <div className="text-center py-10">Chargement du profil...</div>;
  }

  if (error && !profile) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>
      
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
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-32 h-32 flex-shrink-0">
              {profile.photo ? (
                <img 
                  src={profile.photo} 
                  alt="Photo de profil" 
                  className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Photo</span>
                </div>
              )}
            </div>
            
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-gray-500">Nom d'utilisateur</h3>
                <p className="font-medium">{profile.username}</p>
              </div>
              
              <div>
                <h3 className="text-gray-500">Email</h3>
                <p className="font-medium">{profile.email}</p>
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
          
          <div className="mt-6">
            <button
              onClick={handleEditClick}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Modifier mon profil
            </button>
          </div>
        </div>
      ) : (
        editedProfile && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-32 h-32 flex-shrink-0">
                {photoPreview ? (
                  <img 
                    src={photoPreview} 
                    alt="Aperçu de la photo" 
                    className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : profile?.photo ? (
                  <img 
                    src={profile.photo} 
                    alt="Photo actuelle" 
                    className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Photo</span>
                  </div>
                )}
                
                <label className="block mt-2 text-center cursor-pointer text-blue-600 hover:text-blue-800">
                  Changer
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
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
                    Le nom d'utilisateur ne peut pas être modifié
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
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="password">
                Mot de passe (requis pour confirmer les modifications)
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full p-2 border rounded ${passwordError ? 'border-red-500' : ''}`}
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
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
    </div>
  );
};

export default ProfileComponent;