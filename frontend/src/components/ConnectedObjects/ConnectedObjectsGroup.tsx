import React, { useEffect, useState } from 'react';
import { getObjects, ObjectType } from '../../services/objectService';
import Door from './Door';
import Light from './Light';
import Camera from './Camera';
import Heater from './Heater';

const ConnectedObjectsGroup: React.FC = () => {
  const [objects, setObjects] = useState<ObjectType[]>([]);

  useEffect(() => {
    getObjects().then(res => setObjects(res.data));
  }, []);

  const grouped = {
    porte: objects.filter(obj => obj.type === 'porte'),
    lumiere: objects.filter(obj => obj.type === 'lumiere'),
    camera: objects.filter(obj => obj.type === 'camera'),
    chauffage: objects.filter(obj => obj.type === 'chauffage'),
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      <Door objects={grouped.porte} />
      <Light objects={grouped.lumiere} />
      <Camera objects={grouped.camera} />
      <Heater objects={grouped.chauffage} />
    </div>
  );
};

export default ConnectedObjectsGroup;
