import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LayoutGrid, Activity, RefreshCw, ClipboardList, Filter, Calendar, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, User } from 'lucide-react';

interface ObjetLog {
    id: number;
    objet: number | null;
    type: string;
    nom: string;
    etat: string;
    date: string;
    commentaire?: string;
    user?: number | null;
    user_info?: {
        id: number;
        username: string;
        full_name: string;
        role: string;
        prison?: string;
    };
}

// Interface adaptée pour correspondre à la structure de l'API et du modèle UserActivityLog
interface UserLog {
    id: number;
    user: {
        id: number;
        username: string;
    } | number;
    action: string;
    timestamp: string;
    user_info?: {
        id: number;
        username: string;
        full_name?: string;
        role?: string;
        prison?: string;
    };
}

type SortColumn = 'date' | 'nom' | 'type' | 'etat' | 'commentaire' | 'user' | 'action';
type SortDirection = 'asc' | 'desc';
type LogType = 'object' | 'user' | 'all';

const LogsComponent: React.FC<{ prisonId: string }> = ({ prisonId }) => {
    const [objectLogs, setObjectLogs] = useState<ObjetLog[]>([]);
    const [userLogs, setUserLogs] = useState<UserLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<(ObjetLog | UserLog)[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeLogType, setActiveLogType] = useState<LogType>('all');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Sorting state
    const [sortColumn, setSortColumn] = useState<SortColumn>('date');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    // Filtering state
    const [filterType, setFilterType] = useState<string>('');
    const [filterObject, setFilterObject] = useState<string>('');
    const [filterAction, setFilterAction] = useState<string>('');
    const [filterUser, setFilterUser] = useState<string>('');
    
    const fetchLogs = async () => {
        try {
            setRefreshing(true);
            setError(null);
            
            // Récupérer les logs d'objets
            const objectLogsResponse = await axios.get('http://localhost:8000/api/logs/', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('sessionToken')}`,
                },
            });
            setObjectLogs(objectLogsResponse.data);

            // Récupérer les logs utilisateurs
            const userLogsResponse = await axios.get('http://localhost:8000/api/Userslogs/', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('sessionToken')}`,
                },
            });
            
            console.log('Logs utilisateurs bruts:', userLogsResponse.data);
            
            // Transformer les données pour correspondre à notre interface UserLog
            const transformedUserLogs = userLogsResponse.data.map((log: any) => {
                return {
                    ...log,
                    // Créer un champ user_info basé sur la structure de l'API
                    user_info: typeof log.user === 'object' ? {
                        id: log.user.id,
                        username: log.user.username,
                        full_name: log.user.username, // Utiliser username comme fallback pour full_name
                        role: log.user.role || 'user', // Valeur par défaut 'user' si role n'existe pas
                        prison: log.user.prison || prisonId // Utiliser prisonId comme valeur par défaut
                    } : undefined
                };
            });
            
            console.log('Logs utilisateurs transformés:', transformedUserLogs);
            setUserLogs(transformedUserLogs);
            
            setLoading(false);
            setTimeout(() => setRefreshing(false), 500); // Visual feedback
        } catch (err: any) {
            console.error('Error fetching logs:', err);

            // Handle 401 Unauthorized errors (invalid token)
            if (err.response?.status === 401) {
                setError('Session expirée. Veuillez vous reconnecter.');
                localStorage.removeItem('authToken');
                localStorage.removeItem('sessionToken');
                return;
            }

            setError('Erreur lors du chargement des logs: ' +
                (err.friendlyMessage || err.response?.data?.detail || 'Problème de connexion au serveur'));
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Apply sorting and filtering to logs
    useEffect(() => {
        let result: (ObjetLog | UserLog)[] = [];
        
        // Filtrer les logs selon le type actif
        if (activeLogType === 'object' || activeLogType === 'all') {
            let objectLogsFiltered = [...objectLogs];
            
            // Filtrer pour exclure les logs des utilisateurs admin
            objectLogsFiltered = objectLogsFiltered.filter(log => 
                // Garder les logs du système (sans user) ou ceux d'utilisateurs non-admin
                !log.user_info || log.user_info.role !== 'admin'
            );
            
            // Filtrer pour ne montrer que les logs des utilisateurs de la prison actuelle
            if (prisonId) {
                objectLogsFiltered = objectLogsFiltered.filter(log => {
                    // Si le log n'a pas d'infos utilisateur, on ne le garde pas (retire les logs système)
                    if (!log.user_info) return false;
                    
                    // Vérifier si l'utilisateur a un champ prison
                    const userPrison = log.user_info.prison;
                    return userPrison === prisonId;
                });
            }

            // Apply filters if any
            if (filterType) {
                objectLogsFiltered = objectLogsFiltered.filter(log => log.type === filterType);
            }
            if (filterObject) {
                objectLogsFiltered = objectLogsFiltered.filter(log => log.nom.toLowerCase().includes(filterObject.toLowerCase()));
            }
            if (filterAction) {
                objectLogsFiltered = objectLogsFiltered.filter(log => log.commentaire?.toLowerCase().includes(filterAction.toLowerCase()));
            }
            if (filterUser && filterUser !== 'system') {
                objectLogsFiltered = objectLogsFiltered.filter(log => {
                    return log.user_info?.id.toString() === filterUser;
                });
            } else if (filterUser === 'system') {
                objectLogsFiltered = objectLogsFiltered.filter(log => !log.user);
            }

            result = [...result, ...objectLogsFiltered];
        }

        if (activeLogType === 'user' || activeLogType === 'all') {
            let userLogsFiltered = [...userLogs];

            // Filtrer pour exclure les logs des utilisateurs admin
            userLogsFiltered = userLogsFiltered.filter(log => 
                // Garder les logs d'utilisateurs non-admin
                log.user_info && log.user_info.role !== 'admin'
            );
            
            // Filtrer pour la prison actuelle
            if (prisonId) {
                userLogsFiltered = userLogsFiltered.filter(log => {
                    if (!log.user_info) return false;
                    const userPrison = log.user_info.prison;
                    return userPrison === prisonId;
                });
            }

            // Filtrer par action utilisateur
            if (filterAction) {
                userLogsFiltered = userLogsFiltered.filter(log => 
                    log.action.toLowerCase().includes(filterAction.toLowerCase())
                );
            }

            // Filtrer par utilisateur
            if (filterUser && filterUser !== 'system') {
                userLogsFiltered = userLogsFiltered.filter(log => 
                    log.user_info?.id.toString() === filterUser
                );
            }

            result = [...result, ...userLogsFiltered];
        }

        // Apply sorting
        result.sort((a, b) => {
            let comparison = 0;
            const dateA = 'date' in a ? a.date : a.timestamp;
            const dateB = 'date' in b ? b.date : b.timestamp;

            switch (sortColumn) {
                case 'date':
                    comparison = new Date(dateA).getTime() - new Date(dateB).getTime();
                    break;
                case 'nom':
                    if ('nom' in a && 'nom' in b) {
                        comparison = (a.nom || '').localeCompare(b.nom || '');
                    }
                    break;
                case 'type':
                    if ('type' in a && 'type' in b) {
                        comparison = (a.type || '').localeCompare(b.type || '');
                    }
                    break;
                case 'etat':
                    if ('etat' in a && 'etat' in b) {
                        comparison = (a.etat || '').localeCompare(b.etat || '');
                    }
                    break;
                case 'action':
                    const actionA = 'commentaire' in a ? a.commentaire || '' : ('action' in a ? a.action || '' : '');
                    const actionB = 'commentaire' in b ? b.commentaire || '' : ('action' in b ? b.action || '' : '');
                    comparison = actionA.localeCompare(actionB);
                    break;
                case 'user':
                    // Compare par full_name si disponible, sinon par username, sinon par une chaîne vide
                    const aUserInfo = 'user_info' in a ? a.user_info : null;
                    const bUserInfo = 'user_info' in b ? b.user_info : null;
                    const aUserName = aUserInfo?.full_name || aUserInfo?.username || '';
                    const bUserName = bUserInfo?.full_name || bUserInfo?.username || '';
                    comparison = aUserName.localeCompare(bUserName);
                    break;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });

        setFilteredLogs(result);
        // Reset to first page when filters change
        setCurrentPage(1);
    }, [objectLogs, userLogs, activeLogType, sortColumn, sortDirection, filterType, filterObject, filterAction, filterUser, prisonId]);

    useEffect(() => {
        fetchLogs();
    }, []);

    // Function to get appropriate icon color based on object type
    const getTypeColor = (type: string): string => {
        switch (type) {
            case 'porte': return 'text-blue-600 dark:text-blue-400';
            case 'lumiere': return 'text-yellow-600 dark:text-yellow-400';
            case 'camera': return 'text-purple-600 dark:text-purple-400';
            case 'chauffage': return 'text-orange-600 dark:text-orange-400';
            default: return 'text-gray-600 dark:text-gray-400';
        }
    };

    // Function to get icon background color based on object type
    const getTypeBgColor = (type: string): string => {
        switch (type) {
            case 'porte': return 'bg-blue-100 dark:bg-blue-900/30';
            case 'lumiere': return 'bg-yellow-100 dark:bg-yellow-900/30';
            case 'camera': return 'bg-purple-100 dark:bg-purple-900/30';
            case 'chauffage': return 'bg-orange-100 dark:bg-orange-900/30';
            default: return 'bg-gray-100 dark:bg-gray-900/30';
        }
    };

    // Function to get user action badge color
    const getActionColor = (action: string): string => {
        switch (action) {
            case 'login': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'logout': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'update_profile': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'password_change': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
            case 'create': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300';
            case 'delete': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case 'otp_request': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'otp_validate': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    // Function to get state badge color for object logs
    const getStateColor = (state: string): string => {
        return state === 'on'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    };

    // Format date nicely
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Traduire le type d'objet
    const translateObjectType = (type: string): string => {
        switch (type) {
            case 'porte': return 'Porte';
            case 'lumiere': return 'Lumière';
            case 'camera': return 'Caméra';
            case 'chauffage': return 'Chauffage';
            default: return type;
        }
    };

    // Function to translate comment to French for object logs
    const translateComment = (comment: string | undefined): string => {
        if (!comment) return '';

        switch (comment.toLowerCase()) {
            case 'création': return 'Création';
            case 'update': return 'Mise à jour';
            case 'deletion': return 'Suppression';
            case 'state change': return 'Changement d\'état';
            default: return comment;
        }
    };

    // Traduire l'action utilisateur
    const translateUserAction = (action: string): string => {
        switch (action) {
            case 'login': return 'Connexion';
            case 'logout': return 'Déconnexion';
            case 'update_profile': return 'Modification du profil';
            case 'password_change': return 'Changement de mot de passe';
            case 'create': return 'Création de compte';
            case 'delete': return 'Suppression de compte';
            case 'otp_request': return 'Demande de code OTP';
            case 'otp_validate': return 'Validation OTP';
            default: return action;
        }
    };

    // Function to handle sorting
    const handleSort = (column: SortColumn) => {
        if (sortColumn === column) {
            // Toggle direction if same column
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Set new column and default to ascending
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    // Get sort icon based on current sort
    const getSortIcon = (column: SortColumn) => {
        if (sortColumn !== column) {
            return <ArrowUpDown className="h-4 w-4 ml-1" />;
        }
        return sortDirection === 'asc' ?
            <ArrowUp className="h-4 w-4 ml-1" /> :
            <ArrowDown className="h-4 w-4 ml-1" />;
    };

    // Pagination helpers
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredLogs.length);
    const currentLogs = filteredLogs.slice(startIndex, endIndex);

    // Get unique object types for filter dropdown
    const objectTypes = [...new Set(objectLogs.map(log => log.type))];

    // Get unique users for filter dropdown from both log types
    const objectLogUsers = objectLogs
        .filter(log => log.user_info !== undefined && log.user_info !== null)
        .map(log => log.user_info!);
    
    const userLogUsers = userLogs
        .filter(log => log.user_info !== undefined && log.user_info !== null)
        .map(log => log.user_info!);
    
    const allUsers = [...objectLogUsers, ...userLogUsers];
    const uniqueUsers = allUsers.filter((user, index, self) =>
        index === self.findIndex(u => u.id === user.id)
    );

    // Get unique action types from both object and user logs
    const defaultObjectActionTypes = ['Création', 'Suppression', 'Changement d\'état', 'Réparation'];
    const objectActionTypes = [...new Set(objectLogs.map(log => log.commentaire || '').filter(Boolean))];
    
    const userActionTypes = [...new Set(userLogs.map(log => translateUserAction(log.action)))];
    
    const allActionTypes = [...new Set([...defaultObjectActionTypes, ...objectActionTypes, ...userActionTypes])];

    // Get unique object names for filter dropdown
    const uniqueObjectNames = [...new Set(objectLogs.map(log => log.nom))];

    // Function to get user role label
    const getUserRoleLabel = (role: string): string => {
        switch (role) {
            case 'admin': return 'Administrateur';
            case 'gerant': return 'Gérant';
            case 'gestionnaire': return 'Gestionnaire';
            case 'employe': return 'Employé';
            case 'user': return 'Utilisateur';
            default: return role || 'Non défini';
        }
    };

    // Check if log is ObjectLog type
    const isObjectLog = (log: any): log is ObjetLog => {
        return 'type' in log && 'etat' in log;
    };

    // Check if log is UserLog type
    const isUserLog = (log: any): log is UserLog => {
        return 'action' in log && 'timestamp' in log;
    };

    return (
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <ClipboardList className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Historique des activités</h2>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Activity className="h-4 w-4 mr-1 text-green-500" />
                        {loading ? 'Chargement...' : `${filteredLogs.length} événements`}
                    </span>
                    <button
                        onClick={fetchLogs}
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                        disabled={refreshing}
                    >
                        <RefreshCw className={`h-4 w-4 text-gray-600 dark:text-gray-300 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Type de logs */}
            <div className="mb-4">
                <div className="flex space-x-2">
                    <button 
                        onClick={() => setActiveLogType('all')}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                            activeLogType === 'all' 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                    >
                        Tous les logs
                    </button>
                    <button 
                        onClick={() => setActiveLogType('object')}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                            activeLogType === 'object' 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                    >
                        <LayoutGrid className="h-4 w-4 inline-block mr-1" />
                        Objets
                    </button>
                    <button 
                        onClick={() => setActiveLogType('user')}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                            activeLogType === 'user' 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                    >
                        <User className="h-4 w-4 inline-block mr-1" />
                        Utilisateurs
                    </button>
                </div>
            </div>

            {/* Filter section */}
            <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <div className="flex flex-wrap items-center gap-2 w-full">
                    <div className="flex items-center mr-2 whitespace-nowrap">
                        <Filter className="h-4 w-4 text-indigo-500 mr-1" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtres:</span>
                    </div>

                    {activeLogType !== 'user' && (
                        <select
                            id="filterType"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="flex-1 min-w-[120px] px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Type: Tous</option>
                            {objectTypes.map(type => (
                                <option key={type} value={type}>
                                    {type === 'porte' ? 'Type: Porte' :
                                        type === 'lumiere' ? 'Type: Lumière' :
                                            type === 'camera' ? 'Type: Caméra' :
                                                type === 'chauffage' ? 'Type: Chauffage' : `Type: ${type}`}
                                </option>
                            ))}
                        </select>
                    )}

                    {activeLogType !== 'user' && (
                        <select
                            id="filterObject"
                            value={filterObject}
                            onChange={(e) => setFilterObject(e.target.value)}
                            className="flex-1 min-w-[120px] px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Objet: Tous</option>
                            {uniqueObjectNames.map(name => (
                                <option key={name} value={name}>Objet: {name}</option>
                            ))}
                        </select>
                    )}

                    <select
                        id="filterAction"
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                        className="flex-1 min-w-[120px] px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Action: Toutes</option>
                        {allActionTypes.map(action => (
                            <option key={action} value={action}>Action: {action}</option>
                        ))}
                    </select>

                    <select
                        id="filterUser"
                        value={filterUser}
                        onChange={(e) => setFilterUser(e.target.value)}
                        className="flex-1 min-w-[120px] px-2 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Utilisateur: Tous</option>
                        <option value="system">Utilisateur: Système</option>
                        {uniqueUsers.map(user => (
                            <option key={user.id} value={user.id.toString()}>Utilisateur: {user.full_name}</option>
                        ))}
                    </select>

                    {(filterType || filterObject || filterAction || filterUser) && (
                        <button
                            onClick={() => {
                                setFilterType('');
                                setFilterObject('');
                                setFilterAction('');
                                setFilterUser('');
                            }}
                            className="whitespace-nowrap px-3 py-1.5 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                            Réinitialiser
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="w-full h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : error ? (
                <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg">
                    {error}
                </div>
            ) : filteredLogs.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                    <ClipboardList className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">Aucun événement correspondant aux filtres</p>
                </div>
            ) : (
                <div className="overflow-x-auto mt-8 backdrop-blur-md bg-white/10 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">
                                    <button
                                        className="flex items-center font-semibold"
                                        onClick={() => handleSort('date')}
                                    >
                                        Date {getSortIcon('date')}
                                    </button>
                                </th>
                                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">
                                    <button
                                        className="flex items-center font-semibold"
                                        onClick={() => handleSort('user')}
                                    >
                                        Utilisateur {getSortIcon('user')}
                                    </button>
                                </th>
                                <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">
                                    <button
                                        className="flex items-center font-semibold"
                                        onClick={() => handleSort('action')}
                                    >
                                        Action {getSortIcon('action')}
                                    </button>
                                </th>
                                {(activeLogType === 'object' || activeLogType === 'all') && objectLogs.length > 0 && (
                                    <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">
                                        <span className="font-semibold">Détails</span>
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {currentLogs.map((log) => (
                                <tr key={`${isObjectLog(log) ? 'obj' : 'user'}-${log.id}`} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                            {formatDate(isObjectLog(log) ? log.date : log.timestamp)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {log.user_info ? (
                                            <div className="flex items-center">
                                                <div className={`w-8 h-8 rounded-full mr-2 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300`}>
                                                    {(log.user_info.full_name || log.user_info.username || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-800 dark:text-gray-200">{log.user_info.full_name || log.user_info.username || 'Inconnu'}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{getUserRoleLabel(log.user_info.role || '')}</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500 dark:text-gray-400">Système</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {isObjectLog(log) ? (
                                            <span className="text-gray-800 dark:text-gray-200">
                                                {translateComment(log.commentaire)}
                                            </span>
                                        ) : (
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                                                {translateUserAction(log.action)}
                                            </span>
                                        )}
                                    </td>
                                    {isObjectLog(log) && (
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getTypeBgColor(log.type)} ${getTypeColor(log.type)}`}>
                                                        {translateObjectType(log.type)}
                                                    </span>
                                                    <span className="text-gray-800 dark:text-gray-200">{log.nom}</span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(log.etat)}`}>
                                                        {log.etat === 'on' ? 'Activé' : 'Désactivé'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            Affichage des événements <span className="font-medium">{startIndex + 1}</span> à <span className="font-medium">{endIndex}</span> sur <span className="font-medium">{filteredLogs.length}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                            >
                                <option value={5}>5 par page</option>
                                <option value={10}>10 par page</option>
                                <option value={20}>20 par page</option>
                                <option value={50}>50 par page</option>
                            </select>
                            <button
                                onClick={() => setCurrentPage(curr => Math.max(curr - 1, 1))}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            {/* Page number display */}
                            <span className="px-3 py-1 text-sm">
                                {currentPage} / {totalPages || 1}
                            </span>
                            <button
                                onClick={() => setCurrentPage(curr => Math.min(curr + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className={`p-2 rounded-md ${currentPage === totalPages || totalPages === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LogsComponent;
