// StatForm.tsx
import React, { useState } from 'react';
import axios from 'axios';

interface StatFormData {
  nombre_objets: number;
  pourcentage_allumes: number;
  nbr_on: number;
  nbr_off: number;
  type: number;
  consommation_total_actuelle: number;
  consommation_moyenne: number;
  cout_horaire: number;
  porte_allumees: number;
  porte_consommation: number;
  camera_allumees: number;
  camera_consommation: number;
  lumiere_allumees: number;
  lumiere_consommation: number;
  panneau_allumes: number;
  panneau_consommation: number;
  thermostat_allumes: number;
  thermostat_consommation: number;
  ventilation_allumees: number;
  ventilation_consommation: number;
}

const StatForm: React.FC = () => {
  const initialFormData: StatFormData = {
    nombre_objets: 0,
    pourcentage_allumes: 0.0,
    nbr_on: 0,
    nbr_off: 0,
    type: 6,
    consommation_total_actuelle: 0.0,
    consommation_moyenne: 0.0,
    cout_horaire: 0.0,
    porte_allumees: 0,
    porte_consommation: 0.0,
    camera_allumees: 0,
    camera_consommation: 0.0,
    lumiere_allumees: 0,
    lumiere_consommation: 0.0,
    panneau_allumes: 0,
    panneau_consommation: 0.0,
    thermostat_allumes: 0,
    thermostat_consommation: 0.0,
    ventilation_allumees: 0,
    ventilation_consommation: 0.0
  };

  const [formData, setFormData] = useState<StatFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>('');
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | ''>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: name.includes('consommation') || name.includes('pourcentage') || name === 'cout_horaire' || name === 'consommation_moyenne' 
        ? parseFloat(value) 
        : parseInt(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitStatus('');

    try {
      // Remplacez l'URL par votre endpoint API Django
      const response = await axios.post('http://localhost:8000/api/stats/', formData);
      
      setSubmitMessage('Les statistiques ont été ajoutées avec succès !');
      setSubmitStatus('success');
      setFormData(initialFormData); // Réinitialiser le formulaire après une soumission réussie
    } catch (error) {
      console.error('Erreur lors de l\'envoi des données:', error);
      setSubmitMessage('Erreur lors de l\'ajout des statistiques. Veuillez réessayer.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour calculer automatiquement certaines valeurs
  const calculateDerivedValues = () => {
    // Exemple: mettre à jour nbr_on et nbr_off basé sur nombre_objets et pourcentage_allumes
    const nbr_on = Math.round(formData.nombre_objets * (formData.pourcentage_allumes / 100));
    const nbr_off = formData.nombre_objets - nbr_on;
    
    setFormData(prevState => ({
      ...prevState,
      nbr_on,
      nbr_off
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Ajouter des statistiques</h1>
      
      {submitMessage && (
        <div className={`p-4 mb-4 rounded ${submitStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {submitMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg shadow mb-6">
          <h2 className="font-semibold text-lg mb-4">Informations générales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre d'objets
                <input
                  type="number"
                  name="nombre_objets"
                  value={formData.nombre_objets}
                  onChange={handleChange}
                  onBlur={calculateDerivedValues}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pourcentage allumés
                <input
                  type="number"
                  name="pourcentage_allumes"
                  value={formData.pourcentage_allumes}
                  onChange={handleChange}
                  onBlur={calculateDerivedValues}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Objets allumés
                <input
                  type="number"
                  name="nbr_on"
                  value={formData.nbr_on}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Objets éteints
                <input
                  type="number"
                  name="nbr_off"
                  value={formData.nbr_off}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type de statistique
                <input
                  type="number"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg shadow mb-6">
          <h2 className="font-semibold text-lg mb-4">Données de consommation générale</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Consommation totale actuelle
                <input
                  type="number"
                  name="consommation_total_actuelle"
                  value={formData.consommation_total_actuelle}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Consommation moyenne
                <input
                  type="number"
                  name="consommation_moyenne"
                  value={formData.consommation_moyenne}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Coût horaire
                <input
                  type="number"
                  name="cout_horaire"
                  value={formData.cout_horaire}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg shadow mb-6">
          <h2 className="font-semibold text-lg mb-4">Détails par équipement</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <h3 className="text-md font-medium col-span-full">Portes</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Portes allumées
                <input
                  type="number"
                  name="porte_allumees"
                  value={formData.porte_allumees}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Consommation des portes
                <input
                  type="number"
                  name="porte_consommation"
                  value={formData.porte_consommation}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <h3 className="text-md font-medium col-span-full">Caméras</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Caméras allumées
                <input
                  type="number"
                  name="camera_allumees"
                  value={formData.camera_allumees}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Consommation des caméras
                <input
                  type="number"
                  name="camera_consommation"
                  value={formData.camera_consommation}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <h3 className="text-md font-medium col-span-full">Lumières</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Lumières allumées
                <input
                  type="number"
                  name="lumiere_allumees"
                  value={formData.lumiere_allumees}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Consommation des lumières
                <input
                  type="number"
                  name="lumiere_consommation"
                  value={formData.lumiere_consommation}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <h3 className="text-md font-medium col-span-full">Panneaux</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Panneaux allumés
                <input
                  type="number"
                  name="panneau_allumes"
                  value={formData.panneau_allumes}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Consommation des panneaux
                <input
                  type="number"
                  name="panneau_consommation"
                  value={formData.panneau_consommation}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <h3 className="text-md font-medium col-span-full">Thermostats</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Thermostats allumés
                <input
                  type="number"
                  name="thermostat_allumes"
                  value={formData.thermostat_allumes}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Consommation des thermostats
                <input
                  type="number"
                  name="thermostat_consommation"
                  value={formData.thermostat_consommation}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h3 className="text-md font-medium col-span-full">Ventilations</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ventilations allumées
                <input
                  type="number"
                  name="ventilation_allumees"
                  value={formData.ventilation_allumees}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Consommation des ventilations
                <input
                  type="number"
                  name="ventilation_consommation"
                  value={formData.ventilation_consommation}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Envoi en cours...' : 'Ajouter les statistiques'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StatForm;