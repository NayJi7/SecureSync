import React, { useState } from 'react';
import { ObjectType, DoorObject } from './types';
import { Lock, Unlock, Plus, DoorClosed, ToggleLeft, MoreVertical, Pencil, Trash2, X } from 'lucide-react';
import { toggleObjectState, updateObject, deleteObject } from '../../services/objectService';

interface DoorProps {
    objects: ObjectType[];
    onAddObject?: () => void;
    onStatusChange?: () => void; // Callback for when status changes
}

const Door: React.FC<DoorProps> = ({ objects, onAddObject, onStatusChange }) => {
    const isEmpty = objects.length === 0;
    const [isHovering, setIsHovering] = useState(false);
    const [toggleLoading, setToggleLoading] = useState<number | null>(null);
    const [activeMenu, setActiveMenu] = useState<number | null>(null);
    const [objectToEdit, setObjectToEdit] = useState<ObjectType | null>(null);
    const [newX, setNewX] = useState<number>(0);
    const [newY, setNewY] = useState<number>(0);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [isUpdating, setIsUpdating] = useState<number | null>(null);

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
        }
    };

    const handleEditClick = (object: ObjectType) => {
        setObjectToEdit(object);
        setNewX(object.coord_x);
        setNewY(object.coord_y);
        setActiveMenu(null);
    };

    const handleCoordinatesSave = async (id: number) => {
        try {
            // Validate coordinates
            if (isNaN(newX) || isNaN(newY)) {
                alert('Les coordonnées doivent être des nombres valides');
                return;
            }

            setIsUpdating(id);
            console.log(`Updating object ${id} with coords: X=${newX}, Y=${newY}`);

            const response = await updateObject(id, { coord_x: newX, coord_y: newY });
            console.log('Update successful:', response);
            if (onStatusChange) {
                onStatusChange();
            }
            setObjectToEdit(null);
        } catch (error: any) {
            console.error('Error updating coordinates:', error);

            // Special handling for authentication errors
            if (error.response?.status === 401) {
                alert('Session expirée. Veuillez vous reconnecter.');
                // Clear any stale tokens that may be causing the JWT error
                localStorage.removeItem('authToken');
                localStorage.removeItem('sessionToken');
                window.location.href = '/login'; // Redirect to login page
                return;
            }

            // Handle validation errors (400 Bad Request)
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
                alert('Erreur lors de la mise à jour des coordonnées: ' +
                    (error.friendlyMessage || error.response?.data?.detail || 'Problème de connexion au serveur'));
            }
        } finally {
            setIsUpdating(null);
        }
    };

    const handleDeleteClick = async (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet objet ?')) {
            try {
                setIsDeleting(id);
                const response = await deleteObject(id);
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
            }
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
                <div className="space-y-3">
                    {objects.map(door => (
                        <div key={door.id} className="relative">
                            {objectToEdit && objectToEdit.id === door.id ? (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-medium text-blue-800 dark:text-blue-300">Modifier les coordonnées</h4>
                                        <button
                                            onClick={() => setObjectToEdit(null)}
                                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-3">
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
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => handleCoordinatesSave(door.id)}
                                            disabled={isUpdating === door.id}
                                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded flex items-center"
                                        >
                                            {isUpdating === door.id ? (
                                                <span>Enregistrement...</span>
                                            ) : (
                                                <>
                                                    <Pencil className="h-3 w-3 mr-1" />
                                                    Enregistrer
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <div className="flex items-center">
                                        <div className={`p-2 rounded-full mr-3 ${door.etat === 'on' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                            {door.etat === 'on' ? (
                                                <Lock className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            ) : (
                                                <Unlock className="h-4 w-4 text-red-600 dark:text-red-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200">{door.nom}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Position: {door.coord_x}, {door.coord_y}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${door.etat === 'on'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                            }`}>
                                            {door.etat === 'on' ? 'Activé' : 'Désactivé'}
                                        </span>
                                        <button
                                            onClick={() => handleToggleState(door.id, door.etat)}
                                            disabled={toggleLoading === door.id}
                                            className={`p-1.5 bg-blue-100 rounded-full hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 transition-colors ${toggleLoading === door.id ? 'opacity-50' : ''}`}
                                            title={door.etat === 'on' ? 'Ouvrir la porte' : 'Fermer la porte'}
                                        >
                                            <ToggleLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </button>
                                        <div className="relative">
                                            <button
                                                onClick={() => handleMenuToggle(door.id)}
                                                className="p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors"
                                                title="Options"
                                            >
                                                <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                            </button>
                                            {activeMenu === door.id && (
                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-10">
                                                    <ul className="py-1">
                                                        <li>
                                                            <button
                                                                onClick={() => handleEditClick(door)}
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5 mr-2 text-gray-500 dark:text-gray-400" />
                                                                Modifier les coordonnées
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button
                                                                onClick={() => handleDeleteClick(door.id)}
                                                                disabled={isDeleting === door.id}
                                                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5 mr-2 text-red-500 dark:text-red-400" />
                                                                {isDeleting === door.id ? "Suppression..." : "Supprimer"}
                                                            </button>
                                                        </li>
                                                    </ul>
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
        </div>
    );
};

export default Door;
