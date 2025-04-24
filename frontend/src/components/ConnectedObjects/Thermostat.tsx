import React, { useState, useEffect, useRef } from 'react';
import { ObjectType } from './types';
import {
    Thermometer,
    Plus,
    ToggleLeft,
    MoreVertical,
    Pencil,
    Trash2,
    X,
    ChevronUp,
    ChevronDown,
    Info,
    Save
} from 'lucide-react';
import { toggleObjectState, updateObject, deleteObject } from '../../services/objectService';
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

interface ThermostatProps {
    objects: ObjectType[];
    onAddObject?: () => void;
    onStatusChange?: () => void;
    addPoints?: (points: number) => Promise<void>;
}

const Thermostat: React.FC<ThermostatProps> = ({ objects, onAddObject, onStatusChange, addPoints }) => {
    const [isHovering, setIsHovering] = useState(false);
    const [toggleLoading, setToggleLoading] = useState<number | null>(null);
    const [activeMenu, setActiveMenu] = useState<number | null>(null);
    const [objectToEdit, setObjectToEdit] = useState<ObjectType | null>(null);
    const [newName, setNewName] = useState<string>('');
    const [newX, setNewX] = useState<number>(0);
    const [newY, setNewY] = useState<number>(0);
    const [newConsumption, setNewConsumption] = useState<number>(0);
    const [newConnection, setNewConnection] = useState<'wifi' | 'filaire'>('wifi');
    const [newTargetTemp, setNewTargetTemp] = useState<number>(22);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [isUpdating, setIsUpdating] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [objectToDelete, setObjectToDelete] = useState<number | null>(null);
    const [showInfoId, setShowInfoId] = useState<number | null>(null);
    const [thermostatsInProgress, setThermostatsInProgress] = useState<Set<number>>(new Set());
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const handleAddClick = () => {
        onAddObject ? onAddObject() : alert('Fonctionnalité à venir: Ajouter un thermostat');
    };

    const handleToggleState = async (id: number, currentState: 'on' | 'off') => {
        try {
            setToggleLoading(id);
            const response = await toggleObjectState(id, currentState);
            if (addPoints) await addPoints(4);
            onStatusChange?.();
        } catch (error: any) {
            alert('Erreur lors du changement d\'état: ' + (error.response?.data?.message || 'Erreur inconnue'));
        } finally {
            setToggleLoading(null);
        }
    };

    const handleMenuToggle = (id: number) => {
        setActiveMenu(activeMenu === id ? null : id);
        setObjectToEdit(null);
        setShowInfoId(null);
    };

    const handleInfoToggle = (id: number) => {
        setShowInfoId(showInfoId === id ? null : id);
        setActiveMenu(null);
    };

    const handleEditClick = (object: ObjectType) => {
        setObjectToEdit(object);
        setNewName(object.nom);
        setNewX(object.coord_x);
        setNewY(object.coord_y);
        setNewConsumption(object.consomation || 0);
        setNewConnection(object.connection as 'wifi' | 'filaire' || 'wifi');
        setNewTargetTemp(Number(object.valeur_cible) || 22);
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

            if (isNaN(newConsumption) || newConsumption < 0) {
                alert('La consommation doit être un nombre positif');
                return;
            }

            if (isNaN(newTargetTemp) || newTargetTemp < 10 || newTargetTemp > 30) {
                alert('La température cible doit être entre 10°C et 30°C');
                return;
            }

            setIsUpdating(id);
            console.log(`Updating thermostat ${id} with new values`);

            const response = await updateObject(id, {
                nom: newName,
                coord_x: newX,
                coord_y: newY,
                consomation: newConsumption,
                connection: newConnection,
                valeur_cible: newTargetTemp
            });

            console.log('Update successful:', response);
            onStatusChange?.();
            setObjectToEdit(null);
        } catch (error: any) {
            console.error('Error updating thermostat:', error);

            // Special handling for authentication errors
            if (error.response?.status === 401) {
                alert('Session expirée. Veuillez vous reconnecter.');
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
                    Object.entries(errorDetails).forEach(([field, errors]) => {
                        errorMessage += `- ${field}: ${errors}\n`;
                    });
                } else {
                    errorMessage += errorDetails;
                }

                alert(errorMessage);
            } else {
                alert('Erreur lors de la mise à jour du thermostat: ' +
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
            await deleteObject(objectToDelete);
            onStatusChange?.();
        } catch (error: any) {
            alert('Erreur de suppression: ' + (error.response?.data?.message || 'Erreur inconnue'));
        } finally {
            setIsDeleting(null);
            setShowDeleteModal(false);
            setObjectToDelete(null);
        }
    };

    // This effect sets up a single interval to handle all temperature updates
    useEffect(() => {
        // Clear any existing interval when component mounts or remounts
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Set up a new interval that runs every 3 seconds
        intervalRef.current = setInterval(async () => {
            // Only proceed if there are thermostats that need updating
            if (thermostatsInProgress.size === 0) return;

            // Create a new Set to track which thermostats should remain in progress
            const stillInProgress = new Set<number>();

            // Process each thermostat that's currently being updated
            for (const thermostatId of thermostatsInProgress) {
                // Find the thermostat object
                const thermostat = objects.find(t => t.id === thermostatId);

                // Skip if thermostat not found or turned off
                if (!thermostat || thermostat.etat !== 'on') continue;

                const currentTemp = Number(thermostat.valeur_actuelle) || 22;
                const targetTemp = Number(thermostat.valeur_cible) || 22;

                // Skip if already at target temperature
                if (currentTemp === targetTemp) continue;

                // Determine direction (heating up or cooling down)
                const step = targetTemp > currentTemp ? 1 : -1;

                try {
                    // Update the actual temperature by one degree
                    const newTemp = currentTemp + step;
                    await updateObject(thermostatId, { valeur_actuelle: newTemp });

                    // If we haven't reached the target yet, keep this thermostat in progress
                    if (newTemp !== targetTemp) {
                        stillInProgress.add(thermostatId);
                    }

                    // Call the status change callback so the UI refreshes
                    onStatusChange?.();
                } catch (error) {
                    console.error('Error updating temperature:', error);
                }
            }

            // Update the set of thermostats in progress
            setThermostatsInProgress(stillInProgress);

        }, 3000);

        // Clean up the interval when component unmounts
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [objects, thermostatsInProgress, onStatusChange]);

    // Update the target temperature function
    const updateTargetTemperature = async (id: number, newTemp: number) => {
        try {
            // Ensure temperature is within a reasonable range (10-30°C)
            newTemp = Math.max(10, Math.min(30, newTemp));

            setIsUpdating(id);

            // Update the target temperature
            await updateObject(id, { valeur_cible: newTemp });

            // Get the current thermostat
            const thermostat = objects.find(t => t.id === id);

            // If the thermostat is on and its actual temperature differs from the target,
            // add it to the set of thermostats in progress
            if (thermostat && thermostat.etat === 'on') {
                const currentTemp = Number(thermostat.valeur_actuelle) || 22;

                if (currentTemp !== newTemp) {
                    setThermostatsInProgress(prev => new Set(prev).add(id));
                }
            }

            onStatusChange?.();
        } catch (error: any) {
            alert('Erreur température: ' + (error.response?.data?.message || 'Erreur inconnue'));
        } finally {
            setIsUpdating(null);
        }
    };

    const getTemperatureColor = (temp: number) => temp > 22 ? 'text-red-500' : temp < 19 ? 'text-blue-500' : 'text-yellow-500';

    return (
        <div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow relative"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
                        <Thermometer className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Thermostats</h3>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded dark:bg-blue-900 dark:text-blue-300">
                        {objects.length}
                    </span>
                    <button
                        onClick={handleAddClick}
                        className={`p-1.5 bg-blue-100 rounded-lg hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 transition-colors ${isHovering ? 'opacity-100' : 'opacity-70'}`}
                        title="Ajouter un thermostat"
                    >
                        <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </button>
                </div>
            </div>

            {objects.length === 0 ? (
                <div className="py-8 flex flex-col items-center text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                    <Thermometer className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">Aucun thermostat connecté</p>
                    <button
                        onClick={handleAddClick}
                        className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                    >
                        <Plus className="h-4 w-4 mr-1" /> Ajouter un thermostat
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    {objects.map(thermo => (
                        <div key={thermo.id} className="relative">
                            {objectToEdit?.id === thermo.id ? (
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-medium text-blue-800 dark:text-blue-300">Modifier le thermostat</h4>
                                        <button onClick={() => setObjectToEdit(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
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
                                                        className="form-radio h-4 w-4 text-blue-600"
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
                                                        className="form-radio h-4 w-4 text-blue-600"
                                                        name="connectionType"
                                                        value="filaire"
                                                        checked={newConnection === 'filaire'}
                                                        onChange={() => setNewConnection('filaire')}
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Filaire</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Température cible (°C)</label>
                                            <input
                                                type="number"
                                                value={newTargetTemp}
                                                onChange={(e) => setNewTargetTemp(Number(e.target.value))}
                                                min="10"
                                                max="30"
                                                className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-4">
                                        <button
                                            onClick={() => handleSaveChanges(thermo.id)}
                                            disabled={isUpdating === thermo.id}
                                            className={`px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center ${isUpdating === thermo.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isUpdating === thermo.id ? 'Enregistrement...' : <><Save className="h-3.5 w-3.5 mr-1" /> Enregistrer</>}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                                    <div className="flex justify-between items-center p-3">
                                        <div className="flex items-center">
                                            <div className={`p-1.5 rounded-full mr-2 ${thermo.etat === 'on' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                                <Thermometer className={`h-4 w-4 ${thermo.etat === 'on' ? getTemperatureColor(Number(thermo.valeur_actuelle) || 20) : 'text-gray-500 dark:text-gray-400'}`} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800 dark:text-white text-sm">{thermo.nom}</p>
                                                <div className="flex items-center mt-1">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${thermo.etat === 'on'
                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                        : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-400'}`}
                                                    >
                                                        {thermo.etat === 'on' ? 'Actif' : 'Inactif'}
                                                    </span>
                                                </div>
                                                {thermo.etat === 'on' && (
                                                    <div className="flex space-x-3 mt-1">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            Actuelle: <span className={getTemperatureColor(Number(thermo.valeur_actuelle) || 20)}>
                                                                {thermo.valeur_actuelle || 20}°C
                                                                {thermostatsInProgress.has(thermo.id) && <span className="ml-1 inline-block animate-pulse text-blue-500 dark:text-blue-400">●</span>}
                                                            </span>
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            Cible: <span className="font-medium">
                                                                {thermo.valeur_cible || 22}°C
                                                            </span>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            {thermo.etat === 'on' && (
                                                <div className="mr-2 flex flex-col w-60">
                                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                        <span className="font-medium">Température: {thermo.valeur_cible || 22}°C</span>
                                                    </div>
                                                    <Slider
                                                        value={[Number(thermo.valeur_cible) || 22]}
                                                        min={10}
                                                        max={30}
                                                        step={1}
                                                        onValueChange={(value) => updateTargetTemperature(thermo.id, value[0])}
                                                        className="w-full [&>[data-slot=slider-track]]:bg-blue-100 [&>[data-slot=slider-track]>[data-slot=slider-range]]:bg-blue-500 [&>[data-slot=slider-thumb]]:border-blue-500 dark:[&>[data-slot=slider-track]]:bg-blue-900/30 dark:[&>[data-slot=slider-track]>[data-slot=slider-range]]:bg-blue-400 dark:[&>[data-slot=slider-thumb]]:border-blue-400"
                                                    />
                                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        <span>10°C</span>
                                                        <span>20°C</span>
                                                        <span>30°C</span>
                                                    </div>
                                                </div>
                                            )}
                                            <button onClick={() => handleInfoToggle(thermo.id)} className="p-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors" title="Informations">
                                                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </button>
                                            <button onClick={() => handleToggleState(thermo.id, thermo.etat)} disabled={toggleLoading === thermo.id} className={`p-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors ${toggleLoading === thermo.id ? 'opacity-50 cursor-not-allowed' : ''}`} title="Changer état">
                                                <ToggleLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </button>
                                            <button onClick={() => handleMenuToggle(thermo.id)} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Options">
                                                <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                            </button>
                                            {activeMenu === thermo.id && (
                                                <div className="absolute right-0 top-auto mt-8 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-10">
                                                    <button onClick={() => handleEditClick(thermo)} className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                        <Pencil className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                                                        Modifier
                                                    </button>
                                                    <button onClick={() => handleDeleteClick(thermo.id)} className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Supprimer
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {showInfoId === thermo.id && (
                                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">État</p>
                                                    <p className="font-medium">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${thermo.etat === 'on' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-400'}`}>
                                                            {thermo.etat === 'on' ? 'Actif' : 'Inactif'}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Connexion</p>
                                                    <p className="font-medium text-gray-700 dark:text-gray-300">{thermo.connection || 'N/A'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Position</p>
                                                    <p className="font-medium text-gray-700 dark:text-gray-300">X: {thermo.coord_x}, Y: {thermo.coord_y}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Consommation</p>
                                                    <p className="font-medium text-gray-700 dark:text-gray-300">{thermo.consomation || 0} W</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Maintenance</p>
                                                    <p className={`text-xs font-medium ${thermo.maintenance === 'fonctionnel'
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                        }`}>
                                                        {thermo.maintenance === 'fonctionnel' ? 'Opérationnel' : 'En panne'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-3">
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Durabilité</p>
                                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{thermo.durabilité || 0}%</p>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                    <div
                                                        className={`h-1.5 rounded-full ${(thermo.durabilité || 0) > 70 ? 'bg-green-500' :
                                                            (thermo.durabilité || 0) > 30 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${thermo.durabilité || 0}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)}></div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4 relative z-10">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Confirmer la suppression</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">Êtes-vous sûr de vouloir supprimer ce thermostat ? Cette action est irréversible.</p>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded">Annuler</button>
                            <button onClick={confirmDelete} disabled={isDeleting !== null} className={`px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded ${isDeleting !== null ? 'opacity-50 cursor-not-allowed' : ''}`}>{isDeleting !== null ? 'Suppression...' : 'Supprimer'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Thermostat;
