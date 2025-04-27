import React, { useEffect, useState, useRef } from 'react';
import { ObjectType } from './types';
import { getObjects } from '../../services/objectService';
import { DoorClosed, Lightbulb, Video, Thermometer, Activity, Wind, MonitorPlay, Library } from 'lucide-react';
import axios from 'axios';

// Define a type for the add object callback
export type AddObjectCallback = (type: 'porte' | 'lumiere' | 'camera' | 'thermostat' | 'ventilation' | "panneau d'affichage") => void;

const ObjectsChart: React.FC<{ onAddObject?: AddObjectCallback }> = ({ onAddObject }) => {
    const [objects, setObjects] = useState<ObjectType[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
    const [showConsommation, setShowConsommation] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const statsIntervalRef = useRef<NodeJS.Timeout | null>(null); // Intervalle pour l'envoi des statistiques
    const [statsEnabled, setStatsEnabled] = useState<boolean>(
        localStorage.getItem('statsEnabled') !== 'false'
    );

    const fetchObjects = async () => {
        try {
            const prisonId = localStorage.getItem('userPrison') || localStorage.getItem('selectedPrison');
            
            // console.log("Prison ID utilisé pour la requête:", prisonId);
            
            const response = await getObjects();
            
            // Log the raw response to debug
            // console.log("Objects data received:", response.data);

            // Filter objects to only include those matching the prison ID
            if (prisonId && response.data && Array.isArray(response.data)) {
                // Filter objects where the prisonId matches
                const filteredObjects = response.data.filter(obj => 
                    obj.Prison_id === prisonId
                );
                
                // console.log(`Filtered ${filteredObjects.length} objects for prison ID ${prisonId}`);
                response.data = filteredObjects;
                // console.log("Filtered objects data:", response.data);
            } else {
                console.warn("Prison ID not found or response data is not an array:", prisonId);
            }

            // Si le backend filtre correctement, on n'a plus besoin de filtrer côté client
            setObjects(response.data);
            setLoading(false);
            setLastUpdateTime(new Date());
        } catch (error) {
            console.error('Error fetching objects:', error);
            setLoading(false);
        }
    };

    // Fonction pour envoyer les statistiques à l'API
    const sendStatsToApi = async () => {
        try {
            // Récupération de l'ID de la prison
            const prisonId = localStorage.getItem('userPrison');
            
            // Récupération des stats calculées avec l'ID de la prison
            const statsData = calculateStats(objects, prisonId);
            
            // Token d'authentification pour l'API
            const token = localStorage.getItem('sessionToken');
            
            // Envoi des statistiques à l'API
            await axios.post('http://localhost:8000/api/stats/', statsData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Statistiques envoyées avec succès:', new Date().toLocaleString());
        } catch (error) {
            console.error('Erreur lors de l\'envoi des statistiques:', error);
        }
    };

    // Fonction pour calculer toutes les statistiques requises
    const calculateStats = (objectsList: ObjectType[], prisonId?: string | null) => {
        // Nombre total d'objets
        const total = objectsList.length;
        
        // Objets allumés/éteints
        const active = objectsList.filter(obj => obj.etat === 'on').length;
        const inactive = total - active;
        
        // Pourcentage d'objets allumés
        const pourcentage_allumes = total > 0 ? (active / total) * 100 : 0;
        
        // Fonction pour obtenir la consommation d'un objet
        const getConsommation = (obj: ObjectType) => {
            if (obj.consomation === undefined) {
                switch(obj.type) {
                    case 'porte': return 15;
                    case 'lumiere': return 10;
                    case 'camera': return 8;
                    case 'thermostat': return 5;
                    case 'ventilation': return 20;
                    case "paneau d'affichage": return 25;
                    default: return 10;
                }
            }
            return obj.consomation;
        };
        
        // Objets allumés par type
        const porteAllumees = objectsList.filter(obj => obj.type === 'porte' && obj.etat === 'on').length;
        const lumiereAllumees = objectsList.filter(obj => obj.type === 'lumiere' && obj.etat === 'on').length;
        const cameraAllumees = objectsList.filter(obj => obj.type === 'camera' && obj.etat === 'on').length;
        const thermostatAllumes = objectsList.filter(obj => obj.type === 'thermostat' && obj.etat === 'on').length;
        const ventilationAllumees = objectsList.filter(obj => obj.type === 'ventilation' && obj.etat === 'on').length;
        const panneauAllumes = objectsList.filter(obj => obj.type === "paneau d'affichage" && obj.etat === 'on').length;
        
        // Consommation par type
        const porteConsommation = objectsList
            .filter(obj => obj.type === 'porte' && obj.etat === 'on')
            .reduce((total, obj) => total + getConsommation(obj), 0);
            
        const lumiereConsommation = objectsList
            .filter(obj => obj.type === 'lumiere' && obj.etat === 'on')
            .reduce((total, obj) => total + getConsommation(obj), 0);
            
        const cameraConsommation = objectsList
            .filter(obj => obj.type === 'camera' && obj.etat === 'on')
            .reduce((total, obj) => total + getConsommation(obj), 0);
            
        const thermostatConsommation = objectsList
            .filter(obj => obj.type === 'thermostat' && obj.etat === 'on')
            .reduce((total, obj) => total + getConsommation(obj), 0);
            
        const ventilationConsommation = objectsList
            .filter(obj => obj.type === 'ventilation' && obj.etat === 'on')
            .reduce((total, obj) => total + getConsommation(obj), 0);
            
        const panneauConsommation = objectsList
            .filter(obj => obj.type === "paneau d'affichage" && obj.etat === 'on')
            .reduce((total, obj) => total + getConsommation(obj), 0);
        
        // Consommation totale et moyenne
        const consommationTotale = objectsList
            .filter(obj => obj.etat === 'on')
            .reduce((total, obj) => total + getConsommation(obj), 0);
            
        const consommationMoyenne = active > 0 ? consommationTotale / active : 0;
        
        // Coût horaire (0.15€ par kWh)
        const coutHoraire = consommationTotale * 0.15 / 1000;
        
        // Construction de l'objet à envoyer à l'API
        return {
            nombre_objets: total,
            pourcentage_allumes: parseFloat(pourcentage_allumes.toFixed(2)),
            nbr_on: active,
            nbr_off: inactive,
            type: 6, // Valeur fixe comme dans StatForm
            consommation_total_actuelle: parseFloat(consommationTotale.toFixed(2)),
            consommation_moyenne: parseFloat(consommationMoyenne.toFixed(2)),
            cout_horaire: parseFloat(coutHoraire.toFixed(4)),
            porte_allumees: porteAllumees,
            porte_consommation: parseFloat(porteConsommation.toFixed(2)),
            camera_allumees: cameraAllumees,
            camera_consommation: parseFloat(cameraConsommation.toFixed(2)),
            lumiere_allumees: lumiereAllumees,
            lumiere_consommation: parseFloat(lumiereConsommation.toFixed(2)),
            panneau_allumes: panneauAllumes,
            panneau_consommation: parseFloat(panneauConsommation.toFixed(2)),
            thermostat_allumes: thermostatAllumes,
            thermostat_consommation: parseFloat(thermostatConsommation.toFixed(2)),
            ventilation_allumees: ventilationAllumees,
            ventilation_consommation: parseFloat(ventilationConsommation.toFixed(2)),
            prison_id: prisonId || '' // Ajout de l'ID de la prison
        };
    };

    useEffect(() => {
        // Initial fetch
        fetchObjects();

        // Set up interval for periodic refresh (every 5 seconds)
        intervalRef.current = setInterval(() => {
            fetchObjects();
        }, 5000);

        // Récupérer la configuration des statistiques
        const isStatsEnabled = localStorage.getItem('statsEnabled') !== 'false';
        setStatsEnabled(isStatsEnabled);

        // Si les statistiques sont activées, configurer l'envoi périodique
        if (isStatsEnabled) {
            // Récupérer la fréquence depuis localStorage (défaut: 1 heure)
            const statsFrequency = parseInt(localStorage.getItem('statsFrequency') || '3600000');
            
            // Configurer l'intervalle d'envoi des statistiques
            statsIntervalRef.current = setInterval(() => {
                if (objects.length > 0) {  // S'assurer qu'il y a des objets à analyser
                    sendStatsToApi();
                }
            }, statsFrequency);
        }
        
        // Ajouter un écouteur pour l'envoi manuel des statistiques (debug)
        const handleManualStatsSend = () => {
            if (objects.length > 0) {
                console.log("Envoi manuel des statistiques à:", new Date().toLocaleString());
                sendStatsToApi();
            } else {
                console.warn("Impossible d'envoyer des statistiques: aucun objet disponible");
            }
        };
        
        // Ajouter l'écouteur d'événements
        window.addEventListener('sendStatsManually', handleManualStatsSend);

        // Configurer un écouteur pour les changements de configuration
        const handleStorageChange = (event: StorageEvent) => {
            // Changement de fréquence
            if (event.key === 'statsFrequency') {
                // Si l'intervalle existe déjà, le nettoyer
                if (statsIntervalRef.current) {
                    clearInterval(statsIntervalRef.current);
                    statsIntervalRef.current = null;
                }
                
                // Récupérer la nouvelle fréquence
                const newFrequency = parseInt(event.newValue || '3600000');
                const isEnabled = localStorage.getItem('statsEnabled') !== 'false';
                
                // Reconfigurer l'intervalle si la collecte est activée
                if (isEnabled) {
                    statsIntervalRef.current = setInterval(() => {
                        if (objects.length > 0) {
                            sendStatsToApi();
                        }
                    }, newFrequency);
                }
            } 
            // Changement d'état d'activation
            else if (event.key === 'statsEnabled') {
                const isEnabled = event.newValue !== 'false';
                setStatsEnabled(isEnabled);
                
                // Nettoyer l'intervalle existant
                if (statsIntervalRef.current) {
                    clearInterval(statsIntervalRef.current);
                    statsIntervalRef.current = null;
                }
                
                // Reconfigurer uniquement si activé
                if (isEnabled) {
                    const freq = parseInt(localStorage.getItem('statsFrequency') || '3600000');
                    statsIntervalRef.current = setInterval(() => {
                        if (objects.length > 0) {
                            sendStatsToApi();
                        }
                    }, freq);
                }
            }
        };
        
        // Ajouter l'écouteur
        window.addEventListener('storage', handleStorageChange);

        // Clean up intervals on component unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (statsIntervalRef.current) {
                clearInterval(statsIntervalRef.current);
            }
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('sendStatsManually', handleManualStatsSend);
        };
    }, [objects.length]);

    if (loading) {
        return <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg animate-pulse">
            <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mt-4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mt-2"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
            </div>
        </div>;
    }

    // Gérer les cas où les propriétés peuvent être undefined
    const getConsommation = (obj: ObjectType) => {
        // Si la propriété n'existe pas ou est undefined, on retourne une valeur par défaut
        if (obj.consomation === undefined) {
            // Définition d'une consommation par défaut selon le type
            switch(obj.type) {
                case 'porte': return 15;
                case 'lumiere': return 10;
                case 'camera': return 8;
                case 'thermostat': return 5;
                case 'ventilation': return 20;
                case "paneau d'affichage": return 25;
                default: return 10;
            }
        }
        return obj.consomation;
    };

    const stats = {
        total: objects.length,
        active: objects.filter(obj => obj.etat === 'on').length,
        inactive: objects.filter(obj => obj.etat === 'off').length,
        // Calcul de la consommation totale (uniquement pour les objets actifs)
        consommationTotale: objects
            .filter(obj => obj.etat === 'on')
            .reduce((total, obj) => total + getConsommation(obj), 0),
        // Calcul de la consommation moyenne par objet actif
        consommationMoyenne: objects.filter(obj => obj.etat === 'on').length > 0 ?
            objects
                .filter(obj => obj.etat === 'on')
                .reduce((total, obj) => total + getConsommation(obj), 0) / 
                objects.filter(obj => obj.etat === 'on').length : 0,
        byType: {
            porte: objects.filter(obj => obj.type === 'porte').length,
            lumiere: objects.filter(obj => obj.type === 'lumiere').length,
            camera: objects.filter(obj => obj.type === 'camera').length,
            thermostat: objects.filter(obj => obj.type === 'thermostat').length,
            ventilation: objects.filter(obj => obj.type === 'ventilation').length,
            paneauAffichage: objects.filter(obj => obj.type === "paneau d'affichage").length,
        },
        // Consommation par type d'objet (uniquement pour les objets actifs)
        consommationParType: {
            porte: objects
                .filter(obj => obj.type === 'porte' && obj.etat === 'on')
                .reduce((total, obj) => total + getConsommation(obj), 0),
            lumiere: objects
                .filter(obj => obj.type === 'lumiere' && obj.etat === 'on')
                .reduce((total, obj) => total + getConsommation(obj), 0),
            camera: objects
                .filter(obj => obj.type === 'camera' && obj.etat === 'on')
                .reduce((total, obj) => total + getConsommation(obj), 0),
            thermostat: objects
                .filter(obj => (obj.type === 'thermostat') && obj.etat === 'on')
                .reduce((total, obj) => total + getConsommation(obj), 0),
            ventilation: objects
                .filter(obj => obj.type === 'ventilation' && obj.etat === 'on')
                .reduce((total, obj) => total + getConsommation(obj), 0),
            paneauAffichage: objects
                .filter(obj => obj.type === "paneau d'affichage" && obj.etat === 'on')
                .reduce((total, obj) => total + getConsommation(obj), 0),
        }
    };

    // Calculate percentages for active vs inactive pie chart
    const activePercentage = stats.total ? Math.round((stats.active / stats.total) * 100) : 0;
    const inactivePercentage = 100 - activePercentage;

    return (
        <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex justify-between items-center mb-5">
                <div className="flex items-center">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg mr-3">
                        <Library className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Informations</h3>
                </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                {/* Summary boxes */}
                <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30 flex flex-col items-center justify-center shadow-sm h-full relative group">
                        <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400 mb-1" />
                        <p className="text-xs text-blue-600 dark:text-blue-400 uppercase font-medium text-center">Total</p>
                        <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{stats.total}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-900/30 flex flex-col items-center justify-center shadow-sm h-full">
                        <div className="h-5 w-5 rounded-full border-3 border-green-500 mb-1"></div>
                        <p className="text-xs text-green-600 dark:text-green-400 uppercase font-medium text-center">ON</p>
                        <p className="text-lg font-bold text-green-700 dark:text-green-300">{stats.active}</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30 flex flex-col items-center justify-center shadow-sm h-full">
                        <div className="h-5 w-5 rounded-full border-3 border-red-500 border-dashed mb-1"></div>
                        <p className="text-xs text-red-600 dark:text-red-400 uppercase font-medium text-center">OFF</p>
                        <p className="text-lg font-bold text-red-700 dark:text-red-300">{stats.inactive}</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-900/30 flex flex-col items-center justify-center shadow-sm h-full">
                        <div className="flex space-x-0.5 mb-1">
                            {Object.keys(stats.byType).map((type, i) => (
                                <div key={i} className="h-5 w-1 bg-purple-500 rounded-sm" style={{ opacity: 0.3 + (i * 0.2) }}></div>
                            ))}
                        </div>
                        <p className="text-xs text-purple-600 dark:text-purple-400 uppercase font-medium text-center">Types</p>
                        <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{Object.keys(stats.byType).length}</p>
                    </div>
                </div>

                {/* Pie chart */}
                <div className="md:col-span-2 bg-white dark:bg-gray-800/60 rounded-lg border border-gray-100 dark:border-gray-700 p-3 flex flex-col items-center justify-center shadow-sm">
                    <div className="relative w-24 h-24 md:w-28 md:h-28">
                        <svg className="w-full h-full" viewBox="0 0 42 42">
                            {/* Background circle */}
                            <circle
                                cx="21" cy="21" r="21"
                                className="fill-white dark:fill-gray-800"
                            />
                            {/* Gray track */}
                            <circle
                                cx="21" cy="21" r="15.75"
                                fill="none"
                                className="stroke-current text-gray-200 dark:text-gray-700"
                                strokeWidth="2.5"
                            />
                            {/* Green progress */}
                            {activePercentage > 0 && (
                                <circle
                                    cx="21" cy="21" r="15.75"
                                    fill="none"
                                    className="stroke-current text-green-500"
                                    strokeWidth="2.5"
                                    strokeDasharray={`${activePercentage} ${inactivePercentage}`}
                                    strokeDashoffset="25"
                                    transform="rotate(-90 21 21)"
                                />
                            )}
                            {/* Text content */}
                            <text x="21" y="20" textAnchor="middle" dominantBaseline="middle" className="text-[8px] font-bold fill-gray-700 dark:fill-white">
                                {activePercentage}%
                            </text>
                            <text x="21" y="28" textAnchor="middle" className="text-[5px] fill-gray-500 dark:fill-gray-400">
                                actifs
                            </text>
                        </svg>
                    </div>
                    <div className="flex mt-2 space-x-4">
                        <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">ON ({stats.active})</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 mr-1"></div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">OFF ({stats.inactive})</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section pour les statistiques de consommation avec toggle */}
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex justify-end items-center">
                    <button 
                        onClick={() => setShowConsommation(prev => !prev)} 
                        className="flex items-center text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                    >
                        <span>{showConsommation ? 'Masquer les détails' : 'Afficher les détails'}</span>
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className={`ml-1 transition-transform duration-200 ${showConsommation ? 'rotate-180' : ''}`}
                        >
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                </div>
                
                {/* Afficher les statistiques de consommation uniquement si toggle activé */}
                {showConsommation && (
                    <>
                        <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase mb-4">Consommation énergétique</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5 animate-fadeIn">
                            {/* Consommation totale */}
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-100 dark:border-orange-900/30 flex flex-col justify-between">
                                <div className="flex items-center mb-2">
                                    <div className="bg-orange-100 dark:bg-orange-900/50 p-1.5 rounded-md mr-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600 dark:text-orange-400">
                                            <path d="M12 2v10m0 0 4-4m-4 4-4-4M4.6 19.4a8 8 0 1 0 14.8 0"></path>
                                        </svg>
                                    </div>
                                    <h5 className="text-sm font-medium text-gray-600 dark:text-gray-300">Consommation totale</h5>
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.consommationTotale.toFixed(0)}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">watts/h</p>
                                </div>
                            </div>

                            {/* Consommation moyenne */}
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-100 dark:border-orange-900/30 flex flex-col justify-between">
                                <div className="flex items-center mb-2">
                                    <div className="bg-orange-100 dark:bg-orange-900/50 p-1.5 rounded-md mr-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600 dark:text-orange-400">
                                            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                                        </svg>
                                    </div>
                                    <h5 className="text-sm font-medium text-gray-600 dark:text-gray-300">Consommation moyenne</h5>
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.consommationMoyenne.toFixed(1)}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">watts/h/objet</p>
                                </div>
                            </div>

                            {/* Estimation du prix par heure */}
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-100 dark:border-orange-900/30 flex flex-col justify-between">
                                <div className="flex items-center mb-2">
                                    <div className="bg-orange-100 dark:bg-orange-900/50 p-1.5 rounded-md mr-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600 dark:text-orange-400">
                                            <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                        </svg>
                                    </div>
                                    <h5 className="text-sm font-medium text-gray-600 dark:text-gray-300">Coût horaire</h5>
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{(stats.consommationTotale * 0.15 / 1000).toFixed(2)}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">€/heure</p>
                                </div>
                            </div>
                        </div>

                        {/* Distribution par type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5 animate-fadeIn">
                            <div className="space-y-3">
                                <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase mb-2">Distribution par type</h4>
                                
                                {/* Porte */}
                                <div className="flex items-center">
                                    <div className="w-32 flex items-center">
                                        <DoorClosed className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                                        <span className="text-sm text-gray-600 dark:text-gray-300">Portes</span>
                                    </div>
                                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mx-3">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${stats.total ? (stats.byType.porte / stats.total) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <div className="w-10 text-right">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{stats.byType.porte}</span>
                                    </div>
                                </div>
                                
                                {/* Lumière */}
                                <div className="flex items-center">
                                    <div className="w-32 flex items-center">
                                        <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-2" />
                                        <span className="text-sm text-gray-600 dark:text-gray-300">Lumières</span>
                                    </div>
                                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mx-3">
                                        <div
                                            className="bg-yellow-400 h-2 rounded-full"
                                            style={{ width: `${stats.total ? (stats.byType.lumiere / stats.total) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <div className="w-10 text-right">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{stats.byType.lumiere}</span>
                                    </div>
                                </div>
                                
                                {/* Camera */}
                                <div className="flex items-center">
                                    <div className="w-32 flex items-center">
                                        <Video className="h-4 w-4 text-purple-600 dark:text-purple-400 mr-2" />
                                        <span className="text-sm text-gray-600 dark:text-gray-300">Caméras</span>
                                    </div>
                                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mx-3">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full"
                                            style={{ width: `${stats.total ? (stats.byType.camera / stats.total) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <div className="w-10 text-right">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{stats.byType.camera}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase mb-2 invisible">Distribution par type</h4>
                                
                                {/* Thermostat */}
                                <div className="flex items-center">
                                    <div className="w-32 flex items-center">
                                        <Thermometer className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
                                        <span className="text-sm text-gray-600 dark:text-gray-300">Thermostats</span>
                                    </div>
                                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mx-3">
                                        <div
                                            className="bg-red-600 h-2 rounded-full"
                                            style={{ width: `${stats.total ? (stats.byType.thermostat / stats.total) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <div className="w-10 text-right">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{stats.byType.thermostat}</span>
                                    </div>
                                </div>
                                
                                {/* Ventilation */}
                                <div className="flex items-center">
                                    <div className="w-32 flex items-center">
                                        <Wind className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                                        <span className="text-sm text-gray-600 dark:text-gray-300">Ventilations</span>
                                    </div>
                                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mx-3">
                                        <div
                                            className="bg-green-600 h-2 rounded-full"
                                            style={{ width: `${stats.total ? (stats.byType.ventilation / stats.total) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <div className="w-10 text-right">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{stats.byType.ventilation}</span>
                                    </div>
                                </div>
                                
                                {/* Panneau */}
                                <div className="flex items-center">
                                    <div className="w-32 flex items-center">
                                        <MonitorPlay className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mr-2" />
                                        <span className="text-sm text-gray-600 dark:text-gray-300">Panneaux</span>
                                    </div>
                                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mx-3">
                                        <div
                                            className="bg-indigo-600 h-2 rounded-full"
                                            style={{ width: `${stats.total ? (stats.byType.paneauAffichage / stats.total) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <div className="w-10 text-right">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{stats.byType.paneauAffichage}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    <div className="bg-white dark:bg-gray-800/60 p-4 rounded-lg border border-gray-200 dark:border-gray-700 animate-fadeIn">
                        <h5 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">Consommation par type</h5>
                        <div className="space-y-3">
                            {/* Portes */}
                            <div className="flex items-center">
                                <div className="w-28 flex items-center">
                                    <DoorClosed className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                                    <span className="text-xs text-gray-600 dark:text-gray-400">Portes</span>
                                </div>
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mx-3">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{
                                            width: `${stats.consommationTotale ? 
                                                Math.min((stats.consommationParType.porte / stats.consommationTotale) * 100, 100) : 0}%`
                                        }}
                                    ></div>
                                </div>
                                <div className="w-24 text-right">
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{stats.consommationParType.porte.toFixed(0)} W</span>
                                </div>
                            </div>

                            {/* Lumières */}
                            <div className="flex items-center">
                                <div className="w-28 flex items-center">
                                    <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-2" />
                                    <span className="text-xs text-gray-600 dark:text-gray-400">Lumières</span>
                                </div>
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mx-3">
                                    <div
                                        className="bg-yellow-400 h-2 rounded-full"
                                        style={{
                                            width: `${stats.consommationTotale ? 
                                                Math.min((stats.consommationParType.lumiere / stats.consommationTotale) * 100, 100) : 0}%`
                                        }}
                                    ></div>
                                </div>
                                <div className="w-24 text-right">
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{stats.consommationParType.lumiere.toFixed(0)} W</span>
                                </div>
                            </div>

                            {/* Caméras */}
                            <div className="flex items-center">
                                <div className="w-28 flex items-center">
                                    <Video className="h-4 w-4 text-purple-600 dark:text-purple-400 mr-2" />
                                    <span className="text-xs text-gray-600 dark:text-gray-400">Caméras</span>
                                </div>
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mx-3">
                                    <div
                                        className="bg-purple-600 h-2 rounded-full"
                                        style={{
                                            width: `${stats.consommationTotale ? 
                                                Math.min((stats.consommationParType.camera / stats.consommationTotale) * 100, 100) : 0}%`
                                        }}
                                    ></div>
                                </div>
                                <div className="w-24 text-right">
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{stats.consommationParType.camera.toFixed(0)} W</span>
                                </div>
                            </div>

                            {/* Thermostats */}
                            <div className="flex items-center">
                                <div className="w-28 flex items-center">
                                    <Thermometer className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
                                    <span className="text-xs text-gray-600 dark:text-gray-400">Thermostats</span>
                                </div>
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mx-3">
                                    <div
                                        className="bg-red-600 h-2 rounded-full"
                                        style={{
                                            width: `${stats.consommationTotale ? 
                                                Math.min((stats.consommationParType.thermostat / stats.consommationTotale) * 100, 100) : 0}%`
                                        }}
                                    ></div>
                                </div>
                                <div className="w-24 text-right">
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{stats.consommationParType.thermostat.toFixed(0)} W</span>
                                </div>
                            </div>

                            {/* Ventilation */}
                            <div className="flex items-center">
                                <div className="w-28 flex items-center">
                                    <Wind className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                                    <span className="text-xs text-gray-600 dark:text-gray-400">Ventilations</span>
                                </div>
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mx-3">
                                    <div
                                        className="bg-green-600 h-2 rounded-full"
                                        style={{
                                            width: `${stats.consommationTotale ? 
                                                Math.min((stats.consommationParType.ventilation / stats.consommationTotale) * 100, 100) : 0}%`
                                        }}
                                    ></div>
                                </div>
                                <div className="w-24 text-right">
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{stats.consommationParType.ventilation.toFixed(0)} W</span>
                                </div>
                            </div>

                            {/* Panneaux */}
                            <div className="flex items-center">
                                <div className="w-28 flex items-center">
                                    <MonitorPlay className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mr-2" />
                                    <span className="text-xs text-gray-600 dark:text-gray-400">Panneaux</span>
                                </div>
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mx-3">
                                    <div
                                        className="bg-indigo-600 h-2 rounded-full"
                                        style={{
                                            width: `${stats.consommationTotale ? 
                                                Math.min((stats.consommationParType.paneauAffichage / stats.consommationTotale) * 100, 100) : 0}%`
                                        }}
                                    ></div>
                                </div>
                                <div className="w-24 text-right">
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{stats.consommationParType.paneauAffichage.toFixed(0)} W</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
                )}
            </div>

        </div>
    );
};

export default ObjectsChart;
