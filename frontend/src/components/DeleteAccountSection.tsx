import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DeleteAccountSection: React.FC = () => {
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleDeleteRequest = async () => {
    if (!password) {
      setError('Veuillez entrer votre mot de passe pour confirmer.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('sessionToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      // D'abord vérifier le mot de passe (vous devrez implémenter cette API)
      await axios.post('http://localhost:8000/api/verify-password/', 
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Puis supprimer le compte
      await axios.delete('http://localhost:8000/api/account/delete/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Supprimer le token de session
      localStorage.removeItem('sessionToken');
      
      // Rediriger vers une page de confirmation
      navigate('/account-deleted');
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setError('Mot de passe incorrect. Veuillez réessayer.');
      } else {
        setError('Une erreur est survenue lors de la suppression du compte.');
        console.error('Erreur de suppression:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Supprimer mon compte</h2>
      
      <p className="text-gray-700 mb-4">
        Cette action est irréversible. Toutes vos données personnelles seront définitivement supprimées.
      </p>
      
      {!confirmDelete ? (
        <button
          onClick={() => setConfirmDelete(true)}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Je souhaite supprimer mon compte
        </button>
      ) : (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <p className="font-medium text-gray-800 mb-3">
            Veuillez confirmer la suppression en entrant votre mot de passe:
          </p>
          
          <div className="mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleDeleteRequest}
              disabled={loading}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:bg-red-300"
            >
              {loading ? 'Suppression...' : 'Confirmer la suppression'}
            </button>
            
            <button
              onClick={() => {
                setConfirmDelete(false);
                setPassword('');
                setError(null);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteAccountSection;