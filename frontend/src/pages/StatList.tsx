import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Stat {
  id: number;
  nombre_objets: number;
  pourcentage_allumes: number;
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

const StatPage: React.FC = () => {
  const [stats, setStats] = useState<Stat[]>([]);

  useEffect(() => {
    axios.get<Stat[]>('http://localhost:8000/api/stats/')
      .then(response => setStats(response.data))
      .catch(error => {
        console.error('Erreur lors de la récupération des stats:', error);
      });
  }, []);

  return (
    <div>
      <h1>Données Statistiques</h1>
      {stats.length === 0 ? (
        <p>Aucune donnée disponible.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Objets</th>
              <th>% Allumés</th>
              <th>Type</th>
              <th>Conso Totale</th>
              <th>Caméras Allumées</th>
              <th>Lumières Allumées</th>
              <th>Ventilation</th>
              {/* Ajoute d'autres colonnes si besoin */}
            </tr>
          </thead>
          <tbody>
            {stats.map(stat => (
              <tr key={stat.id}>
                <td>{stat.id}</td>
                <td>{stat.nombre_objets}</td>
                <td>{stat.pourcentage_allumes}%</td>
                <td>{stat.type}</td>
                <td>{stat.consommation_total_actuelle}</td>
                <td>{stat.camera_allumees}</td>
                <td>{stat.lumiere_allumees}</td>
                <td>{stat.ventilation_allumees}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StatPage;
