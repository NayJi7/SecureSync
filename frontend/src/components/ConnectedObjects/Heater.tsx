import React, { useState } from 'react';
import { ObjectType, HeaterObject } from './types';
import { Flame, Plus, ToggleLeft, MoreVertical, Pencil, Trash2, X } from 'lucide-react';
import { toggleObjectState, updateObject, deleteObject } from '../../services/objectService';

interface HeaterProps {
    objects: ObjectType[];
    onAddObject?: () => void;
    onStatusChange?: () => void; // Callback for when status changes
    addPoints?: (points: number) => Promise<void>; // Fonction pour ajouter des points à l'utilisateur
}

const Heater: React.FC<HeaterProps> = ({ objects, onAddObject, onStatusChange, addPoints }) => {
    const isEmpty = objects.length === 0;
    const [isHovering, setIsHovering] = useState(false);
    const [toggleLoading, setToggleLoading] = useState<number | null>(null);
    const [activeMenu, setActiveMenu] = useState<number | null>(null);
    const [objectToEdit, setObjectToEdit] = useState<ObjectType | null>(null);
    const [newX, setNewX] = useState<number>(0);
    const [newY, setNewY] = useState<number>(0);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [isUpdating, setIsUpdating] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [objectToDelete, setObjectToDelete] = useState<number | null>(null);

    const handleAddClick = () => {
        if (onAddObject) {
            onAddObject();
        } else {
            alert('Fonctionnalité à venir: Ajouter un chauffage');
        }
    };

    const handleToggleState = async (id: number, currentState: 'on' | 'off') => {
        try {
            setToggleLoading(id);
            const response = await toggleObjectState(id, currentState);
            console.log('Toggle successful:', response);
            
            // Ajouter des points à l'utilisateur pour chaque interaction
            if (addPoints) {
                // Attribution de 4 points pour l'interaction avec un chauffage
                await addPoints(4);
            }
            
            if (onStatusChange) {
                onStatusChange();
            }
        } catch (error: any) {
            console.error('Error toggling heater state:', error);
            alert('Erreur lors du changement d\'état du chauffage: ' +
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
            console.log(`Updating heater ${id} with coords: X=${newX}, Y=${newY}`);

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
            alert('Erreur lors de la suppression de l\'objet: ' +
                (error.response?.data?.message || 'Problème de connexion au serveur'));
        } finally {
            setIsDeleting(null);
            setShowDeleteModal(false);
            setObjectToDelete(null);
        }
    };

    // Custom icon component for flame
    const FlameSolidIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="#ff6b6b" />
        </svg>
    );

    return (
        <div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow relative"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg mr-3">
                        <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chauffages</h3>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-1 rounded dark:bg-orange-900 dark:text-orange-300">
                        {objects.length}
                    </span>
                    <button
                        onClick={handleAddClick}
                        className={`p-1.5 bg-orange-100 rounded-lg hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-800/50 transition-colors ${isHovering ? 'opacity-100' : 'opacity-70'}`}
                        aria-label="Ajouter un chauffage"
                        title="Ajouter un chauffage"
                    >
                        <Plus className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </button>
                </div>
            </div>

            {isEmpty ? (
                <div className="py-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                    <Flame className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">Aucun chauffage connecté</p>
                    <button
                        className="mt-2 text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline flex items-center"
                        onClick={handleAddClick}
                    >
                        <Plus className="h-4 w-4 mr-1" /> Ajouter un chauffage
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {objects.map(heater => (
                        <div key={heater.id} className="relative">
                            {objectToEdit && objectToEdit.id === heater.id ? (
                                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-medium text-orange-800 dark:text-orange-300">Modifier les coordonnées</h4>
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
                                            onClick={() => handleCoordinatesSave(heater.id)}
                                            disabled={isUpdating === heater.id}
                                            className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded flex items-center"
                                        >
                                            {isUpdating === heater.id ? (
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
                                        <div className={`p-2 rounded-full mr-3 ${heater.etat === 'on' ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-gray-100 dark:bg-gray-800/60'}`}>
                                            {heater.etat === 'on' ? (
                                                <FlameSolidIcon />
                                            ) : (
                                                <Flame className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200">{heater.nom}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Position: {heater.coord_x}, {heater.coord_y}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${heater.etat === 'on'
                                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                            {heater.etat === 'on' ? 'Actif' : 'Inactif'}
                                        </span>
                                        <button
                                            onClick={() => handleToggleState(heater.id, heater.etat)}
                                            disabled={toggleLoading === heater.id}
                                            className={`p-1.5 bg-orange-100 rounded-full hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-800/50 transition-colors ${toggleLoading === heater.id ? 'opacity-50' : ''}`}
                                            title={heater.etat === 'on' ? 'Désactiver' : 'Activer'}
                                        >
                                            <ToggleLeft className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                        </button>
                                        <div className="relative">
                                            <button
                                                onClick={() => handleMenuToggle(heater.id)}
                                                className="p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors"
                                                title="Options"
                                            >
                                                <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                            </button>
                                            {activeMenu === heater.id && (
                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-10">
                                                    <ul className="py-1">
                                                        <li>
                                                            <button
                                                                onClick={() => handleEditClick(heater)}
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5 mr-2 text-gray-500 dark:text-gray-400" />
                                                                Modifier les coordonnées
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button
                                                                onClick={() => handleDeleteClick(heater.id)}
                                                                disabled={isDeleting === heater.id}
                                                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5 mr-2 text-red-500 dark:text-red-400" />
                                                                {isDeleting === heater.id ? "Suppression..." : "Supprimer"}
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
            
            {/* Modal de confirmation de suppression */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)}></div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4 relative z-10">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Confirmer la suppression
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Êtes-vous sûr de vouloir supprimer ce chauffage ? Cette action est irréversible.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting !== null}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center transition-colors"
                            >
                                {isDeleting !== null ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Suppression...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Supprimer
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

export default Heater;
