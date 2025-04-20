import React, { useState } from 'react';
import { ObjectType, CameraObject } from './types';
import { Video, VideoOff, Plus, ToggleLeft, MoreVertical, Pencil, Trash2, X } from 'lucide-react';
import { toggleObjectState, updateObject, deleteObject } from '../../services/objectService';

interface CameraProps {
    objects: ObjectType[];
    onAddObject?: () => void;
    onStatusChange?: () => void; // Callback for when status changes
}

const Camera: React.FC<CameraProps> = ({ objects, onAddObject, onStatusChange }) => {
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
            alert('Fonctionnalité à venir: Ajouter une caméra');
        }
    };

    const handleToggleState = async (id: number, currentState: 'on' | 'off') => {
        try {
            setToggleLoading(id);
            const response = await toggleObjectState(id, currentState);
            console.log('Toggle successful:', response);
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
            console.log(`Updating camera ${id} with coords: X=${newX}, Y=${newY}`);

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
                alert('Erreur lors de la suppression de l\'objet: ' +
                    (error.response?.data?.message || 'Problème de connexion au serveur'));
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
                <div className="space-y-3">
                    {objects.map(camera => (
                        <div key={camera.id} className="relative">
                            {objectToEdit && objectToEdit.id === camera.id ? (
                                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-medium text-purple-800 dark:text-purple-300">Modifier les coordonnées</h4>
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
                                            onClick={() => handleCoordinatesSave(camera.id)}
                                            disabled={isUpdating === camera.id}
                                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded flex items-center"
                                        >
                                            {isUpdating === camera.id ? (
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
                                        <div className={`p-2 rounded-full mr-3 ${camera.etat === 'on' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-800/60'}`}>
                                            {camera.etat === 'on' ? (
                                                <Video className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                            ) : (
                                                <VideoOff className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200">{camera.nom}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Position: {camera.coord_x}, {camera.coord_y}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${camera.etat === 'on'
                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                            {camera.etat === 'on' ? 'Active' : 'Inactive'}
                                        </span>
                                        <button
                                            onClick={() => handleToggleState(camera.id, camera.etat)}
                                            disabled={toggleLoading === camera.id}
                                            className={`p-1.5 bg-purple-100 rounded-full hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-800/50 transition-colors ${toggleLoading === camera.id ? 'opacity-50' : ''}`}
                                            title={camera.etat === 'on' ? 'Désactiver' : 'Activer'}
                                        >
                                            <ToggleLeft className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                        </button>
                                        <div className="relative">
                                            <button
                                                onClick={() => handleMenuToggle(camera.id)}
                                                className="p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors"
                                                title="Options"
                                            >
                                                <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                            </button>
                                            {activeMenu === camera.id && (
                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-10">
                                                    <ul className="py-1">
                                                        <li>
                                                            <button
                                                                onClick={() => handleEditClick(camera)}
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5 mr-2 text-gray-500 dark:text-gray-400" />
                                                                Modifier les coordonnées
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button
                                                                onClick={() => handleDeleteClick(camera.id)}
                                                                disabled={isDeleting === camera.id}
                                                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5 mr-2 text-red-500 dark:text-red-400" />
                                                                {isDeleting === camera.id ? "Suppression..." : "Supprimer"}
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

export default Camera;
