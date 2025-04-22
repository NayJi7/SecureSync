import React, { useEffect, useState } from 'react';
import { ObjectType, DoorObject, LightObject, CameraObject, HeaterObject } from '../ConnectedObjects/types';
import { getObjects, createObject, toggleObjectState } from '../../services/objectService';
import Door from '../ConnectedObjects/Door';
import Light from '../ConnectedObjects/Light';
import Camera from '../ConnectedObjects/Camera';
import Heater from '../ConnectedObjects/Heater';
import ObjectsChart, { AddObjectCallback } from '../ConnectedObjects/ObjectsChart';
import { LayoutGrid, Activity, RefreshCw, X, PlusCircle, AlertCircle, MapPin, ToggleLeft } from 'lucide-react';
import axios from 'axios';

interface ConnectedObjectsProps {
    prisonId?: string;
}

const ConnectedObjects: React.FC<ConnectedObjectsProps> = ({ prisonId }) => {
    const [objects, setObjects] = useState<ObjectType[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [addingObjectType, setAddingObjectType] = useState<'porte' | 'lumiere' | 'camera' | 'chauffage' | null>(null);
    const [newObjectName, setNewObjectName] = useState('');
    const [newObjectX, setNewObjectX] = useState<number>(0);
    const [newObjectY, setNewObjectY] = useState<number>(0);
    const [newObjectState, setNewObjectState] = useState<'on' | 'off'>('off');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Get the prison ID from props or from localStorage if not provided
    const currentPrisonId = prisonId || localStorage.getItem('userPrison') || localStorage.getItem('selectedPrison');

    const fetchObjects = async () => {
        try {
            setRefreshing(true);
            setError(null);
            // Use the service function with prison ID parameter
            const response = await getObjects(currentPrisonId || undefined);
            
            // Filtrage supplémentaire côté client pour assurer que seuls les objets 
            // de la prison actuelle sont affichés
            const filteredObjects = currentPrisonId 
                ? response.data.filter(obj => obj.Prison_id === currentPrisonId)
                : response.data;
                
            console.log(`Filtered objects for prison ${currentPrisonId}: ${filteredObjects.length} of ${response.data.length}`);
            
            setObjects(filteredObjects);
            setLoading(false);
            setTimeout(() => setRefreshing(false), 500); // Visual feedback
        } catch (error: any) {
            console.error('Error fetching objects:', error);

            // Handle 401 Unauthorized errors (invalid token)
            if (error.response?.status === 401) {
                setError('Session expirée. Veuillez vous reconnecter.');
                // Clear any stale tokens
                localStorage.removeItem('authToken');
                localStorage.removeItem('sessionToken');
                // Optional: Redirect to login
                // window.location.href = '/login';
                return;
            }

            setError('Erreur lors du chargement des objets: ' +
                (error.friendlyMessage || error.response?.data?.detail || 'Problème de connexion au serveur'));
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Fetch objects when component mounts or when currentPrisonId changes
    useEffect(() => {
        fetchObjects();
    }, [currentPrisonId]);

    // Group objects by type using type assertions for type safety
    const grouped = {
        porte: objects.filter(obj => obj.type === 'porte') as DoorObject[],
        lumiere: objects.filter(obj => obj.type === 'lumiere') as LightObject[],
        camera: objects.filter(obj => obj.type === 'camera') as CameraObject[],
        chauffage: objects.filter(obj => obj.type === 'chauffage') as HeaterObject[],
    };

    const handleAddObject: AddObjectCallback = (type) => {
        setAddingObjectType(type);
        setNewObjectName('');
        setNewObjectX(0);
        setNewObjectY(0);
        setNewObjectState('off');
        setError(null);
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setAddingObjectType(null);
        setError(null);
    };

    const handleSaveObject = async () => {
        if (!addingObjectType || !newObjectName.trim()) return;

        setIsSaving(true);
        setError(null);

        // Debug logging
        console.log(`Creating ${addingObjectType} with state: ${newObjectState}`);
        console.log(`State label: ${newObjectState === 'on' ? (addingObjectType === 'porte' ? 'Fermée' : 'Activé') : (addingObjectType === 'porte' ? 'Ouverte' : 'Désactivé')}`);

        try {
            // Assurons-nous que l'ID de la prison actuelle est utilisé et non écrasé
            const prisonId = currentPrisonId || '';
            console.log('Création d\'un objet pour la prison:', prisonId);
            
            // Pour être sûr de débugger le problème
            if (localStorage.getItem('userPrison') !== prisonId || localStorage.getItem('selectedPrison') !== prisonId) {
                console.warn('Attention: l\'ID de prison actuel ne correspond pas au localStorage:', {
                    'currentPrisonId': prisonId,
                    'localStorage.userPrison': localStorage.getItem('userPrison'),
                    'localStorage.selectedPrison': localStorage.getItem('selectedPrison')
                });
                
                // Forcer la mise à jour du localStorage pour éviter des conflits futurs
                if (prisonId) {
                    localStorage.setItem('selectedPrison', prisonId);
                }
            }
            
            // Use the service function instead of direct API call
            await createObject({
                nom: newObjectName,
                type: addingObjectType,
                etat: newObjectState,
                coord_x: newObjectX,
                coord_y: newObjectY,
                Prison_id: prisonId, // Utiliser une variable explicite
                // Champs requis par le modèle backend
                consomation: 0, // Valeur par défaut (0 watts)
                valeur_actuelle: addingObjectType === 'chauffage' ? 20 : 0,
                valeur_cible: addingObjectType === 'chauffage' ? 22 : 0,
                durabilité: 100, // 100% par défaut
                connection: 'wifi', // Connexion par défaut
                maintenance: 'fonctionnel' // État de maintenance par défaut
            });

            // Refresh the objects list
            await fetchObjects();

            // Close the modal
            handleCloseModal();

        } catch (error: any) {
            console.error('Error creating object:', error);

            // Handle 401 Unauthorized errors (invalid token)
            if (error.response?.status === 401) {
                setError('Session expirée. Veuillez vous reconnecter.');
                // Clear any stale tokens
                localStorage.removeItem('authToken');
                localStorage.removeItem('sessionToken');
                // Optional: Redirect to login
                // window.location.href = '/login';
                return;
            }

            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 400) {
                    setError('Données invalides. Vérifiez le nom de l\'objet.');
                } else {
                    setError(`Erreur lors de la création: ${error.response.data.detail || error.response.statusText}`);
                }
            } else {
                setError('Erreur de connexion au serveur: ' + (error.friendlyMessage || error.message));
            }
        } finally {
            setIsSaving(false);
        }
    };

    // Handle object state change
    const handleToggleState = async (id: number, currentState: 'on' | 'off') => {
        try {
            const response = await toggleObjectState(id, currentState);
            console.log('Toggle successful:', response);
            // Refresh objects to show updated state
            await fetchObjects();
        } catch (error: any) {
            console.error('Error toggling object state:', error);

            // Handle 401 Unauthorized errors (invalid token)
            if (error.response?.status === 401) {
                alert('Session expirée. Veuillez vous reconnecter.');
                // Clear any stale tokens
                localStorage.removeItem('authToken');
                localStorage.removeItem('sessionToken');
                // Redirect to login
                window.location.href = '/login';
                return;
            }

            // Use the enhanced error from API service if available
            alert('Erreur lors du changement d\'état de l\'objet: ' +
                (error.friendlyMessage || error.response?.data?.detail || 'Problème de connexion au serveur'));
        }
    };

    const getObjectTypeLabel = (type: string): string => {
        switch (type) {
            case 'porte': return 'Porte';
            case 'lumiere': return 'Éclairage';
            case 'camera': return 'Caméra';
            case 'chauffage': return 'Chauffage';
            default: return 'Objet';
        }
    };

    // Render appropriate component based on object type
    const renderObject = (type: 'porte' | 'lumiere' | 'camera' | 'chauffage', objects: ObjectType[]) => {
        const addHandler = () => handleAddObject(type);
        // The filtered objects are already passed in - no need to filter again
        // Ensure the objects are the correct type to fix the linter errors

        switch (type) {
            case 'porte':
                return <Door objects={objects as DoorObject[]} onAddObject={addHandler} onStatusChange={fetchObjects} />;
            case 'lumiere':
                return <Light objects={objects as LightObject[]} onAddObject={addHandler} onStatusChange={fetchObjects} />;
            case 'camera':
                return <Camera objects={objects as CameraObject[]} onAddObject={addHandler} onStatusChange={fetchObjects} />;
            case 'chauffage':
                return <Heater objects={objects as HeaterObject[]} onAddObject={addHandler} onStatusChange={fetchObjects} />;
        }
    };

    // Render components by object type with the correct props
    const renderObjectComponents = () => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Render objects that exist */}
                {grouped.porte.length > 0 && renderObject('porte', grouped.porte)}
                {grouped.lumiere.length > 0 && renderObject('lumiere', grouped.lumiere)}
                {grouped.camera.length > 0 && renderObject('camera', grouped.camera)}
                {grouped.chauffage.length > 0 && renderObject('chauffage', grouped.chauffage)}

                {/* Add empty components with add button if no objects exist */}
                {grouped.porte.length === 0 && renderObject('porte', [])}
                {grouped.lumiere.length === 0 && renderObject('lumiere', [])}
                {grouped.camera.length === 0 && renderObject('camera', [])}
                {grouped.chauffage.length === 0 && renderObject('chauffage', [])}
            </div>
        );
    };

    // Additional section to show all objects with state toggle functionality
    const renderAllObjectsWithControls = () => {
        if (objects.length === 0) return null;

        return (
            <div className="mt-8 backdrop-blur-md bg-white/10 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Contrôle des objets</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">ID</th>
                                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">Nom</th>
                                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">Type</th>
                                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">Coordonnées</th>
                                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">État</th>
                                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {objects.map(object => (
                                <tr key={object.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{object.id}</td>
                                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{object.nom}</td>
                                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{getObjectTypeLabel(object.type)}</td>
                                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                                        <span className="flex items-center">
                                            <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                                            {object.coord_x}, {object.coord_y}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${object.etat === 'on'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {object.etat === 'on' ? 'Activé' : 'Désactivé'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleToggleState(object.id, object.etat)}
                                            className="flex items-center px-3 py-1 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/40 text-indigo-700 dark:text-indigo-300 rounded-md transition-colors text-sm"
                                        >
                                            <ToggleLeft className="h-3 w-3 mr-1" />
                                            Changer état
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <LayoutGrid className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Tableau de Bord</h2>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Activity className="h-4 w-4 mr-1 text-green-500" />
                        {loading ? 'Chargement...' : `${objects.length} objets connectés`}
                    </span>
                    <button
                        onClick={fetchObjects}
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                        disabled={refreshing}
                    >
                        <RefreshCw className={`h-4 w-4 text-gray-600 dark:text-gray-300 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="w-full h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
            ) : (
                <>
                    <div className="mb-8">
                        <ObjectsChart onAddObject={handleAddObject} />
                    </div>

                    {renderObjectComponents()}

                    {renderAllObjectsWithControls()}
                </>
            )}

            {/* Add Object Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 mx-4 relative">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Ajouter un{['a', 'e', 'i', 'o', 'u', 'y', 'é'].includes(getObjectTypeLabel(addingObjectType || '').toLowerCase()[0]) ? ' nouvel' : ' nouveau'} {addingObjectType && getObjectTypeLabel(addingObjectType).toLowerCase()}
                        </h3>

                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300 rounded-md flex items-start">
                                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="objectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nom
                                </label>
                                <input
                                    type="text"
                                    id="objectName"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-transparent"
                                    placeholder={`Entrez le nom du ${addingObjectType && getObjectTypeLabel(addingObjectType).toLowerCase()}`}
                                    value={newObjectName}
                                    onChange={(e) => setNewObjectName(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="objectX" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Coordonnée X
                                    </label>
                                    <input
                                        type="number"
                                        id="objectX"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-transparent"
                                        value={newObjectX}
                                        onChange={(e) => setNewObjectX(Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="objectY" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Coordonnée Y
                                    </label>
                                    <input
                                        type="number"
                                        id="objectY"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-transparent"
                                        value={newObjectY}
                                        onChange={(e) => setNewObjectY(Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    État initial
                                </label>
                                <div className="flex space-x-4">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio h-4 w-4 text-indigo-600 dark:text-indigo-400"
                                            name="objectState"
                                            value="off"
                                            checked={newObjectState === 'off'}
                                            onChange={() => setNewObjectState('off')}
                                        />
                                        <span className="ml-2 text-gray-700 dark:text-gray-300">
                                            Désactivé
                                        </span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio h-4 w-4 text-indigo-600 dark:text-indigo-400"
                                            name="objectState"
                                            value="on"
                                            checked={newObjectState === 'on'}
                                            onChange={() => setNewObjectState('on')}
                                        />
                                        <span className="ml-2 text-gray-700 dark:text-gray-300">
                                            Activé
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSaveObject}
                                    disabled={!newObjectName.trim() || isSaving}
                                    className={`px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center transition-colors ${!newObjectName.trim() || isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isSaving ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Enregistrement...
                                        </>
                                    ) : (
                                        <>
                                            <PlusCircle className="h-4 w-4 mr-2" />
                                            Ajouter
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConnectedObjects;
