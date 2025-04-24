import React, { useState } from 'react';
import { ObjectType, PanneauAffichageObject } from './types';
import { MonitorPlay, Plus, ToggleLeft, MoreVertical, Pencil, Trash2, X, MessageSquare } from 'lucide-react';
import { toggleObjectState, updateObject, deleteObject } from '../../services/objectService';

interface PanneauAffichageProps {
    objects: ObjectType[];
    onAddObject?: () => void;
    onStatusChange?: () => void;
    addPoints?: (points: number) => Promise<void>;
}

const PanneauAffichage: React.FC<PanneauAffichageProps> = ({ objects, onAddObject, onStatusChange, addPoints }) => {
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
    const [showMessageInput, setShowMessageInput] = useState<number | null>(null);
    const [newMessage, setNewMessage] = useState('');

    const handleAddClick = () => {
        if (onAddObject) {
            onAddObject();
        } else {
            alert("Fonctionnalité à venir: Ajouter un panneau d'affichage");
        }
    };

    const handleToggleState = async (id: number, currentState: 'on' | 'off') => {
        try {
            setToggleLoading(id);
            const response = await toggleObjectState(id, currentState);
            console.log('Toggle successful:', response);

            if (addPoints) {
                await addPoints(3);
            }

            if (onStatusChange) {
                onStatusChange();
            }
        } catch (error: any) {
            console.error("Error toggling display panel state:", error);
            alert("Erreur lors du changement d'état du panneau d'affichage: " +
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
            setShowMessageInput(null);
        }
    };

    const handleEditClick = (object: ObjectType) => {
        setObjectToEdit(object);
        setNewX(object.coord_x);
        setNewY(object.coord_y);
        setActiveMenu(null);
    };

    const handleMessageClick = (id: number) => {
        setShowMessageInput(id);
        setActiveMenu(null);
    };

    const handleMessageSave = async (id: number) => {
        try {
            if (!newMessage.trim()) {
                alert('Veuillez entrer un message');
                return;
            }

            setIsUpdating(id);
            const response = await updateObject(id, { valeur_actuelle: newMessage });
            console.log('Message update successful:', response);
            if (onStatusChange) {
                onStatusChange();
            }
            setShowMessageInput(null);
            setNewMessage('');
        } catch (error: any) {
            console.error('Error updating message:', error);
            alert("Erreur lors de la mise à jour du message: " +
                (error.response?.data?.message || 'Problème de connexion au serveur'));
        } finally {
            setIsUpdating(null);
        }
    };

    const handleCoordinatesSave = async (id: number) => {
        try {
            if (isNaN(newX) || isNaN(newY)) {
                alert('Les coordonnées doivent être des nombres valides');
                return;
            }

            setIsUpdating(id);
            console.log(`Updating display panel ${id} with coords: X=${newX}, Y=${newY}`);

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

            alert('Erreur lors de la mise à jour des coordonnées: ' +
                (error.friendlyMessage || error.response?.data?.detail || 'Problème de connexion au serveur'));
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
            alert("Erreur lors de la suppression du panneau d'affichage: " +
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
                        <Plus className="h-4 w-4 mr-1" /> Ajouter un panneau d'affichage
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {objects.map(panel => (
                        <div key={panel.id} className="relative">
                            {objectToEdit?.id === panel.id ? (
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
                                            onClick={() => handleCoordinatesSave(panel.id)}
                                            disabled={isUpdating === panel.id}
                                            className={`px-3 py-1.5 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors ${isUpdating === panel.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isUpdating === panel.id ? 'Enregistrement...' : 'Enregistrer'}
                                        </button>
                                    </div>
                                </div>
                            ) : showMessageInput === panel.id ? (
                                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-inner border border-gray-200 dark:border-gray-600">
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
                                            onClick={() => handleMessageSave(panel.id)}
                                            disabled={isUpdating === panel.id}
                                            className={`px-3 py-1.5 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors ${isUpdating === panel.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isUpdating === panel.id ? 'Enregistrement...' : 'Enregistrer'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <div className="flex items-center">
                                        <div className={`p-2 rounded-full mr-3 ${panel.etat === 'on' ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-gray-100 dark:bg-gray-800/60'}`}>
                                            <MonitorPlay className={`h-4 w-4 ${panel.etat === 'on' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200">{panel.nom}</p>
                                            <div className="flex space-x-3 mt-1">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Position: {panel.coord_x}, {panel.coord_y}
                                                </p>
                                            </div>
                                            {panel.etat === 'on' && panel.valeur_actuelle && (
                                                <div className="mt-2 p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-md">
                                                    <p className="text-sm text-indigo-800 dark:text-indigo-200 font-medium">
                                                        {panel.valeur_actuelle.toString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {panel.etat === 'on' && (
                                            <button
                                                onClick={() => handleMessageClick(panel.id)}
                                                className="p-1.5 bg-indigo-100 rounded-full hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/50 transition-colors"
                                                title="Modifier le message"
                                            >
                                                <MessageSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                            </button>
                                        )}
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${panel.etat === 'on'
                                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                            {panel.etat === 'on' ? 'Actif' : 'Inactif'}
                                        </span>
                                        <button
                                            onClick={() => handleToggleState(panel.id, panel.etat)}
                                            disabled={toggleLoading === panel.id}
                                            className={`p-1.5 bg-indigo-100 rounded-full hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/50 transition-colors ${toggleLoading === panel.id ? 'opacity-50' : ''}`}
                                            title={panel.etat === 'on' ? 'Désactiver' : 'Activer'}
                                        >
                                            <ToggleLeft className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        </button>

                                        <div className="relative">
                                            <button
                                                onClick={() => handleMenuToggle(panel.id)}
                                                className="p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors"
                                                title="Options"
                                            >
                                                <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                            </button>
                                            {activeMenu === panel.id && (
                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-10">
                                                    <button
                                                        onClick={() => handleEditClick(panel)}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >
                                                        <Pencil className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                                                        Modifier la position
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteClick(panel.id)}
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