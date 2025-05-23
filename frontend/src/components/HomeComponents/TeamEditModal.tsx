import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Interface pour les propriétés du composant
interface TeamEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: any;
  onMemberUpdated: () => void;
  isAdmin: boolean;
}

const TeamEditModal: React.FC<TeamEditModalProps> = ({ isOpen, onClose, member, onMemberUpdated, isAdmin }) => {
  // États pour le formulaire
  const [memberData, setMemberData] = useState({
    username: member?.username || '',
    email: member?.email || '',
    first_name: member?.first_name || '',
    last_name: member?.last_name || '',
    sexe: member?.sexe || 'M',
    role: member?.role || 'employe',
    section: member?.section || 'a',
    points: member?.points || 0
  });
  const [originalUsername, setOriginalUsername] = useState<string>(member?.username || '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Mettre à jour les données du formulaire lorsque member change
  useEffect(() => {
    if (member) {
      // console.log('Membre reçu dans TeamEditModal:', member);
      // console.log('Type de member:', typeof member, 'Clés:', Object.keys(member));

      // Stocker l'username original pour la mise à jour
      if (member.username) {
        setOriginalUsername(member.username);
      }

      // Récupérer les données complètes du membre
      const fetchCompleteData = async () => {
        if (member && member.username) {
          try {
            const token = localStorage.getItem('sessionToken');
            if (!token) return;

            // Utiliser le nouvel endpoint spécifique pour récupérer les détails de l'utilisateur
            const usernameForFetch = member.username;
            // console.log('Récupération des détails pour le username:', usernameForFetch);

            const response = await axios.get(
              `http://localhost:8000/api/staff/${usernameForFetch}/`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );

            if (response.data) {
              //   console.log('Données complètes trouvées:', response.data);
              // Utiliser les données complètes retournées par l'API
              const userData = response.data;
              setMemberData({
                username: userData.username || '',
                email: userData.email || member.email || '',
                first_name: userData.first_name || member.first_name || '',
                last_name: userData.last_name || member.last_name || '',
                sexe: userData.sexe || member.sexe || 'M',
                role: userData.role || member.role || 'employe',
                section: userData.section || member.section || 'a',
                points: userData.points !== undefined ? userData.points : (member.points !== undefined ? member.points : 0)
              });
              return;
            }
          } catch (error) {
            console.error("Erreur lors de la récupération des données complètes:", error);
          }
        }

        // Si l'appel API échoue, utiliser les données disponibles
        // Utiliser des opérateurs de coalescence pour gérer correctement les valeurs 0
        setMemberData({
          username: member.username || '',
          email: member.email || '',
          first_name: member.first_name || '',
          last_name: member.last_name || '',
          sexe: member.sexe || 'M',
          role: member.role || 'employe',
          section: member.section || 'a',
          points: member.points !== undefined ? member.points : 0
        });
      };

      fetchCompleteData();
    }
  }, [member]);

  // Handler pour gérer les changements de formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMemberData(prev => ({
      ...prev,
      [name]: name === 'points' ? parseInt(value) : value
    }));
  };

  // Handler pour soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('sessionToken');
      console.log('Token d\'authentification présent:', !!token);
      if (!token) {
        setError('Session expirée, veuillez vous reconnecter');
        setLoading(false);
        return;
      }

      // console.log("Envoi de requête pour le membre:", member);
      // Utiliser l'username original pour la requête API (et non le username modifié)
      // console.log("Username original utilisé pour la mise à jour:", originalUsername);

      await axios.put(
        `http://localhost:8000/api/staff/${originalUsername}/update/`,
        memberData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess('Informations de l\'employé mises à jour avec succès');

      // Attendre un petit délai puis fermer le modal et rafraîchir les données
      setTimeout(() => {
        onMemberUpdated();
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error('Erreur lors de la mise à jour :', err);
      // Log détaillé de l'erreur 
      console.log('Status de l\'erreur:', err.response?.status);
      console.log('URL qui a échoué:', err.config?.url);
      console.log('Données envoyées:', err.config?.data);
      console.log('Headers envoyés:', err.config?.headers);

      if (err.response && err.response.data) {
        const errorDetails = typeof err.response.data === 'object'
          ? JSON.stringify(err.response.data)
          : err.response.data.toString().substring(0, 200) + '...';
        console.log('Détails de la réponse:', errorDetails);

        const errorMessages = Object.keys(err.response.data)
          .map(key => {
            const value = err.response.data[key];
            return `${key}: ${Array.isArray(value) ? value.join(', ') : value}`;
          })
          .join('; ');

        setError(errorMessages || `Erreur lors de la mise à jour: ${err.message}`);
      } else {
        setError(`Une erreur s'est produite: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Modifier les informations de l'employé</h2>

        {success && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom d'utilisateur */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom d'utilisateur
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={memberData.username}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={memberData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>

          {/* Prénom et Nom */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prénom
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                value={memberData.first_name}
                onChange={handleChange}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                value={memberData.last_name}
                onChange={handleChange}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </div>
          </div>

          {/* Sexe */}
          <div>
            <label htmlFor="sexe" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sexe
            </label>
            <select
              id="sexe"
              name="sexe"
              value={memberData.sexe}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
              <option value="A">Autre</option>
              <option value="N">Préfère ne pas préciser</option>
            </select>
          </div>

          {/* Points */}
          <div>
            <label htmlFor="points" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Points
            </label>
            <input
              id="points"
              name="points"
              type="number"
              min="0"
              value={memberData.points}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            />
          </div>

          {/* Rôle et Section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rôle
              </label>
              <select
                id="role"
                name="role"
                value={memberData.role}
                onChange={handleChange}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              >
                <option value="employe">Employé</option>
                <option value="gestionnaire">Gestionnaire</option>
                {isAdmin && <option value="gerant">Gérant</option>}
                {isAdmin && <option value="admin">Admin</option>}
              </select>
            </div>

            <div>
              <label htmlFor="section" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Section
              </label>
              <select
                id="section"
                name="section"
                value={memberData.section}
                onChange={handleChange}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              >
                <option value="a">Section A</option>
                <option value="b">Section B</option>
                <option value="c">Section C</option>
                <option value="toutes">Toutes les sections</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamEditModal;