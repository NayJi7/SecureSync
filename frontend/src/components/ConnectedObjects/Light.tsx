import React, { useState, useEffect, useRef } from 'react';
import { ObjectType } from './types';
import { LightbulbIcon, Plus, ToggleLeft, MoreVertical, Pencil, Trash2, X, Info, Save, Wrench, AlertTriangle } from 'lucide-react';
import { toggleObjectState as toggleObjectStateService, updateObject, deleteObject, repairObject } from '../../services/objectService';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// Extended interface for Light objects with brightness property
interface LightObjectExtended extends ObjectType {
    brightness?: number;
}

interface LightProps {
    objects: LightObjectExtended[];
    onAddObject?: () => void;
    onStatusChange?: () => void;
    addPoints?: (points: number) => Promise<void>;
    toggleObjectState?: (id: number, currentState: 'on' | 'off') => Promise<void>;
}

const Light: React.FC<LightProps> = ({ objects, onAddObject, onStatusChange, addPoints, toggleObjectState }) => {
    const isEmpty = objects.length === 0;
    const [isHovering, setIsHovering] = useState(false);
    const [toggleLoading, setToggleLoading] = useState<number | null>(null);
    const [activeMenu, setActiveMenu] = useState<number | null>(null);
    const [objectToEdit, setObjectToEdit] = useState<LightObjectExtended | null>(null);
    const [showInfoId, setShowInfoId] = useState<number | null>(null);

    // Form state for editing
    const [newName, setNewName] = useState<string>('');
    const [newX, setNewX] = useState<number>(0);
    const [newY, setNewY] = useState<number>(0);
    const [newBrightness, setNewBrightness] = useState<number>(100);
    const [newConsumption, setNewConsumption] = useState<number>(0);
    const [newConnection, setNewConnection] = useState<'wifi' | 'filaire'>('wifi');

    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [isUpdating, setIsUpdating] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [objectToDelete, setObjectToDelete] = useState<number | null>(null);
    const [isRepairing, setIsRepairing] = useState<number | null>(null);
    const [repairDialogId, setRepairDialogId] = useState<number | null>(null);

    // Add repair progress tracking
    const [repairProgress, setRepairProgress] = useState<number>(0);
    const [repairCountdown, setRepairCountdown] = useState<number>(6);
    const [repairInProgress, setRepairInProgress] = useState<number | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Add event listener for clicks outside the dropdown
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAddClick = () => {
        if (onAddObject) {
            onAddObject();
        } else {
            alert('Fonctionnalité à venir: Ajouter une lumière');
        }
    };

    const handleToggleState = async (id: number, currentState: 'on' | 'off') => {
        try {
            // Find the light object
            const light = objects.find(l => l.id === id);
            
            // Check if the device is broken or has zero durability
            if (currentState === 'off' && light && 
                ((light.durabilité !== undefined && light.durabilité <= 0) || 
                 light.maintenance === 'en panne')) {
                // Show repair dialog instead of alert
                setRepairDialogId(id);
                return;
            }
            
            setToggleLoading(id);
            let response;
            if (toggleObjectState) {
                await toggleObjectState(id, currentState);
            } else {
                response = await toggleObjectStateService(id, currentState);
                console.log('Toggle successful:', response);
            }

            if (addPoints) {
                // Attribution de 1 point pour l'interaction avec une lumière
                await addPoints(1);
            }

            // Always call onStatusChange to refresh the state
            onStatusChange?.();
        } catch (error: any) {
            console.error('Error toggling light state:', error);

            // Special handling for authentication errors
            if (error.response?.status === 401) {
                alert('Session expirée. Veuillez vous reconnecter.');
                // Clear any stale tokens that may be causing the JWT error
                localStorage.removeItem('authToken');
                localStorage.removeItem('sessionToken');
                window.location.href = '/login'; // Redirect to login page
                return;
            }

            alert('Erreur lors du changement d\'état de la lumière: ' +
                (error.friendlyMessage || error.response?.data?.detail || 'Problème de connexion au serveur'));
        } finally {
            setToggleLoading(null);
        }
    };

    const handleMenuToggle = (id: number) => {
        if (activeMenu === id) {
            setActiveMenu(null);
        } else {
            setActiveMenu(id);
            // Close any open edit forms
            setObjectToEdit(null);
            // Close any open info panels
            setShowInfoId(null);
        }
    };

    const handleInfoToggle = (id: number) => {
        if (showInfoId === id) {
            setShowInfoId(null);
        } else {
            setShowInfoId(id);
            // Close any open menus
            setActiveMenu(null);
        }
    };

    const handleEditClick = (object: LightObjectExtended) => {
        setObjectToEdit(object);
        // Initialize form with current values
        setNewName(object.nom);
        setNewX(object.coord_x);
        setNewY(object.coord_y);
        setNewBrightness(Number(object.valeur_actuelle) || 100);
        setNewConsumption(object.consomation || 0);
        setNewConnection(object.connection as 'wifi' | 'filaire' || 'wifi');
        // Close any open menus
        setActiveMenu(null);
    };

    const handleSaveChanges = async (id: number) => {
        try {
            // Validate inputs
            if (!newName.trim()) {
                alert('Le nom est requis');
                return;
            }

            if (isNaN(newX) || isNaN(newY)) {
                alert('Les coordonnées doivent être des nombres valides');
                return;
            }

            if (isNaN(newBrightness) || newBrightness < 0 || newBrightness > 100) {
                alert('La luminosité doit être un nombre entre 0 et 100%');
                return;
            }

            if (isNaN(newConsumption) || newConsumption < 0) {
                alert('La consommation doit être un nombre positif');
                return;
            }

            setIsUpdating(id);
            console.log(`Updating light ${id} with new values`);

            const response = await updateObject(id, {
                nom: newName,
                coord_x: newX,
                coord_y: newY,
                consomation: newConsumption,
                connection: newConnection,
                valeur_actuelle: newBrightness // Using valeur_actuelle to store brightness
            });

            console.log('Update successful:', response);
            onStatusChange?.();
            setObjectToEdit(null);
        } catch (error: any) {
            console.error('Error updating light:', error);

            // Special handling for authentication errors
            if (error.response?.status === 401) {
                alert('Session expirée. Veuillez vous reconnecter.');
                // Clear any stale tokens that may be causing the JWT error
                localStorage.removeItem('authToken');
                localStorage.removeItem('sessionToken');
                window.location.href = '/login';
                return;
            }

            // Handle validation errors
            if (error.response?.status === 400) {
                const errorDetails = error.response.data || {};
                console.error('Validation errors:', errorDetails);

                let errorMessage = 'Erreur de validation:\n';
                if (typeof errorDetails === 'object') {
                    // Handle Django REST Framework error format
                    Object.entries(errorDetails).forEach(([field, errors]) => {
                        errorMessage += `- ${field}: ${errors}\n`;
                    });
                } else {
                    errorMessage += errorDetails;
                }

                alert(errorMessage);
            } else {
                alert('Erreur lors de la mise à jour de la lumière: ' +
                    (error.friendlyMessage || error.response?.data?.detail || 'Problème de connexion au serveur'));
            }
        } finally {
            setIsUpdating(null);
        }
    };

    const handleDeleteClick = (id: number) => {
        setObjectToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (objectToDelete === null) return;

        try {
            setIsDeleting(objectToDelete);
            const response = await deleteObject(objectToDelete);
            console.log('Delete successful:', response);
            onStatusChange?.();
        } catch (error: any) {
            console.error('Error deleting object:', error);

            // Special handling for authentication errors
            if (error.response?.status === 401) {
                alert('Session expirée. Veuillez vous reconnecter.');
                // Clear any stale tokens that may be causing the JWT error
                localStorage.removeItem('authToken');
                localStorage.removeItem('sessionToken');
                window.location.href = '/login'; // Redirect to login page
                return;
            }

            alert('Erreur lors de la suppression de l\'objet: ' +
                (error.friendlyMessage || error.response?.data?.detail || 'Problème de connexion au serveur'));
        } finally {
            setIsDeleting(null);
            setShowDeleteModal(false);
            setObjectToDelete(null);
        }
    };

    const handleRepair = async (id: number) => {
        try {
            // Initialize repair states
            setIsRepairing(id);
            setRepairInProgress(id);
            setRepairProgress(0);
            setRepairCountdown(6);
            
            // Create an interval that runs every second to update the percentage and countdown
            const intervalId = setInterval(() => {
                setRepairProgress(prev => {
                    const newProgress = prev + (100/6); // Increases by ~16.67% each second
                    return Math.min(newProgress, 100);
                });
                
                setRepairCountdown(prev => {
                    const newCountdown = prev - 1;
                    return Math.max(newCountdown, 0);
                });
            }, 1000);
            
            // Wait 6 seconds before calling the repair API
            await new Promise(resolve => setTimeout(resolve, 6000));
            
            // Clear the interval
            clearInterval(intervalId);
            
            const response = await repairObject(id);
            console.log('Repair successful:', response);
            
            // Add points for user for the repair
            if (addPoints) {
                // Award 10 points for repairing a light
                await addPoints(10);
            }

            if (onStatusChange) {
                onStatusChange();
            }
            
            // Close repair dialog
            setRepairDialogId(null);
            
            // Close any open menus
            setActiveMenu(null);
        } catch (error: any) {
            console.error('Error repairing light:', error);

            // Special handling for authentication errors
            if (error.response?.status === 401) {
                alert('Session expirée. Veuillez vous reconnecter.');
                // Clear any stale tokens that may be causing the JWT error
                localStorage.removeItem('authToken');
                localStorage.removeItem('sessionToken');
                window.location.href = '/login'; // Redirect to login page
                return;
            }

            // Generic error handling
            alert('Erreur lors de la réparation de la lumière: ' +
                (error.friendlyMessage || error.response?.data?.detail || 'Problème de connexion au serveur'));
        } finally {
            // Reset all repair states
            setIsRepairing(null);
            setRepairInProgress(null);
            setRepairProgress(0);
            setRepairCountdown(6);
        }
    };

    return (
        <div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow relative"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg mr-3">
                        <LightbulbIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lumières</h3>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded dark:bg-yellow-900 dark:text-yellow-300">
                        {objects.length}
                    </span>
                    <button
                        onClick={handleAddClick}
                        className={`p-1.5 bg-yellow-100 rounded-lg hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-800/50 transition-colors ${isHovering ? 'opacity-100' : 'opacity-70'}`}
                        aria-label="Ajouter une lumière"
                        title="Ajouter une lumière"
                    >
                        <Plus className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    </button>
                </div>
            </div>

            {isEmpty ? (
                <div className="py-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                    <LightbulbIcon className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">Aucune lumière connectée</p>
                    <button
                        className="mt-2 text-sm font-medium text-yellow-600 dark:text-yellow-400 hover:underline flex items-center"
                        onClick={handleAddClick}
                    >
                        <Plus className="h-4 w-4 mr-1" /> Ajouter une lumière
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    {objects.map(light => (
                        <div key={light.id} className="relative">
                            {objectToEdit && objectToEdit.id === light.id ? (
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-medium text-yellow-800 dark:text-yellow-300">Modifier la lumière</h4>
                                        <button
                                            onClick={() => setObjectToEdit(null)}
                                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nom</label>
                                            <input
                                                type="text"
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                                className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Coordonnée X</label>
                                                <input
                                                    type="number"
                                                    value={newX}
                                                    onChange={(e) => setNewX(Number(e.target.value))}
                                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Coordonnée Y</label>
                                                <input
                                                    type="number"
                                                    value={newY}
                                                    onChange={(e) => setNewY(Number(e.target.value))}
                                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Consommation (Watts)</label>
                                            <input
                                                type="number"
                                                value={newConsumption}
                                                onChange={(e) => setNewConsumption(Number(e.target.value))}
                                                min="0"
                                                className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Type de connexion</label>
                                            <div className="flex space-x-4">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="radio"
                                                        className="form-radio h-4 w-4 text-yellow-600"
                                                        name="connectionType"
                                                        value="wifi"
                                                        checked={newConnection === 'wifi'}
                                                        onChange={() => setNewConnection('wifi')}
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Wifi</span>
                                                </label>
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="radio"
                                                        className="form-radio h-4 w-4 text-yellow-600"
                                                        name="connectionType"
                                                        value="filaire"
                                                        checked={newConnection === 'filaire'}
                                                        onChange={() => setNewConnection('filaire')}
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Filaire</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-4">
                                        <button
                                            onClick={() => handleSaveChanges(light.id)}
                                            disabled={isUpdating === light.id}
                                            className={`px-3 py-1.5 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors flex items-center ${isUpdating === light.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isUpdating === light.id ? (
                                                'Enregistrement...'
                                            ) : (
                                                <>
                                                    <Save className="h-3.5 w-3.5 mr-1" />
                                                    Enregistrer
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : showInfoId === light.id ? (
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-yellow-300 dark:hover:border-yellow-700 transition-colors">
                                    <div className="flex justify-between items-center p-3">
                                        <div className="flex items-center">
                                            <div className={`p-1.5 rounded-full mr-2 ${light.etat === 'on' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-gray-100 dark:bg-gray-800/60'}`}>
                                                <LightbulbIcon className={`h-4 w-4 ${light.etat === 'on' ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'}`} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800 dark:text-white text-sm">{light.nom}</p>
                                                <div className="flex items-center mt-1">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${light.etat === 'on'
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                        : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-400'}`}>
                                                        {light.etat === 'on' ? 'Allumée' : 'Éteinte'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => handleInfoToggle(light.id)}
                                                className="p-1.5 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                                                title="Informations"
                                            >
                                                <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                            </button>
                                            <button
                                                onClick={() => handleToggleState(light.id, light.etat)}
                                                disabled={toggleLoading === light.id}
                                                className={`p-1.5 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors ${toggleLoading === light.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                title={light.etat === 'on' ? 'Éteindre' : 'Allumer'}
                                            >
                                                {toggleLoading === light.id ? (
                                                    <div className="h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <ToggleLeft className={`h-4 w-4 ${light.etat === 'on' ? 'transform rotate-180' : ''} text-yellow-600 dark:text-yellow-400`} />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleMenuToggle(light.id)}
                                                className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                title="Options"
                                            >
                                                <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                            </button>

                                            {activeMenu === light.id && (
                                                <div ref={dropdownRef} className="absolute right-0 top-auto mt-8 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-10">
                                                    <button
                                                        onClick={() => handleEditClick(light)}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >
                                                        <Pencil className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                                                        Modifier
                                                    </button>
                                                    
                                                    <button
                                                        onClick={() => handleDeleteClick(light.id)}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Supprimer
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Collapsible info panel */}
                                    {showInfoId === light.id && (
                                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">État</p>
                                                    <p className="font-medium">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${light.etat === 'on'
                                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                            : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-400'}`}>
                                                            {light.etat === 'on' ? 'Allumée' : 'Éteinte'}
                                                        </span>
                                                    </p>
                                                </div>

                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Connexion</p>
                                                    <p className="font-medium text-gray-700 dark:text-gray-300">{light.connection || 'N/A'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Position</p>
                                                    <p className="font-medium text-gray-700 dark:text-gray-300">X: {light.coord_x}, Y: {light.coord_y}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Consommation</p>
                                                    <p className="font-medium text-gray-700 dark:text-gray-300">{light.consomation || 0} W</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Maintenance</p>
                                                    <p className={`text-xs font-medium ${light.maintenance === 'fonctionnel'
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                        }`}>
                                                        {light.maintenance === 'fonctionnel' ? 'Opérationnelle' : 'En panne'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Durability indicator with repair button */}
                                            <div className="mt-3">
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Durabilité</p>
                                                    <div className="flex items-center space-x-2">
                                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{light.durabilité || 0}%</p>
                                                        <button
                                                            onClick={() => handleRepair(light.id)}
                                                            disabled={(light.durabilité || 0) > 0 && light.maintenance === 'fonctionnel'}
                                                            className={`flex items-center px-3 py-1.5 text-sm rounded font-medium ${
                                                                (light.durabilité !== undefined && light.durabilité <= 0) || light.maintenance !== 'fonctionnel'
                                                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                                                : 'bg-gray-300 text-gray-600 cursor-default'
                                                            }`}
                                                        >
                                                            <Wrench className="h-4 w-4 mr-1.5" />
                                                            {(light.durabilité !== undefined && light.durabilité <= 0) || light.maintenance !== 'fonctionnel' ? 'Réparer' : 'OK'}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                    <div
                                                        className={`h-1.5 rounded-full ${(light.durabilité || 0) > 70 ? 'bg-green-500' :
                                                            (light.durabilité || 0) > 30 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${light.durabilité || 0}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-yellow-300 dark:hover:border-yellow-700 transition-colors">
                                    <div className="flex justify-between items-center p-3">
                                        <div className="flex items-center">
                                            <div className={`p-1.5 rounded-full mr-2 ${light.etat === 'on' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-gray-100 dark:bg-gray-800/60'}`}>
                                                <LightbulbIcon className={`h-4 w-4 ${light.etat === 'on' ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'}`} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800 dark:text-white text-sm">{light.nom}</p>
                                                <div className="flex items-center mt-1">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${light.etat === 'on'
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                        : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-400'}`}>
                                                        {light.etat === 'on' ? 'Allumée' : 'Éteinte'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => handleInfoToggle(light.id)}
                                                className="p-1.5 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                                                title="Informations"
                                            >
                                                <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                            </button>
                                            <button
                                                onClick={() => handleToggleState(light.id, light.etat)}
                                                disabled={toggleLoading === light.id}
                                                className={`p-1.5 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors ${toggleLoading === light.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                title={light.etat === 'on' ? 'Éteindre' : 'Allumer'}
                                            >
                                                {toggleLoading === light.id ? (
                                                    <div className="h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <ToggleLeft className={`h-4 w-4 ${light.etat === 'on' ? 'transform rotate-180' : ''} text-yellow-600 dark:text-yellow-400`} />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleMenuToggle(light.id)}
                                                className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                title="Options"
                                            >
                                                <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                            </button>

                                            {activeMenu === light.id && (
                                                <div ref={dropdownRef} className="absolute right-0 top-auto mt-8 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-10">
                                                    <button
                                                        onClick={() => handleEditClick(light)}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >
                                                        <Pencil className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                                                        Modifier
                                                    </button>
                                                    
                                                    <button
                                                        onClick={() => handleDeleteClick(light.id)}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Supprimer
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {repairDialogId && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black/30" onClick={() => setRepairDialogId(null)}></div>
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
                                        onClick={() => setRepairDialogId(null)}
                                        className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 rounded"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleRepair(repairDialogId);
                                            setRepairDialogId(null);
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

            {/* Delete confirmation modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl max-w-md w-full">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Confirmer la suppression</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Êtes-vous sûr de vouloir supprimer cette lumière ? Cette action est irréversible.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting !== null}
                                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed flex items-center"
                            >
                                {isDeleting !== null ? (
                                    <span>Suppression...</span>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Light;
