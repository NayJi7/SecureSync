import React, { useState, useEffect } from 'react';
import { X, Shield } from 'lucide-react';

interface VideoViewProps {
  onClose: () => void;
  videoUrl: string;
}

const VideoView: React.FC<VideoViewProps> = ({ onClose, videoUrl }) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    return new Intl.DateTimeFormat('fr-FR', options).format(date);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/75">
      <div className="w-[90vw] h-[90vh] rounded-lg overflow-hidden flex flex-col relative border shadow-xl
                    bg-white dark:bg-gray-900 
                    border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center p-4 
                      bg-gray-100 dark:bg-gray-800 
                      border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <Shield size={28} className="text-red-600 dark:text-red-500" />
            <h1 className="text-2xl font-bold tracking-wider 
                           text-gray-900 dark:text-white">
              VISUALISATION SÉCURISÉE
            </h1>
          </div>
          
          <div className="mr-15 flex items-center gap-2 px-4 py-2 rounded-md
                          bg-red-500/10 dark:bg-red-500/20
                          border border-red-500/20 dark:border-red-500/30">
            <div className="w-2.5 h-2.5 bg-red-600 dark:bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-bold text-sm text-gray-900 dark:text-white">
              EN DIRECT
            </span>
          </div>
        </div>
        
        <button
          className="absolute top-4 right-4 z-10 p-2 rounded-full cursor-pointer
                    bg-gray-200/80 hover:bg-gray-300/90 
                    dark:bg-gray-700/80 dark:hover:bg-gray-600/90
                    border border-gray-300 dark:border-gray-600
                    shadow-sm transition-colors"
          onClick={onClose}
          title="Fermer la visualisation"
        >
          <X className="h-6 w-6 text-gray-700 dark:text-gray-200" />
        </button>
        
        <div className="relative flex-1 overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            src={videoUrl}
            title="Visualisation 3D Prison"
            frameBorder="0"
            allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full min-h-[400px]"
            style={{ 
              filter: 'contrast(1.05) brightness(0.98)',
              pointerEvents: 'none'
            }}
          />
          
          <div className="absolute bottom-3 left-3 py-1 px-3 
                          bg-gray-800/70 dark:bg-gray-900/80 
                          text-sm font-bold tracking-wide text-white
                          rounded shadow-md border border-gray-700/50">
            CAMERA
          </div>
          
          <div className="absolute top-3 right-3 py-1 px-3 
                          bg-gray-800/70 dark:bg-gray-900/80
                          text-xs font-bold tracking-wide font-mono text-white
                          rounded shadow-md border border-gray-700/50">
            {formatDateTime(currentDateTime)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoView;
