import React, { useState } from 'react';
import axios from 'axios';

const CreateObjetPage: React.FC = () => {
  const [formData, setFormData] = useState({
    nom: '',
    type: '',
    coord_x: '',
    coord_y: '',
    etat: '',
    connection: '',
    consomation: '',
    valeur_actuelle: '',
    valeur_cible: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('sessionToken');
      await axios.post('http://localhost:8000/api/objets/', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setMessage('Objet créé avec succès !');
      setFormData({
        nom: '',
        type: '',
        coord_x: '',
        coord_y: '',
        etat: '',
        connection: '',
        consomation: '',
        valeur_actuelle: '',
        valeur_cible: '',
      });
    } catch (error: any) {
      console.error('Erreur création objet:', error);
      if (error.response) {
        console.error('Détails de l\'erreur:', error.response.data);
      }
      setMessage('Erreur lors de la création de l\'objet.');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded">
      <h1 className="text-2xl font-bold mb-4">Créer un Objet Connecté</h1>
      <form onSubmit={handleSubmit} className="space-y-4">

        <input type="text" name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} required className="w-full p-2 border rounded" />

        <select name="type" value={formData.type} onChange={handleChange} required className="w-full p-2 border rounded">
          <option value="">Sélectionner un type</option>
          <option value="porte">Porte Automatique</option>
          <option value="lumiere">Lumière</option>
          <option value="camera">Caméra</option>
          <option value="chauffage">Chauffage</option>
          <option value="climatisation">Climatisation</option>
          <option value="paneau d'affichage">Panneau d'affichage</option>
        </select>

        <input type="number" step="0.01" name="coord_x" placeholder="Coordonnée X" value={formData.coord_x} onChange={handleChange} required className="w-full p-2 border rounded" />

        <input type="number" step="0.01" name="coord_y" placeholder="Coordonnée Y" value={formData.coord_y} onChange={handleChange} required className="w-full p-2 border rounded" />

        <select name="etat" value={formData.etat} onChange={handleChange} required className="w-full p-2 border rounded">
          <option value="">Sélectionner l'état</option>
          <option value="on">On</option>
          <option value="off">Off</option>
        </select>

        <select name="connection" value={formData.connection} onChange={handleChange} required className="w-full p-2 border rounded">
          <option value="">Sélectionner la connexion</option>
          <option value="wifi">WiFi</option>
          <option value="filaire">Filaire</option>
        </select>

        <input type="number" name="consomation" placeholder="Consommation (W)" value={formData.consomation} onChange={handleChange} required className="w-full p-2 border rounded" />

        <input type="text" name="valeur_actuelle" placeholder="Valeur actuelle" value={formData.valeur_actuelle} onChange={handleChange} className="w-full p-2 border rounded" />

        <input type="text" name="valeur_cible" placeholder="Valeur cible" value={formData.valeur_cible} onChange={handleChange} className="w-full p-2 border rounded" />

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Créer
        </button>
      </form>

      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
    </div>
  );
};

export default CreateObjetPage;
