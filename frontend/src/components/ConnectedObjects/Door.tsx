import React, { useState } from 'react';
import { ObjectType, DoorObject } from './types';
import { Lock, Unlock, Plus, DoorClosed, ToggleLeft, MoreVertical, Pencil, Trash2, X, Info, Save } from 'lucide-react';
import { toggleObjectState, updateObject, deleteObject } from '../../services/objectService';

interface DoorProps {
    objects: ObjectType[];
    onAddObject?: () => void;
    onStatusChange?: () => void; // Callback for when status changes
    addPoints?: (points: number) => Promise<void>; // Fonction pour ajouter des points à l'utilisateur
}

const Door: React.FC<DoorProps> = ({ objects, onAddObject, onStatusChange, addPoints }) => {
    const isEmpty = objects.length === 0;
    const [isHovering, setIsHovering] = useState(false);
    const [toggleLoading, setToggleLoading] = useState<number | null>(null);
    const [activeMenu, setActiveMenu] = useState<number | null>(null);
    const [objectToEdit, setObjectToEdit] = useState<ObjectType | null>(null);
    const [showInfoId, setShowInfoId] = useState<number | null>(null);

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

    const handleAddClick = () => {
        if (onAddObject) {
            onAddObject();
        } else {
            alert('Fonctionnalité à venir: Ajouter une porte');
        }
    };

    const handleToggleState = async (id: number, currentState: 'on' | 'off') => {
        try {
            setToggleLoading(id);
            // Log the current state before toggle for debugging
            console.log(`Door toggle: Currently ${currentState}, will toggle to ${currentState === 'on' ? 'off' : 'on'}`);
            const response = await toggleObjectState(id, currentState);
            console.log('Toggle successful:', response);

            // Ajouter des points à l'utilisateur pour chaque interaction
            if (addPoints) {
                // Attribution de 5 points pour l'interaction avec une porte
                await addPoints(5);
            }

            if (onStatusChange) {
                onStatusChange();
            }
        } catch (error: any) {
            console.error('Error toggling door state:', error);

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
            alert('Erreur lors du changement d\'état de la porte: ' +
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
            console.log(`Updating door ${id} with new values`);

            const response = await updateObject(id, {
                nom: newName,
                coord_x: newX,
                coord_y: newY,
                consomation: newConsumption,
                connection: newConnection
            });

            console.log('Update successful:', response);
            if (onStatusChange) {
                onStatusChange();
            }
            setObjectToEdit(null);
        } catch (error: any) {
            console.error('Error updating door:', error);

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
                alert('Erreur lors de la mise à jour de la porte: ' +
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
            if (onStatusChange) {
                onStatusChange();
            }
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

    return (
        <div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow relative"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
                        <DoorClosed className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Portes</h3>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded dark:bg-blue-900 dark:text-blue-300">
                        {objects.length}
                    </span>
                    <button
                        onClick={handleAddClick}
                        className={`p-1.5 bg-blue-100 rounded-lg hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 transition-colors ${isHovering ? 'opacity-100' : 'opacity-70'}`}
                        aria-label="Ajouter une porte"
                        title="Ajouter une porte"
                    >
                        <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </button>
                </div>
            </div>

            {isEmpty ? (
                <div className="py-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                    <DoorClosed className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">Aucune porte connectée</p>
                    <button
                        className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                        onClick={handleAddClick}
                    >
                        <Plus className="h-4 w-4 mr-1" /> Ajouter une porte
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    {objects.map(door => (
                        <div key={door.id} className="relative">
                            {objectToEdit && objectToEdit.id === door.id ? (
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-medium text-blue-800 dark:text-blue-300">Modifier la porte</h4>
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
                                    </div>

                                    <div className="flex justify-end mt-4">
                                        <button
                                            onClick={() => handleSaveChanges(door.id)}
                                            disabled={isUpdating === door.id}
                                            className={`px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center ${isUpdating === door.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isUpdating === door.id ? (
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
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                                    <div className="flex justify-between items-center p-3">
                                        <div className="flex items-center">
                                            <div className={`p-1.5 rounded-full mr-2 ${door.etat === 'on' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                                {door.etat === 'on' ? (
                                                    <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                ) : (
                                                    <Unlock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                )}
                                            </div>                                            <div>
                                                <p className="font-medium text-gray-800 dark:text-white text-sm">{door.nom}</p>
                                                <div className="flex items-center mt-1">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${door.etat === 'on'
                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                        : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-400'}`}
                                                    >
                                                        {door.etat === 'on' ? 'Verrouillée' : 'Déverrouillée'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => handleInfoToggle(door.id)}
                                                className="p-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                                title="Informations"
                                            >
                                                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </button>
                                            <button
                                                onClick={() => handleToggleState(door.id, door.etat)}
                                                disabled={toggleLoading === door.id}
                                                className={`p-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors ${toggleLoading === door.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                title={door.etat === 'on' ? 'Déverrouiller' : 'Verrouiller'}
                                            >
                                                <ToggleLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </button>
                                            <button
                                                onClick={() => handleMenuToggle(door.id)}
                                                className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                title="Options"
                                            >
                                                <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                            </button>

                                            {activeMenu === door.id && (
                                                <div className="absolute right-0 top-auto mt-8 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-10">
                                                    <button
                                                        onClick={() => handleEditClick(door)}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >
                                                        <Pencil className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                                                        Modifier
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(door.id)}
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
                                    {showInfoId === door.id && (
                                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">État</p>
                                                    <p className="font-medium">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${door.etat === 'on'
                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                            : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-400'}`}>
                                                            {door.etat === 'on' ? 'Verrouillée' : 'Déverrouillée'}
                                                        </span>
                                                    </p>
                                                </div>                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Connexion</p>
                                                    <p className="font-medium text-gray-700 dark:text-gray-300">{door.connection || 'N/A'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Position</p>
                                                    <p className="font-medium text-gray-700 dark:text-gray-300">X: {door.coord_x}, Y: {door.coord_y}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Consommation</p>
                                                    <p className="font-medium text-gray-700 dark:text-gray-300">{door.consomation || 0} W</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Maintenance</p>
                                                    <p className={`text-xs font-medium ${door.maintenance === 'fonctionnel'
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                        }`}>
                                                        {door.maintenance === 'fonctionnel' ? 'Opérationnel' : 'En panne'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Durability indicator */}
                                            <div className="mt-3">
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Durabilité</p>
                                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{door.durabilité || 0}%</p>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                    <div
                                                        className={`h-1.5 rounded-full ${(door.durabilité || 0) > 70 ? 'bg-green-500' :
                                                            (door.durabilité || 0) > 30 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${door.durabilité || 0}%` }}
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

            {/* Modal de confirmation de suppression */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)}></div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4 relative z-10">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Confirmer la suppression
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Êtes-vous sûr de vouloir supprimer cette porte ? Cette action est irréversible.
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

export default Door;
