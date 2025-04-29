import React, { useState, useEffect, useRef } from 'react';
import { ObjectType } from './types';
import { Video, VideoOff, Plus, ToggleLeft, MoreVertical, Pencil, Trash2, X, Info, Save, Wrench, AlertTriangle } from 'lucide-react';
import { toggleObjectState, updateObject, deleteObject, repairObject } from '../../services/objectService';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import VideoView from '../HomeComponents/VideoView';

interface CameraProps {
    objects: ObjectType[];
    onAddObject?: () => void;
    onStatusChange?: () => void;
    addPoints?: (points: number) => Promise<void>;
}

const Camera: React.FC<CameraProps> = ({ objects, onAddObject, onStatusChange, addPoints }) => {
    const isEmpty = objects.length === 0;
    const [isHovering, setIsHovering] = useState(false);
    const [toggleLoading, setToggleLoading] = useState<number | null>(null);
    const [activeMenu, setActiveMenu] = useState<number | null>(null);
    const [objectToEdit, setObjectToEdit] = useState<ObjectType | null>(null);
    const [showInfoId, setShowInfoId] = useState<number | null>(null);
    const [isRepairing, setIsRepairing] = useState<number | null>(null);
    const [repairDialogId, setRepairDialogId] = useState<number | null>(null);

    // Form state for editing
    const [newName, setNewName] = useState<string>('');
    const [newX, setNewX] = useState<number>(0);
    const [newY, setNewY] = useState<number>(0);
    const [newConsumption, setNewConsumption] = useState<number>(0);
    const [newConnection, setNewConnection] = useState<'wifi' | 'filaire'>('wifi');

    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [isUpdating, setIsUpdating] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [objectToDelete, setObjectToDelete] = useState<number | null>(null);

    // Add repair progress tracking
    const [repairProgress, setRepairProgress] = useState<number>(0);
    const [repairCountdown, setRepairCountdown] = useState<number>(6);
    const [repairInProgress, setRepairInProgress] = useState<number | null>(null);

    const [showVideoId, setShowVideoId] = useState<number | null>(null);
    const [currentVideoUrl, setCurrentVideoUrl] = useState<string>("");

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
            alert('Fonctionnalité à venir: Ajouter une caméra');
        }
    };

    const handleToggleState = async (id: number, currentState: 'on' | 'off') => {
        try {
            // Find the camera object
            const camera = objects.find(c => c.id === id);
            
            // Check if the device is broken or has zero durability
            if (currentState === 'off' && camera && 
                ((camera.durabilité !== undefined && camera.durabilité <= 0) || 
                 camera.maintenance === 'en panne')) {
                // Show repair dialog instead of alert
                setRepairDialogId(id);
                return;
            }
            
            setToggleLoading(id);
            const response = await toggleObjectState(id, currentState);
            // console.log('Toggle successful:', response);

            if (addPoints) {
                // Attribution de 3 points pour l'interaction avec une caméra
                await addPoints(3);
            }

            if (onStatusChange) {
                onStatusChange();
            }
        } catch (error: any) {
            console.error('Error toggling camera state:', error);
            alert('Erreur lors du changement d\'état de la caméra: ' +
                (error.response?.data?.message || 'Problème de connexion au serveur'));
        } finally {
            setToggleLoading(null);
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
            
            // Close the repair confirmation dialog
            setRepairDialogId(null);
            
            const response = await repairObject(id);
            console.log('Repair successful:', response);
            
            // Add points for the user for the repair
            if (addPoints) {
                // Award 10 points for repairing a camera
                await addPoints(10);
            }

            if (onStatusChange) {
                onStatusChange();
            }
            
            // Close any open menus
            setActiveMenu(null);
        } catch (error: any) {
            console.error('Error repairing camera:', error);

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
            alert('Erreur lors de la réparation de la caméra: ' +
                (error.friendlyMessage || error.response?.data?.detail || 'Problème de connexion au serveur'));
        } finally {
            // Reset all repair states
            setIsRepairing(null);
            setRepairInProgress(null);
            setRepairProgress(0);
            setRepairCountdown(6);
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

    const handleEditClick = (object: ObjectType) => {
        setObjectToEdit(object);
        // Initialize form with current values
        setNewName(object.nom);
        setNewX(object.coord_x);
        setNewY(object.coord_y);
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

            if (isNaN(newConsumption) || newConsumption < 0) {
                alert('La consommation doit être un nombre positif');
                return;
            }

            setIsUpdating(id);
            // console.log(`Updating camera ${id} with new values`);

            const response = await updateObject(id, {
                nom: newName,
                coord_x: newX,
                coord_y: newY,
                consomation: newConsumption, // Utilisation du nom correct pour le backend
                connection: newConnection
            });

            // console.log('Update successful:', response);
            if (onStatusChange) {
                onStatusChange();
            }
            setObjectToEdit(null);
        } catch (error: any) {
            console.error('Error updating camera:', error);
            alert('Erreur lors de la mise à jour de la caméra: ' +
                (error.response?.data?.message || 'Problème de connexion au serveur'));
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
            // console.log('Delete successful:', response);
            if (onStatusChange) {
                onStatusChange();
            }
        } catch (error: any) {
            console.error('Error deleting object:', error);
            alert('Erreur lors de la suppression de l\'objet: ' +
                (error.response?.data?.message || 'Problème de connexion au serveur'));
        } finally {
            setIsDeleting(null);
            setShowDeleteModal(false);
            setObjectToDelete(null);
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
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg mr-3">
                        <Video className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Caméras</h3>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded dark:bg-purple-900 dark:text-purple-300">
                        {objects.length}
                    </span>
                    <button
                        onClick={handleAddClick}
                        className={`p-1.5 bg-purple-100 rounded-lg hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-800/50 transition-colors ${isHovering ? 'opacity-100' : 'opacity-70'}`}
                        aria-label="Ajouter une caméra"
                        title="Ajouter une caméra"
                    >
                        <Plus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </button>
                </div>
            </div>

            {isEmpty ? (
                <div className="py-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                    <Video className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">Aucune caméra connectée</p>
                    <button
                        className="mt-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline flex items-center"
                        onClick={handleAddClick}
                    >
                        <Plus className="h-4 w-4 mr-1" /> Ajouter une caméra
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    {objects.map(camera => (
                        <div key={camera.id} className="relative">
                            {objectToEdit && objectToEdit.id === camera.id ? (
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-medium text-purple-800 dark:text-purple-300">Modifier la caméra</h4>
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
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Consommation (kWh)</label>
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
                                                        className="form-radio h-4 w-4 text-purple-600"
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
                                                        className="form-radio h-4 w-4 text-purple-600"
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
                                            onClick={() => handleSaveChanges(camera.id)}
                                            disabled={isUpdating === camera.id}
                                            className={`px-3 py-1.5 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center ${isUpdating === camera.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isUpdating === camera.id ? (
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
                            ) : (
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                                    <div className="flex justify-between items-center p-3">
                                        <div className="flex items-center">
                                            {/* Icône caméra */}
                                            <div className={`p-1.5 rounded-full mr-2 ${camera.etat === 'on' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-800/60'}`}>
                                                {camera.etat === 'on' 
                                                    ? <Video className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                    : <VideoOff className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                }
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800 dark:text-white text-sm flex items-center">
                                                    {camera.nom}
                                                    {camera.etat === 'on' && (
                                                        <button
                                                            onClick={() => {
                                                                setCurrentVideoUrl("https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&mute=1&disablekb=1&fs=0&iv_load_policy=3&playsinline=1");                                                              setShowVideoId(camera.id);
                                                            }}
                                                            className="ml-2 p-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                                                            title="Visualiser la caméra"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600 dark:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12s4-7.5 10.5-7.5S22.5 12 22.5 12s-4 7.5-10.5 7.5S1.5 12 1.5 12z" />
                                                                <circle cx="12" cy="12" r="3" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </p>
                                                <div className="flex items-center mt-1">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${camera.etat === 'on'
                                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                                        : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-400'}`}>
                                                        {camera.etat === 'on' ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => handleInfoToggle(camera.id)}
                                                className="p-1.5 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                                title="Informations"
                                            >
                                                <Info className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                            </button>
                                            <button
                                                onClick={() => handleToggleState(camera.id, camera.etat)}
                                                disabled={toggleLoading === camera.id}
                                                className={`p-1.5 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors ${toggleLoading === camera.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                title={camera.etat === 'on' ? 'Éteindre' : 'Allumer'}
                                            >
                                                {toggleLoading === camera.id ? (
                                                    <div className="h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <ToggleLeft className={`h-4 w-4 ${camera.etat === 'on' ? 'transform rotate-180' : ''} text-purple-600 dark:text-purple-400`} />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleMenuToggle(camera.id)}
                                                className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                title="Options"
                                            >
                                                <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {activeMenu === camera.id && (
                                        <div ref={dropdownRef} className="absolute right-0 top-11 mt-0.5 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-10">
                                            <button
                                                onClick={() => handleEditClick(camera)}
                                                className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <Pencil className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                                                Modifier
                                            </button>
                                            
                                            <button
                                                onClick={() => handleDeleteClick(camera.id)}
                                                className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Supprimer
                                            </button>
                                        </div>
                                    )}

                                    {/* Collapsible info panel */}
                                    {showInfoId === camera.id && (
                                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">État</p>
                                                    <p className="font-medium">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${camera.etat === 'on'
                                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                                            : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-400'}`}>
                                                            {camera.etat === 'on' ? 'Activée' : 'Désactivée'}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Connexion</p>
                                                    <p className="font-medium text-gray-700 dark:text-gray-300">{camera.connection || 'N/A'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Position</p>
                                                    <p className="font-medium text-gray-700 dark:text-gray-300">X: {camera.coord_x}, Y: {camera.coord_y}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Consommation</p>
                                                    <p className="font-medium text-gray-700 dark:text-gray-300">{camera.consomation || 0} kWh</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Maintenance</p>
                                                    <p className={`text-xs font-medium ${camera.maintenance === 'fonctionnel'
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                        }`}>
                                                        {camera.maintenance === 'fonctionnel' ? 'Opérationnelle' : 'En panne'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Durability indicator with repair button */}
                                            <div className="mt-3">
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Durabilité</p>
                                                    <div className="flex items-center space-x-2">
                                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{camera.durabilité || 0}%</p>
                                                        {(camera.durabilité || 0) <= 0 && camera.maintenance !== 'fonctionnel' && (
                                                            <button
                                                                onClick={() => handleRepair(camera.id)}
                                                                className={`flex items-center px-3 py-1.5 text-sm rounded font-medium ${
                                                                    (camera.durabilité !== undefined && camera.durabilité <= 0) || camera.maintenance !== 'fonctionnel'
                                                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                                                    : 'bg-gray-300 text-gray-600 cursor-default'
                                                                }`}
                                                            >
                                                                <Wrench className="h-3 w-3 mr-0.5" />
                                                                {(camera.durabilité !== undefined && camera.durabilité <= 0) || camera.maintenance !== 'fonctionnel' ? 'Réparer' : 'OK'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                    <div
                                                        className={`h-1.5 rounded-full ${(camera.durabilité || 0) > 70 ? 'bg-green-500' :
                                                            (camera.durabilité || 0) > 30 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${camera.durabilité || 0}%` }}
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

            {/* Modal de confirmation de suppression */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)}></div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4 relative z-10">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Confirmer la suppression
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Êtes-vous sûr de vouloir supprimer cette caméra ? Cette action est irréversible.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting !== null}
                                className={`px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded ${isDeleting !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isDeleting !== null ? 'Suppression...' : 'Supprimer'}
                            </button>
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

            {showVideoId !== null && (
                <VideoView
                    onClose={() => setShowVideoId(null)}
                    videoUrl={currentVideoUrl}
                />
            )}
        </div>
    );
};

export default Camera;
