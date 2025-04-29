import API from './api';
import { ObjectType } from '../components/ConnectedObjects/types';

// Object API endpoints
const OBJECTS_ENDPOINT = 'objects/';

// Get all objects, optionally filtered by prison ID
export const getObjects = (prison_id?: string) => {
  console.debug('Fetching objects' + (prison_id ? ` for prison: ${prison_id}` : ''));
  // Allow this request without authentication since it's a read-only operation
  return API.get<ObjectType[]>(OBJECTS_ENDPOINT, { 
    params: prison_id ? { prison_id } : undefined 
  });
};

// Get single object by ID
export const getObjectById = (id: number) => {
  console.debug(`Fetching object with ID: ${id}`);
  return API.get<ObjectType>(`${OBJECTS_ENDPOINT}${id}/`);
};

// Create a new object
export const createObject = (object: Omit<ObjectType, 'id'>) => {
  console.debug('Creating new object:', object.type);
  
  // N'ajouter l'ID de prison que si aucun n'a été fourni
  let objectToCreate = object;
  
  // Si aucun Prison_id n'est fourni ou s'il est vide, utiliser celui du localStorage
  if (!object.Prison_id || object.Prison_id === '') {
    const currentPrisonId = localStorage.getItem('userPrison') || localStorage.getItem('selectedPrison') || undefined;
    objectToCreate = {
      ...object,
      Prison_id: currentPrisonId
    };
    console.debug('Prison_id non fourni, utilisation de la valeur par défaut:', currentPrisonId);
  }
  
  // Définir une consommation par défaut si aucune n'est spécifiée
  if (objectToCreate.consomation === undefined || objectToCreate.consomation === 0) {
    // Valeurs de consommation par défaut selon le type d'objet
    let defaultConsumption = 10; // Valeur par défaut générale
    
    switch(objectToCreate.type) {
      case 'porte': 
        defaultConsumption = 1.0;
        break;
      case 'lumiere': 
        defaultConsumption = 0.5;
        break;
      case 'camera': 
        defaultConsumption = 0.2;
        break;
      case 'thermostat': 
        defaultConsumption = 0.1;
        break;
      case 'ventilation': 
        defaultConsumption = 2.0;
        break;
      case "paneau d'affichage": 
        defaultConsumption = 4.0;
        break;
    }
    
    objectToCreate = {
      ...objectToCreate,
      consomation: defaultConsumption
    };
    console.debug(`Consommation non spécifiée, valeur par défaut utilisée: ${defaultConsumption} pour type: ${objectToCreate.type}`);
  }
  
  console.debug('Creating object with prison ID:', objectToCreate.Prison_id);
  return API.post<ObjectType>(OBJECTS_ENDPOINT, objectToCreate);
};

// Update an object
export const updateObject = (id: number, object: Partial<Omit<ObjectType, 'id'>>) => {
  // console.debug(`Updating object ${id} with:`, object);

  // Ensure coordinates are numbers, not strings
  const payload = {
    ...object,
    coord_x: object.coord_x !== undefined ? Number(object.coord_x) : undefined,
    coord_y: object.coord_y !== undefined ? Number(object.coord_y) : undefined
  };

  console.debug('Formatted payload:', payload);

  try {
    // Use PATCH instead of PUT to update only the specified fields
    return API.patch<ObjectType>(`${OBJECTS_ENDPOINT}${id}/`, payload);
  } catch (error) {
    console.error('Error in updateObject:', error);
    throw error;
  }
};

// Delete an object
export const deleteObject = (id: number) => {
  console.debug(`Deleting object with ID: ${id}`);
  try {
    // Django REST Framework will return a 204 No Content on successful delete
    return API.delete(`${OBJECTS_ENDPOINT}${id}/`);
  } catch (error) {
    console.error('Error in deleteObject:', error);
    throw error;
  }
};

// Toggle object state (on/off)
export const toggleObjectState = (id: number, currentState: 'on' | 'off') => {
  const newState = currentState === 'on' ? 'off' : 'on';
  console.debug(`Toggling object ${id} state from ${currentState} to ${newState}`);

  try {
    // Django REST Framework expects a PATCH request for partial updates
    return API.patch<ObjectType>(`${OBJECTS_ENDPOINT}${id}/`, { etat: newState });
  } catch (error) {
    console.error('Error in toggleObjectState:', error);
    throw error;
  }
};

// Repair object - restore durability and set maintenance to functional
export const repairObject = (id: number) => {
  console.debug(`Repairing object with ID: ${id}`);
  try {
    // Update the object to restore durability to full and set maintenance to functional
    return API.patch<ObjectType>(`${OBJECTS_ENDPOINT}${id}/`, { 
      durabilité: 100, 
      maintenance: 'fonctionnel' 
    });
  } catch (error) {
    console.error('Error in repairObject:', error);
    throw error;
  }
};

export const modifyObject = async (id: number, objectData: Partial<ObjectType>): Promise<ObjectType> => {
  try {
    // Ensure durability is capped between 0-100 if present in the data
    if (objectData.durabilité !== undefined) {
      objectData.durabilité = Math.max(0, Math.min(100, objectData.durabilité));
    }

    const response = await API.patch<ObjectType>(`${OBJECTS_ENDPOINT}${id}/`, objectData);
    
    return response.data;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
};
