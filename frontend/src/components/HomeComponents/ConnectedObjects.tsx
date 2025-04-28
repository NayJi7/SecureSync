import React, { useEffect, useState } from 'react';
import { ObjectType, DoorObject, LightObject, CameraObject, ThermostatObject, VentilationObject, PanneauAffichageObject } from '../ConnectedObjects/types';
import { getObjects, createObject, toggleObjectState } from '../../services/objectService';
import Door from '../ConnectedObjects/Door';
import Light from '../ConnectedObjects/Light';
import Camera from '../ConnectedObjects/Camera';
import Thermostat from '../ConnectedObjects/Thermostat';
import Ventilation from '../ConnectedObjects/Ventilation';
import PanneauAffichage from '../ConnectedObjects/PanneauAffichage';
import ObjectsChart, { AddObjectCallback } from '../ConnectedObjects/ObjectsChart';
import { LayoutGrid, Activity, RefreshCw, X, PlusCircle, AlertCircle, MapPin, ToggleLeft, AlertTriangle, Wrench } from 'lucide-react';
import axios from 'axios';
import VideoView from './VideoView';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useDevice } from '../../hooks/use-device';

interface ConnectedObjectsProps {
    prisonId?: string;
    addPoints?: (points: number) => Promise<void>;
}

const ConnectedObjects: React.FC<ConnectedObjectsProps> = ({ prisonId, addPoints }) => {
    const { isMobile } = useDevice();
    const [objects, setObjects] = useState<ObjectType[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [addingObjectType, setAddingObjectType] = useState<'porte' | 'lumiere' | 'camera' | 'thermostat' | 'ventilation' | "paneau d'affichage" | null>(null);
    const [newObjectName, setNewObjectName] = useState('');
    const [newObjectX, setNewObjectX] = useState<number>(0);
    const [newObjectY, setNewObjectY] = useState<number>(0);
    const [newObjectState, setNewObjectState] = useState<'on' | 'off'>('off');
    const [newConnection, setNewConnection] = useState<'wifi' | 'filaire'>('wifi');
    const [newConsumption, setNewConsumption] = useState<number>(0);
    const [newDurability, setNewDurability] = useState<number>(100);
    const [newTargetValue, setNewTargetValue] = useState<number>(22);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [show3D, setShow3D] = useState(false);
    const [repairModalObject, setRepairModalObject] = useState<ObjectType | null>(null);
    const [repairInProgress, setRepairInProgress] = useState<number | null>(null);
    const [repairProgress, setRepairProgress] = useState(0);
    const [repairCountdown, setRepairCountdown] = useState(5);

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

            // console.log(`Filtered objects for prison ${currentPrisonId}: ${filteredObjects.length} of ${response.data.length}`);

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
        thermostat: objects.filter(obj => obj.type === 'thermostat') as ThermostatObject[],
        ventilation: objects.filter(obj => obj.type === 'ventilation') as VentilationObject[],
        paneauAffichage: objects.filter(obj => obj.type === "paneau d'affichage") as PanneauAffichageObject[],
    };

    const handleAddObject: AddObjectCallback = (type) => {
        // Convert "panneau d'affichage" (from UI/component definition) to "paneau d'affichage" (backend/database definition)
        const fixedType = type === "panneau d'affichage" ? "paneau d'affichage" : type;
        setAddingObjectType(fixedType);
        setNewObjectName('');
        setNewObjectX(0);
        setNewObjectY(0);
        setNewObjectState('off');
        setNewConnection('wifi');
        setNewConsumption(0);
        setNewDurability(100);
        setNewTargetValue(22);
        setError(null);
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setAddingObjectType(null);
        setError(null);
        // Reset form fields
        setNewObjectName('');
        setNewObjectX(0);
        setNewObjectY(0);
        setNewObjectState('off');
        setNewConnection('wifi');
        setNewConsumption(0);
        setNewDurability(100);
        setNewTargetValue(22);
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

            // Determine initial value based on object type
            let initialValue: number | string = 0;
            if (addingObjectType === 'thermostat') {
                initialValue = 20;
            } else if (addingObjectType === 'ventilation') {
                initialValue = 1;
            } else if (addingObjectType === "paneau d'affichage") {
                initialValue = "Bienvenue"; // Default message for display panel
            }

            // Ensure durability is within 0-100 range
            const cappedDurability = Math.max(0, Math.min(100, newDurability));

            // Use the service function instead of direct API call
            await createObject({
                nom: newObjectName,
                type: addingObjectType as any, // Cast to any to bypass type checking
                etat: newObjectState,
                coord_x: newObjectX,
                coord_y: newObjectY,
                Prison_id: prisonId, // Utiliser une variable explicite
                // Champs requis par le modèle backend
                consomation: newConsumption, // Consumption in kWh
                valeur_actuelle: initialValue,
                valeur_cible: addingObjectType === 'thermostat' ? newTargetValue : 0, // Use target value for thermostat
                durabilité: cappedDurability, // Use the capped durability value
                connection: newConnection, // Use the connection type from the form
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

            // Ajouter des points à l'utilisateur pour chaque interaction
            if (addPoints) {
                // Trouver l'objet dans la liste pour déterminer son type
                const object = objects.find(obj => obj.id === id);
                if (object) {
                    // Attribution de points selon le type d'objet
                    let pointsToAdd = 0;
                    switch (object.type) {
                        case 'porte':
                            pointsToAdd = 5; // Même valeur que dans Door.tsx
                            break;
                        case 'lumiere':
                            pointsToAdd = 3; // Même valeur que dans Light.tsx
                            break;
                        case 'camera':
                            pointsToAdd = 7; // Même valeur que dans Camera.tsx
                            break;
                        case 'thermostat':
                            pointsToAdd = 4; // Même valeur que dans Thermostat.tsx
                            break;
                        case 'ventilation':
                            pointsToAdd = 4; // Même valeur que dans Ventilation.tsx
                            break;
                        case "paneau d'affichage":
                            pointsToAdd = 3; // Points pour panneau d'affichage
                            break;
                        default:
                            pointsToAdd = 2; // Valeur par défaut pour les types non reconnus
                    }
                    await addPoints(pointsToAdd);
                }
            }

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
            case 'thermostat': return 'Chauffage';
            case 'ventilation': return 'Ventilation';
            case "paneau d'affichage": return 'Panneau d\'affichage';
            default: return 'Objet';
        }
    };

    // Render appropriate component based on object type
    const renderObject = (type: 'porte' | 'lumiere' | 'camera' | 'thermostat' | 'ventilation' | "paneau d'affichage", objects: ObjectType[]) => {
        const addHandler = () => {
            // When passing to handleAddObject, convert "paneau d'affichage" to "panneau d'affichage" for ObjectsChart
            if (type === "paneau d'affichage") {
                handleAddObject("panneau d'affichage" as any);
            } else {
                handleAddObject(type as any);
            }
        };
        
        // The filtered objects are already passed in - no need to filter again
        // Ensure the objects are the correct type to fix the linter errors

        switch (type) {
            case 'porte':
                return <Door objects={objects as DoorObject[]} onAddObject={addHandler} onStatusChange={fetchObjects} addPoints={addPoints} />;
            case 'lumiere':
                return <Light objects={objects as LightObject[]} onAddObject={addHandler} onStatusChange={fetchObjects} addPoints={addPoints} />;
            case 'camera':
                return <Camera objects={objects as CameraObject[]} onAddObject={addHandler} onStatusChange={fetchObjects} addPoints={addPoints} />;
            case 'thermostat':
                return <Thermostat objects={objects as ThermostatObject[]} onAddObject={addHandler} onStatusChange={fetchObjects} addPoints={addPoints} />;
            case 'ventilation':
                return <Ventilation objects={objects as VentilationObject[]} onAddObject={addHandler} onStatusChange={fetchObjects} addPoints={addPoints} />;
            case "paneau d'affichage":
                return <PanneauAffichage objects={objects as PanneauAffichageObject[]} onAddObject={addHandler} onStatusChange={fetchObjects} addPoints={addPoints} />;
        }
    };

    // Render components by object type with the correct props
    const renderObjectComponents = () => {
        return (
            <div className="grid grid-cols-1 gap-6">
                {/* First row: display cameras and doors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {grouped.camera.length > 0 && renderObject('camera', grouped.camera)}
                    {grouped.camera.length === 0 && renderObject('camera', [])}
                    
                    {grouped.porte.length > 0 && renderObject('porte', grouped.porte)}
                    {grouped.porte.length === 0 && renderObject('porte', [])}
                </div>

                {/* Second row: display lights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {grouped.lumiere.length > 0 && renderObject('lumiere', grouped.lumiere)}
                    {grouped.lumiere.length === 0 && renderObject('lumiere', [])}
            
                    {grouped.paneauAffichage.length > 0 && renderObject("paneau d'affichage", grouped.paneauAffichage)}
                    {grouped.paneauAffichage.length === 0 && renderObject("paneau d'affichage", [])}
                </div>

                {/* Third row: display thermostats and ventilation side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left column: thermostats */}
                    <div>
                        {grouped.thermostat.length > 0 && renderObject('thermostat', grouped.thermostat)}
                        {grouped.thermostat.length === 0 && renderObject('thermostat', [])}
                    </div>
                    
                    {/* Right column: ventilation */}
                    <div>
                        {grouped.ventilation.length > 0 && renderObject('ventilation', grouped.ventilation)}
                        {grouped.ventilation.length === 0 && renderObject('ventilation', [])}
                    </div>
                </div>

                {/* Fourth row: display panels */}
               
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
                                            onClick={() => {
                                                if (object.maintenance && object.maintenance !== 'fonctionnel') {
                                                    setRepairModalObject(object);
                                                } else {
                                                    handleToggleState(object.id, object.etat);
                                                }
                                            }}
                                            className="flex items-center px-3 py-1 rounded-md transition-colors text-sm
                                                bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300
                                                hover:bg-indigo-200 dark:hover:bg-indigo-800/40"
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

    // Fonction de réparation (similaire à Light.tsx)
    const handleRepair = async (objectId: number) => {
        setRepairInProgress(objectId);
        setRepairProgress(0);
        setRepairCountdown(5);
        let progress = 0;
        let countdown = 5;
        const interval = setInterval(() => {
            progress += 20;
            countdown -= 1;
            setRepairProgress(progress);
            setRepairCountdown(countdown);
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(async () => {
                    // Appel effectif de l'API de réparation
                    try {
                        // Import dynamique pour éviter les cycles
                        const { repairObject } = await import('../../services/objectService');
                        await repairObject(objectId);
                    } catch (e) {
                        console.error('Erreur lors de la réparation de l\'objet :', e);
                    }
                    setRepairInProgress(null);
                    setRepairProgress(0);
                    setRepairCountdown(5);
                    await fetchObjects();
                }, 500);
            }
        }, 1000);
    };

    return (
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <LayoutGrid className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                        Tableau de Bord
                        {(() => {
                            // Correspondance ID -> nom lisible
                            const prisonNames: Record<string, string> = {
                                paris: 'Paris',
                                cergy: 'Cergy',
                                lyon: 'Lyon',
                                marseille: 'Marseille',
                            };
                            const id = (prisonId || currentPrisonId || '').toLowerCase();
                            if (id && prisonNames[id]) {
                                return isMobile ? ` - ${prisonNames[id]}` : ` - Prison de ${prisonNames[id]}`;
                            }
                            return '';
                        })()}
                        <button
                            title="Visualiser la prison en 3D"
                            className={`${isMobile ? 'mr-4' : 'ml-3'} inline-flex items-center px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400`}
                            onClick={() => setShow3D(true)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12s4-7.5 10.5-7.5S22.5 12 22.5 12s-4 7.5-10.5 7.5S1.5 12 1.5 12z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </button>
                    </h2>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Activity className="h-4 w-4 mr-1 text-green-500" />
                        {loading ? 'Chargement...' : `${objects.length} objets connectés`}
                    </span>
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
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 mx-4 relative overflow-y-auto max-h-[90vh]">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            {(() => {
                                if (!addingObjectType) return 'Ajouter un objet';
                                const objectLabel = getObjectTypeLabel(addingObjectType).toLowerCase();
                                // Gérer les mots féminins (porte, caméra)
                                if (addingObjectType === 'porte' || addingObjectType === 'camera') {
                                    return `Ajouter une nouvelle ${objectLabel}`;
                                }
                                // Gérer les mots masculins commençant par une voyelle
                                else if (['a', 'e', 'i', 'o', 'u', 'y', 'é'].includes(objectLabel[0])) {
                                    return `Ajouter un nouvel ${objectLabel}`;
                                }
                                // Mots masculins commençant par une consonne
                                else {
                                    return `Ajouter un nouveau ${objectLabel}`;
                                }
                            })()}
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
                                    placeholder={`Entrez le nom ${addingObjectType === 'porte' || addingObjectType === 'camera' ?
                                        'de la ' :
                                        ['a', 'e', 'i', 'o', 'u', 'y', 'é'].includes((addingObjectType && getObjectTypeLabel(addingObjectType).toLowerCase()[0]) || '') ?
                                            "de l'" :
                                            'du '
                                        }${addingObjectType && getObjectTypeLabel(addingObjectType).toLowerCase()}`}
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
                                    Type de connexion
                                </label>
                                <div className="flex space-x-4">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio h-4 w-4 text-indigo-600 dark:text-indigo-400"
                                            name="connectionType"
                                            value="wifi"
                                            checked={newConnection === 'wifi'}
                                            onChange={() => setNewConnection('wifi')}
                                        />
                                        <span className="ml-2 text-gray-700 dark:text-gray-300">
                                            Wifi
                                        </span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio h-4 w-4 text-indigo-600 dark:text-indigo-400"
                                            name="connectionType"
                                            value="filaire"
                                            checked={newConnection === 'filaire'}
                                            onChange={() => setNewConnection('filaire')}
                                        />
                                        <span className="ml-2 text-gray-700 dark:text-gray-300">
                                            Filaire
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="consumption" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Consommation (kWh)
                                    </label>
                                    <input
                                        type="number"
                                        id="consumption"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-transparent"
                                        value={newConsumption}
                                        onChange={(e) => setNewConsumption(Number(e.target.value))}
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="durability" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Durabilité
                                    </label>
                                    <input
                                        type="number"
                                        id="durability"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-transparent"
                                        value={newDurability}
                                        onChange={(e) => {
                                            const value = Number(e.target.value);
                                            // Ensure durability is within 0-100 range
                                            const capped = Math.max(0, Math.min(100, value));
                                            setNewDurability(capped);
                                        }}
                                        min="0"
                                        max="100"
                                    />
                                </div>
                            </div>

                            {addingObjectType === 'thermostat' && (
                                <div>
                                    <label htmlFor="targetValue" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Valeur cible (°C)
                                    </label>
                                    <input
                                        type="number"
                                        id="targetValue"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-transparent"
                                        value={newTargetValue}
                                        onChange={(e) => setNewTargetValue(Number(e.target.value))}
                                        min="15"
                                        max="30"
                                        step="0.5"
                                    />
                                </div>
                            )}

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

            {/* 3D View Modal */}
            {show3D && (
                <VideoView 
                    onClose={() => setShow3D(false)}
                    videoUrl="https://www.youtube.com/embed/g1uriA73Bp4?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&mute=1&disablekb=1&fs=0&iv_load_policy=3&playsinline=1"
                />
            )}

            {/* Repair Modal */}
            {repairModalObject && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black/30" onClick={() => setRepairModalObject(null)}></div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 max-w-md w-full mx-4 relative z-10 border-l-4 border-amber-500">
                        <div className="flex items-start mb-3">
                            <div className="mr-3 mt-0.5">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                                    Appareil en panne
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    Cet appareil est en panne. Vous devez le réparer avant de pouvoir l'utiliser à nouveau.
                                </p>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setRepairModalObject(null)}
                                        className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 rounded"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleRepair(repairModalObject.id);
                                            setRepairModalObject(null);
                                        }}
                                        className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded flex items-center"
                                    >
                                        <Wrench className="h-4 w-4 mr-1.5" /> Réparer maintenant
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Replace the repair in progress modal with new UI */}
            {repairInProgress !== null && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black/15" onClick={() => {}}></div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-xs w-full mx-4 relative z-10">
                        <div className="flex flex-col items-center">
                            <div className="mb-4 w-40 h-40 filter grayscale brightness-[0.6] contrast-[1.2]">
                                <DotLottieReact
                                    src="https://lottie.host/bab12c80-4bd7-4261-b763-0f7ec72a2834/LE6JcmwrGJ.lottie"
                                    loop
                                    autoplay
                                />
                            </div>
                            
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                                <div
                                    className="h-2 rounded-full bg-green-500 transition-all duration-1000 ease-linear"
                                    style={{ width: `${repairProgress}%` }}
                                ></div>
                            </div>
                            
                            <div className="flex justify-center items-center mt-1">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{repairCountdown}s</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
                </div>
            )}

export default ConnectedObjects;
