import React, { useEffect, useState } from 'react';
import { getObjects } from '../../services/objectService';
import { ObjectType } from './types';
import Door from './Door';
import Light from './Light';
import Camera from './Camera';
import Heater from './Heater';

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
    chauffage: objects.filter(obj => obj.type === 'chauffage'),
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      <Door objects={grouped.porte} addPoints={addPoints} />
      <Light objects={grouped.lumiere} addPoints={addPoints} />
      <Camera objects={grouped.camera} addPoints={addPoints} />
      <Heater objects={grouped.chauffage} addPoints={addPoints} />
    </div>
  );
};

export default ConnectedObjectsGroup;
