import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface ObjetLog {
  id: number;
  objet: number | null;
  type: string;
  nom: string;
  etat: string;
  date: string;
  commentaire?: string;
}

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<ObjetLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8000/api/logs/', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('sessionToken')}`, // si tu as un token JWT
      },
    })
      .then(res => {
        setLogs(res.data);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Chargement des logs...</p>;

  return (
    <div>
      <h2>Historique des Logs</h2>
      <ul>
        {logs.map(log => (
          <li key={log.id}>
            <strong>{log.nom}</strong> ({log.type}) – {log.etat} – {new Date(log.date).toLocaleString()}<br />
            <em>{log.commentaire}</em>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Logs;
