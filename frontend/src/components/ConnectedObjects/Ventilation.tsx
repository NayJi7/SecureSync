import React, { useState } from 'react';
import { ObjectType, VentilationObject } from './types';
import { Wind, Plus, ToggleLeft, MoreVertical, Pencil, Trash2, X, ChevronUp, ChevronDown } from 'lucide-react';
import { toggleObjectState, updateObject, deleteObject } from '../../services/objectService';

interface VentilationProps {
    objects: ObjectType[];
    onAddObject?: () => void;
    onStatusChange?: () => void;
    addPoints?: (points: number) => Promise<void>;
}

const Ventilation: React.FC<VentilationProps> = ({ objects, onAddObject, onStatusChange, addPoints }) => {
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
            alert('Fonctionnalité à venir: Ajouter une ventilation');
        }
    };

    const handleToggleState = async (id: number, currentState: 'on' | 'off') => {
        try {
            setToggleLoading(id);
            const response = await toggleObjectState(id, currentState);
            console.log('Toggle successful:', response);

            if (addPoints) {
                await addPoints(4);
            }

            if (onStatusChange) {
                onStatusChange();
            }
        } catch (error: any) {
            console.error('Error toggling ventilation state:', error);
            alert('Erreur lors du changement d\'état de la ventilation: ' +
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
            if (isNaN(newX) || isNaN(newY)) {
                alert('Les coordonnées doivent être des nombres valides');
                return;
            }

            setIsUpdating(id);
            console.log(`Updating ventilation ${id} with coords: X=${newX}, Y=${newY}`);

            const response = await updateObject(id, { coord_x: newX, coord_y: newY });
            console.log('Update successful:', response);
            if (onStatusChange) {
                onStatusChange();
            }
            setObjectToEdit(null);
        } catch (error: any) {
            console.error('Error updating coordinates:', error);

            if (error.response?.status === 401) {
                alert('Session expirée. Veuillez vous reconnecter.');
                localStorage.removeItem('authToken');
                localStorage.removeItem('sessionToken');
                window.location.href = '/login';
                return;
            }

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

    // Function to update the ventilation level
    const updateVentilationLevel = async (id: number, currentLevel: string | number, increment: boolean) => {
        try {
            // Convert current level to number, default to 1 if not set
            const numLevel = Number(currentLevel) || 1;

            // Calculate new level (1-3 range)
            let newLevel = increment ? Math.min(numLevel + 1, 3) : Math.max(numLevel - 1, 1);

            setIsUpdating(id);
            const response = await updateObject(id, { valeur_actuelle: newLevel });
            console.log('Ventilation level update successful:', response);
            if (onStatusChange) {
                onStatusChange();
            }
        } catch (error: any) {
            console.error('Error updating ventilation level:', error);
            alert('Erreur lors de la mise à jour du niveau de ventilation: ' +
                (error.response?.data?.message || 'Problème de connexion au serveur'));
        } finally {
            setIsUpdating(null);
        }
    };

    // Get the icon based on current ventilation level
    const getVentilationIcon = (level: number) => {
        const baseClass = "h-4 w-4";
        switch (level) {
            case 3:
                return <Wind className={`${baseClass} animate-pulse`} style={{ animationDuration: '0.5s' }} />;
            case 2:
                return <Wind className={`${baseClass} animate-pulse`} style={{ animationDuration: '1s' }} />;
            default: // level 1 or fallback
                return <Wind className={`${baseClass} animate-pulse`} style={{ animationDuration: '1.5s' }} />;
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
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg mr-3">
                        <Wind className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ventilation</h3>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded dark:bg-green-900 dark:text-green-300">
                        {objects.length}
                    </span>
                    <button
                        onClick={handleAddClick}
                        className={`p-1.5 bg-green-100 rounded-lg hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-800/50 transition-colors ${isHovering ? 'opacity-100' : 'opacity-70'}`}
                        aria-label="Ajouter une ventilation"
                        title="Ajouter une ventilation"
                    >
                        <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </button>
                </div>
            </div>

            {isEmpty ? (
                <div className="py-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                    <Wind className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">Aucune ventilation connectée</p>
                    <button
                        className="mt-2 text-sm font-medium text-green-600 dark:text-green-400 hover:underline flex items-center"
                        onClick={handleAddClick}
                    >
                        <Plus className="h-4 w-4 mr-1" /> Ajouter une ventilation
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {objects.map(ventilation => (
                        <div key={ventilation.id} className="relative">
                            {objectToEdit?.id === ventilation.id ? (
                                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-inner border border-gray-200 dark:border-gray-600">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-medium text-gray-800 dark:text-gray-200">Modifier la position</h4>
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
                                            onClick={() => handleCoordinatesSave(ventilation.id)}
                                            disabled={isUpdating === ventilation.id}
                                            className={`px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors ${isUpdating === ventilation.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isUpdating === ventilation.id ? 'Enregistrement...' : 'Enregistrer'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <div className="flex items-center">
                                        <div className={`p-2 rounded-full mr-3 ${ventilation.etat === 'on' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800/60'}`}>
                                            {ventilation.etat === 'on'
                                                ? getVentilationIcon(Number(ventilation.valeur_actuelle) || 1)
                                                : <Wind className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                            }
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200">{ventilation.nom}</p>
                                            <div className="flex space-x-3 mt-1">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Position: {ventilation.coord_x}, {ventilation.coord_y}
                                                </p>
                                                {ventilation.etat === 'on' && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Niveau: <span className="font-medium">
                                                            {ventilation.valeur_actuelle || 1}/3
                                                        </span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {ventilation.etat === 'on' && (
                                            <div className="flex flex-col">
                                                <button
                                                    onClick={() => updateVentilationLevel(ventilation.id, ventilation.valeur_actuelle || 1, true)}
                                                    disabled={Number(ventilation.valeur_actuelle) >= 3}
                                                    className={`p-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-t ${Number(ventilation.valeur_actuelle) >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    title="Augmenter niveau"
                                                >
                                                    <ChevronUp className="h-3 w-3 text-gray-700 dark:text-gray-300" />
                                                </button>
                                                <button
                                                    onClick={() => updateVentilationLevel(ventilation.id, ventilation.valeur_actuelle || 1, false)}
                                                    disabled={Number(ventilation.valeur_actuelle) <= 1}
                                                    className={`p-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-b ${Number(ventilation.valeur_actuelle) <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    title="Diminuer niveau"
                                                >
                                                    <ChevronDown className="h-3 w-3 text-gray-700 dark:text-gray-300" />
                                                </button>
                                            </div>
                                        )}
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${ventilation.etat === 'on'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                            {ventilation.etat === 'on' ? 'Actif' : 'Inactif'}
                                        </span>
                                        <button
                                            onClick={() => handleToggleState(ventilation.id, ventilation.etat)}
                                            disabled={toggleLoading === ventilation.id}
                                            className={`p-1.5 bg-green-100 rounded-full hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-800/50 transition-colors ${toggleLoading === ventilation.id ? 'opacity-50' : ''}`}
                                            title={ventilation.etat === 'on' ? 'Désactiver' : 'Activer'}
                                        >
                                            <ToggleLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        </button>

                                        <div className="relative">
                                            <button
                                                onClick={() => handleMenuToggle(ventilation.id)}
                                                className="p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors"
                                                title="Options"
                                            >
                                                <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                            </button>
                                            {activeMenu === ventilation.id && (
                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-10">
                                                    <button
                                                        onClick={() => handleEditClick(ventilation)}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >
                                                        <Pencil className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                                                        Modifier la position
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteClick(ventilation.id)}
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

            {/* Modal de confirmation de suppression */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)}></div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4 relative z-10">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Confirmer la suppression
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Êtes-vous sûr de vouloir supprimer cette ventilation ? Cette action est irréversible.
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

export default Ventilation; 