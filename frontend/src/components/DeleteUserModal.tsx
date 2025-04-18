import React from 'react';
import axios from 'axios';

interface DeleteUserModalProps {
  isOpen: boolean;
  username: string;
  userId: string;
  onClose: () => void;
  onUserDeleted: () => void;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({ 
  isOpen, 
  username, 
  userId, 
  onClose, 
  onUserDeleted 
}) => {
  if (!isOpen) return null;

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('sessionToken');
      
      if (!token) {
        console.error('Token de session non disponible');
        return;
      }

      await axios.delete(`http://localhost:8000/api/account/delete/${username}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      onUserDeleted();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirmer la suppression</h2>
        <p className="text-gray-600 mb-6">
          Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{username}</strong> ? 
          Cette action est irréversible.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;