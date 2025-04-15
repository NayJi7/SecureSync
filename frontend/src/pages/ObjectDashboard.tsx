import { useState, useEffect } from 'react';

// Types selon ton modèle Django
type ObjectType = 'porte' | 'lumiere' | 'camera' | 'chauffage';
type ObjectState = 'on' | 'off';

interface SmartObject {
  id: number;
  nom: string;
  type: ObjectType;
  coord_x: number;
  coord_y: number;
  etat: ObjectState;
}

export default function ObjectDashboard() {
  const [objects, setObjects] = useState<SmartObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchObjects = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/objects/');
        const rawText = await response.text();
        console.log('Réponse API brute:', rawText);

        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

        try {
          const data = JSON.parse(rawText);
          setObjects(data);
        } catch (parseError) {
          console.error('Erreur de parsing JSON:', parseError);
          setError('Données invalides reçues depuis l’API');
        }
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des objets");
      } finally {
        setLoading(false);
      }
    };

    fetchObjects();
  }, []);

  const toggleObjectState = async (id: number) => {
    try {
      const objectToUpdate = objects.find(obj => obj.id === id);
      if (!objectToUpdate) return;

      const newState: ObjectState = objectToUpdate.etat === 'on' ? 'off' : 'on';

      setObjects(objects.map(obj =>
        obj.id === id ? { ...obj, etat: newState } : obj
      ));

      const response = await fetch(`http://localhost:8000/api/objects/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ etat: newState }),
      });

      if (!response.ok) throw new Error(`Erreur mise à jour: ${response.status}`);
    } catch (err) {
      console.error("Erreur changement d'état:", err);
      setError("Erreur lors du changement d'état");
    }
  };

  const deleteObject = async (id: number) => {
    const confirmDelete = window.confirm("Es-tu sûr de vouloir supprimer cet objet ?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:8000/api/objects/${id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error(`Erreur suppression: ${response.status}`);

      setObjects(objects.filter(obj => obj.id !== id));
    } catch (err) {
      console.error("Erreur suppression:", err);
      setError("Erreur lors de la suppression de l'objet");
    }
  };

  const getTypeLabel = (type: ObjectType): string => {
    const types = {
      porte: 'Porte Automatique',
      lumiere: 'Lumière',
      camera: 'Caméra',
      chauffage: 'Chauffage'
    };
    return types[type] || type;
  };

  if (loading) return <div className="text-center p-8">Chargement...</div>;
  if (error) return <div className="text-red-500 p-8">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord des objets connectés</h1>

      {objects.length === 0 ? (
        <p>Aucun objet trouvé</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {objects.map(obj => (
            <div key={obj.id} className="border rounded-lg p-4 shadow-md bg-white">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">{obj.nom}</h2>
                <span className="px-2 py-1 text-sm rounded-full bg-gray-200">
                  {getTypeLabel(obj.type)}
                </span>
              </div>

              <div className="mb-2 text-sm text-gray-600">
                Position : ({obj.coord_x}, {obj.coord_y})
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  obj.etat === 'on' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {obj.etat === 'on' ? 'Activé' : 'Désactivé'}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleObjectState(obj.id)}
                    className={`px-3 py-1 rounded text-white text-sm ${
                      obj.etat === 'on'
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    {obj.etat === 'on' ? 'Désactiver' : 'Activer'}
                  </button>

                  <button
                    onClick={() => deleteObject(obj.id)}
                    className="px-3 py-1 rounded text-white bg-gray-600 hover:bg-gray-700 text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
