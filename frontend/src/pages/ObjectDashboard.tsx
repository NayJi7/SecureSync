import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

type ObjectType = "porte" | "lumiere" | "camera" | "thermostat" | "ventilation" | "panneau d'affichage";
type ObjectState = "on" | "off";
type ConnectionType = "wifi" | "filaire" | null;
type MaintenanceState = "en panne" | "fonctionnel";

interface SmartObject {
  id: number;
  nom: string;
  type: ObjectType;
  coord_x: number;
  coord_y: number;
  etat: ObjectState;
  connection: ConnectionType;
  consomation: number;
  valeur_actuelle: string | null;
  valeur_cible: string | null;
  durabilité: number;
  maintenance: MaintenanceState;
  Prison_id?: string;
}

interface UserPoints {
  status: string;
  new_total: number;
}

export default function ObjectDashboard() {
  const [objects, setObjects] = useState<SmartObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pointsTotal, setPointsTotal] = useState<number | null>(null);
  const [showPointsMessage, setShowPointsMessage] = useState(false);
  const [pointsMessage, setPointsMessage] = useState("");

  // Récupérer l'ID de prison depuis les paramètres d'URL
  const { prisonId } = useParams();
  const [selectedPrison, setSelectedPrison] = useState<string | null>(null);

  // Initialiser la prison sélectionnée lors du chargement
  useEffect(() => {
    // Si prisonId est défini dans l'URL, l'utiliser
    if (prisonId) {
      setSelectedPrison(prisonId);
      // Sauvegarder dans le localStorage pour les navigations futures
      localStorage.setItem('selectedPrison', prisonId);
    } else {
      // Sinon, utiliser la prison stockée dans le localStorage (si disponible)
      const storedPrison = localStorage.getItem('selectedPrison');
      if (storedPrison) {
        setSelectedPrison(storedPrison);
      }
    }
  }, [prisonId]);

  useEffect(() => {
    const fetchObjects = async () => {
      try {
        setLoading(true);

        // Construire l'URL de l'API en incluant l'identifiant de prison si disponible
        const apiUrl = selectedPrison
          ? `http://localhost:8000/api/objects/?prison_id=${selectedPrison}`
          : "http://localhost:8000/api/objects/";

        const response = await fetch(apiUrl);
        const rawText = await response.text();

        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

        try {
          const data = JSON.parse(rawText);
          setObjects(data);
        } catch (parseError) {
          console.error("Erreur de parsing JSON:", parseError);
          setError("Données invalides reçues depuis l'API");
        }
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des objets");
      } finally {
        setLoading(false);
      }
    };

    fetchObjects();
  }, [selectedPrison]); // Recharger les objets lorsque la prison change

  const addPoints = async (points: number) => {
    try {
      const accessToken = localStorage.getItem('sessionToken');
      if (!accessToken) return;

      const response = await fetch("http://localhost:8000/api/user/add_point/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ points }),
      });

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

      const data: UserPoints = await response.json();
      setPointsTotal(data.new_total);
      setPointsMessage(`+${points} points ! Total: ${data.new_total} points`);
      setShowPointsMessage(true);

      setTimeout(() => {
        setShowPointsMessage(false);
      }, 3000);
    } catch (err) {
      console.error("Erreur lors de l'ajout de points:", err);
    }
  };

  const toggleObjectState = async (id: number) => {
    try {
      const objectToUpdate = objects.find(obj => obj.id === id);
      if (!objectToUpdate) return;

      if (objectToUpdate.durabilité <= 0) {
        console.warn("Objet hors service, impossible de changer l'état.");
        return;
      }

      const newState: ObjectState = objectToUpdate.etat === "on" ? "off" : "on";
      let newDurability = objectToUpdate.durabilité;

      // Si on l'active, on réduit la durabilité de façon aléatoire
      if (newState === "on") {
        newDurability = Math.max(0, objectToUpdate.durabilité - Math.floor(Math.random() * 10 + 1));
      }

      // Si la durabilité atteint 0, on le passe en panne
      const newMaintenance: MaintenanceState = newDurability <= 0 ? "en panne" : objectToUpdate.maintenance;

      const response = await fetch(`http://localhost:8000/api/objects/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          etat: newState,
          durabilité: newDurability,
          maintenance: newMaintenance
        }),
      });

      if (!response.ok) throw new Error(`Erreur mise à jour: ${response.status}`);

      const updatedRes = await fetch(`http://localhost:8000/api/objects/${id}/`);
      const updatedObject: SmartObject = await updatedRes.json();

      setObjects(prev =>
        prev.map(obj => (obj.id === id ? updatedObject : obj))
      );

      await addPoints(1);
    } catch (err) {
      console.error("Erreur changement d'état:", err);
      setError("Erreur lors du changement d'état");
    }
  };

  const repairObject = async (id: number) => {
    try {
      const objectToRepair = objects.find(obj => obj.id === id);
      if (!objectToRepair) return;

      const response = await fetch(`http://localhost:8000/api/objects/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          durabilité: 100,
          maintenance: "fonctionnel"
        }),
      });

      if (!response.ok) throw new Error(`Erreur réparation: ${response.status}`);

      const updatedRes = await fetch(`http://localhost:8000/api/objects/${id}/`);
      const updatedObject: SmartObject = await updatedRes.json();

      setObjects(prev =>
        prev.map(obj => (obj.id === id ? updatedObject : obj))
      );

      // Ajouter des points pour la réparation
      await addPoints(5);
    } catch (err) {
      console.error("Erreur réparation:", err);
      setError("Erreur lors de la réparation de l'objet");
    }
  };

  const deleteObject = async (id: number) => {
    const confirmDelete = window.confirm("Es-tu sûr de vouloir supprimer cet objet ?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:8000/api/objects/${id}/`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error(`Erreur suppression: ${response.status}`);

      setObjects(objects.filter(obj => obj.id !== id));
    } catch (err) {
      console.error("Erreur suppression:", err);
      setError("Erreur lors de la suppression de l'objet");
    }
  };

  const getTypeLabel = (type: ObjectType): string => {
    const types: Record<ObjectType, string> = {
      "porte": "Porte Automatique",
      "lumiere": "Lumière",
      "camera": "Caméra",
      "thermostat": "Thermostat",
      "ventilation": "Ventilation",
      "panneau d'affichage": "Panneau d'affichage"
    };
    return types[type] || type;
  };

  const getTypeIcon = (type: ObjectType) => {
    switch (type) {
      case "porte":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 4V20M19 4V20H5V4H19Z" />
          </svg>
        );
      case "lumiere":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2V6M12 18V22M4 12H8M16 12H20M6.34 6.34L8.46 8.46M15.54 15.54L17.66 17.66M6.34 17.66L8.46 15.54M15.54 8.46L17.66 6.34M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" />
          </svg>
        );
      case "camera":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 10L19.5528 7.72361C19.8343 7.58281 20 7.30529 20 7V17C20 17.3047 19.8343 17.5822 19.5528 17.7236L15 15M5 18H15C15.5523 18 16 17.5523 16 17V7C16 6.44772 15.5523 6 15 6H5C4.44772 6 4 6.44772 4 7V17C4 17.5523 4.44772 18 5 18Z" />
          </svg>
        );
      case "thermostat":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z" />
            <path d="M12 2V4M4 12H2M6.34 6.34L4.93 4.93M17.66 6.34L19.07 4.93M22 12H20M12 22V16M6.56 16.67L7.45 15.54M17.44 16.67L16.55 15.54M15 20H9" />
          </svg>
        );
      case "ventilation":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 14L4 4M15 14L15 5.5M20 14L20 9M9 14L9 12M4 20L4 18M15 20L15 18M20 20L20 18M9 20L9 18M2 14L22 14" />
          </svg>
        );
      case "panneau d'affichage":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="5" width="16" height="16" rx="2" />
            <path d="M16 2V5" />
            <path d="M8 2V5" />
            <path d="M4 9H20" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-black to-gray-900">
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-green-300 text-lg font-medium">Chargement...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-black to-gray-900">
      <div className="bg-red-900/20 backdrop-blur-sm border border-red-900/40 text-red-300 p-8 rounded-xl shadow-xl max-w-lg">
        <div className="flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold">Erreur</h2>
        </div>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600/70 hover:bg-red-700 text-white rounded-md shadow-md transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        Tableau de bord des objets connectés
        {selectedPrison && <span className="text-lg font-normal ml-2 text-gray-500">(Prison ID: {selectedPrison})</span>}
      </h1>

      {showPointsMessage && (
        <div className="fixed top-4 right-4 bg-green-600/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-xl transition-opacity z-50 border border-green-500/50">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {pointsMessage}
          </div>
        </div>
      )}

      {objects.length === 0 ? (
        <p>Aucun objet trouvé pour cette prison</p>
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

              <div className="mb-2 text-sm text-gray-600 space-y-1">
                <p><strong>Position</strong> : ({obj.coord_x}, {obj.coord_y})</p>
                <p><strong>Connexion</strong> : {obj.connection ?? "—"}</p>
                <p><strong>Consommation</strong> : {obj.consomation} W</p>
                <p><strong>Valeur actuelle</strong> : {obj.valeur_actuelle ?? "—"}</p>
                <p><strong>Valeur cible</strong> : {obj.valeur_cible ?? "—"}</p>
                <p><strong>Durabilité</strong> : {obj.durabilité} %</p>
                <p><strong>Maintenance</strong> : <span className={obj.maintenance === "en panne" ? "text-red-600 font-semibold" : "text-green-600"}>{obj.maintenance}</span></p>
              </div>

              <div className="mb-4">
                <div className="mb-1 flex justify-between">
                  <span className="text-sm text-gray-300">Durabilité</span>
                  <span className={`text-sm font-medium ${obj.durabilité > 70 ? "text-green-400" :
                    obj.durabilité > 30 ? "text-yellow-400" :
                      "text-red-400"
                    }`}>{obj.durabilité}%</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${obj.durabilité > 70 ? "bg-green-600" :
                      obj.durabilité > 30 ? "bg-yellow-600" :
                        "bg-red-600"
                      }`}
                    style={{ width: `${obj.durabilité}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {obj.durabilité <= 0 || obj.maintenance === "en panne" ? (
                  <button
                    onClick={() => repairObject(obj.id)}
                    className="flex-1 bg-blue-600/70 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    Réparer
                  </button>
                ) : (
                  <button
                    onClick={() => toggleObjectState(obj.id)}
                    className={`flex-1 py-2 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center ${obj.etat === "on"
                      ? "bg-red-600/70 hover:bg-red-700 text-white"
                      : "bg-green-600/70 hover:bg-green-700 text-white"
                      }`}
                  >
                    {obj.etat === "on" ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Désactiver
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        Activer
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => deleteObject(obj.id)}
                  className="px-3 py-1 mt-1 rounded text-white bg-gray-500 hover:bg-gray-600 text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}