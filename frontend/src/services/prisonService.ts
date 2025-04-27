import axios from 'axios';

// Types pour les logs d'activité utilisateur
export interface UserActivityLog {
  id: number;
  user: {
    id: number;
    username: string;
    role: string;
    prison: string;
    full_name: string;
  };
  action: string;
  timestamp: string;
}

// Types pour les logs d'objets
export interface ObjectLog {
  id: number;
  objet: number | null;
  type: string;
  nom: string;
  etat: string;
  date: string;
  commentaire: string | null;
  prison_id: string | null;
  user: number | null;
  user_info: {
    id: number;
    username: string;
    full_name: string;
    role: string;
    prison: string;
  } | null;
}

// Type pour les utilisateurs de la prison
export interface PrisonUser {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  sexe: string;
  date_naissance: string | null;
  role: string;
  section: string;
  prison: string;
  points: number;
}

// Type pour les données complètes de la prison
export interface PrisonData {
  userLogs: UserActivityLog[];
  objectLogs: ObjectLog[];
  users: PrisonUser[];
}

// Fonction pour récupérer toutes les données de la prison
export const getPrisonData = async (): Promise<PrisonData> => {
  const token = localStorage.getItem('sessionToken');
  const prisonId = localStorage.getItem('userPrison') || localStorage.getItem('selectedPrison');
  
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
  
  // Récupérer les logs des utilisateurs
  const userLogsResponse = await axios.get<UserActivityLog[]>('http://localhost:8000/api/Userslogs/', config);
  
  // Récupérer les logs des objets
  const objectLogsResponse = await axios.get<ObjectLog[]>('http://localhost:8000/api/logs/', config);
  
  // Récupérer les utilisateurs
  const usersResponse = await axios.get<PrisonUser[]>('http://localhost:8000/api/staff/', config);
  
  // Filtrer les données par prison_id et exclure les logs créés par les admins
  const filteredObjectLogs = objectLogsResponse.data.filter(
    log => {
      // Vérifier si le log appartient à la prison actuelle
      const belongsToPrison = !prisonId || log.prison_id === prisonId;
      
      // Exclure les logs créés par les administrateurs
      const notCreatedByAdmin = !log.user_info || log.user_info.role !== 'admin';
      
      return belongsToPrison && notCreatedByAdmin;
    }
  );
  
  const filteredUserLogs = userLogsResponse.data.filter(
    log => {
      // Vérifier si le log appartient à la prison actuelle
      const belongsToPrison = !prisonId || log.user?.prison === prisonId;
      
      // Exclure les logs créés par les administrateurs
      const notCreatedByAdmin = !log.user || log.user.role !== 'admin';
      
      return belongsToPrison && notCreatedByAdmin;
    }
  );
  
  const filteredUsers = usersResponse.data.filter(
    user => {
      // Vérifier si l'utilisateur appartient à la prison actuelle
      const belongsToPrison = !prisonId || user.prison === prisonId;
      
      // Exclure les administrateurs
      const notAdmin = user.role !== 'admin';
      
      return belongsToPrison && notAdmin;
    }
  );
  
  return {
    userLogs: filteredUserLogs,
    objectLogs: filteredObjectLogs,
    users: filteredUsers
  };
};

// Fonction pour compter les actions par type
export const countUserActions = (logs: UserActivityLog[]): Record<string, number> => {
  return logs.reduce((acc, log) => {
    // Vérifier si l'action existe avant de l'inclure
    if (log.action) {
      acc[log.action] = (acc[log.action] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
};

// Fonction pour compter les utilisateurs par rôle
export const countUsersByRole = (users: PrisonUser[]): Record<string, number> => {
  return users.reduce((acc, user) => {
    // Vérifier si le rôle existe avant de l'inclure
    if (user.role) {
      acc[user.role] = (acc[user.role] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
};

// Fonction pour compter les changements d'objets par type
export const countObjectChanges = (logs: ObjectLog[]): Record<string, number> => {
  return logs.reduce((acc, log) => {
    // Vérifier si le type existe avant de l'inclure
    if (log.type) {
      acc[log.type] = (acc[log.type] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
};

// Fonction pour compter les utilisateurs par section
export const countUsersBySection = (users: PrisonUser[]): Record<string, number> => {
  return users.reduce((acc, user) => {
    const section = user.section || 'non-définie';
    acc[section] = (acc[section] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

// Fonction pour calculer les points moyens par utilisateur
export const calculateAveragePoints = (users: PrisonUser[]): number => {
  if (users.length === 0) return 0;
  const totalPoints = users.reduce((sum, user) => sum + (user.points || 0), 0);
  return totalPoints / users.length;
};

// Fonction pour calculer l'âge moyen des utilisateurs
export const calculateAverageAge = (users: PrisonUser[]): number => {
  const usersWithBirthdate = users.filter(user => user.date_naissance);
  if (usersWithBirthdate.length === 0) return 0;
  
  const now = new Date();
  const totalAge = usersWithBirthdate.reduce((sum, user) => {
    const birthdate = new Date(user.date_naissance as string);
    const age = now.getFullYear() - birthdate.getFullYear();
    // Ajuster l'âge si l'anniversaire n'est pas encore passé cette année
    return sum + (now.getMonth() < birthdate.getMonth() || 
                 (now.getMonth() === birthdate.getMonth() && now.getDate() < birthdate.getDate()) 
                 ? age - 1 : age);
  }, 0);
  
  return totalAge / usersWithBirthdate.length;
};

// Fonction pour compter les utilisateurs par genre
export const countUsersByGender = (users: PrisonUser[]): Record<string, number> => {
  return users.reduce((acc, user) => {
    const gender = user.sexe || 'non-défini';
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

// Fonction pour calculer la répartition des points par rôle
export const calculatePointsByRole = (users: PrisonUser[]): Record<string, { total: number, count: number, average: number }> => {
  const result = {} as Record<string, { total: number, count: number, average: number }>;
  
  users.forEach(user => {
    const role = user.role || 'non-défini';
    if (!result[role]) {
      result[role] = { total: 0, count: 0, average: 0 };
    }
    result[role].total += user.points || 0;
    result[role].count += 1;
  });
  
  // Calculer les moyennes
  Object.keys(result).forEach(role => {
    result[role].average = result[role].count > 0 ? result[role].total / result[role].count : 0;
  });
  
  return result;
};
