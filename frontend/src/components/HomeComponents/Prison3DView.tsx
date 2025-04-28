import React from 'react';
import { X } from 'lucide-react';

interface VideoViewProps {
  onClose: () => void;
  videoUrl: string;
}

const VideoView: React.FC<VideoViewProps> = ({ onClose, videoUrl }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="w-[90vw] h-[90vh] rounded-2xl shadow-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center relative">
        <button
          className="absolute top-4 right-4 z-10 bg-white/80 dark:bg-gray-900/80 rounded-full p-2 shadow hover:bg-white dark:hover:bg-gray-800 transition-colors"
          onClick={onClose}
          title="Fermer la visualisation 3D"
        >
          <X className="h-6 w-6 text-gray-700 dark:text-gray-200" />
        </button>
        <iframe
          width="100%"
          height="100%"
          src={videoUrl}
          title="Visualisation 3D Prison"
          frameBorder="0"
          allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="rounded-2xl w-full h-full min-h-[400px]"
          style={{ pointerEvents: 'none' }}
        ></iframe>
      </div>
    </div>
  );
};

export default VideoView;
