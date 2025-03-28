/**
 * Service pour gérer les appels API vers le backend Django
 */

// URL de base de l'API
const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Appel à la page d'accueil de l'API
 * @returns {Promise<any>} La réponse de l'API
 */
export const getHomeData = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/home/`);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    throw error;
  }
};

/**
 * Méthode générique pour faire des requêtes GET
 * @param endpoint Point d'accès de l'API
 * @returns {Promise<any>} La réponse de l'API
 */
export const fetchData = async (endpoint: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erreur lors de la récupération des données depuis ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Méthode générique pour faire des requêtes POST
 * @param endpoint Point d'accès de l'API
 * @param data Données à envoyer
 * @returns {Promise<any>} La réponse de l'API
 */
export const postData = async (endpoint: string, data: any): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erreur lors de l'envoi des données à ${endpoint}:`, error);
    throw error;
  }
};