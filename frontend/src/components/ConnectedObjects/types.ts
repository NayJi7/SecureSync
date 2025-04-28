export type ObjectTypeName = 'porte' | 'lumiere' | 'camera' | 'thermostat' | 'ventilation' | "paneau d'affichage";

export interface ObjectType {
  id: number;
  nom: string;
  type: ObjectTypeName;
  coord_x: number;
  coord_y: number;
  etat: 'on' | 'off';
  Prison_id?: string; // ID de la prison à laquelle appartient l'objet
  consomation?: number; // Orthographe du backend: Consommation électrique en kWh
  durabilité?: number; // Durabilité de l'objet en pourcentage
  maintenance?: string; // État de maintenance de l'objet
  connection?: string; // État de la connexion de l'objet
  valeur_actuelle?: number | string; // Pour les objets qui ont une valeur actuelle (ex: température, message pour panneau)
  valeur_cible?: number; // Pour les objets qui ont une valeur cible (ex: température souhaitée)
  valeur_min?: number;
  valeur_max?: number;
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

export interface ThermostatObject extends ObjectType {
  type: 'thermostat';
}

export interface VentilationObject extends ObjectType {
  type: 'ventilation';
}

export interface PanneauAffichageObject extends ObjectType {
  type: "paneau d'affichage";
}
