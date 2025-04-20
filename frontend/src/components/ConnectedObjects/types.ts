export interface ObjectType {
  id: number;
  nom: string;
  type: 'porte' | 'lumiere' | 'camera' | 'chauffage';
  coord_x: number;
  coord_y: number;
  etat: 'on' | 'off';
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
