// src/components/UserDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser, deleteUser, User } from '../../services/userService';

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await getUser(parseInt(id));
        setUser(response.data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des détails:', err);
        setError('Impossible de charger les détails de l\'utilisateur');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    
    try {
      await deleteUser(parseInt(id));
      navigate('/users');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError('Impossible de supprimer l\'utilisateur');
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!user) return <div>Utilisateur non trouvé</div>;

  return (
    <div>
      <h2>Détails de l'utilisateur</h2>
      <div>
        <p><strong>Nom d'utilisateur:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Prénom:</strong> {user.first_name || 'Non spécifié'}</p>
        <p><strong>Nom:</strong> {user.last_name || 'Non spécifié'}</p>
      </div>
      <div className="actions">
        <button onClick={() => navigate(`/users/edit/${id}`)}>Modifier</button>
        <button onClick={handleDelete}>Supprimer</button>
        <button onClick={() => navigate('/users')}>Retour à la liste</button>
      </div>
    </div>
  );
};

export default UserDetail;