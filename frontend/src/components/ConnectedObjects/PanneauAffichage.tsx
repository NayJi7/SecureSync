import React, { useState, useRef, useEffect } from 'react';
import { Info, MoreVertical, Pencil, Save, Trash2, ToggleLeft, X, MonitorPlay, Plus, MessageSquare, Wrench, AlertTriangle, MonitorOff } from 'lucide-react';
import { ObjectType } from './types';
import { toggleObjectState, updateObject, deleteObject, repairObject } from '../../services/objectService';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface PanneauAffichageProps {
    objects: ObjectType[];
    onStatusChange?: () => void;
    onAddObject?: () => void;
    addPoints?: (points: number) => Promise<void>;
}

const PanneauAffichage: React.FC<PanneauAffichageProps> = ({ objects, onStatusChange, onAddObject, addPoints }) => {
    const isEmpty = objects.length === 0;
    const [activeMenu, setActiveMenu] = useState<number | null>(null);
    const [isUpdating, setIsUpdating] = useState<number | null>(null);
    const [toggleLoading, setToggleLoading] = useState<number | null>(null);
    const [isHovering, setIsHovering] = useState(false);
    const [objectToEdit, setObjectToEdit] = useState<ObjectType | null>(null);
    const [newName, setNewName] = useState<string>('');
    const [newX, setNewX] = useState<number>(0);
    const [newY, setNewY] = useState<number>(0);
    const [newConsumption, setNewConsumption] = useState<number>(0);
    const [newConnection, setNewConnection] = useState<'wifi' | 'filaire'>('wifi');
    const [showInfoId, setShowInfoId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [objectToDelete, setObjectToDelete] = useState<number | null>(null);
    const [showMessageInput, setShowMessageInput] = useState<number | null>(null);
    const [newMessage, setNewMessage] = useState<string>('');
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
            alert("Fonctionnalité à venir: Ajouter un panneau d'affichage");
        }
    };

    const handleToggleState = async (id: number, currentState: string) => {
        try {
            // Find the panel object
            const panneau = objects.find(p => p.id === id);
            
            // Check if the device is broken or has zero durability
            if (currentState === 'off' && panneau && 
                ((panneau.durabilité !== undefined && panneau.durabilité <= 0) || 
                 panneau.maintenance === 'en panne')) {
                // Show repair dialog instead of alert
                setRepairDialogId(id);
                return;
            }
            
            setToggleLoading(id);
            console.log(`Toggling panel ${id} state from ${currentState} to ${currentState === 'on' ? 'off' : 'on'}`);

            // Important: Dans le service, toggleObjectState inverse déjà l'état, donc nous devons passer l'état ACTUEL
            await toggleObjectState(id, currentState as 'on' | 'off');

            console.log(`Panel state toggled successfully`);
            onStatusChange?.();
            if (addPoints) {
                await addPoints(10);
            }
        } catch (error: any) {
            console.error('Error toggling state:', error);
            alert('Erreur lors du changement d\'état: ' +
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
        }
    };

    const handleEditClick = (object: ObjectType) => {
        setObjectToEdit(object);
        setNewName(object.nom);
        setNewX(object.coord_x);
        setNewY(object.coord_y);
        setNewConsumption(object.consomation || 0);
        setNewConnection(object.connection as 'wifi' | 'filaire' || 'wifi');
        setActiveMenu(null);
    };

    const handleMessageClick = (id: number) => {
        const object = objects.find(o => o.id === id);
        setShowMessageInput(id);
        setNewMessage(String(object?.valeur_actuelle || ''));
        setActiveMenu(null);
    };

    const handleMessageSave = async (id: number) => {
        try {
            setIsUpdating(id);
            await updateObject(id, {
                valeur_actuelle: newMessage
            });
            onStatusChange?.();
            setShowMessageInput(null);
            if (addPoints) {
                await addPoints(5);
            }
        } catch (error: any) {
            console.error('Error updating message:', error);
            alert('Erreur lors de la mise à jour du message: ' +
                (error.friendlyMessage || error.response?.data?.detail || 'Problème de connexion au serveur'));
        } finally {
            setIsUpdating(null);
        }
    };

    const handleInfoToggle = (id: number) => {
        if (showInfoId === id) {
            setShowInfoId(null);
        } else {
            setShowInfoId(id);
            setActiveMenu(null);
        }
    };

    const handleSaveChanges = async (id: number) => {
        try {
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
            await updateObject(id, {
                nom: newName,
                coord_x: newX,
                coord_y: newY,
                consomation: newConsumption,
                connection: newConnection
            });

            onStatusChange?.();
            setObjectToEdit(null);
        } catch (error: any) {
            console.error('Error updating display panel:', error);
            if (error.response?.status === 401) {
                alert('Session expirée. Veuillez vous reconnecter.');
                localStorage.removeItem('authToken');
                localStorage.removeItem('sessionToken');
                window.location.href = '/login';
                return;
            }

            if (error.response?.status === 400) {
                const errorDetails = error.response.data || {};
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
                alert('Erreur lors de la mise à jour du paneau d\'affichage: ' +
                    (error.friendlyMessage || error.response?.data?.detail || 'Problème de connexion au serveur'));
            }
        } finally {
            setIsUpdating(null);
        }
    };

    const handleDeleteClick = (id: number) => {
        setObjectToDelete(id);
        setShowDeleteModal(true);
        setActiveMenu(null);
    };

    const confirmDelete = async () => {
        if (!objectToDelete) return;

        try {
            setIsDeleting(objectToDelete);
            await deleteObject(objectToDelete);
            onStatusChange?.();
            setShowDeleteModal(false);
            setObjectToDelete(null);
        } catch (error: any) {
            console.error('Error deleting object:', error);
            alert('Erreur lors de la suppression: ' +
                (error.friendlyMessage || error.response?.data?.detail || 'Problème de connexion au serveur'));
        } finally {
            setIsDeleting(null);
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
            
            // Ajouter des points à l'utilisateur pour la réparation
            if (addPoints) {
                // Attribution de 10 points pour la réparation d'un panneau d'affichage
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
            console.error('Error repairing display panel:', error);

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
            alert('Erreur lors de la réparation du paneau d\'affichage: ' +
                (error.friendlyMessage || error.response?.data?.detail || 'Problème de connexion au serveur'));
        } finally {
            // Reset all repair states
            setIsRepairing(null);
            setRepairInProgress(null);
            setRepairProgress(0);
            setRepairCountdown(6);
        }
    };

    const getDisplayPanelIcon = (message: string | number | null | undefined, etat: string) => {
        if (etat === 'on') {
            return <MonitorPlay className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
        } else {
            return <MonitorOff className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
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
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg mr-3">
                        <MonitorPlay className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Panneaux d'affichage</h3>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-1 rounded dark:bg-indigo-900 dark:text-indigo-300">
                        {objects.length}
                    </span>
                    <button
                        onClick={handleAddClick}
                        className={`p-1.5 bg-indigo-100 rounded-lg hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/50 transition-colors ${isHovering ? 'opacity-100' : 'opacity-70'}`}
                        aria-label="Ajouter un panneau d'affichage"
                        title="Ajouter un panneau d'affichage"
                    >
                        <Plus className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </button>
                </div>
            </div>

            {isEmpty ? (
                <div className="py-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                    <MonitorPlay className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">Aucun panneau d'affichage connecté</p>
                    <button
                        className="mt-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
                        onClick={handleAddClick}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter un panneau
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {objects.map((panneau) => (
                        <div
                            key={panneau.id}
                            className="flex flex-col bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors"
                        >
                            <div className="flex justify-between items-center p-3">
                                <div className="flex items-center">
                                    <div className={`p-1.5 rounded-full mr-2 ${panneau.etat === 'on' ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                        {getDisplayPanelIcon(panneau.valeur_actuelle, panneau.etat)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-white text-sm">{panneau.nom}</p>
                                        <div className="flex items-center mt-1">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${panneau.etat === 'on'
                                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
                                                : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-400'}`}
                                            >
                                                {panneau.etat === 'on' ? 'Actif' : 'Inactif'}
                                            </span>
                                        </div>
                                        {panneau.etat === 'on' && (
                                            <div className="flex space-x-3 mt-1">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Message: <span className="font-medium">
                                                        {panneau.valeur_actuelle || 'Aucun'}
                                                    </span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-1 relative">
                                    <button
                                        onClick={() => handleInfoToggle(panneau.id)}
                                        className="p-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                                        title="Informations"
                                    >
                                        <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    </button>
                                    <button
                                        onClick={() => handleToggleState(panneau.id, panneau.etat)}
                                        disabled={toggleLoading === panneau.id}
                                        className={`p-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors ${toggleLoading === panneau.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        title="Changer état"
                                    >
                                        <ToggleLeft className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    </button>
                                    <button
                                        onClick={() => handleMenuToggle(panneau.id)}
                                        className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                        title="Options"
                                    >
                                        <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                    </button>
                                    {activeMenu === panneau.id && (
                                        <div ref={dropdownRef} className="absolute right-0 top-5 mt-0.5 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-10">
                                            <ul className="py-1">
                                                <li>
                                                    <button 
                                                        onClick={() => handleMessageClick(panneau.id)} 
                                                        className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >
                                                        <MessageSquare className="h-3.5 w-3.5 mr-2 text-gray-500 dark:text-gray-400" />
                                                        Modifier message
                                                    </button>
                                                </li>
                                                <li>
                                                    <button 
                                                        onClick={() => handleEditClick(panneau)} 
                                                        className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5 mr-2 text-gray-500 dark:text-gray-400" />
                                                        Modifier
                                                    </button>
                                                </li>
                                                <li>
                                                    <button 
                                                        onClick={() => handleDeleteClick(panneau.id)} 
                                                        className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 mr-2 text-red-600 dark:text-red-400" />
                                                        Supprimer
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {objectToEdit?.id === panneau.id && (
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700 mt-3">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-medium text-indigo-800 dark:text-indigo-300">Modifier le panneau d'affichage</h4>
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
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Consommation (kW)</label>
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
                                                        className="form-radio h-4 w-4 text-indigo-600"
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
                                                        className="form-radio h-4 w-4 text-indigo-600"
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
                                            onClick={() => handleSaveChanges(panneau.id)}
                                            disabled={isUpdating === panneau.id}
                                            className={`px-3 py-1.5 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center ${isUpdating === panneau.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isUpdating === panneau.id ? 'Enregistrement...' : <><Save className="h-3.5 w-3.5 mr-1" /> Enregistrer</>}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {showMessageInput === panneau.id && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-inner border border-gray-200 dark:border-gray-600 mt-3">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-medium text-gray-800 dark:text-gray-200">Modifier le message</h4>
                                        <button
                                            onClick={() => setShowMessageInput(null)}
                                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="mb-3">
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Entrez le message à afficher sur le panneau..."
                                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => handleMessageSave(panneau.id)}
                                            disabled={isUpdating === panneau.id}
                                            className={`px-3 py-1.5 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center ${isUpdating === panneau.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isUpdating === panneau.id ? 'Enregistrement...' : <><Save className="h-3.5 w-3.5 mr-1" /> Enregistrer</>}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {showInfoId === panneau.id && (
                                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">État</p>
                                            <p className="font-medium">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${panneau.etat === 'on' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-400'}`}>
                                                    {panneau.etat === 'on' ? 'Actif' : 'Inactif'}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Connexion</p>
                                            <p className="font-medium text-gray-700 dark:text-gray-300">{panneau.connection || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Position</p>
                                            <p className="font-medium text-gray-700 dark:text-gray-300">X: {panneau.coord_x}, Y: {panneau.coord_y}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Consommation</p>
                                            <p className="font-medium text-gray-700 dark:text-gray-300">{panneau.consomation || 0} kW</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Maintenance</p>
                                            <p className={`text-xs font-medium ${panneau.maintenance === 'fonctionnel'
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-red-600 dark:text-red-400'
                                                }`}>
                                                {panneau.maintenance === 'fonctionnel' ? 'Opérationnel' : 'En panne'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Durabilité</p>
                                            <div className="flex items-center space-x-2">
                                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{panneau.durabilité || 0}%</p>
                                                {(panneau.durabilité || 0) <= 0 && panneau.maintenance !== 'fonctionnel' && (
                                                <button
                                                    onClick={() => handleRepair(panneau.id)}
                                                    className={`flex items-center px-3 py-1.5 text-sm rounded font-medium ${
                                                        (panneau.durabilité !== undefined && panneau.durabilité <= 0) || panneau.maintenance !== 'fonctionnel'
                                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                                        : 'bg-gray-300 text-gray-600 cursor-default'
                                                    }`}
                                                >
                                                    <Wrench className="h-4 w-4 mr-1" />
                                                    {(panneau.durabilité !== undefined && panneau.durabilité <= 0) || panneau.maintenance !== 'fonctionnel' ? 'Réparer' : 'OK'}
                                                </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                            <div
                                                className={`h-1.5 rounded-full ${(panneau.durabilité || 0) > 70 ? 'bg-green-500' :
                                                    (panneau.durabilité || 0) > 30 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${panneau.durabilité || 0}%` }}
                                            ></div>
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

            {/* Replace the repair in progress modal */}
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

            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)}></div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4 relative z-10">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Confirmer la suppression
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Êtes-vous sûr de vouloir supprimer ce panneau d'affichage ? Cette action est irréversible.
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
        </div>
    );
};

export default PanneauAffichage; 