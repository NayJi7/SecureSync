export interface ObjectType {
  id: number;
  nom: string;
  type: 'porte' | 'lumiere' | 'camera' | 'chauffage';
  coord_x: number;
  coord_y: number;
  etat: 'on' | 'off';
  Prison_id?: string; // ID de la prison à laquelle appartient l'objet
  consomation?: number; // Consommation électrique de l'objet en watts
  durabilité?: number; // Durabilité de l'objet en pourcentage
  maintenance?: string; // État de maintenance de l'objet
  connection?: string; // État de la connexion de l'objet
  valeur_actuelle?: number; // Pour les objets qui ont une valeur actuelle (ex: température)
  valeur_cible?: number; // Pour les objets qui ont une valeur cible (ex: température souhaitée)
}

// Define specific object types for type safety in components
export interface DoorObject extends ObjectType {
  type: 'porte';
}

export interface LightObject extends ObjectType {
  type: 'lumiere';
}

export interface CameraObject extends ObjectType {
  type: 'camera';
}

export interface HeaterObject extends ObjectType {
  type: 'chauffage';
}
