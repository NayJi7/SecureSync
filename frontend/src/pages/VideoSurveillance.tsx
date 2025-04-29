import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

const VideoSurveillance: React.FC = () => {
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

    const cameras = [
        { id: 'cam01', label: 'CAM 01', source: '/Camera1.mp4' },
        { id: 'cam02', label: 'CAM 02', source: '/Camera2.mp4' },
        { id: 'cam03', label: 'CAM 03', source: '/Camera1.mp4' },
        { id: 'cam04', label: 'CAM 04', source: '/Camera2.mp4' },
        { id: 'cam05', label: 'CAM 05', source: '/Camera1.mp4' },
        { id: 'cam06', label: 'CAM 06', source: '/Camera2.mp4' }
    ];

    return (
        <div style={{
            width: '100%',
            minHeight: '100vh',
            backgroundColor: '#000',
            color: '#fff',
            padding: '0',
            margin: '0',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px 20px',
                backgroundColor: '#1a1a1a',
                borderBottom: '1px solid #333'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                }}>
                    <Shield size={28} className="text-red-500" />
                    <h1 style={{
                        margin: 0,
                        fontSize: '24px',
                        fontWeight: 'bold',
                        letterSpacing: '2px'
                    }}>CENTRE PÉNITENTIAIRE - SYSTÈME DE SURVEILLANCE</h1>
                </div>
                
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                    padding: '8px 15px',
                    borderRadius: '4px',
                    border: '1px solid rgba(255, 0, 0, 0.2)'
                }}>
                    <div style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: '#ff0000',
                        borderRadius: '50%',
                        animation: 'pulse 1.5s infinite'
                    }}/>
                    <span style={{
                        fontWeight: 'bold',
                        color: '#fff'
                    }}>EN DIRECT</span>
                </div>
            </div>

            {/* Camera Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '4px',
                padding: '4px',
                flex: 1,
                backgroundColor: '#000'
            }}>
                {cameras.map(camera => (
                    <div
                        key={camera.id}
                        style={{
                            position: 'relative',
                            aspectRatio: '16/9',
                            backgroundColor: '#0a0a0a',
                            overflow: 'hidden',
                            border: '1px solid #333'
                        }}
                    >
                        <video
                            src={camera.source}
                            autoPlay
                            loop
                            muted
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                filter: 'grayscale(100%)'
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            bottom: '10px',
                            left: '10px',
                            padding: '4px 8px',
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            letterSpacing: '1px'
                        }}>
                            {camera.label}
                        </div>
                        <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            padding: '4px 8px',
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            fontFamily: 'monospace'
                        }}>
                            {formatDateTime(currentDateTime)}
                        </div>
                    </div>
                ))}
            </div>

            <style>
                {`
                    @keyframes pulse {
                        0% { opacity: 1; }
                        50% { opacity: 0.5; }
                        100% { opacity: 1; }
                    }
                `}
            </style>
        </div>
    );
};

export default VideoSurveillance;