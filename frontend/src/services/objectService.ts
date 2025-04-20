import API from './api';
import { ObjectType } from '../components/ConnectedObjects/types';

// Object API endpoints
const OBJECTS_ENDPOINT = 'objects/';

// Get all objects
export const getObjects = () => {
  console.debug('Fetching all objects');
  // Allow this request without authentication since it's a read-only operation
  return API.get<ObjectType[]>(OBJECTS_ENDPOINT);
};

// Get single object by ID
export const getObjectById = (id: number) => {
  console.debug(`Fetching object with ID: ${id}`);
  return API.get<ObjectType>(`${OBJECTS_ENDPOINT}${id}/`);
};

// Create a new object
export const createObject = (object: Omit<ObjectType, 'id'>) => {
  console.debug('Creating new object:', object.type);
  return API.post<ObjectType>(OBJECTS_ENDPOINT, object);
};

// Update an object
export const updateObject = (id: number, object: Partial<Omit<ObjectType, 'id'>>) => {
  console.debug(`Updating object ${id} with:`, object);

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
