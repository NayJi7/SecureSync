import React, { useEffect, useState } from 'react';
import { getObjects } from '../../services/objectService';
import { ObjectType } from './types';
import Door from './Door';
import Light from './Light';
import Camera from './Camera';
import PanneauAffichage from './PanneauAffichage';

interface ConnectedObjectsGroupProps {
  prisonId?: string;
  addPoints?: (points: number) => Promise<void>;
}

const ConnectedObjectsGroup: React.FC<ConnectedObjectsGroupProps> = ({ prisonId, addPoints }) => {
  const [objects, setObjects] = useState<ObjectType[]>([]);

  useEffect(() => {
    // Utiliser prisonId si disponible
    getObjects(prisonId).then(res => setObjects(res.data));
  }, [prisonId]);

  const grouped = {
    porte: objects.filter(obj => obj.type === 'porte'),
    lumiere: objects.filter(obj => obj.type === 'lumiere'),
    camera: objects.filter(obj => obj.type === 'camera'),
    thermostat: objects.filter(obj => obj.type === 'thermostat'),
    panneauAffichage: objects.filter(obj => obj.type === "paneau d'affichage"),
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      <Door objects={grouped.porte} addPoints={addPoints} />
      <Light objects={grouped.lumiere} addPoints={addPoints} />
      <Camera objects={grouped.camera} addPoints={addPoints} />
      <PanneauAffichage objects={grouped.panneauAffichage} addPoints={addPoints} />
    </div>
  );
};

export default ConnectedObjectsGroup;
