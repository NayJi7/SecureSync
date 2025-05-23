import React, { useEffect, useState, useRef } from 'react';
import { Map, MapPin, X, PencilIcon, Save, ToggleLeft, ArrowLeft, MoveIcon, Trash2, AlertTriangle, Wrench } from 'lucide-react';
import { DoorClosed, Lightbulb, Video, Thermometer, Wind, MonitorPlay } from 'lucide-react';
import VideoView from './VideoView';
import { useDevice } from '../../hooks/use-device';
import { ObjectType, ObjectTypeName } from '../ConnectedObjects/types';
import { getObjects, createObject, updateObject, toggleObjectState, deleteObject } from '../../services/objectService';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import useAuth from '../../hooks/useAuth';
import Swal from 'sweetalert2';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PlanComponentProps {
    prisonId?: string;
    addPoints?: (points: number) => Promise<void>;
}

const PlanComponent: React.FC<PlanComponentProps> = ({ prisonId, addPoints }) => {    
    const currentPrisonId = prisonId || localStorage.getItem('userPrison') || localStorage.getItem('selectedPrison');
    const [show3D, setShow3D] = useState(false);
    const [objects, setObjects] = useState<ObjectType[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedObject, setSelectedObject] = useState<ObjectType | null>(null);
    const [contextMenuPosition, setContextMenuPosition] = useState<{x: number, y: number, pageX: number, pageY: number} | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [toggleLoading, setToggleLoading] = useState<number | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [objectToDelete, setObjectToDelete] = useState<ObjectType | null>(null);
    // États pour la réparation des objets en panne
    const [repairModalObject, setRepairModalObject] = useState<ObjectType | null>(null);
    const [repairInProgress, setRepairInProgress] = useState<number | null>(null);
    const [repairProgress, setRepairProgress] = useState(0);
    const [repairCountdown, setRepairCountdown] = useState(5);
    const popupRef = useRef<HTMLDivElement>(null);
    const planRef = useRef<HTMLDivElement>(null);
    
    // États pour le drag and drop
    const [draggedObject, setDraggedObject] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState<{x: number, y: number}>({ x: 0, y: 0 });
    
    // États pour le formulaire d'édition
    const [editForm, setEditForm] = useState({
        name: '',
        x: 50,
        y: 50,
        consumption: 0,
        connection: 'wifi' as 'wifi' | 'filaire'
    });
    
    // Coordonnées maximales dans le système d'objets
    const MAX_X_COORD = 100;
    const MAX_Y_COORD = 100;
    
    // Aspect ratio du plan pour maintenir les proportions
    const PLAN_ASPECT_RATIO = 16/9; // Rapport largeur/hauteur
    
    // Récupération du contexte d'authentification
    const { user } = useAuth();
    
    // Fonction pour vérifier si l'utilisateur a les permissions pour modifier/supprimer
    const hasEditDeletePermission = () => {
        const userRole = user?.role;
        const userPoints = user?.points || 0;
        
        return (
            // Si l'utilisateur est un admin, gérant ou gestionnaire
            (userRole === 'admin' || userRole === 'gerant' || userRole === 'gestionnaire') ||
            // Ou si c'est un employé avec plus de 100 points
            (userRole === 'employe' && userPoints >= 100)
        );
    };

    // Fonction pour récupérer les objets connectés
    useEffect(() => {
        let interval: NodeJS.Timeout;

        const fetchObjects = async () => {
            try {
                const response = await getObjects(currentPrisonId || undefined);
                const filteredObjects = currentPrisonId
                    ? response.data.filter(obj => obj.Prison_id === currentPrisonId)
                    : response.data;
                setObjects(filteredObjects);
                setLoading(false);
            } catch (error) {
                console.error('Erreur lors du chargement des objets:', error);
                setLoading(false);
            }
        };

        fetchObjects();
        interval = setInterval(fetchObjects, 5000);

        return () => clearInterval(interval);
    }, [currentPrisonId]);

    // Fonction pour obtenir l'icône correspondant au type d'objet
    const getObjectIcon = (type: string, etat: 'on' | 'off') => {
        const iconProps = {
            className: "h-5 w-5",
            strokeWidth: 2
        };
        
        switch(type) {
            case 'porte':
                return <DoorClosed {...iconProps} className={`h-6 w-6 ${etat === 'on' ? 'text-blue-600' : 'text-gray-500'}`} />;
            case 'lumiere':
                return <Lightbulb {...iconProps} className={`h-6 w-6 ${etat === 'on' ? 'text-yellow-400' : 'text-gray-500'}`} />;
            case 'camera':
                return <Video {...iconProps} className={`h-6 w-6 ${etat === 'on' ? 'text-purple-600' : 'text-gray-500'}`} />;
            case 'thermostat':
                return <Thermometer {...iconProps} className={`h-6 w-6 ${etat === 'on' ? 'text-red-500' : 'text-gray-500'}`} />;
            case 'ventilation':
                return <Wind {...iconProps} className={`h-6 w-6 ${etat === 'on' ? 'text-green-500' : 'text-gray-500'}`} />;
            case "paneau d'affichage":
                return <MonitorPlay {...iconProps} className={`h-6 w-6 ${etat === 'on' ? 'text-indigo-500' : 'text-gray-500'}`} />;
            default:
                return <MapPin {...iconProps} className="h-6 w-6 text-gray-500" />;
        }
    };

    // Fonction pour obtenir la couleur de fond du point en fonction du type d'objet
    const getObjectColor = (type: string) => {
        switch(type) {
            case 'porte': return 'bg-blue-100';
            case 'lumiere': return 'bg-yellow-100';
            case 'camera': return 'bg-purple-100';
            case 'thermostat': return 'bg-red-100';
            case 'ventilation': return 'bg-green-100';
            case "paneau d'affichage": return 'bg-indigo-100';
            default: return 'bg-gray-100';
        }
    };

    // Fonction pour convertir les coordonnées des objets en positions sur l'écran
    const getPosition = (x: number, y: number) => {
        const percentX = (x / MAX_X_COORD) * 100;
        const percentY = (y / MAX_Y_COORD) * 100;
        
        return {
            left: `${percentX}%`,
            top: `${percentY}%`,
        };
    };

    // Fonction pour gérer le clic sur un objet
    const handleObjectClick = (obj: ObjectType) => {
        if (!isDragging) {
            setSelectedObject(obj);
            // Réinitialiser le mode édition quand on change d'objet
            setIsEditing(false);
        }
    };
    
    // Fonctions pour le drag and drop
    const handleMouseDown = (e: React.MouseEvent, obj: ObjectType) => {
        e.stopPropagation();
        
        // Vérifier si l'utilisateur a les droits suffisants
        if (!hasEditDeletePermission()) {
            Swal.fire({
                title: 'Permission insuffisante',
                text: 'Vous devez être gestionnaire, gérant ou avoir au moins 100 points pour déplacer cet objet.',
                icon: 'warning',
                confirmButtonText: 'Compris'
            });
            return;
        }
        
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left - rect.width / 2,
            y: e.clientY - rect.top - rect.height / 2
        });
        setDraggedObject(obj.id);
        setIsDragging(true);
    };
    
    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && draggedObject !== null && planRef.current) {
            e.preventDefault();
            
            // Récupérer les dimensions du conteneur
            const rect = planRef.current.getBoundingClientRect();
            
            // Calculer la position relative du curseur à l'intérieur du conteneur (en pourcentage)
            const x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
            const y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;
            
            // Convertir en coordonnées du système d'objets (0-100)
            const objX = Math.max(0, Math.min(MAX_X_COORD, Math.round((x / 100) * MAX_X_COORD)));
            const objY = Math.max(0, Math.min(MAX_Y_COORD, Math.round((y / 100) * MAX_Y_COORD)));
            
            // Mettre à jour temporairement la position de l'objet dans le state
            setObjects(prevObjects => 
                prevObjects.map(obj => 
                    obj.id === draggedObject
                        ? { ...obj, coord_x: objX, coord_y: objY }
                        : obj
                )
            );
        }
    };
    
    const handleMouseUp = async () => {
        if (isDragging && draggedObject !== null) {
            // Trouver l'objet dans le state actuel
            const obj = objects.find(o => o.id === draggedObject);
            
            if (obj) {
                try {
                    // Mettre à jour la position de l'objet dans la base de données
                    await updateObject(obj.id, {
                        coord_x: obj.coord_x,
                        coord_y: obj.coord_y
                    });
                    
                    // Si l'objet déplacé est l'objet sélectionné, mettre à jour les infos
                    if (selectedObject?.id === obj.id) {
                        setSelectedObject(obj);
                    }
                } catch (error) {
                    console.error('Erreur lors de la mise à jour de la position:', error);
                    // En cas d'erreur, recharger les objets pour revenir à l'état précédent
                    const response = await getObjects(currentPrisonId || undefined);
                    const filteredObjects = currentPrisonId
                        ? response.data.filter(o => o.Prison_id === currentPrisonId)
                        : response.data;
                    setObjects(filteredObjects);
                }
            }
            
            // Réinitialiser les états de drag
            setDraggedObject(null);
            setIsDragging(false);
        }
    };

    // Fonction pour formater l'état de maintenance
    const formatMaintenanceState = (state?: string) => {
        if (!state) return 'Non spécifié';
        return state === 'fonctionnel' ? 'Fonctionnel' : 'En panne';
    };
    
    // Fonction pour passer en mode édition
    const handleEditClick = (e: React.MouseEvent, obj: ObjectType) => {
        e.stopPropagation(); // Empêcher la propagation du clic
        
        // Vérifier si l'utilisateur a les droits suffisants
        if (!hasEditDeletePermission()) {
            Swal.fire({
                title: 'Permission insuffisante',
                text: 'Vous devez être gestionnaire, gérant ou avoir au moins 100 points pour modifier cet objet.',
                icon: 'warning',
                confirmButtonText: 'Compris'
            });
            return;
        }
        
        setEditForm({
            name: obj.nom,
            x: obj.coord_x,
            y: obj.coord_y,
            consumption: obj.consomation || 0,
            connection: obj.connection as 'wifi' | 'filaire' || 'wifi'
        });
        setIsEditing(true);
    };
    
    // Fonction pour quitter le mode édition
    const handleCancelEdit = (e: React.MouseEvent) => {
        e.stopPropagation(); // Empêcher la propagation du clic
        setIsEditing(false);
    };
    
    // Fonction pour enregistrer les modifications
    const handleSaveChanges = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation(); // Empêcher la propagation du clic
        
        try {
            setIsUpdating(true);
            
            await updateObject(id, {
                nom: editForm.name,
                coord_x: editForm.x,
                coord_y: editForm.y,
                consomation: editForm.consumption,
                connection: editForm.connection
            });
            
            // Rafraîchir la liste des objets
            const response = await getObjects(currentPrisonId || undefined);
            const filteredObjects = currentPrisonId
                ? response.data.filter(obj => obj.Prison_id === currentPrisonId)
                : response.data;
            
            setObjects(filteredObjects);
            
            // Mettre à jour l'objet sélectionné avec les nouvelles infos
            const updatedObj = filteredObjects.find(obj => obj.id === id);
            if (updatedObj) {
                setSelectedObject(updatedObj);
            }
            
            setIsEditing(false);
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'objet:', error);
        } finally {
            setIsUpdating(false);
        }
    };
    
    // Fonction pour activer/désactiver un objet
    const handleToggleState = async (e: React.MouseEvent, obj: ObjectType) => {
        e.stopPropagation(); // Empêcher la propagation du clic
        
        try {
            // Vérifier si l'objet est en panne ou a une durabilité à 0
            if (obj.etat === 'off' && (
                (obj.durabilité !== undefined && obj.durabilité <= 0) || 
                obj.maintenance === 'en panne')
            ) {
                // Afficher le dialogue de réparation au lieu de basculer l'état
                setRepairModalObject(obj);
                return;
            }
            
            setToggleLoading(obj.id);
            
            await toggleObjectState(obj.id, obj.etat);
            
            // Rafraîchir la liste des objets
            const response = await getObjects(currentPrisonId || undefined);
            const filteredObjects = currentPrisonId
                ? response.data.filter(obj => obj.Prison_id === currentPrisonId)
                : response.data;
            
            setObjects(filteredObjects);
            
            // Mettre à jour l'objet sélectionné avec les nouvelles infos
            const updatedObj = filteredObjects.find(o => o.id === obj.id);
            if (updatedObj) {
                setSelectedObject(updatedObj);
            }
        } catch (error: any) {
            console.error('Erreur lors du changement d\'état de l\'objet:', error);
        } finally {
            setToggleLoading(null);
        }
    };
    
    // Fonction pour gérer le clic sur le bouton de suppression (ouverture du dialogue)
    const handleDeleteObject = (e: React.MouseEvent, obj: ObjectType) => {
        e.stopPropagation(); // Empêcher la propagation du clic
        
        // Vérifier si l'utilisateur a les droits suffisants
        if (!hasEditDeletePermission()) {
            Swal.fire({
                title: 'Permission insuffisante',
                text: 'Vous devez être gestionnaire, gérant ou avoir au moins 100 points pour supprimer cet objet.',
                icon: 'warning',
                confirmButtonText: 'Compris'
            });
            return;
        }
        
        setObjectToDelete(obj);
        setDeleteDialogOpen(true);
    };

    // Fonction pour confirmer et effectuer la suppression d'un objet
    const confirmDeleteObject = async () => {
        if (!objectToDelete) return;
        
        try {
            await deleteObject(objectToDelete.id);
            
            // Désélectionner l'objet si c'est celui qui est actuellement sélectionné
            if (selectedObject && selectedObject.id === objectToDelete.id) {
                setSelectedObject(null);
            }
            
            // Rafraîchir la liste des objets
            const response = await getObjects(currentPrisonId || undefined);
            const filteredObjects = currentPrisonId
                ? response.data.filter(o => o.Prison_id === currentPrisonId)
                : response.data;
            
            setObjects(filteredObjects);
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'objet:', error);
        } finally {
            setDeleteDialogOpen(false);
            setObjectToDelete(null);
        }
    };
    
    // Fonction pour réparer un objet en panne
    const handleRepair = async (objectId: number) => {
        try {
            // Initialiser les états de réparation
            setRepairInProgress(objectId);
            setRepairProgress(0);
            setRepairCountdown(6);
            
            // Créer un intervalle qui s'exécute chaque seconde pour mettre à jour le pourcentage et le compte à rebours
            const intervalId = setInterval(() => {
                setRepairProgress(prev => {
                    const newProgress = prev + (100 / 6); // Augmente d'environ 16,67% chaque seconde
                    return Math.min(newProgress, 100);
                });
                
                setRepairCountdown(prev => {
                    const newCountdown = prev - 1;
                    return Math.max(newCountdown, 0);
                });
            }, 1000);
            
            // Attendre 6 secondes avant d'appeler l'API de réparation
            await new Promise(resolve => setTimeout(resolve, 6000));
            
            // Effacer l'intervalle
            clearInterval(intervalId);
            
            // Import et appel de l'API de réparation
            const { repairObject } = await import('../../services/objectService');
            const response = await repairObject(objectId);
            console.log('Réparation réussie:', response);
            
            // Rafraîchir la liste des objets
            const objectsResponse = await getObjects(currentPrisonId || undefined);
            const filteredObjects = currentPrisonId
                ? objectsResponse.data.filter(obj => obj.Prison_id === currentPrisonId)
                : objectsResponse.data;
            setObjects(filteredObjects);
            
            // Mettre à jour l'objet sélectionné si c'était celui qui était en réparation
            if (selectedObject && selectedObject.id === objectId) {
                const updatedObj = filteredObjects.find(obj => obj.id === objectId);
                if (updatedObj) {
                    setSelectedObject(updatedObj);
                }
            }
        } catch (error: any) {
            console.error('Erreur lors de la réparation de l\'objet:', error);
            
            // Gestion spéciale pour les erreurs d'authentification
            if (error.response?.status === 401) {
                alert('Session expirée. Veuillez vous reconnecter.');
                // Effacer tous les tokens périmés qui pourraient causer l'erreur JWT
                localStorage.removeItem('authToken');
                localStorage.removeItem('sessionToken');
                window.location.href = '/login'; // Rediriger vers la page de connexion
                return;
            }
            
            // Gestion générique des erreurs
            alert('Erreur lors de la réparation de l\'objet: ' +
                (error.friendlyMessage || error.response?.data?.detail || 'Problème de connexion au serveur'));
        } finally {
            // Réinitialiser tous les états de réparation
            setRepairInProgress(null);
            setRepairProgress(0);
            setRepairCountdown(6);
        }
    };

    // Fonction pour gérer le clic droit sur la carte
    const handleContextMenu = (e: React.MouseEvent) => {
        // Empêcher l'ouverture du menu contextuel par défaut
        e.preventDefault();
        
        // Récupérer les dimensions du conteneur
        const container = e.currentTarget as HTMLDivElement;
        const rect = container.getBoundingClientRect();
        
        // Calculer la position relative du clic à l'intérieur du conteneur (en pourcentage)
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        // Convertir en coordonnées du système d'objets (0-100)
        const objX = Math.round((x / 100) * MAX_X_COORD);
        const objY = Math.round((y / 100) * MAX_Y_COORD);
        
        // Vérifier si on a cliqué sur un objet
        const clickedObject = findObjectAtPosition(e.clientX, e.clientY);
        
        if (clickedObject) {
            // Si on a cliqué sur un objet, afficher ses détails
            setSelectedObject(clickedObject);
            setIsEditing(false);
        } else {
            // Vérifier si l'utilisateur a les droits suffisants pour créer un objet
            if (!hasEditDeletePermission()) {
                Swal.fire({
                    title: 'Permission insuffisante',
                    text: 'Vous devez être gestionnaire, gérant ou avoir au moins 100 points pour créer un nouvel objet.',
                    icon: 'warning',
                    confirmButtonText: 'Compris'
                });
                return;
            }
            
            // Sinon, ouvrir le menu contextuel pour ajouter un objet
            setContextMenuPosition({
                x: objX,
                y: objY,
                pageX: e.pageX,
                pageY: e.pageY
            });
        }
    };
    
    // Fonction pour trouver un objet à une position donnée
    const findObjectAtPosition = (clientX: number, clientY: number): ObjectType | null => {
        if (!planRef.current) return null;
        
        const rect = planRef.current.getBoundingClientRect();
        const relativeX = ((clientX - rect.left) / rect.width) * 100;
        const relativeY = ((clientY - rect.top) / rect.height) * 100;
        
        // Distance maximale de détection en pourcentage
        const threshold = 4; // 4% de la largeur/hauteur
        
        // Chercher l'objet le plus proche
        return objects.find(obj => {
            const objPos = getPosition(obj.coord_x, obj.coord_y);
            const objX = parseFloat(objPos.left);
            const objY = parseFloat(objPos.top);
            
            const distance = Math.sqrt(
                Math.pow(objX - relativeX, 2) + 
                Math.pow(objY - relativeY, 2)
            );
            
            return distance < threshold;
        }) || null;
    };

    // Fonction pour créer un nouvel objet
    const handleCreateObject = async (type: ObjectTypeName) => {
        if (!contextMenuPosition) return;
        
        // Vérifier si l'utilisateur a les droits suffisants
        if (!hasEditDeletePermission()) {
            Swal.fire({
                title: 'Permission insuffisante',
                text: 'Vous devez être gestionnaire, gérant ou avoir au moins 100 points pour créer un nouvel objet.',
                icon: 'warning',
                confirmButtonText: 'Compris'
            });
            return;
        }
        
        setIsCreating(true);
        
        try {
            // Utiliser le genre grammatical pour l'accord du mot "nouveau"
            const genre = getObjectGender(type);
            const prefixe = genre === 'feminin' ? 'Nouvelle' : 'Nouveau';
            const newObjectName = `${prefixe} ${getObjectTypeName(type)}`;
            
            const newObject = {
                nom: newObjectName,
                type: type,
                coord_x: contextMenuPosition ? contextMenuPosition.x : 50,
                coord_y: contextMenuPosition ? contextMenuPosition.y : 50,
                etat: 'off' as const,
                Prison_id: currentPrisonId || undefined,
                consomation: getDefaultConsumption(type),
                durabilité: 100,
                connection: 'wifi',
                maintenance: 'fonctionnel',
                valeur_actuelle: type === 'thermostat' ? 22 : 0,
                valeur_cible: type === 'thermostat' ? 22 : 0
            };
            
            await createObject(newObject);
            
            // Actualiser la liste des objets
            const response = await getObjects(currentPrisonId || undefined);
            const filteredObjects = currentPrisonId
                ? response.data.filter(obj => obj.Prison_id === currentPrisonId)
                : response.data;
            
            setObjects(filteredObjects);
        } catch (error) {
            console.error('Erreur lors de la création de l\'objet:', error);
        } finally {
            setIsCreating(false);
            setContextMenuPosition(null);
        }
    };
    
    // Fonction pour obtenir le nom du type d'objet
    const getObjectTypeName = (type: ObjectTypeName): string => {
        switch(type) {
            case 'porte': return 'Porte';
            case 'lumiere': return 'Lumière';
            case 'camera': return 'Caméra';
            case 'thermostat': return 'Thermostat';
            case 'ventilation': return 'Ventilation';
            case "paneau d'affichage": return "Panneau d'affichage";
            default: return 'Objet';
        }
    };
    
    // Fonction pour obtenir le genre grammatical du type d'objet (pour accord)
    const getObjectGender = (type: ObjectTypeName): 'masculin' | 'feminin' => {
        switch(type) {
            case 'porte': return 'feminin';
            case 'lumiere': return 'feminin';
            case 'camera': return 'feminin';
            case 'ventilation': return 'feminin';
            // Les autres sont masculins
            default: return 'masculin';
        }
    };
    
    // Fonction pour obtenir la consommation par défaut selon le type
    const getDefaultConsumption = (type: ObjectTypeName): number => {
        switch(type) {
            case 'porte': return 1.0;
            case 'lumiere': return 0.5;
            case 'camera': return 0.2;
            case 'thermostat': return 0.1;
            case 'ventilation': return 2.0;
            case "paneau d'affichage": return 4.0;
            default: return 1.0;
        }
    };

    // Gestionnaire d'événements pour fermer le popup quand on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            // Fermer le popup d'informations si on clique en dehors
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                setSelectedObject(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [popupRef]);
    
    // Gestionnaire d'événements pour fermer le menu contextuel quand on clique en dehors
    useEffect(() => {
        const handleClickOutsideMenu = (e: MouseEvent) => {
            if (contextMenuPosition) {
                const target = e.target as HTMLElement;
                // Vérifier si le clic est en dehors du menu contextuel
                // Ne fermer le menu contextuel que si on clique sur le document ou sur un élément qui n'est pas dans le menu
                if (!target.closest('.context-menu')) {
                    setContextMenuPosition(null);
                }
            }
        };
        
        document.addEventListener('click', handleClickOutsideMenu);
        return () => {
            document.removeEventListener('click', handleClickOutsideMenu);
        };
    }, [contextMenuPosition]);

    return (
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <Map className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                        Plan
                        {(() => {
                            // Correspondance ID -> nom lisible
                            const prisonNames: Record<string, string> = {
                                paris: 'Paris',
                                cergy: 'Cergy',
                                lyon: 'Lyon',
                                marseille: 'Marseille',
                            };
                            const id = (prisonId || currentPrisonId || '').toLowerCase();
                            if (id && prisonNames[id]) {
                                return ` - Prison de ${prisonNames[id]}`;
                            }
                            return '';
                        })()}
                        <button
                            title="Visualiser la prison en 3D"
                            className={`ml-3 inline-flex items-center px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400`}
                            onClick={() => setShow3D(true)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12s4-7.5 10.5-7.5S22.5 12 22.5 12s-4 7.5-10.5 7.5S1.5 12 1.5 12z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </button>
                    </h2>
                </div>
            </div>

            {/* Conteneur du plan avec les objets superposés */}
            <div 
                className="relative w-full overflow-hidden" 
                style={{ 
                    width: '100%', 
                    paddingTop: `${100 / PLAN_ASPECT_RATIO}%`,
                    margin: '0 auto',
                    backgroundColor: '#f8fafc'
                }}
                ref={planRef}
                onContextMenu={handleContextMenu}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                        {/* Image du plan en arrière-plan */}
                        <img 
                            src="/plan.png" 
                            alt="Plan de la prison" 
                            className="absolute top-0 left-0 w-full h-full object-contain"
                        />
                        
                        {/* Calque pour les objets connectés */}
                        <div className="absolute inset-0 z-10">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : (
                        <>
                            {objects.map(obj => {
                                const position = getPosition(obj.coord_x, obj.coord_y);
                                const objectColor = getObjectColor(obj.type);
                                const isSelected = selectedObject?.id === obj.id;
                                return (
                                    <div key={obj.id} className="absolute" style={{ 
                                        left: position.left, 
                                        top: position.top,
                                    }}>
                                        <div 
                                            className={`rounded-full p-2 cursor-grab shadow-md ${objectColor} hover:ring-2 hover:ring-indigo-400 transition-all transform hover:scale-110 z-10 ${isSelected ? 'ring-2 ring-indigo-600' : ''} ${draggedObject === obj.id ? 'opacity-70 scale-105 cursor-grabbing' : ''}`} 
                                            style={{ 
                                                transform: 'translate(-50%, -50%)'
                                            }}
                                            title={`${obj.nom} (${obj.etat === 'on' ? 'Actif' : 'Inactif'}) - Clic droit pour voir les détails, clic gauche et glisser pour déplacer`}
                                            onMouseDown={(e) => handleMouseDown(e, obj)}
                                            onContextMenu={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setSelectedObject(obj);
                                                setIsEditing(false);
                                            }}
                                        >
                                            {getObjectIcon(obj.type, obj.etat)}
                                        </div>
                                        
                                        {/* Popup de détails à côté de l'objet */}
                                        {isSelected && (
                                            <div 
                                                className={`absolute p-3 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 w-64 transition-all duration-300`}
                                                style={{ 
                                                    transform: `translate(${obj.coord_x > MAX_X_COORD/2 ? '-100%' : '0%'}, ${obj.coord_y > MAX_Y_COORD/2 ? '-100%' : '0%'})`,
                                                    perspective: '1000px',
                                                }}
                                                ref={popupRef}
                                                onContextMenu={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                            >
                                                {/* Face avant (détails) */}
                                                <div style={{
                                                    backfaceVisibility: 'hidden',
                                                    transition: 'transform 0.6s',
                                                    position: isEditing ? 'absolute' : 'relative',
                                                    width: '100%',
                                                    opacity: isEditing ? 0 : 1,
                                                    transform: isEditing ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                                }}>                                                        <div className="flex justify-between items-center mb-2">
                                                        <h3 className="text-base font-semibold text-gray-800 dark:text-white">{obj.nom}</h3>
                                                        <div className="flex items-center space-x-1">
                                                            <button 
                                                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleMouseDown(e, obj);
                                                                }}
                                                                title="Déplacer"
                                                            >
                                                                <MoveIcon className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button 
                                                                className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                                                                onClick={(e) => handleEditClick(e, obj)}
                                                                title="Modifier"
                                                            >
                                                                <PencilIcon className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button 
                                                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                                                                onClick={(e) => handleDeleteObject(e, obj)}
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button 
                                                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedObject(null);
                                                                }}
                                                                title="Fermer"
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                                                        <div>
                                                            <span className="text-xs font-semibold text-gray-500 uppercase block">Type</span>
                                                            <span className="text-gray-800 dark:text-gray-200">{obj.type}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs font-semibold text-gray-500 uppercase block">État</span>
                                                            <div className="flex items-center gap-1">
                                                                <span className={`font-medium ${obj.etat === 'on' ? 'text-green-500' : 'text-red-500'}`}>
                                                                    {obj.etat === 'on' ? 'Actif' : 'Inactif'}
                                                                </span>
                                                                <button
                                                                    className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                                                                    onClick={(e) => handleToggleState(e, obj)}
                                                                    title={obj.etat === 'on' ? 'Désactiver' : 'Activer'}
                                                                >
                                                                    {toggleLoading === obj.id ? (
                                                                        <div className="h-3 w-3 border-2 border-t-transparent border-gray-400 rounded-full animate-spin"></div>
                                                                    ) : (
                                                                        <ToggleLeft className={`h-3 w-3 ${obj.etat === 'on' ? 'transform rotate-180' : ''}`} />
                                                                    )}
                                                                </button>
                                                                {(obj.maintenance === 'en panne' || obj.durabilité === 0) && (
                                                                    <button
                                                                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setRepairModalObject(obj);
                                                                        }}
                                                                        title="Réparer l'objet"
                                                                    >
                                                                        <Wrench className="h-3 w-3 text-yellow-500" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs font-semibold text-gray-500 uppercase block">Position</span>
                                                            <span className="text-gray-800 dark:text-gray-200">
                                                                ({obj.coord_x}, {obj.coord_y})
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs font-semibold text-gray-500 uppercase block">Connexion</span>
                                                            <span className="text-gray-800 dark:text-gray-200">
                                                                {obj.connection || 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs font-semibold text-gray-500 uppercase block">Consommation</span>
                                                            <span className="text-gray-800 dark:text-gray-200">
                                                                {obj.consomation || 0} kWh
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs font-semibold text-gray-500 uppercase block">Maintenance</span>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className={`font-medium ${obj.maintenance === 'fonctionnel' ? 'text-green-500' : 'text-red-500'}`}>
                                                                    {formatMaintenanceState(obj.maintenance)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {obj.durabilité !== undefined && (
                                                            <div className="col-span-2">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-xs font-semibold text-gray-500 uppercase block">Durabilité</span>
                                                                    <span className={`text-xs font-medium ${
                                                                        obj.durabilité > 70 ? 'text-green-500' :
                                                                        obj.durabilité > 30 ? 'text-yellow-500' : 'text-red-500'
                                                                    }`}>{obj.durabilité}%</span>
                                                                </div>
                                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                                                                    <div 
                                                                        className={`h-1.5 rounded-full ${
                                                                            obj.durabilité > 70 ? 'bg-green-500' :
                                                                            obj.durabilité > 30 ? 'bg-yellow-500' : 'bg-red-500'
                                                                        }`}
                                                                        style={{ width: `${obj.durabilité}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Face arrière (formulaire) */}
                                                <div style={{
                                                    backfaceVisibility: 'hidden',
                                                    transition: 'transform 0.6s',
                                                    position: isEditing ? 'relative' : 'absolute',
                                                    width: '100%',
                                                    opacity: isEditing ? 1 : 0,
                                                    transform: isEditing ? 'rotateY(0deg)' : 'rotateY(-180deg)',
                                                }}
                                                onContextMenu={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                                >
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h3 className="text-base font-semibold text-indigo-600 dark:text-indigo-400">Modifier l'objet</h3>
                                                        <button 
                                                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                                            onClick={handleCancelEdit}
                                                            disabled={isUpdating}
                                                        >
                                                            <ArrowLeft className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nom</label>
                                                            <input
                                                                type="text"
                                                                value={editForm.name}
                                                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                                disabled={isUpdating}
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Coord. X</label>
                                                                <input
                                                                    type="number"
                                                                    value={editForm.x}
                                                                    onChange={(e) => setEditForm({...editForm, x: Number(e.target.value)})}
                                                                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                                    disabled={isUpdating}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Coord. Y</label>
                                                                <input
                                                                    type="number"
                                                                    value={editForm.y}
                                                                    onChange={(e) => setEditForm({...editForm, y: Number(e.target.value)})}
                                                                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                                    disabled={isUpdating}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Consommation (kWh)</label>
                                                            <input
                                                                type="number"
                                                                value={editForm.consumption}
                                                                onChange={(e) => setEditForm({...editForm, consumption: Number(e.target.value)})}
                                                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                                disabled={isUpdating}
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Connexion</label>
                                                            <select
                                                                value={editForm.connection}
                                                                onChange={(e) => setEditForm({...editForm, connection: e.target.value as 'wifi' | 'filaire'})}
                                                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                                disabled={isUpdating}
                                                            >
                                                                <option value="wifi">Wi-Fi</option>
                                                                <option value="filaire">Filaire</option>
                                                            </select>
                                                        </div>
                                                        
                                                        <button
                                                            onClick={(e) => handleSaveChanges(e, obj.id)}
                                                            disabled={isUpdating}
                                                            className="w-full flex items-center justify-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm"
                                                        >
                                                            {isUpdating ? (
                                                                <>
                                                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                                                    Enregistrement...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Save className="h-3.5 w-3.5 mr-1" />
                                                                    Enregistrer
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </>
                    )}
                        </div>
                    </div>
            {/* Menu contextuel custom pour ajouter des objets */}
            {contextMenuPosition && (
                <div 
                    className="fixed z-50 w-60 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 overflow-hidden context-menu"
                    style={{
                        left: `${contextMenuPosition.pageX}px`,
                        top: `${contextMenuPosition.pageY}px`,
                    }}
                >
                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                        Position: ({contextMenuPosition.x}, {contextMenuPosition.y})
                    </div>
                    <div className="py-1">
                        <button
                            className="flex items-center w-full px-3 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 truncate"
                            onClick={() => handleCreateObject('porte')}
                            disabled={isCreating}
                        >
                            <DoorClosed className="min-w-[16px] mr-2 h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            <span className="truncate">Ajouter une porte</span>
                        </button>
                        <button
                            className="flex items-center w-full px-3 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 truncate"
                            onClick={() => handleCreateObject('lumiere')}
                            disabled={isCreating}
                        >
                            <Lightbulb className="min-w-[16px] mr-2 h-4 w-4 text-yellow-400 flex-shrink-0" />
                            <span className="truncate">Ajouter une lumière</span>
                        </button>
                        <button
                            className="flex items-center w-full px-3 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 truncate"
                            onClick={() => handleCreateObject('camera')}
                            disabled={isCreating}
                        >
                            <Video className="min-w-[16px] mr-2 h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                            <span className="truncate">Ajouter une caméra</span>
                        </button>
                        <button
                            className="flex items-center w-full px-3 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 truncate"
                            onClick={() => handleCreateObject('thermostat')}
                            disabled={isCreating}
                        >
                            <Thermometer className="min-w-[16px] mr-2 h-4 w-4 text-red-500 dark:text-red-400 flex-shrink-0" />
                            <span className="truncate">Ajouter un thermostat</span>
                        </button>
                        <button
                            className="flex items-center w-full px-3 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 truncate"
                            onClick={() => handleCreateObject('ventilation')}
                            disabled={isCreating}
                        >
                            <Wind className="min-w-[16px] mr-2 h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                            <span className="truncate">Ajouter une ventilation</span>
                        </button>
                        <button
                            className="flex items-center w-full px-3 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 truncate"
                            onClick={() => handleCreateObject("paneau d'affichage")}
                            disabled={isCreating}
                        >
                            <MonitorPlay className="min-w-[16px] mr-2 h-4 w-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                            <span className="truncate">Ajouter un panneau</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Légende du plan */}
            <div className="mt-6 flex flex-wrap gap-4 justify-center">
                <div className="flex items-center">
                    <div className="p-1 bg-blue-100 rounded-full mr-2">
                        <DoorClosed className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Portes</span>
                </div>
                <div className="flex items-center">
                    <div className="p-1 bg-yellow-100 rounded-full mr-2">
                        <Lightbulb className="h-4 w-4 text-yellow-400" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Éclairages</span>
                </div>
                <div className="flex items-center">
                    <div className="p-1 bg-purple-100 rounded-full mr-2">
                        <Video className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Caméras</span>
                </div>
                <div className="flex items-center">
                    <div className="p-1 bg-red-100 rounded-full mr-2">
                        <Thermometer className="h-4 w-4 text-red-500" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Thermostats</span>
                </div>
                <div className="flex items-center">
                    <div className="p-1 bg-green-100 rounded-full mr-2">
                        <Wind className="h-4 w-4 text-green-500" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Ventilation</span>
                </div>
                <div className="flex items-center">
                    <div className="p-1 bg-indigo-100 rounded-full mr-2">
                        <MonitorPlay className="h-4 w-4 text-indigo-500" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Panneaux d'affichage</span>
                </div>
            </div>

            {/* 3D View Modal */}
            {show3D && (
                <VideoView 
                    onClose={() => setShow3D(false)}
                    videoUrl="https://www.youtube.com/embed/g1uriA73Bp4"
                />
            )}

            {/* Dialog de confirmation de suppression */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-red-600">
                            <Trash2 className="inline-block mr-2 -mt-1" />
                            Confirmation de suppression
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                        Êtes-vous sûr de vouloir supprimer cet objet ? Cette action est irréversible.
                    </DialogDescription>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            className="mr-2"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Annuler
                        </Button>
                        <Button 
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={confirmDeleteObject}
                        >
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog pour la réparation d'un objet en panne */}
            {repairModalObject && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black/30" onClick={() => setRepairModalObject(null)}></div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 max-w-md w-full mx-4 relative z-10 border-l-4 border-amber-500"
                        onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
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
                                        onClick={() => setRepairModalObject(null)}
                                        className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 rounded"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (repairModalObject) {
                                                handleRepair(repairModalObject.id);
                                                setRepairModalObject(null);
                                            }
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

            {/* Modal de progression de réparation */}
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
        </div>
    );
}

export default PlanComponent;
