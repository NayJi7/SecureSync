import React, { useEffect, useState } from 'react';
import { ObjectType, DoorObject, LightObject, CameraObject, HeaterObject } from './types';
import { getObjects, createObject, toggleObjectState } from '../../services/objectService';
import Door from './Door';
import Light from './Light';
import Camera from './Camera';
import Heater from './Heater';
import ObjectsChart, { AddObjectCallback } from './ObjectsChart';
import { LayoutGrid, Activity, RefreshCw, X, PlusCircle, AlertCircle, MapPin, ToggleLeft } from 'lucide-react';
import axios from 'axios';

// Function to test backend connectivity
const testBackendConnection = async () => {
    try {
        console.log('Testing backend connectivity...');
        // Try to access the Django API root endpoint
        const response = await axios.get('http://localhost:8000/api/', {
            timeout: 5000, // 5 second timeout
            // Don't throw on non-2xx status codes
            validateStatus: function (status) {
                return status >= 200 && status < 500; // Accept any status less than 500 as "connected"
            }
        });

        console.log('Backend connectivity test result:', response.status, response.statusText);

        // If we get any response, even a 401 Unauthorized, the server is up
        return true;
    } catch (error) {
        console.error('Backend connectivity test failed:', error);

        // Check specifically for network errors
        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
                console.error('Connection refused or timed out. Backend server may be down.');
                return false;
            }

            // If we got an error response, the server is actually up
            if (error.response) {
                console.log(`Backend responded with status ${error.response.status}`);
                return true;
            }
        }

        // No response at all - server might be down
        return false;
    }
};

const ConnectedObjects: React.FC = () => {
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
    const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
    const [selectedType, setSelectedType] = useState<string>('');

    const fetchObjects = async () => {
        try {
            setRefreshing(true);
            setError(null);

            // First check if backend is connected
            const isConnected = await testBackendConnection();
            setBackendConnected(isConnected);

            if (!isConnected) {
                setError('Impossible de se connecter au serveur backend. Vérifiez que le serveur est démarré.');
                setLoading(false);
                setRefreshing(false);
                return;
            }

            // Use the service function to get objects
            const response = await getObjects();
            setObjects(response.data);
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

            // Check for network errors
            if (!error.response && error.message && (
                error.message.includes('Network Error') ||
                error.code === 'ECONNREFUSED' ||
                error.code === 'ECONNABORTED' ||
                error.code === 'ETIMEDOUT'
            )) {
                setBackendConnected(false);
                setError('Problème de connexion au serveur. Vérifiez que le serveur backend est démarré.');
            } else {
                setError('Erreur lors du chargement des objets: ' +
                    (error.friendlyMessage || error.response?.data?.detail || 'Problème de connexion au serveur'));
            }

            setLoading(false);
            setRefreshing(false);
        }
    };

    // Test backend connectivity when component mounts
    useEffect(() => {
        const checkBackendConnection = async () => {
            const isConnected = await testBackendConnection();
            setBackendConnected(isConnected);
        };

        checkBackendConnection();
    }, []);

    // Fetch objects when component mounts
    useEffect(() => {
        fetchObjects();
    }, []);

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

        try {
            // Basic validation
            if (newObjectName.trim().length < 2) {
                setError('Le nom de l\'objet doit contenir au moins 2 caractères.');
                setIsSaving(false);
                return;
            }

            // Create object data
            const objectData = {
                nom: newObjectName.trim(),
                type: addingObjectType,
                etat: newObjectState,
                coord_x: Math.max(0, Math.round(Number(newObjectX))),
                coord_y: Math.max(0, Math.round(Number(newObjectY))),
                // Champs obligatoires qui manquaient
                consomation: 0,
                connection: 'wifi',
                valeur_actuelle: '',
                valeur_cible: ''
            };

            // Send the request
            await createObject(objectData);

            // Refresh objects
            await fetchObjects();

            // Close modal
            handleCloseModal();

        } catch (error: any) {
            console.error('Error creating object:', error);

            // Handle authentication errors
            if (error.response?.status === 401) {
                setError('Session expirée. Veuillez vous reconnecter.');
                localStorage.removeItem('authToken');
                localStorage.removeItem('sessionToken');
            } else {
                // Display general error
                setError('Erreur lors de la création de l\'objet: ' +
                    (error.friendlyMessage || error.response?.data?.detail || 'Problème de connexion au serveur'));
            }
        } finally {
            setIsSaving(false);
        }
    };

    // Helper function to extract error messages from Django validation errors
    const extractErrorMessage = (errorData: any): string => {
        if (!errorData) return 'Erreur inconnue';

        // Handle string errors
        if (typeof errorData === 'string') return errorData;

        // Handle array errors
        if (Array.isArray(errorData)) return errorData.join(', ');

        // Handle object errors with field names
        if (typeof errorData === 'object') {
            const messages = [];
            for (const [field, value] of Object.entries(errorData)) {
                const fieldValue = Array.isArray(value) ? value.join(', ') : value;
                messages.push(`${field}: ${fieldValue}`);
            }
            return messages.join('; ');
        }

        return 'Format d\'erreur inconnu';
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

    // Function to render the appropriate object type component
    const renderObject = (objectType: string) => {
        const filteredObjects = objects.filter((object) => object.type === objectType);

        switch (objectType) {
            case 'porte':
                return <Door
                    objects={filteredObjects}
                    onAddObject={() => handleAddObject('porte')}
                    onStatusChange={handleObjectStatusChange}
                />;
            case 'lumiere':
                return <Light
                    objects={filteredObjects}
                    onAddObject={() => handleAddObject('lumiere')}
                    onStatusChange={handleObjectStatusChange}
                />;
            case 'camera':
                return <Camera
                    objects={filteredObjects}
                    onAddObject={() => handleAddObject('camera')}
                    onStatusChange={handleObjectStatusChange}
                />;
            case 'chauffage':
                return <Heater
                    objects={filteredObjects}
                    onAddObject={() => handleAddObject('chauffage')}
                    onStatusChange={handleObjectStatusChange}
                />;
            default:
                return null;
        }
    };

    // Render components by object type with the correct props
    const renderObjectComponents = () => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Render objects that exist */}
                {grouped.porte.length > 0 && renderObject('porte')}
                {grouped.lumiere.length > 0 && renderObject('lumiere')}
                {grouped.camera.length > 0 && renderObject('camera')}
                {grouped.chauffage.length > 0 && renderObject('chauffage')}

                {/* Add empty components with add button if no objects exist */}
                {grouped.porte.length === 0 && renderObject('porte')}
                {grouped.lumiere.length === 0 && renderObject('lumiere')}
                {grouped.camera.length === 0 && renderObject('camera')}
                {grouped.chauffage.length === 0 && renderObject('chauffage')}
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

    // Function to handle object status changes
    const handleObjectStatusChange = () => {
        fetchObjects();
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

            {/* Backend Connection Status */}
            {backendConnected === false && (
                <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300 rounded-md flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="w-full">
                        <p className="font-medium">Erreur de connexion à l'API</p>
                        <p className="text-sm mb-2">Impossible de se connecter au serveur backend. Vérifiez que le serveur est démarré et accessible sur http://localhost:8000/api/</p>
                        <div className="flex justify-between items-center">
                            <button
                                onClick={async () => {
                                    const isConnected = await testBackendConnection();
                                    setBackendConnected(isConnected);
                                    if (isConnected) {
                                        // If we can connect, try to refresh the objects
                                        fetchObjects();
                                    }
                                }}
                                className="text-xs px-2 py-1 bg-red-200 hover:bg-red-300 dark:bg-red-800 dark:hover:bg-red-700 rounded transition-colors"
                            >
                                Tester à nouveau la connexion
                            </button>
                            <button
                                onClick={() => {
                                    // Open debug modal or console with connection details
                                    console.log('Debug info:');
                                    console.log('- API Base URL:', 'http://localhost:8000/api');
                                    console.log('- Auth Token:', localStorage.getItem('sessionToken') ? 'Present' : 'Missing');
                                    alert('Informations de débogage affichées dans la console (F12)');
                                }}
                                className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded transition-colors"
                            >
                                Informations de débogage
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                <div className="w-full">
                                    <p className="font-semibold mb-1">{error.includes('400') ? 'Erreur de validation' : 'Erreur'}</p>
                                    <p>{error}</p>

                                    {error.includes('400') && (
                                        <div className="mt-2 text-sm">
                                            <p className="font-medium">Suggestions :</p>
                                            <ul className="list-disc list-inside ml-2 mt-1">
                                                <li>Vérifiez que le nom ne contient pas de caractères spéciaux</li>
                                                <li>Assurez-vous que les coordonnées sont des nombres valides</li>
                                                <li>Le serveur est bien démarré sur http://localhost:8000</li>
                                                <li>Vous êtes connecté avec un compte valide</li>
                                            </ul>

                                            <button
                                                onClick={async () => {
                                                    const isConnected = await testBackendConnection();
                                                    if (isConnected) {
                                                        setError('Connexion au serveur établie, mais la validation des données a échoué. Vérifiez les données saisies.');
                                                    } else {
                                                        setError('Impossible de se connecter au serveur. Vérifiez que le serveur est démarré.');
                                                    }
                                                }}
                                                className="mt-2 text-xs px-2 py-1 bg-red-200 hover:bg-red-300 dark:bg-red-800 dark:hover:bg-red-700 rounded transition-colors"
                                            >
                                                Tester la connexion au serveur
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="objectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nom
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        id="objectName"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-transparent"
                                        placeholder={`Entrez le nom du ${addingObjectType && getObjectTypeLabel(addingObjectType).toLowerCase()}`}
                                        value={newObjectName}
                                        onChange={(e) => {
                                            // Only allow alphanumeric, spaces and basic punctuation
                                            const validName = e.target.value.replace(/[^a-zA-Z0-9\s\-_.()]/g, '');
                                            setNewObjectName(validName);
                                        }}
                                        maxLength={50} // Add reasonable max length
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors text-sm"
                                        onClick={() => {
                                            // Check if the name exists in current objects
                                            if (!newObjectName.trim()) {
                                                setError('Veuillez d\'abord saisir un nom');
                                                return;
                                            }

                                            const nameExists = objects.some(obj =>
                                                obj.nom.toLowerCase() === newObjectName.trim().toLowerCase()
                                            );

                                            if (nameExists) {
                                                setError('Un objet avec ce nom existe déjà. Veuillez utiliser un nom différent.');
                                            } else {
                                                setError(null);
                                                alert('Nom disponible ✓');
                                            }
                                        }}
                                    >
                                        Vérifier
                                    </button>
                                </div>
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
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value, 10);
                                            setNewObjectX(isNaN(value) ? 0 : value);
                                        }}
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
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value, 10);
                                            setNewObjectY(isNaN(value) ? 0 : value);
                                        }}
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
