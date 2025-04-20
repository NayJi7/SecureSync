import React, { useEffect, useState } from 'react';
import { ObjectType } from './types';
import { getObjects } from '../../services/objectService';
import { PieChart, DoorClosed, Lightbulb, Video, Thermometer, Activity, BarChart2, Plus } from 'lucide-react';

// Define a type for the add object callback
export type AddObjectCallback = (type: 'porte' | 'lumiere' | 'camera' | 'chauffage') => void;

const ObjectsChart: React.FC<{ onAddObject?: AddObjectCallback }> = ({ onAddObject }) => {
    const [objects, setObjects] = useState<ObjectType[]>([]);
    const [loading, setLoading] = useState(true);

    // Function to handle adding an object by type
    const handleAddObject = (type: 'porte' | 'lumiere' | 'camera' | 'chauffage') => {
        if (onAddObject) {
            onAddObject(type);
        } else {
            console.log(`Add object of type: ${type}`);
            // Default implementation if no callback is provided
            alert(`Fonctionnalité à venir: Ajouter un objet de type ${type}`);
        }
    };

    useEffect(() => {
        const fetchObjects = async () => {
            try {
                const response = await getObjects();
                setObjects(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching objects:', error);
                setLoading(false);
            }
        };

        fetchObjects();
    }, []);

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

    const stats = {
        total: objects.length,
        active: objects.filter(obj => obj.etat === 'on').length,
        inactive: objects.filter(obj => obj.etat === 'off').length,
        byType: {
            porte: objects.filter(obj => obj.type === 'porte').length,
            lumiere: objects.filter(obj => obj.type === 'lumiere').length,
            camera: objects.filter(obj => obj.type === 'camera').length,
            chauffage: objects.filter(obj => obj.type === 'chauffage').length,
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
                        <BarChart2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Statistiques</h3>
                </div>
                <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        Mise à jour: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                {/* Summary boxes */}
                <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30 flex flex-col items-center justify-center shadow-sm h-full relative group">
                        <button
                            onClick={() => handleAddObject('porte')}
                            className="absolute top-2 right-2 p-1 bg-blue-100 rounded-full opacity-0 group-hover:opacity-100 hover:bg-blue-200 transition-opacity"
                            title="Ajouter une porte"
                        >
                            <Plus className="h-3 w-3 text-blue-600" />
                        </button>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase mb-2">Distribution par type</h4>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <DoorClosed className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">Portes</span>
                        </div>
                        <div className="w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${stats.total ? (stats.byType.porte / stats.total) * 100 : 0}%` }}
                            ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{stats.byType.porte}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-2" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">Lumières</span>
                        </div>
                        <div className="w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{ width: `${stats.total ? (stats.byType.lumiere / stats.total) * 100 : 0}%` }}
                            ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{stats.byType.lumiere}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase mb-2">Suite</h4>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <Video className="h-4 w-4 text-purple-600 dark:text-purple-400 mr-2" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">Caméras</span>
                        </div>
                        <div className="w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${stats.total ? (stats.byType.camera / stats.total) * 100 : 0}%` }}
                            ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{stats.byType.camera}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <Thermometer className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">Chauffage</span>
                        </div>
                        <div className="w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-red-600 h-2 rounded-full"
                                style={{ width: `${stats.total ? (stats.byType.chauffage / stats.total) * 100 : 0}%` }}
                            ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{stats.byType.chauffage}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ObjectsChart;
